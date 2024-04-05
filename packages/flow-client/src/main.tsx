import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';

import { AppProvider, createLogic } from './app/redux/logic';
import { createStore } from './app/redux/store';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <AppProvider store={createStore()} logic={createLogic()}>
        <StrictMode>
            <App />
        </StrictMode>
    </AppProvider>
);
