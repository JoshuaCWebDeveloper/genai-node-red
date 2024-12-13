import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import environment from '../../../../environment';
import {
    FlowEntity,
    FlowNodeEntity,
    SubflowEntity,
    flowActions,
} from '../flow/flow.slice';

// API Types
type FlowApiResponse = {
    id: string;
    type: 'flow' | 'subflow';
    label?: string;
    info?: string;
    disabled?: boolean;
    nodes: Array<{
        id: string;
        type: string;
        name?: string;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

type CreateFlowRequest = Partial<FlowEntity | SubflowEntity> & {
    nodes?: FlowNodeEntity[];
};

type UpdateFlowRequest = Partial<FlowEntity | SubflowEntity> & {
    nodes?: FlowNodeEntity[];
};

// Transform API response to internal format
const transformFlowResponse = (response: FlowApiResponse): FlowEntity | SubflowEntity => {
    const { nodes, label, ...rest } = response;

    if (response.type === 'subflow') {
        return {
            ...rest,
            name: label || '',
            category: 'subflows',
            color: '#ddaa99',
            icon: 'node-red/subflow.svg',
            env: [],
            inputLabels: [],
            outputLabels: [],
        } as SubflowEntity;
    }

    return {
        ...rest,
        name: label || '',
        disabled: rest.disabled || false,
        info: rest.info || '',
        env: [],
    } as FlowEntity;
};

// Create the API service
export const flowApi = createApi({
    reducerPath: 'flowApi',
    baseQuery: fetchBaseQuery({
        baseUrl: environment.NODE_RED_API_ROOT,
        responseHandler: 'content-type',
    }),
    tagTypes: ['Flow'],
    endpoints: builder => ({
        // Get all flows
        getFlows: builder.query<Array<FlowEntity | SubflowEntity>, void>({
            query: () => ({
                url: 'flows',
                headers: {
                    Accept: 'application/json',
                },
            }),
            transformResponse: (response: FlowApiResponse[]) =>
                response.map(transformFlowResponse),
            providesTags: ['Flow'],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: flows } = await queryFulfilled;
                    dispatch(flowActions.addFlowEntities(flows));
                } catch (error) {
                    dispatch(flowActions.setError(error?.toString() || 'Failed to fetch flows'));
                }
            },
        }),

        // Get single flow by ID
        getFlow: builder.query<FlowEntity | SubflowEntity, string>({
            query: (id) => ({
                url: `flow/${id}`,
                headers: {
                    Accept: 'application/json',
                },
            }),
            transformResponse: transformFlowResponse,
            providesTags: (_result, _error, id) => [{ type: 'Flow', id }],
        }),

        // Create new flow
        createFlow: builder.mutation<FlowEntity | SubflowEntity, CreateFlowRequest>({
            query: (flow) => ({
                url: 'flow',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: flow,
            }),
            transformResponse: transformFlowResponse,
            invalidatesTags: ['Flow'],
        }),

        // Update existing flow
        updateFlow: builder.mutation<FlowEntity | SubflowEntity, { id: string; changes: UpdateFlowRequest }>({
            query: ({ id, changes }) => ({
                url: `flow/${id}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: changes,
            }),
            transformResponse: transformFlowResponse,
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Flow', id }],
        }),

        // Delete flow
        deleteFlow: builder.mutation<void, string>({
            query: (id) => ({
                url: `flow/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Flow', id }],
        }),
    }),
});

export const {
    useGetFlowsQuery,
    useGetFlowQuery,
    useCreateFlowMutation,
    useUpdateFlowMutation,
    useDeleteFlowMutation,
} = flowApi;
