import {
    builderActions,
    builderReducer,
    selectTheme,
    selectShowPrimarySidebar,
    selectShowSecondarySidebar,
    selectShowConsolePanel,
    selectEditing,
    selectOpenFlows,
    selectActiveFlow,
} from './builder.slice';

describe('builder.slice', () => {
    const baseInitialState = {
        editing: null,
        theme: 'light' as const,
        showPrimarySidebar: true,
        showSecondarySidebar: true,
        showConsolePanel: true,
        openFlows: [],
        activeFlow: null,
    };

    describe('reducer actions', () => {
        it('should handle initial state', () => {
            const expected = {
                editing: null,
                theme: 'light' as const,
                showPrimarySidebar: true,
                showSecondarySidebar: true,
                showConsolePanel: true,
                openFlows: [],
                activeFlow: null,
            };

            expect(builderReducer(undefined, { type: '' })).toEqual(expected);
        });

        it('setEditing() should handle setEditing', () => {
            const initialState = {
                ...baseInitialState,
                editing: null,
            };

            const editingNodeId = 'node1';

            const state = builderReducer(
                initialState,
                builderActions.setEditing(editingNodeId)
            );

            expect(state).toEqual(
                expect.objectContaining({
                    editing: editingNodeId,
                })
            );
        });

        it('clearEditing() should handle clearEditing', () => {
            const initialState = {
                ...baseInitialState,
                editing: 'node1',
            };

            const state = builderReducer(
                initialState,
                builderActions.clearEditing()
            );

            expect(state).toEqual(
                expect.objectContaining({
                    editing: null,
                })
            );
        });

        it('togglePrimarySidebar() should toggle primary sidebar visibility', () => {
            const initialState = {
                ...baseInitialState,
                showPrimarySidebar: true,
            };

            const state = builderReducer(
                initialState,
                builderActions.togglePrimarySidebar()
            );

            expect(state).toEqual(
                expect.objectContaining({
                    showPrimarySidebar: false,
                })
            );
        });

        it('toggleSecondarySidebar() should toggle secondary sidebar visibility', () => {
            const initialState = {
                ...baseInitialState,
                showSecondarySidebar: true,
            };

            const state = builderReducer(
                initialState,
                builderActions.toggleSecondarySidebar()
            );

            expect(state.showSecondarySidebar).toEqual(false);
        });

        it('toggleConsolePanel() should toggle console panel visibility', () => {
            const initialState = {
                ...baseInitialState,
                showConsolePanel: true,
            };

            const state = builderReducer(
                initialState,
                builderActions.toggleConsolePanel()
            );

            expect(state.showConsolePanel).toEqual(false);
        });

        it('openFlow() should open a new flow if not already open', () => {
            const initialState = {
                ...baseInitialState,
                openFlows: [],
                activeFlow: null,
            };

            const flowId = 'flow1';

            const state = builderReducer(
                initialState,
                builderActions.openFlow(flowId)
            );

            expect(state.openFlows).toContain(flowId);
            expect(state.activeFlow).toEqual(flowId);
        });

        it('closeFlow() should close an open flow', () => {
            const initialState = {
                ...baseInitialState,
                openFlows: ['flow1', 'flow2'],
                activeFlow: 'flow1',
            };

            const state = builderReducer(
                initialState,
                builderActions.closeFlow('flow1')
            );

            expect(state.openFlows).not.toContain('flow1');
            expect(state.activeFlow).toEqual('flow2');
        });

        it('setActiveFlow() should set the active flow', () => {
            const initialState = {
                ...baseInitialState,
                activeFlow: null,
            };

            const flowId = 'flow1';

            const state = builderReducer(
                initialState,
                builderActions.setActiveFlow(flowId)
            );

            expect(state.activeFlow).toEqual(flowId);
        });
    });

    describe('selectors', () => {
        it('selectTheme() should select the theme', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    theme: 'dark' as const,
                },
            };

            expect(selectTheme(state)).toEqual('dark');
        });

        it('selectShowPrimarySidebar() should select primary sidebar visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showPrimarySidebar: true,
                },
            };

            expect(selectShowPrimarySidebar(state)).toEqual(true);
        });

        it('selectShowSecondarySidebar() should select secondary sidebar visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showSecondarySidebar: false,
                },
            };

            expect(selectShowSecondarySidebar(state)).toEqual(false);
        });

        it('selectShowConsolePanel() should select console panel visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showConsolePanel: true,
                },
            };

            expect(selectShowConsolePanel(state)).toEqual(true);
        });

        it('selectEditing() should select the editing node', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    editing: 'node1',
                },
            };

            expect(selectEditing(state)).toEqual('node1');
        });

        it('selectOpenFlows() should select open flows', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    openFlows: ['flow1', 'flow2'],
                },
            };

            expect(selectOpenFlows(state)).toEqual(['flow1', 'flow2']);
        });

        it('selectActiveFlow() should select the active flow', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    activeFlow: 'flow1',
                },
            };

            expect(selectActiveFlow(state)).toEqual('flow1');
        });
    });
});
