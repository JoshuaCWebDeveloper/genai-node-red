import { RootState } from '../../store';
import { FlowState, SubflowEntity } from '../flow/flow.slice';
import {
    PALETTE_NODE_FEATURE_KEY,
    PaletteNodeEntity,
    PaletteNodeState,
    paletteNodeActions,
    paletteNodeAdapter,
    paletteNodeReducer,
    selectCategories,
    selectNodesByNodeRedId,
    selectPaletteNodeById,
} from './node.slice';

describe('node reducer', () => {
    it('should handle initial state', () => {
        const expected = paletteNodeAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
            searchQuery: '',
        });

        expect(paletteNodeReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle setNodes', () => {
        const initialState = paletteNodeAdapter.getInitialState({
            loadingStatus: 'not loaded' as const,
            error: null,
            searchQuery: '',
        });

        const nodes = [
            {
                id: 'node1',
                editorTemplate: '<div></div>',
                helpTemplate: '<p>Help</p>',
                // Include all required properties for a NodeEntity
                name: 'Example Node',
                type: 'exampleType',
                // Add other properties as required by your NodeEntity type
                nodeRedId: 'nodeRedId',
                nodeRedName: 'Node 1',
                module: 'module',
                version: 'version',
            },
        ];

        const state = paletteNodeReducer(
            initialState,
            paletteNodeActions.setNodes(nodes)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'not loaded', // Assuming loadingStatus doesn't change with setNodes
                error: null, // Assuming error doesn't change with setNodes
                entities: {
                    node1: nodes[0],
                },
                ids: ['node1'],
            })
        );
    });

    it('should handle updateNodeProperties', () => {
        let initialState = paletteNodeAdapter.getInitialState({
            loadingStatus: 'loaded' as const,
            error: null,
            // Assuming additional properties in the initial state
            searchQuery: '',
        });

        initialState = paletteNodeAdapter.setAll(initialState, [
            {
                id: 'node1',
                editorTemplate: '',
                helpTemplate: '',
                // Include all required properties for a NodeEntity
                name: 'Initial Node',
                type: 'initialType',
                // Add other properties as required by your NodeEntity type
                nodeRedId: 'nodeRedId',
                nodeRedName: 'Node 1',
                module: 'module',
                version: 'version',
            },
        ]);

        const state = paletteNodeReducer(
            initialState,
            paletteNodeActions.updateOne({
                id: 'node1',
                changes: {
                    editorTemplate: '<div>Updated</div>',
                    helpTemplate: '<p>Updated Help</p>',
                    // Assuming changes might include updates to other properties
                    name: 'Updated Node Name',
                    type: 'updatedType',
                    // Add other properties as required by your NodeEntity type
                },
            })
        );

        expect(state).toEqual(
            expect.objectContaining({
                entities: expect.objectContaining({
                    node1: expect.objectContaining({
                        id: 'node1',
                        editorTemplate: '<div>Updated</div>',
                        helpTemplate: '<p>Updated Help</p>',
                        name: 'Updated Node Name',
                        type: 'updatedType',
                        // Add other properties as required by your NodeEntity type
                    }),
                }),
            })
        );
    });

    describe('selectNodeById selector', () => {
        it('should return the correct node by id', () => {
            const nodes = [
                {
                    id: 'node1',
                    editorTemplate: '<div>Node 1 Editor</div>',
                    helpTemplate: '<p>Node 1 Help</p>',
                    name: 'Node 1',
                    type: 'exampleType',
                    nodeRedId: 'nodeRedId1',
                    nodeRedName: 'Node 1',
                    module: 'module1',
                    version: '1.0.0',
                },
                {
                    id: 'node2',
                    editorTemplate: '<div>Node 2 Editor</div>',
                    helpTemplate: '<p>Node 2 Help</p>',
                    name: 'Node 2',
                    type: 'exampleType2',
                    nodeRedId: 'nodeRedId2',
                    nodeRedName: 'Node 2',
                    module: 'module2',
                    version: '2.0.0',
                },
            ];

            const initialState: PaletteNodeState = {
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, PaletteNodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            };

            const state = {
                [PALETTE_NODE_FEATURE_KEY]: initialState,
            } as RootState;

            const selectedNode1 = selectPaletteNodeById(state, 'node1');
            const selectedNode2 = selectPaletteNodeById(state, 'node2');

            expect(selectedNode1).toEqual(nodes[0]);
            expect(selectedNode2).toEqual(nodes[1]);
        });

        it('should return undefined for a non-existent node id', () => {
            const nodes = [
                {
                    id: 'node1',
                    editorTemplate: '<div>Node 1 Editor</div>',
                    helpTemplate: '<p>Node 1 Help</p>',
                    name: 'Node 1',
                    type: 'exampleType',
                    nodeRedId: 'nodeRedId1',
                    nodeRedName: 'Node 1',
                    module: 'module1',
                    version: '1.0.0',
                },
            ];

            const initialState = paletteNodeAdapter.getInitialState({
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, PaletteNodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            }) as PaletteNodeState;

            const state = {
                [PALETTE_NODE_FEATURE_KEY]: initialState,
            } as RootState;

            const selectedNode = selectPaletteNodeById(
                state,
                'nonExistentNodeId'
            );

            expect(selectedNode).toBeUndefined();
        });
    });

    describe('selectNodesByNodeRedId', () => {
        it('should return nodes that match the specified nodeRedId', () => {
            // Mock state
            const state = {
                [PALETTE_NODE_FEATURE_KEY]: {
                    ids: ['node1', 'node2', 'node3'],
                    entities: {
                        node1: {
                            id: 'node1',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 1',
                        },
                        node2: {
                            id: 'node2',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 2',
                        },
                        node3: {
                            id: 'node3',
                            nodeRedId: 'node-red/http',
                            name: 'HTTP Node',
                        },
                    },
                    loadingStatus: 'loaded',
                    error: null,
                    searchQuery: '',
                },
            };

            // Selector call
            const result = selectNodesByNodeRedId(state, 'node-red/mqtt');

            // Expected result
            expect(result).toEqual([
                {
                    id: 'node1',
                    nodeRedId: 'node-red/mqtt',
                    name: 'MQTT Node 1',
                },
                {
                    id: 'node2',
                    nodeRedId: 'node-red/mqtt',
                    name: 'MQTT Node 2',
                },
            ]);
        });

        it('should return an empty array if no nodes match the specified nodeRedId', () => {
            const state = {
                [PALETTE_NODE_FEATURE_KEY]: {
                    ids: ['node1', 'node2', 'node3'],
                    entities: {
                        node1: {
                            id: 'node1',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 1',
                        },
                        node2: {
                            id: 'node2',
                            nodeRedId: 'node-red/mqtt',
                            name: 'MQTT Node 2',
                        },
                        node3: {
                            id: 'node3',
                            nodeRedId: 'node-red/http',
                            name: 'HTTP Node',
                        },
                    },
                    loadingStatus: 'loaded',
                    error: null,
                    searchQuery: '',
                },
            };

            // Selector call
            const result = selectNodesByNodeRedId(
                state,
                'non-existent-node-red-id'
            );

            // Expected result
            expect(result).toEqual([]);
        });
    });

    describe('selectCategories selector', () => {
        it('should return unique categories from nodes and subflows', () => {
            const nodes = [
                {
                    id: 'node1',
                    nodeRedId: 'nodeRedId1',
                    nodeRedName: 'Node 1',
                    name: 'Node 1',
                    type: 'exampleType',
                    category: 'Category1',
                    module: 'module1',
                    version: '1.0.0',
                },
                {
                    id: 'node2',
                    nodeRedId: 'nodeRedId2',
                    nodeRedName: 'Node 2',
                    name: 'Node 2',
                    type: 'exampleType2',
                    category: 'Category2',
                    module: 'module2',
                    version: '2.0.0',
                },
            ];

            const subflows = [
                {
                    id: 'subflow1',
                    type: 'subflow' as const,
                    name: 'Subflow 1',
                    disabled: false,
                    info: 'Subflow 1 info',
                    env: [],
                    color: '#000000',
                    inputLabels: [],
                    outputLabels: [],
                    category: 'SubflowCategory1',
                },
                {
                    id: 'subflow2',
                    type: 'subflow' as const,
                    name: 'Subflow 2',
                    disabled: false,
                    info: 'Subflow 2 info',
                    env: [],
                    color: '#000000',
                    inputLabels: [],
                    outputLabels: [],
                    category: 'SubflowCategory2',
                },
            ];

            const initialState: PaletteNodeState = {
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, PaletteNodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            };

            const state = {
                [PALETTE_NODE_FEATURE_KEY]: initialState,
                flow: {
                    flowEntities: {
                        ids: subflows.map(subflow => subflow.id),
                        entities: subflows.reduce((acc, subflow) => {
                            acc[subflow.id] = subflow;
                            return acc;
                        }, {} as Record<string, SubflowEntity>),
                    },
                    loadingStatus: 'loaded',
                    flowNodes: {},
                    directories: {},
                } as FlowState,
            } as RootState;

            const categories = selectCategories(state);

            expect(categories).toEqual([
                'SubflowCategory1',
                'SubflowCategory2',
                'Category1',
                'Category2',
            ]);
        });

        it('should return "other" for nodes without a category', () => {
            const nodes = [
                {
                    id: 'node1',
                    nodeRedId: 'nodeRedId1',
                    nodeRedName: 'Node 1',
                    name: 'Node 1',
                    type: 'exampleType',
                    module: 'module1',
                    version: '1.0.0',
                },
            ];

            const subflows = [
                {
                    id: 'subflow1',
                    type: 'subflow' as const,
                    name: 'Subflow 1',
                    disabled: false,
                    info: 'Subflow 1 info',
                    env: [],
                    color: '#000000',
                    inputLabels: [],
                    outputLabels: [],
                    category: 'SubflowCategory1',
                },
            ];

            const initialState: PaletteNodeState = {
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, PaletteNodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            };

            const state = {
                [PALETTE_NODE_FEATURE_KEY]: initialState,
                flow: {
                    flowEntities: {
                        ids: subflows.map(subflow => subflow.id),
                        entities: subflows.reduce((acc, subflow) => {
                            acc[subflow.id] = subflow;
                            return acc;
                        }, {} as Record<string, SubflowEntity>),
                    },
                    loadingStatus: 'loaded',
                    flowNodes: {},
                    directories: {},
                } as FlowState,
            } as RootState;

            const categories = selectCategories(state);

            expect(categories).toEqual(['SubflowCategory1', 'other']);
        });
    });
});
