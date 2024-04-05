import { fetchFeature, featureAdapter, featureReducer } from './feature.slice';

describe('feature reducer', () => {
    it('should handle initial state', () => {
        const expected = featureAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(featureReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchFeature', () => {
        let state = featureReducer(undefined, fetchFeature.pending(''));

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
                ids: [],
            })
        );

        state = featureReducer(state, fetchFeature.fulfilled([{ id: 1 }], ''));

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
                ids: [1],
            })
        );

        state = featureReducer(
            state,
            fetchFeature.rejected(new Error('Uh oh'), '')
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'error',
                error: 'Uh oh',
                entities: { 1: { id: 1 } },
                ids: [1],
            })
        );
    });
});
