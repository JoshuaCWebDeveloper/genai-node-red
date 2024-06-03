import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import { NodeEditorLogic } from './node-editor.logic';
import { NodeLogic } from './node.logic';
import { FlowNodeEntity, flowActions, selectFlowNodeById } from './flow.slice';
import {
    PaletteNodeEntity,
    selectPaletteNodeById,
} from '../palette/node.slice';
import {
    EDITING_TYPE,
    builderActions,
    selectEditing,
} from '../builder/builder.slice';
import {
    executeNodeFn,
    createNodeInstance,
    finalizeNodeEditor,
} from '../../../red/execute-script';

vi.mock('../builder/builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../builder/builder.slice')
    >();
    return {
        ...originalModule,
        selectEditing: vi.fn(() => null),
    };
});

vi.mock('../palette/node.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../palette/node.slice')
    >();
    return {
        ...originalModule,
        selectPaletteNodeById: vi.fn(() => null),
    };
});

vi.mock('./flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./flow.slice')
    >();
    return {
        ...originalModule,
        selectFlowNodeById: vi.fn(() => null),
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
const mockedSelectPaletteNodeById = selectPaletteNodeById as MockedFunction<
    typeof selectPaletteNodeById
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

    beforeEach(() => {
        vi.clearAllMocks();
        mockNodeLogic = {} as NodeLogic;
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
        mockedSelectPaletteNodeById.mockReturnValue(mockPaletteNode);
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
