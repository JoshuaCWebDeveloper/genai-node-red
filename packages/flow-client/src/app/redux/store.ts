import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import { featureApi } from './modules/api/feature.api';
import {
    FEATURE_FEATURE_KEY,
    featureReducer,
} from './modules/feature/feature.slice';

export const createStore = () => {
    const store = configureStore({
        reducer: {
            [FEATURE_FEATURE_KEY]: featureReducer,
            [featureApi.reducerPath]: featureApi.reducer,
        },
        // Additional middleware can be passed to this array
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware().concat(featureApi.middleware),
        devTools: process.env.NODE_ENV !== 'production',
        // Optional Redux store enhancers
        enhancers: [],
    });

    setupListeners(store.dispatch);

    return store;
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
