import { AppDispatch } from '../../store';
import { NodeEntity, nodeActions } from './node.slice';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { REDUtils } from './red-utils';
// No need to import the API or service for fetching, as data will be passed directly

export class NodeLogic {
    private createBaseRedObject() {
        const RED = new Proxy(
            // target RED object
            {
                nodes: {
                    registerType(..._args: unknown[]): unknown {
                        // not implemented
                        return undefined;
                    },
                },
                validators: {
                    number(value: unknown) {
                        return typeof value === 'number';
                    },
                    regex(value: unknown, pattern: RegExp) {
                        return typeof value === 'string' && pattern.test(value);
                    },
                    typedInput(type: string, value: unknown) {
                        switch (type) {
                            case 'number':
                                return typeof value === 'number';
                            case 'string':
                                return typeof value === 'string';
                            case 'boolean':
                                return typeof value === 'boolean';
                            default:
                                return false;
                        }
                    },
                },
                events: {
                    on(
                        event: string,
                        _handler: (...args: unknown[]) => unknown
                    ) {
                        console.debug(
                            'Ignoring node event handler for event: ',
                            event
                        );
                    },
                },
                settings: {
                    get(name: string, defaultValue: unknown) {
                        console.debug(
                            'Returning default Node-RED value for setting: ',
                            name
                        );
                        return defaultValue;
                    },
                },
                // il8n method that returns message corresponding with given path
                _(messagePath: string) {
                    return messagePath;
                },
                utils: REDUtils,
            },
            // proxy handler
            {
                get: function (target, prop) {
                    if (prop in target) {
                        return target[prop as keyof typeof target];
                    } else {
                        console.error(
                            `Attempted to access RED property: \`${String(
                                prop
                            )}\` but it was not emulated.`
                        );
                        return undefined;
                    }
                },
            }
        );

        return RED;
    }

    // Define a plain thunk method that accepts nodeScripts data as an argument
    setNodeScripts(nodeScriptsData: string) {
        return async (dispatch: AppDispatch) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(nodeScriptsData, 'text/html');

            // Process text/javascript script tags
            doc.querySelectorAll('script[type="text/javascript"]').forEach(
                script => {
                    const scriptContent = script.textContent?.trim();
                    if (!scriptContent) return; // Skip if script.textContent is empty

                    // eslint-disable-next-line no-new-func
                    const scriptFunction = new Function('RED', scriptContent);

                    const RED = this.createBaseRedObject();
                    RED.nodes.registerType = (
                        type: string,
                        definition: Partial<NodeEntity>
                    ) => {
                        // recursively iterate through definition and serialize any functions
                        const serializeFunctions = (
                            obj: Record<string, unknown>
                        ) => {
                            Object.keys(obj).forEach(key => {
                                if (typeof obj[key] === 'function') {
                                    obj[key] = {
                                        type: 'serialized-function',
                                        value: (
                                            obj[key] as (
                                                ...args: unknown[]
                                            ) => unknown
                                        ).toString(),
                                    };
                                } else if (
                                    typeof obj[key] === 'object' &&
                                    obj[key] !== null
                                ) {
                                    serializeFunctions(
                                        obj[key] as Record<string, unknown>
                                    );
                                }
                            });
                        };
                        serializeFunctions(definition);
                        // Logic to handle the node registration
                        dispatch(
                            nodeActions.updateOne({
                                id: type,
                                changes: definition,
                            })
                        );
                    };

                    try {
                        // Call the script function with the RED object
                        scriptFunction(RED);
                    } catch (error) {
                        console.error('Error executing script:', error);
                    }
                }
            );

            // Process text/html script tags for editor templates
            doc.querySelectorAll(
                'script[type="text/html"][data-template-name]'
            ).forEach(script => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const nodeName = script.getAttribute('data-template-name')!;
                const editorTemplate = script.innerHTML.trim();
                dispatch(
                    nodeActions.updateOne({
                        id: nodeName,
                        changes: { editorTemplate },
                    })
                );
            });

            // Process text/html script tags for help templates
            doc.querySelectorAll(
                'script[type="text/html"][data-help-name]'
            ).forEach(script => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const nodeName = script.getAttribute('data-help-name')!;
                const helpTemplate = script.innerHTML.trim();
                dispatch(
                    nodeActions.updateOne({
                        id: nodeName,
                        changes: { helpTemplate },
                    })
                );
            });
        };
    }

    // Utility function to deserialize a function from its serialized string representation
    private deserializeFunction<T = (...args: unknown[]) => unknown>(
        serializedFunction: string
    ): T {
        const RED = this.createBaseRedObject();
        const nodeInstance = new Proxy(
            {
                _(messagePath: string) {
                    return RED._(messagePath);
                },
                // switch
                rules: [],
            },
            // proxy handler
            {
                get: function (target, prop) {
                    if (prop in target) {
                        return target[prop as keyof typeof target];
                    } else {
                        console.error(
                            `Attempted to access RED property: \`${String(
                                prop
                            )}\` but it was not emulated.`
                        );
                        return undefined;
                    }
                },
            }
        );
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
    }

    // Method to extract inputs and outputs from a NodeEntity, including deserializing inputLabels and outputLabels
    public getNodeInputsOutputs(node: NodeEntity): {
        inputs: string[];
        outputs: string[];
    } {
        const inputs: string[] = [];
        const outputs: string[] = [];

        // Handle optional properties with defaults
        const inputsCount = node.inputs ?? 0;
        const outputsCount = node.outputs ?? 0;

        // Deserialize inputLabels and outputLabels functions
        const inputLabelsFunc = node.inputLabels
            ? this.deserializeFunction<(index: number) => string>(
                  node.inputLabels.value
              )
            : (index: number) => `Input ${index + 1}`;
        const outputLabelsFunc = node.outputLabels
            ? this.deserializeFunction<(index: number) => string>(
                  node.outputLabels.value
              )
            : (index: number) => `Output ${index + 1}`;

        // Generate input and output labels using the deserialized functions
        for (let i = 0; i < inputsCount; i++) {
            inputs.push(inputLabelsFunc(i) ?? `Input ${i + 1}`);
        }

        for (let i = 0; i < outputsCount; i++) {
            outputs.push(outputLabelsFunc(i) ?? `Output ${i + 1}`);
        }

        return { inputs, outputs };
    }

    // Helper method to extract default values from NodeDefaults
    private extractDefaultNodeValues(
        defaults: NonNullable<NodeEntity['defaults']>
    ) {
        const config: Record<string, unknown> = {};
        Object.keys(defaults).forEach(key => {
            const property = defaults[key];
            if (
                property &&
                'value' in property &&
                property.value !== '_DEFAULT_'
            ) {
                config[key] = property.value;
            }
        });
        return config;
    }
    // Method to generate a default config for a DiagramNode based on its NodeEntity
    public applyConfigDefaults(
        node: FlowNodeEntity,
        entity: NodeEntity
    ): FlowNodeEntity {
        // Generate default config based on the NodeEntity's defaults
        // Now we need to extract the value from each DefaultProperty
        const defaultConfig = entity.defaults
            ? this.extractDefaultNodeValues(entity.defaults)
            : {};

        // Apply the default config to the existing config without overriding existing values
        const updatedNode = {
            name: '',
            ...defaultConfig,
            ...node,
        };

        return updatedNode;
    }
}
