import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get dashboard statistics
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      transformResponse: (response) => ({
        data: response.stats,
        revenueChart: response.revenueChart || response.salesLast30Days || [],
        recentOrders: response.recentOrders || [],
        categoryStats: response.categoryStats,
      }),
    }),

    // Get all users with pagination and search
    getAllUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      transformResponse: (response) => ({
        data: response.users,
        pagination: response.pagination,
      }),
      providesTags: ['Users'],
    }),

    // Update user role
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['Users'],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    // Get all orders with pagination
    getAllOrders: builder.query({
      query: (params) => ({ url: '/admin/orders', params }),
      transformResponse: (response) => ({
        data: response.orders,
        pagination: response.pagination,
      }),
      providesTags: ['Orders'],
    }),

    // Get all products with pagination
    getAllAdminProducts: builder.query({
      query: (params) => ({ url: '/admin/products', params }),
      transformResponse: (response) => ({
        data: response.products,
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),

    // Get all badges
    getBadges: builder.query({
      query: () => '/admin/badges',
      providesTags: ['Badges'],
    }),

    // Assign badge to artisan
    assignBadge: builder.mutation({
      query: (body) => ({ url: '/admin/badges/assign', method: 'POST', body }),
      invalidatesTags: ['Badges', 'Artisans'],
    }),

    // Get pending artisans (not verified)
    getPendingArtisans: builder.query({
      query: (params) => ({ url: '/admin/artisans/pending', params }),
      transformResponse: (response) => ({
        data: response.artisans,
        pagination: response.pagination,
      }),
      providesTags: ['Artisans'],
    }),

    // Approve artisan (verify)
    // Note: Ensure backend has PUT /api/admin/artisans/:id/verify
    approveArtisan: builder.mutation({
      query: (id) => ({ url: `/admin/artisans/${id}/verify`, method: 'PUT' }),
      invalidatesTags: ['Artisans'],
    }),

    // Reject artisan (delete/ban)
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
  useGetBadgesQuery,
  useAssignBadgeMutation,
  useGetPendingArtisansQuery,
  useApproveArtisanMutation,
  useRejectArtisanMutation,
} = adminApi;
