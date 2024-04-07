import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';

export const NODE_FEATURE_KEY = 'node';

export interface NodeEntity {
    // Core properties
    id: string;
    nodeRedId: string;
    name: string;
    type: string;
    category?: string;
    module: string;
    version: string;
    defaults?: Record<string, unknown>; // Object with editable properties for the node
    inputs?: number;
    outputs?: number;
    icon?: string;

    // UI properties
    color?: string;
    align?: string;
    paletteLabel?: string;
    inputLabels?: string | string[];
    outputLabels?: string | string[];
    label?: string;
    labelStyle?: string;
    editorTemplate?: string;
    helpTemplate?: string;

    // Event handlers
    oneditprepare?: string;
    oneditsave?: string;
    oneditcancel?: string;
    oneditdelete?: string;
    oneditresize?: string;
    onpaletteadd?: () => void;
    onpaletteremove?: () => void;

    // Other properties
    enabled?: boolean;
    local?: boolean;
    user?: boolean;
    button?: {
        onclick?: () => void;
    };
    credentials?: Record<string, unknown>; // Optional object defining credential fields
}

export interface NodeState extends EntityState<NodeEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string | null;
    searchQuery: string; // Add searchQuery to the state
}

export const nodeAdapter = createEntityAdapter<NodeEntity>();

export const initialNodeState: NodeState = nodeAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: null,
    searchQuery: '', // Initialize searchQuery as an empty string
});

export const nodeSlice = createSlice({
    name: NODE_FEATURE_KEY,
    initialState: initialNodeState,
    reducers: {
        // Existing reducers for CRUD operations
        addOne: nodeAdapter.addOne,
        addMany: nodeAdapter.addMany,
        updateOne: nodeAdapter.updateOne,
        removeOne: nodeAdapter.removeOne,
        setLoadingStatus: (
            state,
            action: PayloadAction<NodeState['loadingStatus']>
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
        setNodes: (state, action: PayloadAction<NodeEntity[]>) => {
            nodeAdapter.setAll(state, action.payload);
        },
    },
    // No extraReducers if fetching is handled by RTK Query
});

// Export reducer and actions
export const nodeReducer = nodeSlice.reducer;
export const nodeActions = nodeSlice.actions;

// Export selectors
const { selectAll, selectById } = nodeAdapter.getSelectors();
export const getNodeState = (rootState: {
    [NODE_FEATURE_KEY]: NodeState;
}): NodeState => rootState[NODE_FEATURE_KEY];
export const selectAllNodes = createSelector(getNodeState, selectAll);
export const selectNodeById = createSelector(
    getNodeState,
    (state: NodeState, nodeId: string) => nodeId,
    (state, nodeId) => selectById(state, nodeId)
);

// Selector for searchQuery
export const selectSearchQuery = createSelector(
    getNodeState,
    state => state.searchQuery
);

// Selector to get filtered nodes based on searchQuery
export const selectFilteredNodes = createSelector(
    [selectAllNodes, selectSearchQuery],
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
