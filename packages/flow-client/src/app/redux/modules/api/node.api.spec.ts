import * as apiModule from '@reduxjs/toolkit/query/react';
import { MockedFunction } from 'vitest';

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

    it('getNodes endpoint query configuration is correct', () => {
        const endpointFn = mockedCreateApi.mock.calls[0][0].endpoints;
        const mockQuery = vi.fn();

        // Trigger the endpoint function with the mocked builder
        endpointFn({
            query: mockQuery,
            mutation: vi.fn(),
        });

        // Ensure mockQuery was called with an object that includes a query method
        expect(mockQuery).toHaveBeenCalled();

        // Capture the query method passed to mockQuery
        const queryMethod = mockQuery.mock.calls[0][0].query;

        // Directly invoke the captured query method to test its configuration
        const queryConfig = queryMethod();

        // Assert the query configuration
        expect(queryConfig).toEqual({
            url: 'nodes',
            headers: {
                Accept: 'application/json',
            },
        });
    });

    it('getNodes endpoint transformResponse is configured correctly', () => {
        const endpointFn = mockedCreateApi.mock.calls[0][0].endpoints;

        // Mock the builder to capture the query configuration
        const mockQuery = vi.fn();
        // Invoke the endpoints function with the mocked builder to capture the getNodes configuration
        endpointFn({
            query: mockQuery,
            mutation: vi.fn(),
        });

        // Ensure mockQuery was called with an object that includes a query method
        expect(mockQuery).toHaveBeenCalled();

        // Assuming the first call to builder.query() is for the getNodes endpoint
        // Extract the query and transformResponse functions
        const { transformResponse } = mockQuery.mock.calls[0][0];

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
});
