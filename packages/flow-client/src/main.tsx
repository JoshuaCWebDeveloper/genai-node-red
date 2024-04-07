import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';

import { AppProvider, createLogic } from './app/redux/logic';
import { createStore } from './app/redux/store';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

`;

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <AppProvider store={createStore()} logic={createLogic()}>
        <StrictMode>
            <GlobalStyle />
            <App />
        </StrictMode>
    </AppProvider>
);
