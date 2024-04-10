import { NodeLogic } from './node.logic';
import { nodeActions } from './node.slice';

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
                    changes: { category: 'function' },
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
                inputLabels: {
                    type: 'serialized-function' as const,
                    // eslint-disable-next-line no-template-curly-in-string
                    value: 'function(index) { return `Custom Input ${index + 1}`; }',
                },
                outputLabels: {
                    type: 'serialized-function' as const,
                    // eslint-disable-next-line no-template-curly-in-string
                    value: 'function(index) { return `Custom Output ${index + 1}`; }',
                },
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
});
