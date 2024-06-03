import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import { FlowLogic } from '../flow/flow.logic';
import { EnvVarType, flowActions } from '../flow/flow.slice';
import { BuilderLogic } from './builder.logic';
import { EDITING_TYPE, selectEditing } from './builder.slice';

vi.mock('./builder.slice', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./builder.slice')
    >();
    return {
        ...originalModule,
        selectEditing: vi.fn(() => null),
    };
});

const mockDispatch = vi.fn();
const mockGetState = vi.fn(() => ({})) as unknown as () => RootState;

const mockedSelectEditing = selectEditing as MockedFunction<
    typeof selectEditing
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

            expect(mockDispatch).toHaveBeenCalledWith(
                flowActions.updateFlowEntity({
                    id: '123',
                    changes: {
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
                })
            );
        });
    });
});
