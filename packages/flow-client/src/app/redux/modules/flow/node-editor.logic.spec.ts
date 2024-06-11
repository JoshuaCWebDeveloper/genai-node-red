import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import {
    createNodeInstance,
    executeNodeFn,
    finalizeNodeEditor,
} from '../../../red/execute-script';
import { RootState } from '../../store';
import {
    EDITING_TYPE,
    builderActions,
    selectEditing,
} from '../builder/builder.slice';
import { PaletteNodeEntity } from '../palette/node.slice';
import {
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
    selectFlowNodeById,
} from './flow.slice';
import { NodeEditorLogic } from './node-editor.logic';
import { NodeLogic } from './node.logic';

vi.mock('../builder/builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../builder/builder.slice')
    >();
    return {
        ...originalModule,
        selectEditing: vi.fn(() => null),
    };
});

vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectFlowNodeById: vi.fn(() => null),
        selectFlowEntityById: vi.fn(() => null),
    };
});

vi.mock('../../../red/execute-script', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../../../red/execute-script')
    >();
    return {
        ...originalModule,
        executeNodeFn: vi.fn(() => null),
        createNodeInstance: vi.fn(() => null),
        finalizeNodeEditor: vi.fn(() => null),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectEditing = selectEditing as MockedFunction<
    typeof selectEditing
>;
const mockedSelectFlowNodeById = selectFlowNodeById as MockedFunction<
    typeof selectFlowNodeById
>;
const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;
const mockedExecuteNodeFn = executeNodeFn as MockedFunction<
    typeof executeNodeFn
>;
const mockedCreateNodeInstance = createNodeInstance as MockedFunction<
    typeof createNodeInstance
>;
const mockedFinalizeNodeEditor = finalizeNodeEditor as MockedFunction<
    typeof finalizeNodeEditor
>;

describe('node-editor.logic', () => {
    let nodeEditorLogic: NodeEditorLogic;
    let mockNodeLogic: NodeLogic;

    const mockEditingState = {
        type: EDITING_TYPE.NODE,
        id: 'node1',
        data: {
            propertiesFormHandle: 'form1',
            nodeInstanceHandle: 'instance1',
        },
    };

    const mockNodeInstance = {
        id: 'instance1',
        type: 'test',
        x: 0,
        y: 0,
        z: '0',
        name: 'test',
        inputs: 0,
        outputs: 0,
        inputLabels: [],
        outputLabels: [],
        wires: [],
        inPorts: [],
        outPorts: [],
        links: {},
    } as FlowNodeEntity;

    const mockPropertiesForm = Object.assign(document.createElement('form'), {
        getRootNode: () =>
            document.createElement('div').attachShadow({ mode: 'open' }),
    });

    const mockFlowNode = {
        id: 'node1',
        type: 'test',
        x: 0,
        y: 0,
        z: '0',
        name: 'test',
        inputs: 0,
        outputs: 0,
        inputLabels: [],
        outputLabels: [],
        wires: [],
        inPorts: [],
        outPorts: [],
        links: {},
    } as FlowNodeEntity;

    const mockPaletteNode = {
        id: 'node1',
        type: 'test',
        defaults: {},
    } as PaletteNodeEntity;

    const mockSelectPaletteNodeByFlowNode =
        vi.fn() as unknown as MockedFunction<
            NodeLogic['selectPaletteNodeByFlowNode']
        >;

    beforeEach(() => {
        vi.clearAllMocks();
        mockNodeLogic = {
            selectPaletteNodeByFlowNode: mockSelectPaletteNodeByFlowNode,
        } as unknown as NodeLogic;
        nodeEditorLogic = new NodeEditorLogic(mockNodeLogic);
        Object.assign(nodeEditorLogic, {
            nodeInstances: {
                [mockEditingState.data.nodeInstanceHandle]: mockNodeInstance,
            },
            propertiesForms: {
                [mockEditingState.data.propertiesFormHandle]:
                    mockPropertiesForm,
            },
        });
        mockedSelectEditing.mockReturnValue(mockEditingState);
        mockedSelectFlowNodeById.mockReturnValue(mockFlowNode);
        mockSelectPaletteNodeByFlowNode.mockReturnValue(mockPaletteNode);
    });

    describe('setPropertiesForm', () => {
        it('should set properties form and dispatch updateEditingData', async () => {
            const propertiesForm = document.createElement('form');
            const thunk = nodeEditorLogic.setPropertiesForm(propertiesForm);
            await thunk(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.updateEditingData({
                    propertiesFormHandle:
                        expect.stringContaining('properties-form-'),
                })
            );
        });

        it('should dispatch updateEditingData with undefined when propertiesForm is null', async () => {
            const thunk = nodeEditorLogic.setPropertiesForm(null);
            await thunk(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.updateEditingData({
                    propertiesFormHandle: undefined,
                })
            );
        });
    });

    describe('cancel', () => {
        it('should execute oneditcancel if nodeInstance, editingPaletteNode, and propertiesForm are present', async () => {
            const thunk = nodeEditorLogic.cancel();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).toHaveBeenCalledWith(
                ['oneditcancel'],
                mockPaletteNode,
                mockNodeInstance,
                expect.any(ShadowRoot)
            );
        });

        it('should not execute oneditcancel if nodeInstance, editingPaletteNode, or propertiesForm are missing', async () => {
            mockedSelectEditing.mockReturnValue(null);

            const thunk = nodeEditorLogic.cancel();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should execute oneditdelete and dispatch removeFlowNode', async () => {
            const thunk = nodeEditorLogic.delete();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).toHaveBeenCalledWith(
                ['oneditdelete'],
                mockPaletteNode,
                mockNodeInstance,
                expect.any(ShadowRoot)
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.removeFlowNode(mockFlowNode.id)
            );
        });

        it('should not execute oneditdelete or dispatch removeFlowNode if nodeInstance, editingFlowNode, editingPaletteNode, or propertiesForm are missing', async () => {
            mockedSelectEditing.mockReturnValue(null);

            const thunk = nodeEditorLogic.delete();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).not.toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalledWith(
                flowActions.removeFlowNode(expect.any(String))
            );
        });
    });

    describe('save', () => {
        it('should execute oneditsave and dispatch updateFlowNode', async () => {
            mockNodeLogic.updateFlowNode = vi.fn();

            const thunk = nodeEditorLogic.save();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).toHaveBeenCalledWith(
                ['oneditsave'],
                mockPaletteNode,
                mockNodeInstance,
                expect.any(ShadowRoot)
            );
            expect(mockDispatch).toHaveBeenCalledWith(
                mockNodeLogic.updateFlowNode(
                    mockFlowNode.id,
                    expect.any(Object)
                )
            );
        });

        it('should dispatch updateFlowNode with data from editing state', async () => {
            mockNodeLogic.updateFlowNode = vi.fn();

            const mockEditingData = {
                info: 'test info',
                icon: 'test icon',
                inputLabels: ['input1'],
                outputLabels: ['output1'],
            };

            mockedSelectEditing.mockReturnValue({
                ...mockEditingState,
                data: {
                    ...mockEditingState.data,
                    ...mockEditingData,
                },
            });

            const thunk = nodeEditorLogic.save();
            await thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                mockNodeLogic.updateFlowNode(
                    mockFlowNode.id,
                    expect.objectContaining({
                        info: mockEditingData.info,
                        icon: mockEditingData.icon,
                        inputLabels: mockEditingData.inputLabels,
                        outputLabels: mockEditingData.outputLabels,
                    })
                )
            );
        });

        it('should not execute oneditsave or dispatch updateFlowNode if nodeInstance, editingFlowNode, editingPaletteNode, or propertiesForm are missing', async () => {
            mockedSelectEditing.mockReturnValue(null);
            mockNodeLogic.updateFlowNode = vi.fn();

            const thunk = nodeEditorLogic.save();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).not.toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalledWith(
                mockNodeLogic.updateFlowNode(
                    mockFlowNode.id,
                    expect.any(Object)
                )
            );
        });

        it('should include env property in updates when editing a subflow', async () => {
            const mockSubflowNode = {
                ...mockFlowNode,
                type: 'subflow:subflow1',
                env: [{ name: 'ENV_VAR', value: 'value' }],
            } as FlowNodeEntity;

            const mockSubflow = {
                id: 'subflow1',
                type: 'subflow',
                nodes: [],
                links: [],
                name: 'test',
                info: 'test info',
                category: 'test',
                env: [{ name: 'ENV_VAR', value: 'value', type: 'str' }],
                color: 'test',
            } as SubflowEntity;

            mockedSelectFlowNodeById.mockReturnValue(mockSubflowNode);
            mockedSelectFlowEntityById.mockReturnValue(mockSubflow);
            mockNodeLogic.updateFlowNode = vi.fn();

            const thunk = nodeEditorLogic.save();
            await thunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                mockNodeLogic.updateFlowNode(
                    mockSubflowNode.id,
                    expect.objectContaining({
                        env: mockSubflowNode.env,
                    })
                )
            );
        });
    });

    describe('load', () => {
        it('should execute oneditprepare and finalizeNodeEditor', async () => {
            mockedCreateNodeInstance.mockReturnValue(
                mockNodeInstance as ReturnType<typeof createNodeInstance>
            );

            const thunk = nodeEditorLogic.load();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).toHaveBeenCalledWith(
                ['oneditprepare'],
                mockPaletteNode,
                mockNodeInstance,
                expect.any(ShadowRoot)
            );
            expect(mockedFinalizeNodeEditor).toHaveBeenCalledWith(
                mockPropertiesForm,
                expect.any(ShadowRoot)
            );
        });

        it('should not execute oneditprepare if editingFlowNode, editingPaletteNode, or propertiesForm are missing', async () => {
            mockedSelectEditing.mockReturnValue(null);

            const thunk = nodeEditorLogic.load();
            await thunk(mockDispatch, mockGetState);

            expect(mockedExecuteNodeFn).not.toHaveBeenCalled();
            expect(mockedFinalizeNodeEditor).not.toHaveBeenCalled();
        });

        it('should set nodeInstance.subflow when editing a subflow', async () => {
            const mockSubflow = {
                id: 'subflow1',
                type: 'subflow',
                nodes: [],
                links: [],
                name: 'test',
                info: 'test info',
                category: 'test',
                env: [],
                color: 'test',
            } as SubflowEntity;

            const mockSubflowNode = {
                ...mockFlowNode,
                type: 'subflow:subflow1',
            } as FlowNodeEntity;

            mockedCreateNodeInstance.mockReturnValue(
                mockNodeInstance as ReturnType<typeof createNodeInstance>
            );

            mockedSelectFlowNodeById.mockReturnValue(mockSubflowNode);

            mockedSelectFlowEntityById.mockReturnValue(mockSubflow);

            const thunk = nodeEditorLogic.load();
            await thunk(mockDispatch, mockGetState);

            expect(mockedCreateNodeInstance).toHaveBeenCalledWith(
                mockSubflowNode
            );
            const nodeInstance = mockedCreateNodeInstance.mock.results[0].value;
            expect(nodeInstance.subflow).toEqual(mockSubflow);
        });
    });

    describe('close', () => {
        it('should clear nodeInstances and propertiesForms and dispatch updateEditingData', async () => {
            const thunk = nodeEditorLogic.close();
            await thunk(mockDispatch);

            expect(nodeEditorLogic['nodeInstances']).toEqual({});
            expect(nodeEditorLogic['propertiesForms']).toEqual({});
            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.updateEditingData({
                    propertiesFormHandle: undefined,
                    nodeInstanceHandle: undefined,
                })
            );
        });
    });
});
