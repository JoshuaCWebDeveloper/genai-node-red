import * as apiModule from '@reduxjs/toolkit/query/react';
import { MockedFunction } from 'vitest';

import { extractEndpointQuery } from './test-util';

// Mock the createApi and fetchBaseQuery functions from RTK Query
vi.mock('@reduxjs/toolkit/query/react', () => {
    const originalModule = vi.importActual('@reduxjs/toolkit/query/react');
    return {
        ...originalModule,
        createApi: vi.fn(() => ({
            useGetIconsQuery: vi.fn(),
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

describe('iconApi', () => {
    const BASE_URL = 'https://www.example.com/api';

    beforeEach(async () => {
        vi.stubEnv('VITE_NODE_RED_API_ROOT', BASE_URL);
        mockedCreateApi.mockClear();
        mockedBaseQuery.mockClear();
        vi.resetModules();
        await import('./icon.api');
    });

    it('fetchBaseQuery is called with correct baseUrl', () => {
        expect(mockedBaseQuery).toHaveBeenCalledWith({
            baseUrl: BASE_URL,
            responseHandler: 'content-type',
        });
    });

    describe('getIcons()', () => {
        it('query() configuration is correct', () => {
            const { query } = extractEndpointQuery('getIcons');

            // Directly invoke the captured query method to test its configuration
            const queryConfig = query();

            // Assert the query configuration
            expect(queryConfig).toEqual({
                url: 'icons',
                headers: {
                    Accept: 'application/json',
                },
            });
        });

        it('providesTags is configured correctly', () => {
            const { providesTags } = extractEndpointQuery('getIcons');

            // Assert the providesTags configuration
            expect(providesTags).toEqual(['Icon']);
        });
    });
});
