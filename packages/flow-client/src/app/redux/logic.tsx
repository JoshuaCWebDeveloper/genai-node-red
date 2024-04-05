import React, { createContext, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AppStore } from './store';
import { FeatureLogic } from './modules/feature/feature.logic';

export const createLogic = () => ({
    feature: new FeatureLogic(),
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
        <Provider store={store}>{children}</Provider>
    </AppContext.Provider>
);
