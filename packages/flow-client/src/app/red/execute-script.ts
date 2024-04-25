import environment from '../../environment';
import { FlowNodeEntity } from '../redux/modules/flow/flow.slice';
import { NodeEntity } from '../redux/modules/node/node.slice';
import { JqueryContext } from './mock-jquery';
import { createMockRed } from './mock-red';

const executeDefinitionScript = (
    definitionScript: string,
    RED: ReturnType<typeof createMockRed>
) => {
    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function('RED', '$', definitionScript);

    try {
        // Call the script function with the RED object
        scriptFunction(RED, RED.$);
    } catch (error) {
        console.error('Error executing script:', error);
    }
};

export const createNodeInstance = (nodeConfig: FlowNodeEntity) => {
    const RED = createMockRed();
    const nodeInstance = new Proxy(
        {
            ...nodeConfig,
            _(messagePath: string) {
                return RED._(`node-red:${messagePath}`);
            },
        },
        // proxy handler
        {
            get: function (target, prop) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                } else {
                    console.error(
                        `Attempted to access Node instance property: \`${String(
                            prop
                        )}\` but it was not emulated.`
                    );
                    return undefined;
                }
            },
        }
    );

    return nodeInstance;
};

// Utility function to deserialize a function from its serialized string representation
export const deserializeFunction = <T = (...args: unknown[]) => unknown>(
    serializedFunction: string,
    nodeConfig: FlowNodeEntity,
    context = createNodeInstance(nodeConfig)
): T => {
    const nodeInstance = context;
    try {
        console.debug('Deserializing function: ');
        console.debug(serializedFunction);
        // eslint-disable-next-line no-new-func
        return new Function(
            'nodeInstance',
            `return (${serializedFunction}).bind(nodeInstance);`
        )(nodeInstance);
    } catch (error) {
        console.error('Error deserializing function: ');
        console.info(serializedFunction);
        throw error;
    }
};

export const executeRegisterType = (definitionScript: string) => {
    const registeredTypes = [] as Array<{
        type: string;
        definition: Partial<NodeEntity>;
    }>;

    const RED = createMockRed();
    RED.nodes.registerType = (
        type: string,
        definition: Partial<NodeEntity>
    ) => {
        // recursively iterate through definition and serialize any functions
        const serializeFunctions = (obj: Record<string, unknown>) => {
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'function') {
                    obj[key] = {
                        type: 'serialized-function',
                        value: (
                            obj[key] as (...args: unknown[]) => unknown
                        ).toString(),
                    };
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    serializeFunctions(obj[key] as Record<string, unknown>);
                }
            });
        };
        serializeFunctions(definition);
        registeredTypes.push({
            type,
            definition: definition,
        });
    };

    executeDefinitionScript(definitionScript, RED);

    return registeredTypes;
};

type NodeConfigOrInstance =
    | FlowNodeEntity
    | ReturnType<typeof createNodeInstance>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownFn = (...args: any[]) => unknown;

export const extractNodePropertyFn = <T = UnknownFn>(
    propertyPath: string,
    nodeEntity: NodeEntity,
    nodeInstance: NodeConfigOrInstance = createNodeInstance(
        {} as FlowNodeEntity
    ),
    rootDomNode: JqueryContext = window.document
) => {
    let propertyFn = null;

    const RED = createMockRed(rootDomNode);
    const fnContext =
        '_' in nodeInstance ? nodeInstance : createNodeInstance(nodeInstance);

    RED.nodes.registerType = (
        type: string,
        definition: Partial<NodeEntity>
    ) => {
        const getPropertyByPath = (
            obj: Record<string, unknown>,
            path: string
        ) => {
            return path
                .split('.')
                .reduce(
                    (acc, part) =>
                        acc && (acc[part] as Record<string, unknown>),
                    obj
                );
        };

        // if this is not the correct type
        if (type !== nodeEntity.type) {
            // some scripts register more than one type
            // we're only interested in our entity's type
            return;
        }

        const propertyFunction = getPropertyByPath(definition, propertyPath);
        if (typeof propertyFunction === 'function') {
            propertyFn = (
                propertyFunction as (...args: unknown[]) => unknown
            ).bind(fnContext) as unknown as T;
        }
    };

    executeDefinitionScript(nodeEntity.definitionScript ?? '', RED);

    return propertyFn as T | null;
};

export const executeNodeFn = <T extends UnknownFn = UnknownFn>(
    fnCallSpec: [string, ...Parameters<T>],
    nodeEntity: NodeEntity,
    nodeInstance?: NodeConfigOrInstance,
    rootDomNode?: JqueryContext
): ReturnType<T> | void => {
    const propertyPath = fnCallSpec[0];
    const nodeFn = extractNodePropertyFn(
        propertyPath,
        nodeEntity,
        nodeInstance,
        rootDomNode
    );
    try {
        return nodeFn?.(...fnCallSpec.slice(1)) as unknown as ReturnType<T>;
    } catch (error) {
        console.error(
            `Error executing node function - ${propertyPath}: `,
            error
        );
    }
};

export const finalizeNodeEditor = (
    dialogForm: HTMLElement,
    rootContext: JqueryContext = window.document
) => {
    // apply monaco styles to shadow dom
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('data-name', 'vs/editor/editor.main');
    linkElement.setAttribute(
        'href',
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/dev/vs/editor/editor.main.css'
    );

    rootContext.appendChild(linkElement);

    // apply node-red namespace to i18n keys
    Array.from(dialogForm.querySelectorAll<HTMLElement>('[data-i18n]')).forEach(
        element => {
            const currentKeys = element.dataset.i18n as string;
            const newKeys = currentKeys
                .split(';')
                .map(key => {
                    if (key.includes(':')) {
                        return key;
                    }

                    let prefix = '';
                    if (key.startsWith('[')) {
                        const parts = key.split(']');
                        prefix = parts[0] + ']';
                        key = parts[1];
                    }

                    return `${prefix}node-red:${key}`;
                })
                .join(';');
            element.dataset.i18n = newKeys;
        }
    );

    // call i18n plugin on newly created content
    const RED = createMockRed(rootContext);
    (RED.$(dialogForm) as unknown as { i18n: () => void }).i18n();

    // update typed input urls
    Array.from(
        dialogForm.querySelectorAll<HTMLImageElement>(
            'img[src^="red/images/typedInput"]'
        )
    ).forEach(img => {
        const baseUrl = environment.NODE_RED_API_ROOT;
        const originalSrc = img.getAttribute('src');
        if (originalSrc) {
            const newPath = originalSrc.replace(
                /.*red\/images\/typedInput/,
                `${baseUrl}/red/images/typedInput`
            );
            img.setAttribute('src', newPath);
        }
    });
};
