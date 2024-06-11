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

import type { AppLogic } from './logic';
import { iconApi } from './modules/api/icon.api';
import { nodeApi } from './modules/api/node.api'; // Import the nodeApi
import {
    BUILDER_FEATURE_KEY,
    builderReducer,
    BuilderState,
} from './modules/builder/builder.slice';
import {
    FLOW_FEATURE_KEY,
    flowReducer,
    FlowState,
} from './modules/flow/flow.slice';
import {
    PALETTE_NODE_FEATURE_KEY,
    paletteNodeReducer,
} from './modules/palette/node.slice';

export const createStore = (logic: AppLogic) => {
    const store = configureStore({
        reducer: {
            [nodeApi.reducerPath]: nodeApi.reducer,
            [iconApi.reducerPath]: iconApi.reducer,
            [PALETTE_NODE_FEATURE_KEY]: paletteNodeReducer,
            [FLOW_FEATURE_KEY]: persistReducer<FlowState>(
                {
                    key: FLOW_FEATURE_KEY,
                    storage: storage,
                },
                flowReducer
            ),
            [BUILDER_FEATURE_KEY]: persistReducer<BuilderState>(
                {
                    key: BUILDER_FEATURE_KEY,
                    storage: storage,
                },
                builderReducer
            ),
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
            }).concat(nodeApi.middleware, iconApi.middleware),
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
