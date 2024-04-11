import { flowActions, flowAdapter, flowReducer } from './flow.slice';

describe('flow reducer', () => {
    it('should handle initial state', () => {
        const expected = flowAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(flowReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should set flows', () => {
        const initialState = flowAdapter.getInitialState({
            loadingStatus: 'not loaded' as const,
            error: null,
        });

        const flows = [
            {
                id: 'flow1',
                type: 'tab',
                label: 'Example Flow',
                disabled: false,
                info: 'Example flow info',
                env: [],
                // Add other properties as required by your FlowEntity type
            },
        ];

        const state = flowReducer(initialState, flowActions.addEntities(flows));

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'not loaded', // Assuming loadingStatus doesn't change with setFlows
                error: null, // Assuming error doesn't change with setFlows
                entities: {
                    flow1: flows[0],
                },
                ids: ['flow1'],
            })
        );
    });

    it('should update flow properties', () => {
        const initialState = flowReducer(
            flowAdapter.getInitialState({
                loadingStatus: 'not loaded' as const,
                error: null,
            }),
            flowActions.addEntities([
                {
                    id: 'flow1',
                    type: 'tab',
                    label: 'Initial Flow',
                    disabled: false,
                    info: 'Initial flow info',
                    env: [],
                    // Add other properties as required by your FlowEntity type
                },
            ])
        );

        const state = flowReducer(
            initialState,
            flowActions.updateEntity({
                id: 'flow1',
                changes: {
                    label: 'Updated Flow',
                    info: 'Updated flow info',
                    // Assuming changes might include updates to other properties
                    disabled: true,
                    // Add other properties as required by your FlowEntity type
                },
            })
        );

        expect(state).toEqual(
            expect.objectContaining({
                entities: expect.objectContaining({
                    flow1: expect.objectContaining({
                        id: 'flow1',
                        label: 'Updated Flow',
                        info: 'Updated flow info',
                        disabled: true,
                        // Add other properties as required by your FlowEntity type
                    }),
                }),
            })
        );
    });
});
