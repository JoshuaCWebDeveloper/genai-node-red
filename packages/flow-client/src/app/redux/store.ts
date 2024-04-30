import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { featureApi } from './modules/api/feature.api';
import { nodeApi } from './modules/api/node.api'; // Import the nodeApi
import {
    BUILDER_FEATURE_KEY,
    builderReducer,
} from './modules/builder/builder.slice';
import {
    FEATURE_FEATURE_KEY,
    featureReducer,
} from './modules/feature/feature.slice';
import {
    FLOW_FEATURE_KEY,
    flowReducer,
    FlowState,
} from './modules/flow/flow.slice';
import { NODE_FEATURE_KEY, nodeReducer } from './modules/node/node.slice';
import type { AppLogic } from './logic';

export const createStore = (logic: AppLogic) => {
    const store = configureStore({
        reducer: {
            [FEATURE_FEATURE_KEY]: featureReducer,
            [featureApi.reducerPath]: featureApi.reducer,
            [NODE_FEATURE_KEY]: nodeReducer,
            [nodeApi.reducerPath]: nodeApi.reducer, // Add the nodeApi reducer
            // Add more reducers here as needed
            [FLOW_FEATURE_KEY]: persistReducer<FlowState>(
                {
                    key: FLOW_FEATURE_KEY,
                    storage: storage,
                },
                flowReducer
            ),
            [BUILDER_FEATURE_KEY]: builderReducer,
        },
        // Additional middleware can be passed to this array
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        FLUSH,
                        REHYDRATE,
                        PAUSE,
                        PERSIST,
                        PURGE,
                        REGISTER,
                    ],
                },
                thunk: {
                    extraArgument: logic,
                },
            }).concat(featureApi.middleware, nodeApi.middleware),
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
