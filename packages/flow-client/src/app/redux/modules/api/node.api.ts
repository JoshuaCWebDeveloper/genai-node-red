import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import environment from '../../../../environment';
import { PaletteNodeEntity, paletteNodeActions } from '../palette/node.slice';
import { AppLogic } from '../../logic';

// Define a service using a base URL and expected endpoints for nodes
export const nodeApi = createApi({
    reducerPath: 'nodeApi',
    baseQuery: fetchBaseQuery({
        baseUrl: environment.NODE_RED_API_ROOT,
        responseHandler: 'content-type',
    }),
    tagTypes: ['Node'], // For automatic cache invalidation and refetching
    endpoints: builder => ({
        // Endpoint to fetch the list of nodes as JSON
        getNodes: builder.query<PaletteNodeEntity[], void>({
            query: () => ({
                url: 'nodes',
                headers: {
                    Accept: 'application/json',
                },
            }),
            providesTags: ['Node'],
            transformResponse: (
                response: Array<{
                    id: string;
                    name: string;
                    types: string[];
                    enabled: boolean;
                    local: boolean;
                    user: boolean;
                    module: string;
                    version: string;
                }>
            ) => {
                const transformed = response.flatMap(node =>
                    node.types.map(type => ({
                        ...node,
                        id: type,
                        nodeRedId: node.id,
                        nodeRedName: node.name,
                        name: type,
                        type, // Assign each type to a new node
                        types: undefined, // Remove the types array
                    }))
                );
                return transformed;
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data: rawNodes } = await queryFulfilled;
                    dispatch(paletteNodeActions.setNodes(rawNodes));
                } catch (error) {
                    /* ignore errors - handled by caller */
                }
            },
        }),
        // Endpoint to fetch the collection of scripts to inject as HTML
        getNodeScripts: builder.query<string, void>({
            query: () => ({
                url: 'nodes',
                headers: {
                    Accept: 'text/html',
                },
            }),
            // No transformResponse needed for scripts
            providesTags: ['Node'],
            async onQueryStarted(
                _arg,
                { dispatch, queryFulfilled, extra: logic }
            ) {
                const nodeLogic = (logic as AppLogic).node;
                try {
                    const { data: nodeScripts } = await queryFulfilled;
                    dispatch(nodeLogic.setNodeScripts(nodeScripts));
                } catch (error) {
                    /* ignore errors - handled by caller */
                }
            },
        }),
    }),
});

export const { useGetNodesQuery, useGetNodeScriptsQuery } = nodeApi;
