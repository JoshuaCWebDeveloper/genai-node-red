import '../../../../../vitest-esbuild-compat';
import { RootState } from '../../store';
import { FlowNodeEntity } from '../flow/flow.slice';
import { NodeLogic } from './node.logic';
import {
    PALETTE_NODE_FEATURE_KEY,
    PaletteNodeEntity,
    PaletteNodeState,
    paletteNodeActions,
} from './node.slice';

describe('NodeLogic', () => {
    // Mock dispatch function using Vitest's built-in mocking functions
    const mockDispatch = vi.fn();
    // Mock getState function using Vitest's built-in mocking functions
    const mockGetState = vi.fn(
        () =>
            ({
                [PALETTE_NODE_FEATURE_KEY]: {
                    entities: {
                        'mqtt-node1': {
                            id: 'mqtt-node1',
                            type: 'mqtt-node1',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 1',
                            module: 'node-red',
                            version: '1.0.0',
                        },
                        'mqtt-node2': {
                            id: 'mqtt-node2',
                            type: 'mqtt-node2',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 2',
                            module: 'node-red',
                            version: '1.0.0',
                        },
                    },
                    ids: ['mqtt-node1', 'mqtt-node2'],
                    loadingStatus: 'not loaded',
                    error: null,
                    searchQuery: '',
                } as PaletteNodeState,
            } as RootState)
    );

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
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                paletteNodeActions.updateOne({
                    id: 'test-node',
                    changes: expect.objectContaining({ category: 'function' }),
                })
            );
        });

        it('registers multiple node types from a single script tag correctly', async () => {
            const nodeScriptsData = `
      <script type="text/javascript">
        RED.nodes.registerType("multi-type-node1", {category: "function", color: "red"});
        RED.nodes.registerType("multi-type-node2", {category: "input", color: "blue"});
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledTimes(2);
            expect(mockDispatch).toHaveBeenNthCalledWith(
                1,
                paletteNodeActions.updateOne({
                    id: 'multi-type-node1',
                    changes: expect.objectContaining({
                        category: 'function',
                        color: 'red',
                    }),
                })
            );
            expect(mockDispatch).toHaveBeenNthCalledWith(
                2,
                paletteNodeActions.updateOne({
                    id: 'multi-type-node2',
                    changes: expect.objectContaining({
                        category: 'input',
                        color: 'blue',
                    }),
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
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                paletteNodeActions.updateOne({
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
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                paletteNodeActions.updateOne({
                    id: 'test-node',
                    changes: { helpTemplate: '<p>Help Template</p>' },
                })
            );
        });

        it('updates editor templates from script tags with type text/x-red correctly', async () => {
            const nodeScriptsData = `
      <script type="text/x-red" data-template-name="x-red-test-node">
        <div>X-Red Editor Template</div>
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                paletteNodeActions.updateOne({
                    id: 'x-red-test-node',
                    changes: {
                        editorTemplate: '<div>X-Red Editor Template</div>',
                    },
                })
            );
        });

        it('updates help templates from script tags with type text/x-red correctly', async () => {
            const nodeScriptsData = `
      <script type="text/x-red" data-help-name="x-red-test-node">
        <p>X-Red Help Template</p>
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledWith(
                paletteNodeActions.updateOne({
                    id: 'x-red-test-node',
                    changes: { helpTemplate: '<p>X-Red Help Template</p>' },
                })
            );
        });

        it('prepends style tags to editor templates based on module comments', async () => {
            const nodeScriptsData = `
      <!-- --- [red-module:node-red/mqtt] --- -->
      <style>.mqtt-style { color: red; }</style>
      <script type="text/html" data-template-name="mqtt-node1">
        <div>MQTT Node Template</div>
      </script>
      <script type="text/html" data-template-name="mqtt-node2">
        <div>Another MQTT Node Template</div>
      </script>
    `;
            const nodeLogic = new NodeLogic();
            await nodeLogic.setNodeScripts(nodeScriptsData)(
                mockDispatch,
                mockGetState
            );

            expect(mockDispatch).toHaveBeenCalledTimes(2);
            expect(mockDispatch).toHaveBeenNthCalledWith(
                1,
                paletteNodeActions.updateOne({
                    id: 'mqtt-node1',
                    changes: {
                        editorTemplate:
                            '<style>.mqtt-style { color: red; }</style><div>MQTT Node Template</div>',
                    },
                })
            );
            expect(mockDispatch).toHaveBeenNthCalledWith(
                2,
                paletteNodeActions.updateOne({
                    id: 'mqtt-node2',
                    changes: {
                        editorTemplate:
                            '<style>.mqtt-style { color: red; }</style><div>Another MQTT Node Template</div>',
                    },
                })
            );
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
            } as PaletteNodeEntity;

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

        it('should override existing node config values with defaults', () => {
            const node = {
                id: 'node1',
                type: 'exampleType',
                name: 'Example Node',
                property1: 'existingValue',
                x: 10,
                y: 20,
                z: '30',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
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
            } as PaletteNodeEntity;

            const result = nodeLogic.applyConfigDefaults(node, entity);

            expect(result).toEqual(
                expect.objectContaining({
                    property1: 'default1', // Default value is applied, overriding existing
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
            } as PaletteNodeEntity;

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
