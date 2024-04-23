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

export const createNodeInstance = (nodeConfig: Record<string, unknown>) => {
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
    nodeConfig: Record<string, unknown>,
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
    let registeredType = null;

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
        registeredType = {
            type,
            definition: definition,
        };
    };

    executeDefinitionScript(definitionScript, RED);

    return registeredType as {
        type: string;
        definition: Partial<NodeEntity>;
    } | null;
};

export const extractNodePropertyFn = <T = (...args: unknown[]) => unknown>(
    definitionScript: string,
    propertyPath: string,
    rootContext: Context = window.document,
    nodeConfig: Record<string, unknown> = {},
    context = createNodeInstance(nodeConfig)
) => {
    let propertyFn = null;

    const RED = createMockRed(rootContext);
    const nodeInstance = context;

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

        const propertyFunction = getPropertyByPath(definition, propertyPath);
        if (typeof propertyFunction === 'function') {
            propertyFn = (
                propertyFunction as (...args: unknown[]) => unknown
            ).bind(nodeInstance) as unknown as T;
        }
    };

    executeDefinitionScript(definitionScript, RED);

    return propertyFn as T | null;
};

export const finalizeNodeExecution = (
    dialogForm: HTMLElement,
    rootContext: Context = window.document
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
};
