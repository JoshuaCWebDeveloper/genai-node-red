import { createContext, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { FlowLogic } from './modules/flow/flow.logic';
import { NodeLogic } from './modules/palette/node.logic';
import { AppStore } from './store';
import { BuilderLogic } from './modules/builder/builder.logic';

export const createLogic = () => {
    const flow = new FlowLogic();
    return {
        builder: new BuilderLogic(flow),
        node: new NodeLogic(),
        flow,
    };
};

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
