import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';

export const FEATURE_FEATURE_KEY = 'feature';

/*
 * Update these interfaces according to your requirements.
 */
export interface FeatureEntity {
    id: number;
}

export interface FeatureState extends EntityState<FeatureEntity> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string | null;
}

export const featureAdapter = createEntityAdapter<FeatureEntity>();

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(fetchFeature())
 * }, [dispatch]);
 * ```
 */
export const fetchFeature = createAsyncThunk<FeatureEntity[]>(
    'feature/fetchStatus',
    async (_, _thunkAPI) => {
        /**
         * Replace this with your custom fetch call.
         * For example, `return myApi.getFeatures()`;
         * Right now we just return an empty array.
         */
        return Promise.resolve([]);
    }
);

export const initialFeatureState: FeatureState = featureAdapter.getInitialState(
    {
        loadingStatus: 'not loaded',
        error: null,
    }
);

export const featureSlice = createSlice({
    name: FEATURE_FEATURE_KEY,
    initialState: initialFeatureState,
    reducers: {
        add: featureAdapter.addOne,
        remove: featureAdapter.removeOne,
        // ...
    },
    extraReducers: builder => {
        builder
            .addCase(fetchFeature.pending, (state: FeatureState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchFeature.fulfilled,
                (
                    state: FeatureState,
                    action: PayloadAction<FeatureEntity[]>
                ) => {
                    featureAdapter.setAll(state, action.payload);
                    state.loadingStatus = 'loaded';
                }
            )
            .addCase(fetchFeature.rejected, (state: FeatureState, action) => {
                state.loadingStatus = 'error';
                state.error = action.error.message;
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const featureReducer = featureSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(featureActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const featureActions = featureSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllFeature);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = featureAdapter.getSelectors();

export const getFeatureState = (rootState: {
    [FEATURE_FEATURE_KEY]: FeatureState;
}): FeatureState => rootState[FEATURE_FEATURE_KEY];

export const selectAllFeature = createSelector(getFeatureState, selectAll);

export const selectFeatureEntities = createSelector(
    getFeatureState,
    selectEntities
);
