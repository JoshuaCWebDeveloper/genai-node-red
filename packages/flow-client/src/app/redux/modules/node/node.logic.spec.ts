import { NodeLogic } from './node.logic';
import { nodeActions } from './node.slice';

describe('NodeLogic', () => {
    // Mock dispatch function using Vitest's built-in mocking functions
    const mockDispatch = vi.fn();

    beforeEach(() => {
        // Reset mocks before each test
        mockDispatch.mockReset();
    });

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
