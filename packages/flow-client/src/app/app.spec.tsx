import { render } from '@testing-library/react';

vi.stubEnv('VITE_NODE_RED_API_ROOT', 'https://www.example.com/api');

const { default: App } = await import('./app');
const { AppProvider, createLogic } = await import('./redux/logic');
const { createStore } = await import('./redux/store');

// Mock the API queries
vi.mock('./redux/modules/api/node.api', async importOriginal => {
    const originalModule = await importOriginal<
        typeof import('./redux/modules/api/node.api')
    >();
    const nodesData = [{ id: '1', name: 'Test Node' }];
    const nodeScriptsData = [
        { id: '1', script: 'console.log("test script");' },
    ];
    return {
        ...originalModule,
        useGetNodesQuery: vi.fn(() => ({
            data: nodesData,
            error: null,
            isLoading: false,
        })),
        useGetNodeScriptsQuery: vi.fn(() => ({
            data: nodeScriptsData,
            error: null,
            isLoading: false,
        })),
    };
});

vi.mock('./components/flow-canvas/flow-canvas-container', () => ({
    FlowCanvasContainer: () => <div>Flow Container</div>,
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
