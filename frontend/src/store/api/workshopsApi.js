import { baseApi } from './baseApi';

export const workshopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkshops: builder.query({
      query: (params) => ({ url: '/workshops', params }),
      providesTags: ['Workshops'],
    }),
    getWorkshop: builder.query({
      query: (id) => `/workshops/${id}`,
      providesTags: (r, e, id) => [{ type: 'Workshops', id }],
    }),
    createWorkshop: builder.mutation({
      query: (body) => ({ url: '/workshops', method: 'POST', body }),
      invalidatesTags: ['Workshops'],
    }),
    bookWorkshop: builder.mutation({
      query: (id) => ({ url: `/workshops/${id}/book`, method: 'POST' }),
      invalidatesTags: ['Workshops'],
    }),
  }),
});

export const {
  useGetWorkshopsQuery, useGetWorkshopQuery,
  useCreateWorkshopMutation, useBookWorkshopMutation,
} = workshopsApi;
