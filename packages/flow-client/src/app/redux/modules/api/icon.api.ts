import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import environment from '../../../../environment';

export type NodeRedIcons = Record<string, string[]>;

// Define a service using a base URL and expected endpoints for icons
export const iconApi = createApi({
    reducerPath: 'iconsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: environment.NODE_RED_API_ROOT,
        responseHandler: 'content-type',
    }),
    tagTypes: ['Icon'], // For automatic cache invalidation and refetching
    endpoints: builder => ({
        // Endpoint to fetch the list of icons as JSON
        getIcons: builder.query<NodeRedIcons, void>({
            query: () => ({
                url: 'icons',
                headers: {
                    Accept: 'application/json',
                },
            }),
            providesTags: ['Icon'],
        }),
    }),
});

export const { useGetIconsQuery } = iconApi;
