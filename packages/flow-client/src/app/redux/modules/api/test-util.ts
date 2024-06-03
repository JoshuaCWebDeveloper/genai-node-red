import * as apiModule from '@reduxjs/toolkit/query/react';
import { MockedFunction, vi } from 'vitest';

const mockedCreateApi = apiModule.createApi as unknown as MockedFunction<
    typeof apiModule.createApi
>;

export const extractEndpointQuery = (endpoint: string) => {
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
