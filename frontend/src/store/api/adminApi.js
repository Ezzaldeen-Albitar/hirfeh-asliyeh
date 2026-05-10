import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      transformResponse: (response) => ({
        data: response.stats,
        revenueChart: response.revenueChart || response.salesLast30Days || [],
        recentOrders: response.recentOrders || [],
        categoryStats: response.categoryStats,
      }),
    }),

    getAllUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      transformResponse: (response) => ({
        data: response.users,
        pagination: response.pagination,
      }),
      providesTags: ['Users'],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    getAllOrders: builder.query({
      query: (params) => ({ url: '/admin/orders', params }),
      transformResponse: (response) => ({
        data: response.orders,
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),

    getAllAdminProducts: builder.query({
      query: (params) => ({ url: '/admin/products', params }),
      transformResponse: (response) => ({
        data: response.products,
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),

    getAdminWorkshops: builder.query({
      query: (params) => ({ url: '/admin/workshops', params }),
      transformResponse: (response) => ({
        data: response.sessions,
        pagination: response.pagination,
      }),
      providesTags: ['Workshops'],
    }),

    getBadges: builder.query({
      query: () => '/admin/badges',
      providesTags: ['Badges'],
    }),

    assignBadge: builder.mutation({
      query: (body) => ({ url: '/admin/badges/assign', method: 'POST', body }),
      invalidatesTags: ['Badges', 'Artisans'],
    }),

    getPendingArtisans: builder.query({
      query: (params) => ({ url: '/admin/artisans/pending', params }),
      transformResponse: (response) => ({
        data: response.artisans,
        pagination: response.pagination,
      }),
      providesTags: ['Artisans'],
    }),

    approveArtisan: builder.mutation({
      query: (id) => ({ url: `/admin/artisans/${id}/verify`, method: 'PUT' }),
      invalidatesTags: ['Artisans'],
    }),

    rejectArtisan: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Artisans'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAllOrdersQuery,
  useGetAllAdminProductsQuery,
  useGetAdminWorkshopsQuery,
  useGetBadgesQuery,
  useAssignBadgeMutation,
  useGetPendingArtisansQuery,
  useApproveArtisanMutation,
  useRejectArtisanMutation,
} = adminApi;
