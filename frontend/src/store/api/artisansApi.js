import { baseApi } from './baseApi';

export const artisansApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getArtisans: builder.query({
      query: (params) => ({ url: '/artisans', params }),
      providesTags: ['Artisans'],
    }),
    getArtisan: builder.query({
      query: (id) => `/artisans/${id}`,
      providesTags: (r, e, id) => [{ type: 'Artisans', id }],
    }),
    getArtisanDashboard: builder.query({
      query: () => '/artisans/dashboard',
      providesTags: ['Artisans'],
    }),
    updateArtisanProfile: builder.mutation({
      query: (body) => ({ url: '/artisans/profile', method: 'PUT', body }),
      invalidatesTags: ['Artisans'],
    }),
    getFeaturedArtisans: builder.query({
      query: () => '/artisans/featured',
      providesTags: ['Artisans'],
    }),
  }),
});

export const {
  useGetArtisansQuery, useGetArtisanQuery, useGetArtisanDashboardQuery,
  useUpdateArtisanProfileMutation, useGetFeaturedArtisansQuery,
} = artisansApi;