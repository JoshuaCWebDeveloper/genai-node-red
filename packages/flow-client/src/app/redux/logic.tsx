import { createContext, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { FeatureLogic } from './modules/feature/feature.logic';
import { FlowLogic } from './modules/flow/flow.logic';
import { NodeLogic } from './modules/node/node.logic';
import { AppStore } from './store';

export const createLogic = () => ({
    feature: new FeatureLogic(),
    node: new NodeLogic(),
    flow: new FlowLogic(),
});

export type AppLogic = ReturnType<typeof createLogic>;

type AppContextType = {
    logic: AppLogic;
};

export const AppContext = createContext<AppContextType | void>(undefined);

type ProviderProps = {
    store: AppStore;
    logic: AppLogic;
    children: ReactNode;
};

export const AppProvider = ({ store, logic, children }: ProviderProps) => (
    <AppContext.Provider value={{ logic }}>
        <Provider store={store}>
            <PersistGate persistor={persistStore(store)}>
                {children}
            </PersistGate>
        </Provider>
    </AppContext.Provider>
);
