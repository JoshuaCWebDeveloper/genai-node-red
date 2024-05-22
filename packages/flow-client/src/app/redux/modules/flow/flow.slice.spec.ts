import { RootState } from '../../store';
import {
    DirectoryEntity,
    FlowEntity,
    FlowNodeEntity,
    FlowState,
    flowActions,
    flowReducer,
    initialFlowState,
    selectAllDirectories,
    selectAllFlowEntities,
    selectAllFlowNodes,
    selectAllFlows,
    selectAllSubflows,
    selectDirectoryById,
    selectDirectoryEntities,
    selectDirectoryIds,
    selectFlowDirectoryEntityState,
    selectFlowEntities,
    selectFlowEntityById,
    selectFlowEntityIds,
    selectFlowEntityState,
    selectFlowNodeById,
    selectFlowNodeEntities,
    selectFlowNodeEntityState,
    selectFlowNodeIds,
    selectFlowNodesByFlowId,
    selectFlowState,
} from './flow.slice';

describe('Flow Slice', () => {
    it('should handle initial state', () => {
        expect(flowReducer(undefined, { type: '' })).toEqual(initialFlowState);
    });

    describe('Reducer actions - Flow Entities', () => {
        let initialState: FlowState;

        beforeEach(() => {
            initialState = initialFlowState;
        });

        it('addFlowEntity()', () => {
            const newFlow: FlowEntity = {
                id: 'flow1',
                type: 'flow',
                name: 'New Flow',
                disabled: false,
                info: 'Info about new flow',
                env: [],
            };

            const state = flowReducer(
                initialState,
                flowActions.addFlowEntity(newFlow)
            );

            expect(state.flowEntities.entities[newFlow.id]).toEqual(newFlow);
            expect(state.flowEntities.ids).toContain(newFlow.id);
        });

        it('updateFlowEntity()', () => {
            // First, add an entity
            const existingFlow: FlowEntity = {
                id: 'flow1',
                type: 'flow',
                name: 'Existing Flow',
                disabled: false,
                info: 'Existing flow info',
                env: [],
            };
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntity(existingFlow)
            );

            // Now, update it
            const updatedFlow = {
                id: 'flow1',
                changes: {
                    name: 'Updated Flow',
                    info: 'Updated flow info',
                },
            };
            state = flowReducer(
                state,
                flowActions.updateFlowEntity(updatedFlow)
            );

            expect(state.flowEntities.entities['flow1'].name).toEqual(
                'Updated Flow'
            );
            expect(state.flowEntities.entities['flow1'].info).toEqual(
                'Updated flow info'
            );
        });

        it('removeFlowEntity()', () => {
            // First, add an entity
            const flow: FlowEntity = {
                id: 'flow1',
                type: 'flow',
                name: 'Flow to Remove',
                disabled: false,
                info: 'Flow info',
                env: [],
            };
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntity(flow)
            );

            // Now, remove it
            state = flowReducer(state, flowActions.removeFlowEntity(flow.id));

            expect(state.flowEntities.entities[flow.id]).toBeUndefined();
            expect(state.flowEntities.ids).not.toContain(flow.id);
        });

        it('addFlowEntities()', () => {
            const flows = [
                {
                    id: 'flow1',
                    type: 'flow',
                    name: 'Flow One',
                    disabled: false,
                    info: 'Info for Flow One',
                    env: [],
                },
                {
                    id: 'flow2',
                    type: 'flow',
                    name: 'Flow Two',
                    disabled: true,
                    info: 'Info for Flow Two',
                    env: [],
                },
            ] as FlowEntity[];

            const state = flowReducer(
                initialState,
                flowActions.addFlowEntities(flows)
            );

            expect(state.flowEntities.entities['flow1']).toEqual(flows[0]);
            expect(state.flowEntities.entities['flow2']).toEqual(flows[1]);
            expect(state.flowEntities.ids).toContain('flow1');
            expect(state.flowEntities.ids).toContain('flow2');
        });

        it('updateFlowEntities()', () => {
            const initialFlows = [
                {
                    id: 'flow1',
                    type: 'flow',
                    name: 'Initial Flow One',
                    disabled: false,
                    info: 'Initial info',
                    env: [],
                },
                {
                    id: 'flow2',
                    type: 'flow',
                    name: 'Initial Flow Two',
                    disabled: true,
                    info: 'Initial info',
                    env: [],
                },
            ] as FlowEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntities(initialFlows)
            );

            const updates = [
                {
                    id: 'flow1',
                    changes: { name: 'Updated Flow One', info: 'Updated info' },
                },
                { id: 'flow2', changes: { disabled: false } },
            ];
            state = flowReducer(state, flowActions.updateFlowEntities(updates));

            expect(state.flowEntities.entities['flow1'].name).toEqual(
                'Updated Flow One'
            );
            expect(state.flowEntities.entities['flow1'].info).toEqual(
                'Updated info'
            );
            expect(
                (state.flowEntities.entities['flow2'] as FlowEntity).disabled
            ).toEqual(false);
        });

        it('removeFlowEntities()', () => {
            const flows = [
                {
                    id: 'flow1',
                    type: 'flow',
                    name: 'Flow One',
                    disabled: false,
                    info: 'Info for Flow One',
                    env: [],
                },
                {
                    id: 'flow2',
                    type: 'flow',
                    name: 'Flow Two',
                    disabled: true,
                    info: 'Info for Flow Two',
                    env: [],
                },
            ] as FlowEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntities(flows)
            );

            state = flowReducer(
                state,
                flowActions.removeFlowEntities(['flow1', 'flow2'])
            );

            expect(state.flowEntities.entities['flow1']).toBeUndefined();
            expect(state.flowEntities.entities['flow2']).toBeUndefined();
            expect(state.flowEntities.ids).not.toContain('flow1');
            expect(state.flowEntities.ids).not.toContain('flow2');
        });

        it('upsertFlowEntity()', () => {
            const flow = {
                id: 'flow1',
                type: 'flow',
                name: 'Existing Flow',
                disabled: false,
                info: 'Existing info',
                env: [],
            } as FlowEntity;
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntity(flow)
            );

            const upsertFlow = {
                id: 'flow1',
                type: 'flow',
                name: 'Upserted Flow',
                disabled: true,
                info: 'Upserted info',
                env: [],
            } as FlowEntity;
            state = flowReducer(
                state,
                flowActions.upsertFlowEntity(upsertFlow)
            );

            expect(state.flowEntities.entities['flow1']).toEqual(upsertFlow);
        });

        it('upsertFlowEntities()', () => {
            const initialFlows = [
                {
                    id: 'flow1',
                    type: 'flow',
                    name: 'Initial Flow One',
                    disabled: false,
                    info: 'Initial info',
                    env: [],
                },
                {
                    id: 'flow2',
                    type: 'flow',
                    name: 'Initial Flow Two',
                    disabled: true,
                    info: 'Initial info',
                    env: [],
                },
            ] as FlowEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addFlowEntities(initialFlows)
            );

            const upsertFlows = [
                {
                    id: 'flow1',
                    type: 'flow',
                    name: 'Upserted Flow One',
                    disabled: true,
                    info: 'Upserted info',
                    env: [],
                },
                {
                    id: 'flow3',
                    type: 'flow',
                    name: 'New Flow Three',
                    disabled: false,
                    info: 'New flow info',
                    env: [],
                },
            ] as FlowEntity[];
            state = flowReducer(
                state,
                flowActions.upsertFlowEntities(upsertFlows)
            );

            expect(state.flowEntities.entities['flow1'].name).toEqual(
                'Upserted Flow One'
            );
            expect(
                (state.flowEntities.entities['flow1'] as FlowEntity).disabled
            ).toEqual(true);
            expect(state.flowEntities.entities['flow1'].info).toEqual(
                'Upserted info'
            );
            expect(state.flowEntities.entities['flow3']).toEqual(
                upsertFlows[1]
            );
            expect(state.flowEntities.ids).toContain('flow3');
        });
    });

    describe('Reducer actions - Flow Nodes', () => {
        let initialState: FlowState;

        beforeEach(() => {
            initialState = initialFlowState;
        });

        it('addFlowNode()', () => {
            const newNode: FlowNodeEntity = {
                id: 'node1',
                type: 'node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'New Node',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
            };

            const state = flowReducer(
                initialState,
                flowActions.addFlowNode(newNode)
            );

            expect(state.flowNodes.entities[newNode.id]).toEqual(newNode);
            expect(state.flowNodes.ids).toContain(newNode.id);
        });

        it('updateFlowNode()', () => {
            const existingNode: FlowNodeEntity = {
                id: 'node1',
                type: 'node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Existing Node',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
            };
            let state = flowReducer(
                initialState,
                flowActions.addFlowNode(existingNode)
            );

            const updatedNode = {
                id: 'node1',
                changes: {
                    name: 'Updated Node',
                    x: 150,
                    y: 250,
                },
            };
            state = flowReducer(state, flowActions.updateFlowNode(updatedNode));

            expect(state.flowNodes.entities['node1'].name).toEqual(
                'Updated Node'
            );
            expect(state.flowNodes.entities['node1'].x).toEqual(150);
            expect(state.flowNodes.entities['node1'].y).toEqual(250);
        });

        it('removeFlowNode()', () => {
            const node: FlowNodeEntity = {
                id: 'node1',
                type: 'node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Node to Remove',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
            };
            let state = flowReducer(
                initialState,
                flowActions.addFlowNode(node)
            );

            state = flowReducer(state, flowActions.removeFlowNode(node.id));

            expect(state.flowNodes.entities[node.id]).toBeUndefined();
            expect(state.flowNodes.ids).not.toContain(node.id);
        });

        it('should handle removeFlowNodes', () => {
            const nodes = [
                {
                    id: 'node1',
                    type: 'node',
                    x: 100,
                    y: 200,
                    z: 'flow1',
                    name: 'Node One',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node2',
                    type: 'node',
                    x: 300,
                    y: 400,
                    z: 'flow2',
                    name: 'Node Two',
                    inputs: 2,
                    outputs: 2,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node3',
                    type: 'node',
                    x: 500,
                    y: 600,
                    z: 'flow3',
                    name: 'Node Three',
                    inputs: 3,
                    outputs: 3,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];
            let state = flowReducer(
                initialState,
                flowActions.addFlowNodes(nodes)
            );

            // Now, remove multiple nodes
            state = flowReducer(
                state,
                flowActions.removeFlowNodes(['node1', 'node2'])
            );

            expect(state.flowNodes.entities['node1']).toBeUndefined();
            expect(state.flowNodes.entities['node2']).toBeUndefined();
            expect(state.flowNodes.ids).not.toContain('node1');
            expect(state.flowNodes.ids).not.toContain('node2');
            // Check that node3 still exists
            expect(state.flowNodes.entities['node3']).toEqual(nodes[2]);
        });

        it('addFlowNodes()', () => {
            const nodes = [
                {
                    id: 'node1',
                    type: 'node',
                    x: 100,
                    y: 200,
                    z: 'flow1',
                    name: 'Node One',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node2',
                    type: 'node',
                    x: 300,
                    y: 400,
                    z: 'flow2',
                    name: 'Node Two',
                    inputs: 2,
                    outputs: 2,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];

            const state = flowReducer(
                initialState,
                flowActions.addFlowNodes(nodes)
            );

            expect(state.flowNodes.entities['node1']).toEqual(nodes[0]);
            expect(state.flowNodes.entities['node2']).toEqual(nodes[1]);
            expect(state.flowNodes.ids).toContain('node1');
            expect(state.flowNodes.ids).toContain('node2');
        });

        it('updateFlowNodes()', () => {
            const initialNodes = [
                {
                    id: 'node1',
                    type: 'node',
                    x: 100,
                    y: 200,
                    z: 'flow1',
                    name: 'Initial Node One',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node2',
                    type: 'node',
                    x: 300,
                    y: 400,
                    z: 'flow2',
                    name: 'Initial Node Two',
                    inputs: 2,
                    outputs: 2,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];
            let state = flowReducer(
                initialState,
                flowActions.addFlowNodes(initialNodes)
            );

            const updates = [
                {
                    id: 'node1',
                    changes: { name: 'Updated Node One', x: 150, y: 250 },
                },
                {
                    id: 'node2',
                    changes: { name: 'Updated Node Two', x: 350, y: 450 },
                },
            ];
            state = flowReducer(state, flowActions.updateFlowNodes(updates));

            expect(state.flowNodes.entities['node1'].name).toEqual(
                'Updated Node One'
            );
            expect(state.flowNodes.entities['node1'].x).toEqual(150);
            expect(state.flowNodes.entities['node1'].y).toEqual(250);
            expect(state.flowNodes.entities['node2'].name).toEqual(
                'Updated Node Two'
            );
            expect(state.flowNodes.entities['node2'].x).toEqual(350);
            expect(state.flowNodes.entities['node2'].y).toEqual(450);
        });

        it('upsertFlowNode()', () => {
            const node = {
                id: 'node1',
                type: 'node',
                x: 100,
                y: 200,
                z: 'flow1',
                name: 'Existing Node',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
            };
            let state = flowReducer(
                initialState,
                flowActions.addFlowNode(node)
            );

            const upsertNode = {
                id: 'node1',
                type: 'node',
                x: 150,
                y: 250,
                z: 'flow1',
                name: 'Upserted Node',
                inputs: 1,
                outputs: 1,
                wires: [],
                inPorts: [],
                outPorts: [],
                links: {},
            };
            state = flowReducer(state, flowActions.upsertFlowNode(upsertNode));

            expect(state.flowNodes.entities['node1']).toEqual(upsertNode);
        });

        it('upsertFlowNodes()', () => {
            const initialNodes = [
                {
                    id: 'node1',
                    type: 'node',
                    x: 100,
                    y: 200,
                    z: 'flow1',
                    name: 'Initial Node One',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node3',
                    type: 'node',
                    x: 500,
                    y: 600,
                    z: 'flow3',
                    name: 'Initial Node Three',
                    inputs: 3,
                    outputs: 3,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];
            let state = flowReducer(
                initialState,
                flowActions.addFlowNodes(initialNodes)
            );

            const upsertNodes = [
                {
                    id: 'node1',
                    type: 'node',
                    x: 150,
                    y: 250,
                    z: 'flow1',
                    name: 'Upserted Node One',
                    inputs: 1,
                    outputs: 1,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
                {
                    id: 'node2',
                    type: 'node',
                    x: 300,
                    y: 400,
                    z: 'flow2',
                    name: 'New Node Two',
                    inputs: 2,
                    outputs: 2,
                    wires: [],
                    inPorts: [],
                    outPorts: [],
                    links: {},
                },
            ];
            state = flowReducer(
                state,
                flowActions.upsertFlowNodes(upsertNodes)
            );

            expect(state.flowNodes.entities['node1'].x).toEqual(150);
            expect(state.flowNodes.entities['node1'].y).toEqual(250);
            expect(state.flowNodes.entities['node1'].name).toEqual(
                'Upserted Node One'
            );
            expect(state.flowNodes.entities['node2']).toEqual(upsertNodes[1]);
            expect(state.flowNodes.ids).toContain('node2');
        });
    });

    describe('Reducer actions - Directories', () => {
        let initialState: FlowState;

        beforeEach(() => {
            initialState = initialFlowState;
        });

        it('addDirectory()', () => {
            const newDirectory: DirectoryEntity = {
                id: 'dir1',
                name: 'New Directory',
                type: 'directory',
                directory: '',
            };

            const state = flowReducer(
                initialState,
                flowActions.addDirectory(newDirectory)
            );

            expect(state.directories.entities[newDirectory.id]).toEqual(
                newDirectory
            );
            expect(state.directories.ids).toContain(newDirectory.id);
        });

        it('addDirectories()', () => {
            const directories = [
                {
                    id: 'dir1',
                    name: 'Directory One',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'dir2',
                    name: 'Directory Two',
                    directory: '',
                    type: 'directory',
                },
            ] as DirectoryEntity[];

            const state = flowReducer(
                initialState,
                flowActions.addDirectories(directories)
            );

            expect(state.directories.entities['dir1']).toEqual(directories[0]);
            expect(state.directories.entities['dir2']).toEqual(directories[1]);
            expect(state.directories.ids).toContain('dir1');
            expect(state.directories.ids).toContain('dir2');
        });

        it('updateDirectory()', () => {
            const existingDirectory: DirectoryEntity = {
                id: 'dir1',
                name: 'Existing Directory',
                directory: '',
                type: 'directory',
            };
            let state = flowReducer(
                initialState,
                flowActions.addDirectory(existingDirectory)
            );

            const updatedDirectory = {
                id: 'dir1',
                changes: {
                    name: 'Updated Directory',
                },
            };
            state = flowReducer(
                state,
                flowActions.updateDirectory(updatedDirectory)
            );

            expect(state.directories.entities['dir1'].name).toEqual(
                'Updated Directory'
            );
        });

        it('updateDirectories()', () => {
            const initialDirectories = [
                {
                    id: 'dir1',
                    name: 'Initial Directory One',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'dir2',
                    name: 'Initial Directory Two',
                    directory: '',
                    type: 'directory',
                },
            ] as DirectoryEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addDirectories(initialDirectories)
            );

            const updates = [
                { id: 'dir1', changes: { name: 'Updated Directory One' } },
                { id: 'dir2', changes: { name: 'Updated Directory Two' } },
            ];
            state = flowReducer(state, flowActions.updateDirectories(updates));

            expect(state.directories.entities['dir1'].name).toEqual(
                'Updated Directory One'
            );
            expect(state.directories.entities['dir2'].name).toEqual(
                'Updated Directory Two'
            );
        });

        it('removeDirectory()', () => {
            const directory: DirectoryEntity = {
                id: 'dir1',
                name: 'Directory to Remove',
                directory: '',
                type: 'directory',
            };
            let state = flowReducer(
                initialState,
                flowActions.addDirectory(directory)
            );

            state = flowReducer(
                state,
                flowActions.removeDirectory(directory.id)
            );

            expect(state.directories.entities[directory.id]).toBeUndefined();
            expect(state.directories.ids).not.toContain(directory.id);
        });

        it('removeDirectories()', () => {
            const directories = [
                {
                    id: 'dir1',
                    name: 'Directory One',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'dir2',
                    name: 'Directory Two',
                    directory: '',
                    type: 'directory',
                },
            ] as DirectoryEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addDirectories(directories)
            );

            state = flowReducer(
                state,
                flowActions.removeDirectories(['dir1', 'dir2'])
            );

            expect(state.directories.entities['dir1']).toBeUndefined();
            expect(state.directories.entities['dir2']).toBeUndefined();
            expect(state.directories.ids).not.toContain('dir1');
            expect(state.directories.ids).not.toContain('dir2');
        });

        it('upsertDirectory()', () => {
            const directory = {
                id: 'dir1',
                name: 'Existing Directory',
                directory: '',
                type: 'directory',
            } as DirectoryEntity;
            let state = flowReducer(
                initialState,
                flowActions.addDirectory(directory)
            );

            const upsertDirectory = {
                id: 'dir1',
                name: 'Upserted Directory',
                directory: '',
                type: 'directory',
            } as DirectoryEntity;
            state = flowReducer(
                state,
                flowActions.upsertDirectory(upsertDirectory)
            );

            expect(state.directories.entities['dir1']).toEqual(upsertDirectory);
        });

        it('upsertDirectories()', () => {
            const initialDirectories = [
                {
                    id: 'dir1',
                    name: 'Initial Directory One',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'dir3',
                    name: 'Initial Directory Three',
                    directory: '',
                    type: 'directory',
                },
            ] as DirectoryEntity[];
            let state = flowReducer(
                initialState,
                flowActions.addDirectories(initialDirectories)
            );

            const upsertDirectories = [
                {
                    id: 'dir1',
                    name: 'Upserted Directory One',
                    directory: '',
                    type: 'directory',
                },
                {
                    id: 'dir2',
                    name: 'New Directory Two',
                    directory: '',
                    type: 'directory',
                },
            ] as DirectoryEntity[];
            state = flowReducer(
                state,
                flowActions.upsertDirectories(upsertDirectories)
            );

            expect(state.directories.entities['dir1'].name).toEqual(
                'Upserted Directory One'
            );
            expect(state.directories.entities['dir2']).toEqual(
                upsertDirectories[1]
            );
            expect(state.directories.ids).toContain('dir2');
        });
    });

    describe('Selectors - Core', () => {
        let state: RootState;

        beforeEach(() => {
            state = {
                flow: initialFlowState,
            } as RootState;
        });

        it('should select the flow state', () => {
            expect(selectFlowState(state)).toEqual(initialFlowState);
        });

        it('should select the flow entities state', () => {
            const customState = {
                ...state,
                flow: {
                    ...state.flow,
                    flowEntities: {
                        ids: ['flow1'],
                        entities: {
                            flow1: {
                                id: 'flow1',
                                type: 'flow' as const,
                                name: 'Test Flow',
                                disabled: false,
                                info: '',
                                env: [],
                                directory: '',
                            },
                        },
                    },
                },
            };

            expect(selectFlowEntityState(customState)).toEqual(
                customState.flow.flowEntities
            );
        });

        it('should select the flow nodes state', () => {
            const customState = {
                ...state,
                flow: {
                    ...state.flow,
                    flowNodes: {
                        ids: ['node1'],
                        entities: {
                            node1: {
                                id: 'node1',
                                type: 'node',
                                x: 100,
                                y: 200,
                                z: 'flow1',
                                name: 'Node One',
                                inputs: 1,
                                outputs: 1,
                                wires: [],
                                inPorts: [],
                                outPorts: [],
                                links: {},
                            },
                        },
                    },
                },
            };

            expect(selectFlowNodeEntityState(customState)).toEqual(
                customState.flow.flowNodes
            );
        });

        it('should select the flow directories state', () => {
            const customState = {
                ...state,
                flow: {
                    ...state.flow,
                    directories: {
                        ids: ['dir1'],
                        entities: {
                            dir1: {
                                id: 'dir1',
                                type: 'directory' as const,
                                name: 'Main Directory',
                                directory: '/main',
                            },
                        },
                    },
                },
            };

            expect(selectFlowDirectoryEntityState(customState)).toEqual(
                customState.flow.directories
            );
        });
    });

    describe('Selectors - Flow Entities', () => {
        let state: RootState;

        beforeEach(() => {
            state = {
                flow: {
                    flowEntities: {
                        ids: ['flow1', 'subflow1'],
                        entities: {
                            flow1: {
                                id: 'flow1',
                                type: 'flow' as const,
                                name: 'Main Flow',
                                disabled: false,
                                info: '',
                                env: [],
                            },
                            subflow1: {
                                id: 'subflow1',
                                type: 'subflow' as const,
                                name: 'Sub Flow 1',
                                category: 'default',
                                info: '',
                                env: [],
                                color: 'blue',
                            },
                        },
                    },
                } as unknown as FlowState,
            } as RootState;
        });

        it('selectAllFlowEntities()', () => {
            const entities = selectAllFlowEntities(state);
            expect(entities.length).toEqual(2);
            expect(entities).toEqual([
                state.flow.flowEntities.entities['flow1'],
                state.flow.flowEntities.entities['subflow1'],
            ]);
        });

        it('selectFlowEntityById()', () => {
            const entity = selectFlowEntityById(state, 'flow1');
            expect(entity).toEqual(state.flow.flowEntities.entities['flow1']);
        });

        it('selectFlowEntityIds()', () => {
            const ids = selectFlowEntityIds(state);
            expect(ids).toEqual(['flow1', 'subflow1']);
        });

        it('selectFlowEntities()', () => {
            const entities = selectFlowEntities(state);
            expect(Object.keys(entities).length).toEqual(2);
            expect(Object.values(entities)).toEqual([
                state.flow.flowEntities.entities['flow1'],
                state.flow.flowEntities.entities['subflow1'],
            ]);
        });

        it('selectAllFlows()', () => {
            const flows = selectAllFlows(state);
            expect(flows.length).toEqual(1);
            expect(flows[0]).toEqual(state.flow.flowEntities.entities['flow1']);
        });

        it('selectAllSubflows()', () => {
            const subflows = selectAllSubflows(state);
            expect(subflows.length).toEqual(1);
            expect(subflows[0]).toEqual(
                state.flow.flowEntities.entities['subflow1']
            );
        });
    });

    describe('Selectors - Flow Nodes', () => {
        let state: RootState;

        beforeEach(() => {
            state = {
                flow: {
                    flowNodes: {
                        ids: ['node1', 'node2'],
                        entities: {
                            node1: {
                                id: 'node1',
                                type: 'node' as const,
                                x: 100,
                                y: 200,
                                z: 'flow1',
                                name: 'Node One',
                                inputs: 1,
                                outputs: 1,
                                wires: [],
                                inPorts: [],
                                outPorts: [],
                                links: {},
                            },
                            node2: {
                                id: 'node2',
                                type: 'node' as const,
                                x: 300,
                                y: 400,
                                z: 'flow2',
                                name: 'Node Two',
                                inputs: 2,
                                outputs: 2,
                                wires: [],
                                inPorts: [],
                                outPorts: [],
                                links: {},
                            },
                        },
                    },
                } as unknown as FlowState,
            } as RootState;
        });

        it('selectAllFlowNodes()', () => {
            const nodes = selectAllFlowNodes(state);
            expect(nodes.length).toEqual(2);
            expect(nodes).toEqual([
                state.flow.flowNodes.entities['node1'],
                state.flow.flowNodes.entities['node2'],
            ]);
        });

        it('selectFlowNodeById()', () => {
            const node = selectFlowNodeById(state, 'node1');
            expect(node).toEqual(state.flow.flowNodes.entities['node1']);
        });

        it('selectFlowNodeIds()', () => {
            const ids = selectFlowNodeIds(state);
            expect(ids).toEqual(['node1', 'node2']);
        });

        it('selectFlowNodeEntities()', () => {
            const entities = selectFlowNodeEntities(state);
            expect(Object.keys(entities).length).toEqual(2);
            expect(Object.values(entities)).toEqual([
                state.flow.flowNodes.entities['node1'],
                state.flow.flowNodes.entities['node2'],
            ]);
        });

        it('selectFlowNodesByFlowId()', () => {
            const nodes = selectFlowNodesByFlowId(state, 'flow1');
            expect(nodes.length).toEqual(1);
            expect(nodes[0]).toEqual(state.flow.flowNodes.entities['node1']);
        });
    });

    describe('Selectors - Directories', () => {
        let state: RootState;

        beforeEach(() => {
            state = {
                flow: {
                    directories: {
                        ids: ['dir1', 'dir2'],
                        entities: {
                            dir1: {
                                id: 'dir1',
                                type: 'directory',
                                name: 'Main Directory',
                                directory: '/main',
                            },
                            dir2: {
                                id: 'dir2',
                                type: 'directory',
                                name: 'Secondary Directory',
                                directory: '/secondary',
                            },
                        },
                    },
                } as unknown as FlowState,
            } as RootState;
        });

        it('selectAllDirectories()', () => {
            const directories = selectAllDirectories(state);
            expect(directories.length).toEqual(2);
            expect(directories).toEqual([
                state.flow.directories.entities['dir1'],
                state.flow.directories.entities['dir2'],
            ]);
        });

        it('selectDirectoryById()', () => {
            const directory = selectDirectoryById(state, 'dir1');
            expect(directory).toEqual(state.flow.directories.entities['dir1']);
        });

        it('selectDirectoryIds()', () => {
            const ids = selectDirectoryIds(state);
            expect(ids).toEqual(['dir1', 'dir2']);
        });

        it('selectDirectoryEntities()', () => {
            const entities = selectDirectoryEntities(state);
            expect(Object.keys(entities).length).toEqual(2);
            expect(Object.values(entities)).toEqual([
                state.flow.directories.entities['dir1'],
                state.flow.directories.entities['dir2'],
            ]);
        });
    });
});
