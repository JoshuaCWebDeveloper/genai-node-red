import { builderActions, builderReducer } from './builder.slice';

describe('builder reducer', () => {
    it('should handle initial state', () => {
        const expected = {
            editing: null,
        };

        expect(builderReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle setEditing', () => {
        const initialState = {
            editing: null,
        };

        const editingNodeId = 'node1';

        const state = builderReducer(
            initialState,
            builderActions.setEditing(editingNodeId)
        );

        expect(state).toEqual(
            expect.objectContaining({
                editing: editingNodeId,
            })
        );
    });

    it('should handle clearEditing', () => {
        const initialState = {
            editing: 'node1',
        };

        const state = builderReducer(
            initialState,
            builderActions.clearEditing()
        );

        expect(state).toEqual(
            expect.objectContaining({
                editing: null,
            })
        );
    });
});
