import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import { FlowLogic } from '../flow/flow.logic';
import {
    EnvVarType,
    FlowEntity,
    SubflowEntity,
    flowActions,
    selectFlowEntityById,
} from '../flow/flow.slice';
import { BuilderLogic } from './builder.logic';
import { EDITING_TYPE, builderActions, selectEditing } from './builder.slice';

vi.mock('./builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./builder.slice')
    >();
    return {
        ...originalModule,
        selectEditing: vi.fn(() => null),
    };
});

vi.mock('../flow/flow.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('../flow/flow.slice')
    >();
    return {
        ...originalModule,
        selectFlowEntityById: vi.fn(() => null),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectEditing = selectEditing as MockedFunction<
    typeof selectEditing
>;
const mockedSelectFlowEntityById = selectFlowEntityById as MockedFunction<
    typeof selectFlowEntityById
>;

describe('BuilderLogic', () => {
    let builderLogic: BuilderLogic;
    let mockFlowLogic: FlowLogic;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        mockFlowLogic = {
            node: {
                editor: {},
            },
        } as FlowLogic;
        builderLogic = new BuilderLogic(mockFlowLogic);
    });

    describe('editorCancel()', () => {
        it('does nothing if no editing state is found', async () => {
            mockedSelectEditing.mockReturnValueOnce(null);

            const action = builderLogic.editorCancel();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('handles NODE editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.NODE,
                id: '123',
                data: {},
            });
            mockFlowLogic.node.editor.cancel = vi.fn();

            const action = builderLogic.editorCancel();
            await action(mockDispatch, mockGetState);

            expect(mockFlowLogic.node.editor.cancel).toHaveBeenCalled();
        });

        it('handles FLOW editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.FLOW,
                id: '123',
                data: {},
            });

            const action = builderLogic.editorCancel();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('handles SUBFLOW editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.SUBFLOW,
                id: '123',
                data: {},
            });

            const action = builderLogic.editorCancel();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('editorDelete()', () => {
        it('does nothing if no editing state is found', async () => {
            mockedSelectEditing.mockReturnValueOnce(null);

            const action = builderLogic.editorDelete();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('handles NODE editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.NODE,
                id: '123',
                data: {},
            });
            mockFlowLogic.node.editor.delete = vi.fn();

            const action = builderLogic.editorDelete();
            await action(mockDispatch, mockGetState);

            expect(mockFlowLogic.node.editor.delete).toHaveBeenCalled();
        });

        it('handles FLOW editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.FLOW,
                id: '123',
                data: {},
            });

            const action = builderLogic.editorDelete();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.removeFlowEntity('123')
            );
        });

        it('handles SUBFLOW editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.SUBFLOW,
                id: '123',
                data: {},
            });

            const action = builderLogic.editorDelete();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.removeFlowEntity('123')
            );
        });
    });

    describe('editorSave()', () => {
        it('does nothing if no editing state is found', async () => {
            mockedSelectEditing.mockReturnValueOnce(null);

            const action = builderLogic.editorSave();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('handles NODE editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.NODE,
                id: '123',
                data: {},
            });
            mockFlowLogic.node.editor.save = vi.fn();

            const action = builderLogic.editorSave();
            await action(mockDispatch, mockGetState);

            expect(mockFlowLogic.node.editor.save).toHaveBeenCalled();
        });

        it('handles FLOW editing type correctly', async () => {
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.FLOW,
                id: '123',
                data: {
                    name: 'Flow Name',
                    info: 'Flow Info',
                    env: [
                        {
                            name: 'Flow Env',
                            value: 'Flow Value',
                            type: EnvVarType.STR,
                        },
                    ],
                },
            });

            const action = builderLogic.editorSave();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity({
                    id: '123',
                    changes: {
                        name: 'Flow Name',
                        info: 'Flow Info',
                        env: [
                            {
                                name: 'Flow Env',
                                value: 'Flow Value',
                                type: EnvVarType.STR,
                            },
                        ],
                    },
                })
            );
        });

        it('handles SUBFLOW editing type correctly', async () => {
            mockFlowLogic.updateSubflow = vi.fn();
            mockedSelectEditing.mockReturnValueOnce({
                type: EDITING_TYPE.SUBFLOW,
                id: '123',
                data: {
                    name: 'Subflow Name',
                    info: 'Subflow Info',
                    env: [
                        {
                            name: 'Subflow Env',
                            value: 'Subflow Value',
                            type: EnvVarType.STR,
                        },
                    ],
                    color: 'Subflow Color',
                    icon: 'Subflow Icon',
                    category: 'Subflow Category',
                    inputLabels: ['Input 1'],
                    outputLabels: ['Output 1'],
                },
            });

            const action = builderLogic.editorSave();
            await action(mockDispatch, mockGetState);

            expect(mockFlowLogic.updateSubflow).toHaveBeenCalledWith('123', {
                name: 'Subflow Name',
                info: 'Subflow Info',
                env: [
                    {
                        name: 'Subflow Env',
                        value: 'Subflow Value',
                        type: EnvVarType.STR,
                    },
                ],
                color: 'Subflow Color',
                icon: 'Subflow Icon',
                category: 'Subflow Category',
                inputLabels: ['Input 1'],
                outputLabels: ['Output 1'],
            });
        });
    });

    describe('editFlow()', () => {
        it('dispatches setEditing with correct payload for FLOW type', async () => {
            const flow = {
                id: 'flow-123',
                type: 'flow',
                name: 'Flow Name',
                info: 'Flow Info',
                env: [
                    {
                        name: 'Flow Env',
                        value: 'Flow Value',
                        type: EnvVarType.STR,
                    },
                ],
                disabled: false,
            } as FlowEntity;

            const action = builderLogic.editFlow(flow);
            await action(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setEditing({
                    id: flow.id,
                    type: EDITING_TYPE.FLOW,
                    data: {
                        name: flow.name,
                        info: flow.info,
                        env: flow.env,
                    },
                })
            );
        });
    });

    describe('editSubflow()', () => {
        it('dispatches setEditing with correct payload for SUBFLOW type', async () => {
            const subflow = {
                id: 'subflow-123',
                type: 'subflow',
                name: 'Subflow Name',
                info: 'Subflow Info',
                env: [
                    {
                        name: 'Subflow Env',
                        value: 'Subflow Value',
                        type: EnvVarType.STR,
                    },
                ],
                color: 'Subflow Color',
                icon: 'Subflow Icon',
                category: 'Subflow Category',
                inputLabels: ['Input 1'],
                outputLabels: ['Output 1'],
            } as SubflowEntity;

            const action = builderLogic.editSubflow(subflow);
            await action(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setEditing({
                    id: subflow.id,
                    type: EDITING_TYPE.SUBFLOW,
                    data: {
                        name: subflow.name,
                        info: subflow.info,
                        env: subflow.env,
                        color: subflow.color,
                        icon: subflow.icon,
                        category: subflow.category,
                        inputLabels: subflow.inputLabels,
                        outputLabels: subflow.outputLabels,
                    },
                })
            );
        });
    });

    describe('editFlowEntityById()', () => {
        it('dispatches editFlow with correct payload for FLOW type', async () => {
            const flow = {
                id: 'flow-123',
                type: 'flow',
            } as FlowEntity;

            mockedSelectFlowEntityById.mockReturnValue(flow);

            const action = builderLogic.editFlowEntityById(flow.id);
            await action(mockDispatch, mockGetState);
            const calledThunk = mockDispatch.mock.calls[0][0];
            await calledThunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setEditing(
                    expect.objectContaining({
                        id: flow.id,
                    })
                )
            );
        });

        it('dispatches editSubflow with correct payload for SUBFLOW type', async () => {
            const subflow = {
                id: 'subflow-123',
                type: 'subflow',
            } as SubflowEntity;

            mockedSelectFlowEntityById.mockReturnValue(subflow);

            const action = builderLogic.editFlowEntityById(subflow.id);
            await action(mockDispatch, mockGetState);
            const calledThunk = mockDispatch.mock.calls[0][0];
            await calledThunk(mockDispatch, mockGetState);

            expect(mockDispatch).toHaveBeenCalledWith(
                builderActions.setEditing(
                    expect.objectContaining({
                        id: subflow.id,
                    })
                )
            );
        });

        it('does nothing if flow entity is not found', async () => {
            mockedSelectFlowEntityById.mockReturnValue(
                undefined as unknown as FlowEntity
            );

            const action = builderLogic.editFlowEntityById('non-existent-id');
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });
});
