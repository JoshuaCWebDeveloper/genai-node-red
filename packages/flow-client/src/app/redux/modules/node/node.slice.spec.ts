import {
    NODE_FEATURE_KEY,
    NodeEntity,
    NodeState,
    nodeActions,
    nodeAdapter,
    nodeReducer,
    selectNodeById,
} from './node.slice';

describe('node reducer', () => {
    it('should handle initial state', () => {
        const expected = nodeAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
            searchQuery: '',
        });

        expect(nodeReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle setNodes', () => {
        const initialState = nodeAdapter.getInitialState({
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
                module: 'module',
                version: 'version',
            },
        ];

        const state = nodeReducer(initialState, nodeActions.setNodes(nodes));

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
        let initialState = nodeAdapter.getInitialState({
            loadingStatus: 'loaded' as const,
            error: null,
            // Assuming additional properties in the initial state
            searchQuery: '',
        });

        initialState = nodeAdapter.setAll(initialState, [
            {
                id: 'node1',
                editorTemplate: '',
                helpTemplate: '',
                // Include all required properties for a NodeEntity
                name: 'Initial Node',
                type: 'initialType',
                // Add other properties as required by your NodeEntity type
                nodeRedId: 'nodeRedId',
                module: 'module',
                version: 'version',
            },
        ]);

        const state = nodeReducer(
            initialState,
            nodeActions.updateOne({
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
                    module: 'module2',
                    version: '2.0.0',
                },
            ];

            const initialState: NodeState = {
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, NodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            };

            const state = { [NODE_FEATURE_KEY]: initialState };

            const selectedNode1 = selectNodeById(state, 'node1');
            const selectedNode2 = selectNodeById(state, 'node2');

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
                    module: 'module1',
                    version: '1.0.0',
                },
            ];

            const initialState = nodeAdapter.getInitialState({
                ids: nodes.map(node => node.id),
                entities: nodes.reduce((acc, node) => {
                    acc[node.id] = node;
                    return acc;
                }, {} as Record<string, NodeEntity>),
                loadingStatus: 'not loaded',
                error: null,
                searchQuery: '',
            }) as NodeState;

            const state = { [NODE_FEATURE_KEY]: initialState };

            const selectedNode = selectNodeById(state, 'nonExistentNodeId');

            expect(selectedNode).toBeUndefined();
        });
    });
});
