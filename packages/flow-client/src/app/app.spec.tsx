import { render } from '@testing-library/react';

vi.stubEnv('VITE_NODE_RED_API_ROOT', 'https://www.example.com/api');

const { default: App } = await import('./app');
const { AppProvider, createLogic } = await import('./redux/logic');
const { createStore } = await import('./redux/store');

// Mock the API queries
vi.mock('../../../redux/modules/api/node.api', () => ({
    useGetNodesQuery: vi.fn(() => ({
        data: [{ id: '1', name: 'Test Node' }],
        error: null,
        isLoading: false,
    })),
    useGetNodeScriptsQuery: vi.fn(() => ({
        data: [{ id: '1', script: 'console.log("test script");' }],
        error: null,
        isLoading: false,
    })),
}));

describe('App', () => {
    const renderApp = () =>
        render(
            <AppProvider store={createStore()} logic={createLogic()}>
                <App />
            </AppProvider>
        );

    it('should render successfully', () => {
        const { baseElement } = renderApp();
        expect(baseElement).toBeTruthy();
    });

    it('should have a greeting as the title', () => {
        const { getByText } = renderApp();
        expect(getByText(/Flow Canvas/gi)).toBeTruthy();
    });
});
