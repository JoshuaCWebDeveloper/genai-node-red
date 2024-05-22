import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../../themes';
import { flowActions } from '../flow/flow.slice';
import { RootState } from '../../store';

export const BUILDER_FEATURE_KEY = 'builder';

// Define the state interface
export interface BuilderState {
    theme: Theme;
    showPrimarySidebar: boolean;
    showSecondarySidebar: boolean;
    showConsolePanel: boolean;
    editing: string | null;
    openFlows: string[]; // Array of flow IDs that are open
    activeFlow: string | null; // ID of the currently active flow
    newFlowCounter: number;
    newFolderCounter: number;
    newTreeItem?: string;
}

// Initial state
const initialState: BuilderState = {
    theme: 'light',
    showPrimarySidebar: true,
    showSecondarySidebar: true,
    showConsolePanel: true,
    editing: null,
    openFlows: [],
    activeFlow: null,
    newFlowCounter: 0,
    newFolderCounter: 0,
};

// Create the slice
export const builderSlice = createSlice({
    name: BUILDER_FEATURE_KEY,
    initialState,
    reducers: {
        // Action to set the theme
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
        },
        togglePrimarySidebar: state => {
            state.showPrimarySidebar = !state.showPrimarySidebar;
        },
        toggleSecondarySidebar: state => {
            state.showSecondarySidebar = !state.showSecondarySidebar;
        },
        toggleConsolePanel: state => {
            state.showConsolePanel = !state.showConsolePanel;
        },
        // Action to set the editing node
        setEditing: (state, action: PayloadAction<string | null>) => {
            state.editing = action.payload;
        },
        // Action to clear the editing node
        clearEditing: state => {
            state.editing = null;
        },
        // Action to add a flow to the open flows
        openFlow: (state, action: PayloadAction<string>) => {
            if (!state.openFlows.includes(action.payload)) {
                state.openFlows.push(action.payload);
            }
            if (!state.activeFlow) {
                state.activeFlow = action.payload;
            }
        },
        // Action to remove a flow from the open flows
        closeFlow: (state, action: PayloadAction<string>) => {
            state.openFlows = state.openFlows.filter(
                flow => flow !== action.payload
            );
            if (state.activeFlow === action.payload) {
                state.activeFlow = state.openFlows[0] ?? null;
            }
        },
        // Action to set the active flow
        setActiveFlow: (state, action: PayloadAction<string | null>) => {
            if (action.payload) {
                builderSlice.caseReducers.openFlow(
                    state,
                    action as PayloadAction<string>
                );
            }
            state.activeFlow = action.payload;
        },
        addNewFlow: (state, action: PayloadAction<string>) => {
            state.newFlowCounter++;
            state.newTreeItem = action.payload;
        },
        addNewFolder: (state, action: PayloadAction<string>) => {
            state.newFolderCounter++;
            state.newTreeItem = action.payload;
        },
        clearNewTreeItem: state => {
            state.newTreeItem = undefined;
        },
    },
    extraReducers(builder) {
        builder.addCase(
            flowActions.removeFlowEntity,
            (state, action: PayloadAction<string>) => {
                if (state.openFlows.includes(action.payload)) {
                    builderSlice.caseReducers.closeFlow(state, action);
                }
            }
        );
    },
});

// Export the reducer and actions
export const builderReducer = builderSlice.reducer;
export const builderActions = builderSlice.actions;

// Selectors

// builder state
export const selectBuilderState = (state: RootState) =>
    state[BUILDER_FEATURE_KEY];

export const selectTheme = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.theme
);

export const selectShowPrimarySidebar = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.showPrimarySidebar
);

export const selectShowSecondarySidebar = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.showSecondarySidebar
);

export const selectShowConsolePanel = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.showConsolePanel
);

export const selectEditing = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.editing
);

export const selectOpenFlows = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.openFlows
);

export const selectActiveFlow = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.activeFlow
);

export const selectNewFlowCounter = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.newFlowCounter
);

export const selectNewFolderCounter = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.newFolderCounter
);

export const selectNewTreeItem = createSelector(
    selectBuilderState,
    (builderState: BuilderState) => builderState.newTreeItem
);
