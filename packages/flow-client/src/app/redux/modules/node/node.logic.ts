import {
    executeRegisterType,
    extractNodePropertyFn,
} from '../../../red/execute-script';
import { AppDispatch } from '../../store';
import { FlowNodeEntity } from '../flow/flow.slice';
import { NodeEntity, nodeActions } from './node.slice';

export class NodeLogic {
    // Define a plain thunk method that accepts nodeScripts data as an argument
    public setNodeScripts(nodeScriptsData: string) {
        return async (dispatch: AppDispatch) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(nodeScriptsData, 'text/html');

            // Process text/javascript script tags
            doc.querySelectorAll('script[type="text/javascript"]').forEach(
                script => {
                    const scriptContent = script.textContent?.trim();
                    if (!scriptContent) return; // Skip if script.textContent is empty

                    const registeredType = executeRegisterType(scriptContent);

                    if (!registeredType) {
                        return;
                    }

                    // Logic to handle the node registration
                    dispatch(
                        nodeActions.updateOne({
                            id: registeredType.type,
                            changes: {
                                ...registeredType.definition,
                                definitionScript: scriptContent,
                            },
                        })
                    );
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
        const inputLabelsFunc =
            (node.definitionScript
                ? extractNodePropertyFn<(index: number) => string>(
                      node.definitionScript,
                      'inputLabels'
                  )
                : null) ?? ((index: number) => `Input ${index + 1}`);

        const outputLabelsFunc =
            (node.definitionScript
                ? extractNodePropertyFn<(index: number) => string>(
                      node.definitionScript,
                      'outputLabels'
                  )
                : null) ?? ((index: number) => `Output ${index + 1}`);

        // Generate input and output labels using the deserialized functions
        for (let i = 0; i < inputsCount; i++) {
            inputs.push(inputLabelsFunc(i));
        }

        for (let i = 0; i < outputsCount; i++) {
            outputs.push(outputLabelsFunc(i));
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
            ...defaultConfig,
            ...node,
        };

        return updatedNode;
    }
}
