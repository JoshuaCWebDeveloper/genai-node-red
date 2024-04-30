import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../../themes';

export const BUILDER_FEATURE_KEY = 'builder';

// Define the state interface
export interface BuilderState {
    theme: Theme;
    editing: string | null;
}

// Initial state
const initialState: BuilderState = {
    theme: 'light',
    editing: null,
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
        // Action to set the editing node
        setEditing: (state, action: PayloadAction<string | null>) => {
            state.editing = action.payload;
        },
        // Action to clear the editing node
        clearEditing: state => {
            state.editing = null;
        },
    },
});

// Export the reducer and actions
export const builderReducer = builderSlice.reducer;
export const builderActions = builderSlice.actions;

// Selectors
export const selectTheme = (state: { [BUILDER_FEATURE_KEY]: BuilderState }) =>
    state[BUILDER_FEATURE_KEY].theme;
export const selectEditing = (state: { [BUILDER_FEATURE_KEY]: BuilderState }) =>
    state[BUILDER_FEATURE_KEY].editing;
