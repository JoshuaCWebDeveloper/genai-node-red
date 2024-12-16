import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import environment from '../../../../environment';

// Base type for common properties
export interface NodeRedBase {
    id: string;
    type: string;
    info: string;
    env: { name: string; type: string; value: string }[];
}

// Type for regular Node-RED flows
export interface NodeRedFlow extends NodeRedBase {
    type: 'tab';
    label: string;
    disabled: boolean;
}

// Type for Node-RED subflows
export interface NodeRedSubflow extends NodeRedBase {
    type: 'subflow';
    name: string;
    category: string;
    color: string;
    icon: string;
    in: NodeRedEndpoint[];
    out: NodeRedEndpoint[];
}

// Type for nodes within flows or subflows
export interface NodeRedNode extends NodeRedBase {
    name: string;
    x: number;
    y: number;
    z: string;
    wires: string[][];
    inputs?: number;
    outputs?: number;
    inputLabels?: string[];
    outputLabels?: string[];
    icon?: string;
}

// Type for endpoints used in subflows (inputs and outputs)
export interface NodeRedEndpoint {
    x: number;
    y: number;
    wires: { id: string; port?: number }[];
}

// Composite type for all Node-RED objects
export interface NodeRedFlows {
    rev?: string;
    flows: NodeRedBase[];
}

// Define a service using a base URL and expected endpoints for flows
export const flowApi = createApi({
    reducerPath: 'flowApi',
    baseQuery: fetchBaseQuery({
        baseUrl: environment.NODE_RED_API_ROOT,
        responseHandler: 'content-type',
        prepareHeaders: headers => {
            headers.set('Node-RED-API-Version', 'v2');
            headers.set('Node-RED-Deployment-Type', 'nodes');
            return headers;
        },
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
            query: flows => ({
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
