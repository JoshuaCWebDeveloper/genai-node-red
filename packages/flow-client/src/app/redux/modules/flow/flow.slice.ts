import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const FLOW_FEATURE_KEY = 'flow';

enum EnvVarType {
    MSG = 'msg',
    FLOW = 'flow',
    GLOBAL = 'global',
    STR = 'str',
    NUM = 'num',
    BOOL = 'bool',
    JSON = 'json',
    RE = 're',
    DATE = 'date',
    JSONATA = 'jsonata',
    BIN = 'bin',
    ENV = 'env',
    NODE = 'node',
    CRED = 'cred',
}

export type EnvironmentVariable = {
    name: string;
    value: string;
    type: EnvVarType;
};

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
    env: EnvironmentVariable[];
    directory?: string;
}

export interface SubflowEntity {
    id: string;
    type: 'subflow';
    name: string;
    info: string;
    category: string;
    env: EnvironmentVariable[];
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
        addFlowEntity: (
            state,
            action: Parameters<typeof flowAdapter.addOne>[1]
        ) => {
            flowAdapter.addOne(state.flowEntities, action);
        },
        addFlowEntities: (
            state,
            action: Parameters<typeof flowAdapter.addMany>[1]
        ) => {
            flowAdapter.addMany(state.flowEntities, action);
        },
        updateFlowEntity: (
            state,
            action: Parameters<typeof flowAdapter.updateOne>[1]
        ) => {
            flowAdapter.updateOne(state.flowEntities, action);
        },
        updateFlowEntities: (
            state,
            action: Parameters<typeof flowAdapter.updateMany>[1]
        ) => {
            flowAdapter.updateMany(state.flowEntities, action);
        },
        upsertFlowEntity: (
            state,
            action: Parameters<typeof flowAdapter.upsertOne>[1]
        ) => {
            flowAdapter.upsertOne(state.flowEntities, action);
        },
        upsertFlowEntities: (
            state,
            action: Parameters<typeof flowAdapter.upsertMany>[1]
        ) => {
            flowAdapter.upsertMany(state.flowEntities, action);
        },
        removeFlowEntity: (
            state,
            action: Parameters<typeof flowAdapter.removeOne>[1]
        ) => {
            flowAdapter.removeOne(state.flowEntities, action);
        },
        removeFlowEntities: (
            state,
            action: Parameters<typeof flowAdapter.removeMany>[1]
        ) => {
            flowAdapter.removeMany(state.flowEntities, action.payload);
        },
        addFlowNode: (
            state,
            action: Parameters<typeof nodeAdapter.addOne>[1]
        ) => {
            nodeAdapter.addOne(state.flowNodes, action);
        },
        addFlowNodes: (
            state,
            action: Parameters<typeof nodeAdapter.addMany>[1]
        ) => {
            nodeAdapter.addMany(state.flowNodes, action);
        },
        updateFlowNode: (
            state,
            action: Parameters<typeof nodeAdapter.updateOne>[1]
        ) => {
            nodeAdapter.updateOne(state.flowNodes, action);
        },
        updateFlowNodes: (
            state,
            action: Parameters<typeof nodeAdapter.updateMany>[1]
        ) => {
            nodeAdapter.updateMany(state.flowNodes, action);
        },
        upsertFlowNode: (
            state,
            action: Parameters<typeof nodeAdapter.upsertOne>[1]
        ) => {
            nodeAdapter.upsertOne(state.flowNodes, action);
        },
        upsertFlowNodes: (
            state,
            action: Parameters<typeof nodeAdapter.upsertMany>[1]
        ) => {
            nodeAdapter.upsertMany(state.flowNodes, action);
        },
        removeFlowNode: (
            state,
            action: Parameters<typeof nodeAdapter.removeOne>[1]
        ) => {
            nodeAdapter.removeOne(state.flowNodes, action);
        },
        removeFlowNodes: (
            state,
            action: Parameters<typeof nodeAdapter.removeMany>[1]
        ) => {
            nodeAdapter.removeMany(state.flowNodes, action);
        },
        addDirectory: (
            state,
            action: Parameters<typeof directoryAdapter.addOne>[1]
        ) => {
            directoryAdapter.addOne(state.directories, action);
        },
        addDirectories: (
            state,
            action: Parameters<typeof directoryAdapter.addMany>[1]
        ) => {
            directoryAdapter.addMany(state.directories, action);
        },
        updateDirectory: (
            state,
            action: Parameters<typeof directoryAdapter.updateOne>[1]
        ) => {
            directoryAdapter.updateOne(state.directories, action);
        },
        updateDirectories: (
            state,
            action: Parameters<typeof directoryAdapter.updateMany>[1]
        ) => {
            directoryAdapter.updateMany(state.directories, action);
        },
        upsertDirectory: (
            state,
            action: Parameters<typeof directoryAdapter.upsertOne>[1]
        ) => {
            directoryAdapter.upsertOne(state.directories, action);
        },
        upsertDirectories: (
            state,
            action: Parameters<typeof directoryAdapter.upsertMany>[1]
        ) => {
            directoryAdapter.upsertMany(state.directories, action);
        },
        removeDirectory: (
            state,
            action: Parameters<typeof directoryAdapter.removeOne>[1]
        ) => {
            directoryAdapter.removeOne(state.directories, action);
        },
        removeDirectories: (
            state,
            action: Parameters<typeof directoryAdapter.removeMany>[1]
        ) => {
            directoryAdapter.removeMany(state.directories, action);
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
export const selectFlowEntityState = createSelector(
    selectFlowState,
    state => state.flowEntities
);
export const selectFlowNodeEntityState = createSelector(
    selectFlowState,
    state => state.flowNodes
);
export const selectFlowDirectoryEntityState = createSelector(
    selectFlowState,
    state => state.directories
);

// entity selectors
export const {
    selectAll: selectAllFlowEntities,
    selectById: selectFlowEntityById,
    selectIds: selectFlowEntityIds,
    selectEntities: selectFlowEntities,
} = flowAdapter.getSelectors(selectFlowEntityState);

export const {
    selectAll: selectAllFlowNodes,
    selectById: selectFlowNodeById,
    selectIds: selectFlowNodeIds,
    selectEntities: selectFlowNodeEntities,
} = nodeAdapter.getSelectors(selectFlowNodeEntityState);

export const {
    selectAll: selectAllDirectories,
    selectById: selectDirectoryById,
    selectIds: selectDirectoryIds,
    selectEntities: selectDirectoryEntities,
} = directoryAdapter.getSelectors(selectFlowDirectoryEntityState);

// additional selectors
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
