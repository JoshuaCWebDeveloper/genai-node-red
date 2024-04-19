import '../../vitest-esbuild-compat';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

vi.mock('redux-persist/integration/react', async importOriginal => {
    const real = await importOriginal<
        typeof import('redux-persist/integration/react')
    >();
    return {
        ...real,
        PersistGate: ({ children }: { children: React.ReactNode }) => children,
    };
});

vi.mock('./components/flow-canvas/flow-canvas', () => ({
    FlowCanvas: () => <div>Flow Container</div>,
}));

describe('App', () => {
    const renderApp = () =>
        render(
            <AppProvider store={createStore()} logic={createLogic()}>
                <DndProvider backend={HTML5Backend}>
                    <App />
                </DndProvider>
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
