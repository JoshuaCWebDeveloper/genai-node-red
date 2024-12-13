import * as apiModule from '@reduxjs/toolkit/query/react';
import { MockedFunction } from 'vitest';
import { flowActions } from '../flow/flow.slice';
import { extractEndpointQuery } from './test-util';

// Mock the createApi and fetchBaseQuery functions from RTK Query
vi.mock('@reduxjs/toolkit/query/react', () => {
    const originalModule = vi.importActual('@reduxjs/toolkit/query/react');
    return {
        ...originalModule,
        createApi: vi.fn(() => ({
            useGetFlowsQuery: vi.fn(),
            useGetFlowQuery: vi.fn(),
            useCreateFlowMutation: vi.fn(),
            useUpdateFlowMutation: vi.fn(),
            useDeleteFlowMutation: vi.fn(),
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

describe('flowApi', () => {
    const BASE_URL = 'https://www.example.com/api';

    beforeEach(async () => {
        vi.stubEnv('VITE_NODE_RED_API_ROOT', BASE_URL);
        mockedCreateApi.mockClear();
        mockedBaseQuery.mockClear();
        vi.resetModules();
        await import('./flow.api');
    });

    it('fetchBaseQuery is called with correct baseUrl', () => {
        expect(mockedBaseQuery).toHaveBeenCalledWith({
            baseUrl: BASE_URL,
            responseHandler: 'content-type',
        });
    });

    describe('getFlows()', () => {
        it('query() configuration is correct', () => {
            const { query } = extractEndpointQuery('getFlows');
            const queryConfig = query();
            expect(queryConfig).toEqual({
                url: 'flows',
                headers: {
                    Accept: 'application/json',
                },
            });
        });

        it('transformResponse correctly transforms flow response', () => {
            const { transformResponse } = extractEndpointQuery('getFlows');
            const mockResponse = [{
                id: 'flow1',
                type: 'flow',
                label: 'Test Flow',
                disabled: false,
                nodes: [],
            }];

            const result = transformResponse(mockResponse);
            expect(result).toEqual([{
                id: 'flow1',
                type: 'flow',
                name: 'Test Flow',
                disabled: false,
                info: '',
                env: [],
            }]);
        });

        it('transformResponse correctly transforms subflow response', () => {
            const { transformResponse } = extractEndpointQuery('getFlows');
            const mockResponse = [{
                id: 'subflow1',
                type: 'subflow',
                label: 'Test Subflow',
                nodes: [],
            }];

            const result = transformResponse(mockResponse);
            expect(result).toEqual([{
                id: 'subflow1',
                type: 'subflow',
                name: 'Test Subflow',
                category: 'subflows',
                color: '#ddaa99',
                icon: 'node-red/subflow.svg',
                env: [],
                inputLabels: [],
                outputLabels: [],
            }]);
        });

        it('onQueryStarted updates Redux store with flows', async () => {
            const dispatch = vi.fn();
            const flows = [{
                id: 'flow1',
                type: 'flow',
                name: 'Test Flow',
                disabled: false,
                info: '',
                env: [],
            }];
            const queryFulfilled = Promise.resolve({ data: flows });

            const { onQueryStarted } = extractEndpointQuery('getFlows');
            await onQueryStarted(undefined, { dispatch, queryFulfilled });

            expect(dispatch).toHaveBeenCalledWith(
                flowActions.addFlowEntities(flows)
            );
        });

        it('onQueryStarted handles errors correctly', async () => {
            const dispatch = vi.fn();
            const queryFulfilled = Promise.reject(new Error('API Error'));

            const { onQueryStarted } = extractEndpointQuery('getFlows');
            await onQueryStarted(undefined, { dispatch, queryFulfilled });

            expect(dispatch).toHaveBeenCalledWith(
                flowActions.setError('Error: API Error')
            );
        });
    });

    describe('getFlow()', () => {
        it('query() configuration is correct', () => {
            const { query } = extractEndpointQuery('getFlow');
            const queryConfig = query('flow1');
            expect(queryConfig).toEqual({
                url: 'flow/flow1',
                headers: {
                    Accept: 'application/json',
                },
            });
        });
    });

    describe('createFlow()', () => {
        it('mutation configuration is correct', () => {
            const { query } = extractEndpointQuery('createFlow');
            const newFlow = {
                type: 'flow',
                name: 'New Flow',
            };
            const queryConfig = query(newFlow);
            expect(queryConfig).toEqual({
                url: 'flow',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: newFlow,
            });
        });
    });

    describe('updateFlow()', () => {
        it('mutation configuration is correct', () => {
            const { query } = extractEndpointQuery('updateFlow');
            const update = {
                id: 'flow1',
                changes: { name: 'Updated Flow' },
            };
            const queryConfig = query(update);
            expect(queryConfig).toEqual({
                url: 'flow/flow1',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: update.changes,
            });
        });
    });
});

Human: Review and analyze the following coding task description:
<CODING_TASK>
Implement the following task in the README.md:
```
IR-01: Establish API communication for flow management.
Objective: Enable communication between the frontend client and the Node-RED backend for flow management.
Technical Requirements: Design and implement a service layer in the frontend that communicates with Node-RED's backend APIs.
```
  
The API we're trying to connect to is Node_RED's API
</CODING_TASK>

Study and understand this file-by-file implementation plan for the task:
<PLAN>
<PLAN_FILE oldFilepath="/dev/null" newFilepath="packages/flow-client/src/app/redux/modules/api/flow.api.ts">
1. Create new file for flow API endpoints using RTK Query pattern
2. Add types for Flow API responses and requests
3. Implement getFlows query endpoint to fetch all flows
4. Implement getFlow query endpoint to fetch single flow by id
5. Implement createFlow mutation endpoint
6. Implement updateFlow mutation endpoint
7. Implement deleteFlow mutation endpoint
8. Add transformResponse handlers to convert API data to internal format
9. Add onQueryStarted handlers to update Redux store
</PLAN_FILE>
<PLAN_FILE oldFilepath="packages/flow-client/src/app/redux/store.ts" newFilepath="packages/flow-client/src/app/redux/store.ts">
1. Import flowApi from new flow.api.ts
2. Add flowApi.reducer to store configuration
3. Add flowApi.middleware to middleware configuration
</PLAN_FILE>
<PLAN_FILE oldFilepath="packages/flow-client/src/app/redux/modules/flow/flow.logic.ts" newFilepath="packages/flow-client/src/app/redux/modules/flow/flow.logic.ts">
1. Import flow API hooks from flow.api.ts
2. Update createNewFlow to use createFlow mutation
3. Update updateSubflow to use updateFlow mutation
4. Add error handling for API operations
</PLAN_FILE>
<PLAN_FILE oldFilepath="/dev/null" newFilepath="packages/flow-client/src/app/redux/modules/api/flow.api.spec.ts">
1. Create test file following pattern from node.api.spec.ts
2. Add tests for all flow API endpoints
3. Add tests for transform functions
4. Add tests for Redux store integration
</PLAN_FILE>
<PLAN_FILE oldFilepath="packages/flow-client/src/app/redux/modules/flow/flow.slice.ts" newFilepath="packages/flow-client/src/app/redux/modules/flow/flow.slice.ts">
1. Add loading states for API operations
2. Add error handling states for API operations
3. Update types to match API response formats
</PLAN_FILE>
<PLAN_FILE oldFilepath="packages/flow-client/src/environment.ts" newFilepath="packages/flow-client/src/environment.ts">
1. Add any new API endpoint configurations needed for flow management
</PLAN_FILE>
</PLAN>

Review these diffs that you have already completed for the implementation plan:
<COMPLETED_DIFFS>
<DIFF oldFilepath="/dev/null" newFilepath="packages/flow-client/src/app/redux/modules/api/flow.api.ts">
@@ -0,0 +1,147 @@
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
