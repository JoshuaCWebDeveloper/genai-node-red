import * as apiModule from '@reduxjs/toolkit/query/react';
import { MockedFunction } from 'vitest';
import { nodeActions } from '../node/node.slice';

// Mock the createApi and fetchBaseQuery functions from RTK Query
vi.mock('@reduxjs/toolkit/query/react', () => {
    const originalModule = vi.importActual('@reduxjs/toolkit/query/react');
    return {
        ...originalModule,
        createApi: vi.fn(() => ({
            useGetNodeScriptsQuery: vi.fn(),
            useGetNodesQuery: vi.fn(),
        })),
        fetchBaseQuery: vi.fn(),
    };
});

const mockedCreateApi = apiModule.createApi as unknown as MockedFunction<
    typeof apiModule.createApi
>;
const mockedBaseQuery = apiModule.fetchBaseQuery as unknown as MockedFunction<
    typeof apiModule.fetchBaseQuery
>;

describe('nodeApi', () => {
    const BASE_URL = 'https://www.example.com/api';

    const extractEndpointQuery = (endpoint: string) => {
        const endpointFn = mockedCreateApi.mock.calls[0][0].endpoints;
        const calls: number[] = [];
        const mockQuery = vi.fn(_endpointDef => {
            const call = Math.floor(Math.random() * 10000);
            calls.push(call);
            return call;
        });

        // Trigger the endpoint function with the mocked builder
        const endpoints = endpointFn({
            // @ts-expect-error: testing
            query: mockQuery,
            mutation: vi.fn(),
        }) as unknown as Record<string, number>;

        const callIndex = calls.findIndex(call => call === endpoints[endpoint]);

        // Capture the query method passed to mockQuery
        return mockQuery.mock.calls[callIndex][0];
    };

    beforeEach(async () => {
        vi.stubEnv('VITE_NODE_RED_API_ROOT', BASE_URL);
        mockedCreateApi.mockClear();
        mockedBaseQuery.mockClear();
        vi.resetModules();
        await import('./node.api');
    });

    it('fetchBaseQuery is called with correct baseUrl', () => {
        expect(mockedBaseQuery).toHaveBeenCalledWith({
            baseUrl: BASE_URL,
            responseHandler: 'content-type',
        });
    });

    describe('getNodes()', () => {
        it('query() configuration is correct', () => {
            const { query } = extractEndpointQuery('getNodes');

            // Directly invoke the captured query method to test its configuration
            const queryConfig = query();

            // Assert the query configuration
            expect(queryConfig).toEqual({
                url: 'nodes',
                headers: {
                    Accept: 'application/json',
                },
            });
        });

        it('transformResponse() is configured correctly', () => {
            const { transformResponse } = extractEndpointQuery('getNodes');

            // Prepare mock response data for testing transformResponse
            const mockResponse = [
                {
                    id: 'node-module-1',
                    name: 'Test Node 1',
                    types: ['test-node-1-type-1', 'test-node-1-type-2'],
                    enabled: true,
                    local: true,
                    user: false,
                    module: 'test-module-1',
                    version: '1.0.0',
                },
                // Add more nodes as needed for thorough testing
            ];

            // Test the transformResponse function
            const transformedResponse = transformResponse(mockResponse);
            const expectedTransformedResponse = mockResponse.flatMap(node =>
                node.types.map(type => ({
                    ...node,
                    id: type,
                    nodeRedId: node.id,
                    type,
                    types: undefined,
                }))
            );
            expect(transformedResponse).toEqual(expectedTransformedResponse);
        });

        it('onQueryStarted dispatches setNodes action with fetched data', async () => {
            const dispatch = vi.fn();
            const testNode = {
                id: 'node1',
                nodeRedId: 'node1',
                name: 'Node 1',
                type: 'type2',
                enabled: true,
                local: true,
                user: false,
                module: 'module1',
                version: '1.0',
            };
            const queryFulfilled = Promise.resolve({
                data: [testNode],
            });

            const { onQueryStarted } = extractEndpointQuery('getNodes');

            // Simulate the onQueryStarted logic
            await onQueryStarted(undefined, {
                dispatch,
                queryFulfilled,
                extra: {}, // Assuming no extra logic needed for this test
            });

            // Wait for the promise to resolve
            await queryFulfilled;

            // Check if the dispatch was called with the correct action and payload
            expect(dispatch).toHaveBeenCalledWith(
                nodeActions.setNodes([testNode])
            );
        });
    });

    describe('getNodeScripts()', () => {
        it('query() configuration is correct', () => {
            const { query } = extractEndpointQuery('getNodeScripts');

            // Directly invoke the captured query method to test its configuration
            const queryConfig = query();

            // Assert the query configuration
            expect(queryConfig).toEqual({
                url: 'nodes',
                headers: {
                    Accept: 'text/html',
                },
            });
        });

        it('onQueryStarted dispatches setNodeScripts action with fetched data', async () => {
            const dispatch = vi.fn();
            const TEST_ACTION = 'test-action';
            const setNodeScripts = vi.fn(() => TEST_ACTION);
            const queryFulfilled = Promise.resolve({
                data: '<script>console.log("Loaded")</script>',
            });

            const { onQueryStarted } = extractEndpointQuery('getNodeScripts');

            // Simulate the onQueryStarted logic
            await onQueryStarted(undefined, {
                dispatch,
                queryFulfilled,
                extra: { node: { setNodeScripts } },
            });

            // Wait for the promise to resolve
            await queryFulfilled;

            // setNodeScripts thunk should have been called
            expect(setNodeScripts).toHaveBeenCalledWith(
                '<script>console.log("Loaded")</script>'
            );

            // Check if the dispatch was called with the correct action and payload
            expect(dispatch).toHaveBeenCalledWith(TEST_ACTION);
        });
    });
});
