import { MockedFunction } from 'vitest';
import '../../../../../vitest-esbuild-compat';

import { RootState } from '../../store';
import { BuilderLogic } from './builder.logic';
import { FlowLogic } from '../flow/flow.logic';
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

        it('calls the appropriate cancel method based on editing type', async () => {
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
    });

    describe('editorDelete()', () => {
        it('does nothing if no editing state is found', async () => {
            mockedSelectEditing.mockReturnValueOnce(null);

            const action = builderLogic.editorDelete();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('calls the appropriate delete method based on editing type', async () => {
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
    });

    describe('editorSave()', () => {
        it('does nothing if no editing state is found', async () => {
            mockedSelectEditing.mockReturnValueOnce(null);

            const action = builderLogic.editorSave();
            await action(mockDispatch, mockGetState);

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('calls the appropriate save method based on editing type', async () => {
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
    });
});
