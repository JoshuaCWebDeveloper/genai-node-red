import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const PALETTE_NODE_FEATURE_KEY = 'paletteNode';

type SerializedFunction = {
    type: 'serialized-function';
    value: string;
};

// Define the structure of a default property
type DefaultProperty<T> = {
    value: T;
    required?: boolean;
    validate?: SerializedFunction;
};

// Define the structure of the defaults object more precisely
type NodeDefaults = {
    // Add more properties as needed
    [key: string]: DefaultProperty<unknown>;
};

export type PaletteNodeEntity = {
    // Core properties
    id: string;
    nodeRedId: string;
    name: string;
    type: string;
    category?: string;
    module: string;
    version: string;
    defaults?: NodeDefaults; // Object with editable properties for the node
    inputs?: number;
    outputs?: number;
    icon?: string;

    // UI properties
    color?: string;
    align?: string;
    paletteLabel?: string;
    inputLabels?: SerializedFunction;
    outputLabels?: SerializedFunction;
    label?: string;
    labelStyle?: string;
    editorTemplate?: string;
    helpTemplate?: string;

    // Event handlers
    oneditprepare?: SerializedFunction;
    oneditsave?: SerializedFunction;
    oneditcancel?: SerializedFunction;
    oneditdelete?: SerializedFunction;
    oneditresize?: SerializedFunction;
    onpaletteadd?: SerializedFunction;
    onpaletteremove?: SerializedFunction;

    // Other properties
    enabled?: boolean;
    local?: boolean;
    user?: boolean;
    button?: {
        onclick?: SerializedFunction;
    };
    credentials?: Record<
        string,
        {
            type: string;
        }
    >; // Optional object defining credential fields

    definitionScript?: string;
};

export interface PaletteNodeState
    extends EntityState<PaletteNodeEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string | null;
    searchQuery: string; // Add searchQuery to the state
}

export const paletteNodeAdapter = createEntityAdapter<PaletteNodeEntity>();

export const initialPaletteNodeState: PaletteNodeState =
    paletteNodeAdapter.getInitialState({
        loadingStatus: 'not loaded',
        error: null,
        searchQuery: '', // Initialize searchQuery as an empty string
    });

export const paletteNodeSlice = createSlice({
    name: PALETTE_NODE_FEATURE_KEY,
    initialState: initialPaletteNodeState,
    reducers: {
        // Existing reducers for CRUD operations
        addOne: paletteNodeAdapter.addOne,
        addMany: paletteNodeAdapter.addMany,
        updateOne: paletteNodeAdapter.updateOne,
        updateMany: paletteNodeAdapter.updateMany,
        upsertOne: paletteNodeAdapter.upsertOne,
        upsertMany: paletteNodeAdapter.upsertMany,
        removeOne: paletteNodeAdapter.removeOne,
        removeMany: paletteNodeAdapter.removeMany,
        setLoadingStatus: (
            state,
            action: PayloadAction<PaletteNodeState['loadingStatus']>
        ) => {
            state.loadingStatus = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        // Reducer to update searchQuery
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        // Custom action to set nodes
        setNodes: paletteNodeAdapter.setAll,
    },
    // No extraReducers if fetching is handled by RTK Query
});

// Export reducer and actions
export const paletteNodeReducer = paletteNodeSlice.reducer;
export const paletteNodeActions = paletteNodeSlice.actions;

// Selectors

// node state
export const selectPaletteNodeState = (rootState: RootState) =>
    rootState[PALETTE_NODE_FEATURE_KEY];

// entities
export const {
    selectAll: selectAllPaletteNodes,
    selectById: selectPaletteNodeById,
    selectIds: selectPaletteNodeIds,
    selectEntities: selectPaletteNodeEntities,
} = paletteNodeAdapter.getSelectors(selectPaletteNodeState);

// select by node red id
export const selectNodesByNodeRedId = createSelector(
    [selectAllPaletteNodes, (state, nodeRedId: string) => nodeRedId],
    (nodes, nodeRedId) => nodes.filter(node => node.nodeRedId === nodeRedId)
);

// Selector for searchQuery
export const selectSearchQuery = createSelector(
    selectPaletteNodeState,
    state => state.searchQuery
);

// Selector to get filtered nodes based on searchQuery
export const selectFilteredNodes = createSelector(
    [selectAllPaletteNodes, selectSearchQuery],
    (nodes, searchQuery) => {
        if (!searchQuery.trim()) return nodes; // Return all nodes if searchQuery is empty
        return nodes.filter(
            node =>
                node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.category?.toLowerCase().includes(searchQuery.toLowerCase())
            // Add more conditions based on other properties if needed
        );
    }
);
