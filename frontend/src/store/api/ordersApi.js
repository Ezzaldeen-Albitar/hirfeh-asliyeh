import { baseApi } from './baseApi';

export const ordersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      transformResponse: (response) => ({
        data: response.orders,
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (r, e, id) => [{ type: 'Orders', id }],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Orders'],
    }),
    getArtisanOrders: builder.query({
      query: (params) => ({ url: '/orders/artisan', params }),
      transformResponse: (response) => ({
        data: response.orders,
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery, useGetOrderQuery, useCreateOrderMutation,
  useUpdateOrderStatusMutation, useGetArtisanOrdersQuery, useCancelOrderMutation,
} = ordersApi;