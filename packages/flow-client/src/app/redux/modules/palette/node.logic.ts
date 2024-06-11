import { executeRegisterType } from '../../../red/execute-script';
import { AppDispatch, RootState } from '../../store';
import { FlowNodeEntity } from '../flow/flow.slice';
import {
    PaletteNodeEntity,
    paletteNodeActions,
    selectNodesByNodeRedId,
} from './node.slice';

export class NodeLogic {
    // Define a plain thunk method that accepts nodeScripts data as an argument
    public setNodeScripts(nodeScriptsData: string) {
        return async (dispatch: AppDispatch, getState: () => RootState) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(nodeScriptsData, 'text/html');

            // Initialize variables to hold module styles and current module name
            let currentModuleName = '';
            const moduleStyles = {} as Record<string, string>;

            // Process module comments and styles recursively
            const processNodesRecursively = (nodes: NodeList) => {
                nodes.forEach(node => {
                    if (node.nodeType === Node.COMMENT_NODE) {
                        const commentContent = node.textContent?.trim();
                        const moduleMatch = commentContent?.match(
                            /\[red-module:([^\]]+)\]/
                        );
                        if (moduleMatch) {
                            currentModuleName = moduleMatch[1];
                        }
                    } else if (node.nodeName === 'STYLE' && currentModuleName) {
                        const styleNode = node as HTMLStyleElement;
                        selectNodesByNodeRedId(
                            getState(),
                            currentModuleName
                        ).forEach(nodeEntity => {
                            moduleStyles[nodeEntity.type] =
                                styleNode.outerHTML ?? '';
                        });
                    }
                    if (node.childNodes.length > 0) {
                        processNodesRecursively(node.childNodes);
                    }
                });
            };

            processNodesRecursively(doc.childNodes);

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
                            paletteNodeActions.updateOne({
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
                let editorTemplate = script.innerHTML.trim();
                if (moduleStyles[nodeName]) {
                    editorTemplate = moduleStyles[nodeName] + editorTemplate;
                }
                dispatch(
                    paletteNodeActions.updateOne({
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
                    paletteNodeActions.updateOne({
                        id: nodeName,
                        changes: { helpTemplate },
                    })
                );
            });
        };
    }

    // Helper method to extract default values from NodeDefaults
    private extractDefaultNodeValues(
        defaults: NonNullable<PaletteNodeEntity['defaults']>
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
        entity: PaletteNodeEntity
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
