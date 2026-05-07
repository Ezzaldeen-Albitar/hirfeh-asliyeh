import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
    }),
    getAllUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
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
      providesTags: ['Orders'],
    }),
    getAllAdminProducts: builder.query({
      query: (params) => ({ url: '/admin/products', params }),
      providesTags: ['Products'],
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
      query: () => '/admin/artisans/pending',
      providesTags: ['Artisans'],
    }),
    approveArtisan: builder.mutation({
      query: (id) => ({ url: `/admin/artisans/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Artisans'],
    }),
    rejectArtisan: builder.mutation({
      query: (id) => ({ url: `/admin/artisans/${id}/reject`, method: 'PATCH' }),
      invalidatesTags: ['Artisans'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery, useGetAllUsersQuery, useUpdateUserRoleMutation,
  useDeleteUserMutation, useGetAllOrdersQuery, useGetAllAdminProductsQuery,
  useGetBadgesQuery, useAssignBadgeMutation, useGetPendingArtisansQuery,
  useApproveArtisanMutation, useRejectArtisanMutation,
} = adminApi;