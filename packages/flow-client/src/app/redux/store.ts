import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { featureApi } from './modules/api/feature.api';
import { nodeApi } from './modules/api/node.api'; // Import the nodeApi
import {
    FEATURE_FEATURE_KEY,
    featureReducer,
} from './modules/feature/feature.slice';
import { NODE_FEATURE_KEY, nodeReducer } from './modules/node/node.slice';
import { FLOW_FEATURE_KEY, flowReducer } from './modules/flow/flow.slice';
// Add more imports for other slices as needed

export const createStore = () => {
    const store = configureStore({
        reducer: {
            [FEATURE_FEATURE_KEY]: featureReducer,
            [featureApi.reducerPath]: featureApi.reducer,
            [NODE_FEATURE_KEY]: nodeReducer,
            [nodeApi.reducerPath]: nodeApi.reducer, // Add the nodeApi reducer
            // Add more reducers here as needed
            [FLOW_FEATURE_KEY]: flowReducer,
        },
        // Additional middleware can be passed to this array
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware().concat(
                featureApi.middleware,
                nodeApi.middleware
            ),
        devTools: process.env.NODE_ENV !== 'production',
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
