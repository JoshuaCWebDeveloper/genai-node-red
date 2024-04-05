import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FeatureEntity } from '../feature/feature.slice';

// Define a service using a base URL and expected endpoints
export const featureApi = createApi({
    reducerPath: 'featureApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://www.example.com/api/' }),
    endpoints: builder => ({
        getFeatures: builder.query<Record<string, FeatureEntity>, void>({
            query: () => `features/all`,
            // remove duplicates
            transformResponse: (featureData: FeatureEntity[]) =>
                Object.fromEntries(
                    featureData
                        .filter((feature, idx) => {
                            return (
                                featureData.findIndex(
                                    other => other.id === feature.id
                                ) === idx
                            );
                        })
                        .map(feature => [feature.id, feature])
                ),
        }),
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetFeaturesQuery } = featureApi;
