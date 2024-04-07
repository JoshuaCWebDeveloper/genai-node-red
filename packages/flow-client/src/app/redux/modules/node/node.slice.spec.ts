import { nodeActions, nodeAdapter, nodeReducer } from './node.slice';

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
});
