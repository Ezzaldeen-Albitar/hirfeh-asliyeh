import { baseApi } from './baseApi';

const normalizeOrder = (order) => {
  if (!order) return order;
  return {
    ...order,
    total: order.total ?? order.totalAmount ?? 0,
    items: (order.items || []).map((item) => ({
      ...item,
      name: item.name ?? item.title ?? '',
    })),
    customer: order.customer
      ? {
          ...order.customer,
          phone: order.customer.phone ?? order.shippingAddress?.phone ?? '',
        }
      : order.customer,
  };
};

export const ordersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      transformResponse: (response) => ({
        data: (response.orders || []).map(normalizeOrder),
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      transformResponse: (response) => ({
        data: normalizeOrder(response.order),
      }),
      providesTags: (r, e, id) => [{ type: 'Orders', id }],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status: status === 'processing' ? 'in-progress' : status },
      }),
      invalidatesTags: ['Orders'],
    }),
    getArtisanOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      transformResponse: (response) => ({
        data: (response.orders || []).map(normalizeOrder),
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PUT' }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery, useGetOrderQuery, useCreateOrderMutation,
  useUpdateOrderStatusMutation, useGetArtisanOrdersQuery, useCancelOrderMutation,
} = ordersApi;
