import '../../../../../vitest-esbuild-compat';
import { FlowNodeEntity } from '../flow/flow.slice';
import { NodeLogic } from './node.logic';
import { NodeEntity, nodeActions } from './node.slice';

describe('NodeLogic', () => {
    // Mock dispatch function using Vitest's built-in mocking functions
    const mockDispatch = vi.fn();

    beforeEach(() => {
        // Reset mocks before each test
        mockDispatch.mockReset();
    });

    describe('setNodeScripts()', () => {
        it('registers node types from script tags correctly', async () => {
            const nodeScriptsData = `
      <script type="text/javascript">
        RED.nodes.registerType("test-node", {category: "function"});
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                nodeActions.updateOne({
                    id: 'test-node',
                    changes: expect.objectContaining({ category: 'function' }),
                })
            );
        });

        it('updates editor templates from script tags correctly', async () => {
            const nodeScriptsData = `
      <script type="text/html" data-template-name="test-node">
        <div>Editor Template</div>
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                nodeActions.updateOne({
                    id: 'test-node',
                    changes: { editorTemplate: '<div>Editor Template</div>' },
                })
            );
        });

        it('updates help templates from script tags correctly', async () => {
            const nodeScriptsData = `
      <script type="text/html" data-help-name="test-node">
        <p>Help Template</p>
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                nodeActions.updateOne({
                    id: 'test-node',
                    changes: { helpTemplate: '<p>Help Template</p>' },
                })
            );
        });
    });

    describe('getNodeInputsOutputs', () => {
        let nodeLogic: NodeLogic;
        const baseNodeProps = {
            id: 'test-node',
            nodeRedId: 'test-node',
            module: 'module',
            version: 'version',
            name: 'name',
            type: 'type',
        };

        beforeEach(() => {
            nodeLogic = new NodeLogic();
        });

        it('should extract inputs and outputs with default labels when no custom labels are provided', () => {
            const node = {
                ...baseNodeProps,
                id: 'test-node',
                inputs: 2,
                outputs: 1,
            };

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(node);

            expect(inputs).toEqual(['Input 1', 'Input 2']);
            expect(outputs).toEqual(['Output 1']);
        });

        it('should correctly deserialize and use custom input and output label functions', () => {
            const node = {
                ...baseNodeProps,
                id: 'test-node',
                inputs: 2,
                outputs: 2,
                definitionScript: `
                    RED.nodes.registerType("test-node", {
                        inputLabels: function(index) { 
                            return \`Custom Input \${index + 1}\`; 
                        }, 
                        outputLabels: function(index) { 
                            return \`Custom Output \${index + 1}\`; 
                        }
                    });
                `,
            };

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(node);

            expect(inputs).toEqual(['Custom Input 1', 'Custom Input 2']);
            expect(outputs).toEqual(['Custom Output 1', 'Custom Output 2']);
        });

        it('should handle nodes without inputs or outputs', () => {
            const node = {
                ...baseNodeProps,
                id: 'test-node',
            };

            const { inputs, outputs } = nodeLogic.getNodeInputsOutputs(node);

            expect(inputs).toEqual([]);
            expect(outputs).toEqual([]);
        });
    });

    describe('applyConfigDefaults', () => {
        let nodeLogic: NodeLogic;

        beforeEach(() => {
            nodeLogic = new NodeLogic();
        });

        it('should apply default config values to a node', () => {
            const node = {
                id: 'node1',
                type: 'exampleType',
                name: 'Example Node',
                // Other properties as required by your NodeEntity type
            } as FlowNodeEntity;

            const entity = {
                id: 'node1',
                nodeRedId: 'node1',
                name: 'Example Node',
                type: 'exampleType',
                module: 'node-module',
                version: '1.0.0',
                defaults: {
                    property1: { value: 'default1' },
                    property2: { value: 42 },
                },
                // Other properties as required by your NodeEntity type
            } as NodeEntity;

            const result = nodeLogic.applyConfigDefaults(node, entity);

            expect(result).toEqual(
                expect.objectContaining({
                    property1: 'default1',
                    property2: 42,
                    // Ensure all other node properties are preserved
                    id: 'node1',
                    type: 'exampleType',
                    name: 'Example Node',
                })
            );
        });

        it('should not override existing node config values with defaults', () => {
            const node = {
                id: 'node1',
                type: 'exampleType',
                name: 'Example Node',
                property1: 'existingValue',
                x: 10,
                y: 20,
                // Other properties as required by your NodeEntity type
            } as FlowNodeEntity;

            const entity = {
                id: 'node1',
                nodeRedId: 'node1',
                name: 'Example Node',
                type: 'exampleType',
                module: 'node-module',
                version: '1.0.0',
                defaults: {
                    property1: { value: 'default1' },
                    property2: { value: 42 },
                },
                // Other properties as required by your NodeEntity type
            } as NodeEntity;

            const result = nodeLogic.applyConfigDefaults(node, entity);

            expect(result).toEqual(
                expect.objectContaining({
                    property1: 'existingValue', // Existing value is preserved
                    property2: 42, // Default value is applied
                    // Ensure all other node properties are preserved
                    id: 'node1',
                    type: 'exampleType',
                    name: 'Example Node',
                })
            );
        });

        it('should handle nodes with no defaults defined', () => {
            const node = {
                id: 'node1',
                type: 'exampleType',
                name: 'Example Node',
                // Other properties as required by your NodeEntity type
            } as FlowNodeEntity;

            const entity = {
                id: 'node1',
                // No defaults defined
                // Other properties as required by your NodeEntity type
            } as NodeEntity;

            const result = nodeLogic.applyConfigDefaults(node, entity);

            expect(result).toEqual(
                expect.objectContaining({
                    // Ensure all node properties are preserved
                    id: 'node1',
                    type: 'exampleType',
                    name: 'Example Node',
                })
            );
        });
    });
});
