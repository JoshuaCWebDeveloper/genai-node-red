import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import environment from '../../../../environment';

// Type for Node-RED flows response/request
export interface NodeRedFlows {
    flows: unknown[];
}

// Define a service using a base URL and expected endpoints for flows
export const flowApi = createApi({
    reducerPath: 'flowApi',
    baseQuery: fetchBaseQuery({
        baseUrl: environment.NODE_RED_API_ROOT,
        responseHandler: 'content-type',
    }),
    tagTypes: ['Flow'], // For automatic cache invalidation and refetching
    endpoints: builder => ({
        // Endpoint to fetch all flows
        getFlows: builder.query<NodeRedFlows, void>({
            query: () => ({
                url: 'flows',
                headers: {
                    Accept: 'application/json',
                },
            }),
            providesTags: ['Flow'],
        }),
        // Endpoint to update all flows
        updateFlows: builder.mutation<NodeRedFlows, NodeRedFlows>({
            query: (flows) => ({
                url: 'flows',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: flows,
            }),
            invalidatesTags: ['Flow'],
        }),
    }),
});

// Export hooks for usage in components
export const { useGetFlowsQuery, useUpdateFlowsMutation } = flowApi;
