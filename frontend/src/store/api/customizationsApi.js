import { baseApi } from './baseApi';

export const customizationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCustomizations: builder.query({
      query: () => '/customizations',
      providesTags: ['Customizations'],
    }),
    getCustomization: builder.query({
      query: (id) => `/customizations/${id}`,
      providesTags: (r, e, id) => [{ type: 'Customizations', id }],
    }),
    createCustomization: builder.mutation({
      query: (body) => ({ url: '/customizations', method: 'POST', body }),
      invalidatesTags: ['Customizations'],
    }),
    sendMessage: builder.mutation({
      query: ({ id, message }) => ({ url: `/customizations/${id}/messages`, method: 'POST', body: { message } }),
      invalidatesTags: ['Customizations'],
    }),
    updateCustomizationStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/customizations/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Customizations'],
    }),
  }),
});

export const {
  useGetCustomizationsQuery, useGetCustomizationQuery,
  useCreateCustomizationMutation, useSendMessageMutation,
  useUpdateCustomizationStatusMutation,
} = customizationsApi;