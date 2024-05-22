import { RootState } from '../../store';
import { flowActions } from '../flow/flow.slice';
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
    selectNewFlowCounter,
    selectNewFolderCounter,
    selectNewTreeItem,
    BuilderState,
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
        newFlowCounter: 0,
        newFolderCounter: 0,
    };

    describe('reducer actions', () => {
        it('should handle initial state', () => {
            expect(builderReducer(undefined, { type: '' })).toEqual(
                baseInitialState
            );
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

        it('addNewFlow() should increment newFlowCounter and set newTreeItem', () => {
            const initialState = {
                ...baseInitialState,
                newFlowCounter: 0,
                newTreeItem: undefined,
            };

            const newItem = 'newFlow1';

            const state = builderReducer(
                initialState,
                builderActions.addNewFlow(newItem)
            );

            expect(state.newFlowCounter).toEqual(1);
            expect(state.newTreeItem).toEqual(newItem);
        });

        it('addNewFolder() should increment newFolderCounter and set newTreeItem', () => {
            const initialState = {
                ...baseInitialState,
                newFolderCounter: 0,
                newTreeItem: undefined,
            };

            const newItem = 'newFolder1';

            const state = builderReducer(
                initialState,
                builderActions.addNewFolder(newItem)
            );

            expect(state.newFolderCounter).toEqual(1);
            expect(state.newTreeItem).toEqual(newItem);
        });

        it('clearNewTreeItem() should clear newTreeItem', () => {
            const initialState = {
                ...baseInitialState,
                newTreeItem: 'someItem',
            };

            const state = builderReducer(
                initialState,
                builderActions.clearNewTreeItem()
            );

            expect(state.newTreeItem).toBeUndefined();
        });
    });

    describe('extra reducers', () => {
        it('flowActions.removeFlowEntity() should trigger closeFlow if the entity is an open flow', () => {
            const initialState = {
                ...baseInitialState,
                openFlows: ['flow1', 'flow2'],
                activeFlow: 'flow1',
            };

            const action = {
                type: flowActions.removeFlowEntity.type,
                payload: 'flow1',
            };

            const state = builderReducer(initialState, action);

            expect(state.openFlows).not.toContain('flow1');
            expect(state.activeFlow).not.toEqual('flow1');
            expect(state.openFlows).toEqual(['flow2']);
        });

        it('flowActions.removeFlowEntity() should not affect state if the entity is not an open flow', () => {
            const initialState = {
                ...baseInitialState,
                openFlows: ['flow1', 'flow2'],
                activeFlow: 'flow1',
            };

            const action = {
                type: flowActions.removeFlowEntity.type,
                payload: 'flow3', // flow3 is not in openFlows
            };

            const state = builderReducer(initialState, action);

            expect(state.openFlows).toEqual(['flow1', 'flow2']);
            expect(state.activeFlow).toEqual('flow1');
        });
    });

    describe('selectors', () => {
        it('selectTheme() should select the theme', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    theme: 'dark' as const,
                } as BuilderState,
            } as RootState;

            expect(selectTheme(state)).toEqual('dark');
        });

        it('selectShowPrimarySidebar() should select primary sidebar visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showPrimarySidebar: true,
                } as BuilderState,
            } as RootState;

            expect(selectShowPrimarySidebar(state)).toEqual(true);
        });

        it('selectShowSecondarySidebar() should select secondary sidebar visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showSecondarySidebar: false,
                } as BuilderState,
            } as RootState;

            expect(selectShowSecondarySidebar(state)).toEqual(false);
        });

        it('selectShowConsolePanel() should select console panel visibility', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    showConsolePanel: true,
                } as BuilderState,
            } as RootState;

            expect(selectShowConsolePanel(state)).toEqual(true);
        });

        it('selectEditing() should select the editing node', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    editing: 'node1',
                } as BuilderState,
            } as RootState;

            expect(selectEditing(state)).toEqual('node1');
        });

        it('selectOpenFlows() should select open flows', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    openFlows: ['flow1', 'flow2'],
                } as BuilderState,
            } as RootState;

            expect(selectOpenFlows(state)).toEqual(['flow1', 'flow2']);
        });

        it('selectActiveFlow() should select the active flow', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    activeFlow: 'flow1',
                } as BuilderState,
            } as RootState;

            expect(selectActiveFlow(state)).toEqual('flow1');
        });

        it('selectNewFlowCounter() should select the newFlowCounter', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    newFlowCounter: 5,
                } as BuilderState,
            } as RootState;

            expect(selectNewFlowCounter(state)).toEqual(5);
        });

        it('selectNewFolderCounter() should select the newFolderCounter', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    newFolderCounter: 3,
                } as BuilderState,
            } as RootState;

            expect(selectNewFolderCounter(state)).toEqual(3);
        });

        it('selectNewTreeItem() should select the newTreeItem', () => {
            const state = {
                builder: {
                    ...baseInitialState,
                    newTreeItem: 'newItem1',
                } as BuilderState,
            } as RootState;

            expect(selectNewTreeItem(state)).toEqual('newItem1');
        });
    });
});
