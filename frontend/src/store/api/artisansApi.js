import { baseApi } from './baseApi';

const normalizeArtisan = (artisan) => {
  if (!artisan) return artisan;
  const rating = artisan.avgRating ?? artisan.rating ?? 0;
  const yearsOfExperience = artisan.yearsOfExperience ?? artisan.yearsExp ?? 0;
  const productsCount = artisan.productsCount ?? artisan.totalProducts ?? 0;

  return {
    ...artisan,
    name: artisan.name ?? artisan.user?.name ?? '',
    avatar: artisan.avatar ?? artisan.user?.avatar ?? artisan.profileImage ?? '',
    craftSpecialty: artisan.craftSpecialty ?? artisan.craftName ?? artisan.specialties?.[0] ?? '',
    governorate: artisan.governorate ?? artisan.region ?? '',
    avgRating: rating,
    rating,
    yearsExp: yearsOfExperience,
    yearsOfExperience,
    productsCount,
  };
};

export const artisansApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getArtisans: builder.query({
      query: (params) => ({ url: '/artisans', params }),
      transformResponse: (response) => ({
        data: (response.artisans || []).map(normalizeArtisan),
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
        pagination: response.pagination,
      }),
      providesTags: ['Artisans'],
    }),
    getArtisan: builder.query({
      query: (id) => `/artisans/${id}`,
      transformResponse: (response) => ({
        data: normalizeArtisan(response.artisan),
      }),
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
      transformResponse: (response) => ({
        data: (response.artisans || []).map(normalizeArtisan),
      }),
      providesTags: ['Artisans'],
    }),
  }),
});

export const {
  useGetArtisansQuery, useGetArtisanQuery, useGetArtisanDashboardQuery,
  useUpdateArtisanProfileMutation, useGetFeaturedArtisansQuery,
} = artisansApi;
