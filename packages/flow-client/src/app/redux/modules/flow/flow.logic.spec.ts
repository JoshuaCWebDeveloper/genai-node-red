import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { AppDispatch, RootState } from '../../store';
import { builderActions } from '../builder/builder.slice';
import { FlowLogic } from './flow.logic';
import {
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
    selectSubflowInOutByFlowId,
    selectSubflowInstancesByFlowId,
} from './flow.slice';
import { GraphLogic } from './graph.logic';
import { TreeLogic } from './tree.logic';

vi.mock('../builder/builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../builder/builder.slice')
    >();
    return {
        ...originalModule,
        selectNewFlowCounter: vi.fn(() => 0),
    };
});

vi.mock('../flow/flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../flow/flow.slice')
    >();
    return {
        ...originalModule,
        selectSubflowInstancesByFlowId: vi.fn(() => []),
        selectFlowEntityById: vi.fn(() => ({})),
        selectSubflowInOutByFlowId: vi.fn(() => []),
    };
});

const mockNodeLogicInstance = {
    createFlowNode: vi.fn(),
    updateFlowNode: vi.fn(),
};

vi.mock('./node.logic', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./node.logic')
    >();
    return {
        ...originalModule,
        NodeLogic: function () {
            return mockNodeLogicInstance;
        },
    };
});

const mockDispatch = vi.fn(action => {
    if (typeof action === 'function') {
        action(mockDispatch, mockGetState);
    }
}) as unknown as AppDispatch;
const mockGetState = vi.fn(() => ({})) as unknown as MockedFunction<
    () => RootState
>;

const mockedSelectSubflowInstancesByFlowId =
    selectSubflowInstancesByFlowId as MockedFunction<
        typeof selectSubflowInstancesByFlowId
    >;

const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;

const mockedSelectSubflowInOutByFlowId =
    selectSubflowInOutByFlowId as MockedFunction<
        typeof selectSubflowInOutByFlowId
    >;

describe('flow.logic', () => {
    let flowLogic: FlowLogic;

    beforeEach(() => {
        vi.clearAllMocks();
        flowLogic = new FlowLogic();
    });

    describe('Getters', () => {
        it('graph', () => {
            const graph = flowLogic.graph;
            expect(graph).toBeInstanceOf(GraphLogic);
        });

        it('node', () => {
            const node = flowLogic.node;
            expect(node).toBe(mockNodeLogicInstance);
        });

        it('tree', () => {
            const tree = flowLogic.tree;
            expect(tree).toBeInstanceOf(TreeLogic);
        });
    });

    describe('createNewFlow', () => {
        it('should dispatch actions to create a new flow', () => {
            const thunk = flowLogic.createNewFlow();
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'flow',
                        name: 'New Flow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });

        it('should not set active flow if open is false', () => {
            const thunk = flowLogic.createNewFlow({}, false);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'flow',
                        name: 'New Flow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).not.toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });
    });

    describe('createNewSubflow', () => {
        it('should dispatch actions to create a new subflow', () => {
            const thunk = flowLogic.createNewSubflow();
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'subflow',
                        name: 'New Subflow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });

        it('should not set active subflow if open is false', () => {
            const thunk = flowLogic.createNewSubflow({}, false);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntity(
                    expect.objectContaining({
                        type: 'subflow',
                        name: 'New Subflow',
                    })
                )
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.addNewFlow(expect.any(String))
            );
            expect(mockDispatch).not.toHaveBeenCalledWith(
                builderActions.setActiveFlow(expect.any(String))
            );
        });
    });

    describe('updateSubflowInputs()', () => {
        const subflow = {
            id: 'subflow1',
            inputLabels: [],
            outputLabels: [],
            type: 'subflow',
            name: 'Subflow',
            info: '',
            category: 'Subflow',
            env: [],
            color: 'Subflow',
        } as SubflowEntity;

        beforeEach(() => {
            mockedSelectFlowEntityById.mockReturnValue(subflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([]);
        });

        it('should add input nodes when inputs increase', () => {
            const thunk = flowLogic.updateSubflowInputs({ ...subflow }, 1);
            thunk(mockDispatch);

            const expectedNode = expect.objectContaining({
                type: 'in',
                z: subflow.id,
            });
            expect(mockNodeLogicInstance.createFlowNode.mock.calls).toEqual(
                expect.arrayContaining([expect.arrayContaining([expectedNode])])
            );

            // get id of new node
            const newNodeId =
                mockNodeLogicInstance.createFlowNode.mock.calls[0][0].id;

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity(
                    expect.objectContaining({
                        id: subflow.id,
                        changes: { in: [newNodeId] },
                    })
                )
            );
        });

        it('should remove input nodes when inputs decrease', () => {
            const thunk = flowLogic.updateSubflowInputs(
                { ...subflow, in: ['input1'] },
                0
            );
            thunk(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.removeFlowNodes(['input1'])
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity({
                    id: subflow.id,
                    changes: { in: [] },
                })
            );
        });
    });

    describe('updateSubflowOutputs()', () => {
        const subflow = {
            id: 'subflow1',
            inputLabels: [],
            outputLabels: [],
            type: 'subflow',
            name: 'Subflow',
            info: '',
            category: 'Subflow',
            env: [],
            color: 'Subflow',
        } as SubflowEntity;

        beforeEach(() => {
            mockedSelectFlowEntityById.mockReturnValue(subflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([]);
        });

        it('should add output nodes when outputs increase', () => {
            const thunk = flowLogic.updateSubflowOutputs({ ...subflow }, 2);
            thunk(mockDispatch);

            const expectedAddFlowNode = expect.objectContaining({
                type: 'out',
                z: subflow.id,
            });

            expect(mockNodeLogicInstance.createFlowNode.mock.calls).toEqual(
                expect.arrayContaining([
                    expect.arrayContaining([expectedAddFlowNode]),
                    expect.arrayContaining([expectedAddFlowNode]),
                ])
            );

            // get id of new node
            const newNodeIds =
                mockNodeLogicInstance.createFlowNode.mock.calls.map(
                    call => call[0].id
                );

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity(
                    expect.objectContaining({
                        id: subflow.id,
                        changes: { out: newNodeIds },
                    })
                )
            );
        });

        it('should remove output nodes when outputs decrease', () => {
            const thunk = flowLogic.updateSubflowOutputs(
                { ...subflow, out: ['output1', 'output2'] },
                1
            );
            thunk(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.removeFlowNodes(['output2'])
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity(
                    expect.objectContaining({
                        id: subflow.id,
                        changes: { out: ['output1'] },
                    })
                )
            );
        });
    });

    describe('updateSubflow()', () => {
        const subflow = {
            id: 'subflow1',
            inputLabels: [],
            outputLabels: [],
            type: 'subflow',
            name: 'Subflow',
            info: '',
            category: 'Subflow',
            env: [],
            color: 'Subflow',
        } as SubflowEntity;

        const subflowInstance = {
            id: 'node1',
            type: 'subflow:subflow1',
            name: 'Subflow Instance',
            inPorts: [],
            outPorts: [],
            x: 0,
            y: 0,
            z: 'ec8a78',
            inputs: 0,
            outputs: 0,
            wires: [],
            links: {},
        } as FlowNodeEntity;

        beforeEach(() => {
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([]);
            mockedSelectFlowEntityById.mockReturnValue(subflow);
        });

        it('should update subflow entity', () => {
            const changes = { name: 'Updated Subflow' };
            const thunk = flowLogic.updateSubflow(subflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity({
                    id: subflow.id,
                    changes,
                })
            );
        });

        it('should update subflow instance name if it matches the subflow name', () => {
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    name: subflow.name,
                },
            ]);

            const changes = { name: 'Updated Subflow' };
            const thunk = flowLogic.updateSubflow(subflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                changes
            );
        });

        it('should not update subflow instance name if it has been customized', () => {
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    name: 'Custom Name',
                },
            ]);

            const changes = { name: 'Updated Subflow' };
            const thunk = flowLogic.updateSubflow(subflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalledWith(
                flowActions.updateFlowNode(expect.any(Object))
            );
        });

        it('should update subflow instance input and output labels if they match the subflow labels', () => {
            const currentSubflow = {
                ...subflow,
                inputLabels: ['First'],
                outputLabels: ['Second'],
            };
            mockedSelectFlowEntityById.mockReturnValue(currentSubflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    inputLabels: currentSubflow.inputLabels,
                    outputLabels: currentSubflow.outputLabels,
                },
            ]);

            const changes = {
                inputLabels: ['Input 1'],
                outputLabels: ['Output 1'],
            };
            const thunk = flowLogic.updateSubflow(currentSubflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                {
                    inputLabels: changes.inputLabels,
                    outputLabels: changes.outputLabels,
                }
            );
        });

        it('should not update subflow instance input/output labels if they do not match the subflow labels', () => {
            const currentSubflow = {
                ...subflow,
                inputLabels: ['First', 'Second In'],
                outputLabels: ['Second'],
            };
            mockedSelectFlowEntityById.mockReturnValue(currentSubflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    inputLabels: ['First', 'Third'],
                    outputLabels: ['Fourth'],
                },
            ]);

            const changes = {
                inputLabels: ['Input 1', 'Input 2'],
                outputLabels: ['Output 1'],
            };
            const thunk = flowLogic.updateSubflow(currentSubflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                {
                    inputLabels: ['Input 1', 'Third'],
                }
            );
        });

        it('should update subflow instance icon if it matches the subflow icon', () => {
            const currentSubflow = {
                ...subflow,
                icon: 'pencil',
            };
            mockedSelectFlowEntityById.mockReturnValue(currentSubflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    icon: currentSubflow.icon,
                },
            ]);

            const changes = { icon: 'new-icon.svg' };
            const thunk = flowLogic.updateSubflow(currentSubflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                { icon: changes.icon }
            );
        });

        it('should update subflow instance inputs when subflow in property changes', () => {
            const currentSubflow = {
                ...subflow,
                in: ['input1'],
            };
            mockedSelectFlowEntityById.mockReturnValue(currentSubflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    inputs: 1,
                },
            ]);

            const changes = { in: ['input1', 'input2'] };
            const thunk = flowLogic.updateSubflow(currentSubflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                { inputs: changes.in.length }
            );
        });

        it('should update subflow instance outputs when subflow out property changes', () => {
            const currentSubflow = {
                ...subflow,
                out: ['output1'],
            };
            mockedSelectFlowEntityById.mockReturnValue(currentSubflow);
            mockedSelectSubflowInstancesByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    outputs: 1,
                },
            ]);

            const changes = { out: ['output1', 'output2'] };
            const thunk = flowLogic.updateSubflow(currentSubflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                { outputs: changes.out.length }
            );
        });

        it('should update outputLabels of `in` nodes', () => {
            mockedSelectSubflowInOutByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    type: 'in',
                },
            ]);

            const changes = {
                inputLabels: ['Updated Input 1'],
            };
            const thunk = flowLogic.updateSubflow(subflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                {
                    outputLabels: changes.inputLabels,
                }
            );
        });

        it('should update inputLabels of `out` nodes', () => {
            mockedSelectSubflowInOutByFlowId.mockReturnValue([
                {
                    ...subflowInstance,
                    type: 'out',
                },
            ]);

            const changes = {
                outputLabels: ['Updated Output 1'],
            };
            const thunk = flowLogic.updateSubflow(subflow.id, changes);
            thunk(mockDispatch, mockGetState);

            expect(mockNodeLogicInstance.updateFlowNode).toHaveBeenCalledWith(
                subflowInstance.id,
                {
                    inputLabels: changes.outputLabels,
                }
            );
        });
    });
});
