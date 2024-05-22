import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const FLOW_FEATURE_KEY = 'flow';

export type PointModel = {
    id: string;
    type: string;
    x: number;
    y: number;
};

export type PortModel = {
    id: string;
    type: string;
    x: number;
    y: number;
    name: string;
    alignment: string;
    parentNode: string;
    links: string[];
    in: boolean;
    extras: { label: string } & Record<string, unknown>;
};

export type LinkModel = {
    id: string;
    type: string;
    source: string;
    sourcePort: string;
    target: string;
    targetPort: string;
    points: PointModel[];
    labels: LabelModel[];
    width: number;
    color: string;
    curvyness: number;
    selectedColor: string;
    locked: boolean;
    selected: boolean;
    extras: Record<string, unknown>;
};

export type LabelModel = {
    id: string;
    type: string;
    offsetX: number;
    offsetY: number;
    label: string;
};

// Define interfaces for the different entities
export interface FlowNodeEntity {
    id: string;
    type: string;
    x: number;
    y: number;
    z: string; // Flow ID for nodes that belong to a flow or subflow
    name: string;
    inputs: number;
    outputs: number;
    wires: string[][]; // For nodes, to represent connections
    credentials?: Record<string, unknown>;
    [key: string]: unknown; // To allow for other properties dynamically
    // React Diagrams
    selected?: boolean;
    locked?: boolean;
    inPorts: PortModel[];
    outPorts: PortModel[];
    links: Record<string, LinkModel>;
}

export interface FlowEntity {
    id: string;
    type: 'flow';
    name: string;
    disabled: boolean;
    info: string;
    env: unknown[];
    directory?: string;
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
    directory?: string;
}

export interface DirectoryEntity {
    id: string;
    type: 'directory';
    name: string;
    directory: string;
}

export interface FlowState {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string | null;
    flowEntities: EntityState<FlowEntity | SubflowEntity, string>;
    flowNodes: EntityState<FlowNodeEntity, string>;
    directories: EntityState<DirectoryEntity, string>;
}

export const flowAdapter = createEntityAdapter<FlowEntity | SubflowEntity>();
export const nodeAdapter = createEntityAdapter<FlowNodeEntity>();
export const directoryAdapter = createEntityAdapter<DirectoryEntity>();

export const initialFlowState: FlowState = {
    loadingStatus: 'not loaded',
    error: null,
    flowEntities: flowAdapter.getInitialState(),
    flowNodes: nodeAdapter.getInitialState(),
    directories: directoryAdapter.getInitialState(),
};

export const flowSlice = createSlice({
    name: FLOW_FEATURE_KEY,
    initialState: initialFlowState,
    reducers: {
        addFlowEntity: (state, action) => {
            flowAdapter.addOne(state.flowEntities, action.payload);
        },
        addFlowEntities: (state, action) => {
            flowAdapter.addMany(state.flowEntities, action.payload);
        },
        updateFlowEntity: (state, action) => {
            flowAdapter.updateOne(state.flowEntities, action.payload);
        },
        updateFlowEntities: (state, action) => {
            flowAdapter.updateMany(state.flowEntities, action.payload);
        },
        upsertFlowEntity: (state, action) => {
            flowAdapter.upsertOne(state.flowEntities, action.payload);
        },
        upsertFlowEntities: (state, action) => {
            flowAdapter.upsertMany(state.flowEntities, action.payload);
        },
        removeFlowEntity: (state, action) => {
            flowAdapter.removeOne(state.flowEntities, action.payload);
        },
        removeFlowEntities: (state, action) => {
            flowAdapter.removeMany(state.flowEntities, action.payload);
        },
        addFlowNode: (state, action) => {
            nodeAdapter.addOne(state.flowNodes, action.payload);
        },
        addFlowNodes: (state, action) => {
            nodeAdapter.addMany(state.flowNodes, action.payload);
        },
        updateFlowNode: (state, action) => {
            nodeAdapter.updateOne(state.flowNodes, action.payload);
        },
        updateFlowNodes: (state, action) => {
            nodeAdapter.updateMany(state.flowNodes, action.payload);
        },
        upsertFlowNode: (state, action) => {
            nodeAdapter.upsertOne(state.flowNodes, action.payload);
        },
        upsertFlowNodes: (state, action) => {
            nodeAdapter.upsertMany(state.flowNodes, action.payload);
        },
        removeFlowNode: (state, action) => {
            nodeAdapter.removeOne(state.flowNodes, action.payload);
        },
        removeFlowNodes: (state, action) => {
            nodeAdapter.removeMany(state.flowNodes, action.payload);
        },
        addDirectory: (state, action) => {
            directoryAdapter.addOne(state.directories, action.payload);
        },
        addDirectories: (state, action) => {
            directoryAdapter.addMany(state.directories, action.payload);
        },
        updateDirectory: (state, action) => {
            directoryAdapter.updateOne(state.directories, action.payload);
        },
        updateDirectories: (state, action) => {
            directoryAdapter.updateMany(state.directories, action.payload);
        },
        upsertDirectory: (state, action) => {
            directoryAdapter.upsertOne(state.directories, action.payload);
        },
        upsertDirectories: (state, action) => {
            directoryAdapter.upsertMany(state.directories, action.payload);
        },
        removeDirectory: (state, action) => {
            directoryAdapter.removeOne(state.directories, action.payload);
        },
        removeDirectories: (state, action) => {
            directoryAdapter.removeMany(state.directories, action.payload);
        },
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

// flow state
export const selectFlowState = (state: RootState) => state[FLOW_FEATURE_KEY];

// entities
export const selectFlowEntities = createSelector(
    selectFlowState,
    state => state.flowEntities
);
export const selectFlowNodeEntities = createSelector(
    selectFlowState,
    state => state.flowNodes
);
export const selectFlowDirectoryEntities = createSelector(
    selectFlowState,
    state => state.directories
);

// entity selectors
export const {
    selectAll: selectAllFlowEntities,
    selectById: selectFlowEntityById,
    selectIds: selectFlowEntityIds,
} = flowAdapter.getSelectors(selectFlowEntities);

export const {
    selectAll: selectAllFlowNodes,
    selectById: selectFlowNodeById,
    selectIds: selectFlowNodeIds,
} = nodeAdapter.getSelectors(selectFlowNodeEntities);

export const {
    selectAll: selectAllDirectories,
    selectById: selectDirectoryById,
    selectIds: selectDirectoryIds,
} = directoryAdapter.getSelectors(selectFlowDirectoryEntities);

export const selectAllFlows = createSelector(
    selectAllFlowEntities,
    entities =>
        entities.filter(entity => entity.type === 'flow') as FlowEntity[]
);

export const selectAllSubflows = createSelector(
    selectAllFlowEntities,
    entities =>
        entities.filter(entity => entity.type === 'subflow') as SubflowEntity[]
);

export const selectFlowNodesByFlowId = createSelector(
    [selectAllFlowNodes, (state: RootState, flowId: string) => flowId],
    (nodes, flowId) => nodes.filter(node => node.z === flowId)
);
