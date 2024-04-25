import { executeRegisterType } from '../../../red/execute-script';
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

                    const registeredTypes = executeRegisterType(scriptContent);

                    if (registeredTypes.length === 0) {
                        return;
                    }

                    // Logic to handle the node registration
                    registeredTypes.forEach(registeredType => {
                        dispatch(
                            nodeActions.updateOne({
                                id: registeredType.type,
                                changes: {
                                    ...registeredType.definition,
                                    definitionScript: scriptContent,
                                },
                            })
                        );
                    });
                }
            );

            // Process text/html script tags for editor templates
            doc.querySelectorAll(
                'script[type="text/html"][data-template-name], script[type="text/x-red"][data-template-name]'
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
                'script[type="text/html"][data-help-name], script[type="text/x-red"][data-help-name]'
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
            ...node,
            inputs: entity.inputs ?? node.inputs,
            outputs: entity.outputs ?? node.outputs,
            ...defaultConfig,
        };

        return updatedNode;
    }
}
