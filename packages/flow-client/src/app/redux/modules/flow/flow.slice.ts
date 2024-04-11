import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const FLOW_FEATURE_KEY = 'flow';

// Define interfaces for the different entities
export interface FlowNodeEntity {
    id: string;
    type: string;
    z?: string; // Flow ID for nodes that belong to a flow or subflow
    name?: string;
    wires?: string[][]; // For nodes, to represent connections
    [key: string]: unknown; // To allow for other properties dynamically
}

export interface FlowEntity {
    id: string;
    type: 'tab'; // Distinguishing flows from nodes
    label: string;
    disabled: boolean;
    info: string;
    env: unknown[];
}

export interface SubflowEntity {
    id: string;
    type: 'subflow';
    name: string;
    info: string;
    category: string;
    env: unknown[];
    color: string;
    icon?: string;
    in?: unknown[];
    out?: unknown[];
}

// Union type for all possible entities in the flow state
export type FlowStateEntity = FlowNodeEntity | FlowEntity | SubflowEntity;

export interface FlowState extends EntityState<FlowStateEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string | null;
}

export const flowAdapter = createEntityAdapter<FlowStateEntity>();

export const initialFlowState: FlowState = flowAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: null,
});

export const flowSlice = createSlice({
    name: FLOW_FEATURE_KEY,
    initialState: initialFlowState,
    reducers: {
        addEntity: flowAdapter.addOne,
        addEntities: flowAdapter.addMany,
        updateEntity: flowAdapter.updateOne,
        upsertEntity: flowAdapter.upsertOne,
        upsertEntities: flowAdapter.upsertMany,
        removeEntity: flowAdapter.removeOne,
        removeEntities: flowAdapter.removeMany,
        setLoadingStatus: (
            state,
            action: PayloadAction<FlowState['loadingStatus']>
        ) => {
            state.loadingStatus = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const flowReducer = flowSlice.reducer;
export const flowActions = flowSlice.actions;

// Selectors
export const {
    selectAll: selectAllEntities,
    selectById: selectEntityById,
    selectIds: selectEntityIds,
} = flowAdapter.getSelectors(
    (state: { [FLOW_FEATURE_KEY]: FlowState }) => state[FLOW_FEATURE_KEY]
);

export const selectFlows = createSelector(
    selectAllEntities,
    entities => entities.filter(entity => entity.type === 'tab') as FlowEntity[]
);

export const selectSubflows = createSelector(
    selectAllEntities,
    entities =>
        entities.filter(entity => entity.type === 'subflow') as SubflowEntity[]
);

export const selectFlowNodes = createSelector(
    selectAllEntities,
    entities =>
        entities.filter(
            entity => entity.type !== 'tab' && entity.type !== 'subflow'
        ) as FlowNodeEntity[]
);

export const selectFlowNodesByFlowId = createSelector(
    [selectFlowNodes, (state: RootState, flowId: string) => flowId],
    (nodes, flowId) => nodes.filter(node => node.z === flowId)
);
