import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../../themes';
import { flowActions } from '../flow/flow.slice';

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
            flowActions.removeEntity,
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
export const selectTheme = (state: { [BUILDER_FEATURE_KEY]: BuilderState }) =>
    state[BUILDER_FEATURE_KEY].theme;
export const selectShowPrimarySidebar = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].showPrimarySidebar;
export const selectShowSecondarySidebar = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].showSecondarySidebar;
export const selectShowConsolePanel = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].showConsolePanel;
export const selectEditing = (state: { [BUILDER_FEATURE_KEY]: BuilderState }) =>
    state[BUILDER_FEATURE_KEY].editing;
export const selectOpenFlows = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].openFlows;
export const selectActiveFlow = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].activeFlow;
export const selectNewFlowCounter = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].newFlowCounter;
export const selectNewFolderCounter = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].newFolderCounter;
export const selectNewTreeItem = (state: {
    [BUILDER_FEATURE_KEY]: BuilderState;
}) => state[BUILDER_FEATURE_KEY].newTreeItem;
