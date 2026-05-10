import { baseApi } from './baseApi';
import { DEFAULT_ARTISAN_AVATAR, getPrimaryImageSrc, getSafeImageSrc } from '@/lib/imageUtils';
import { normalizeProductCategory, normalizeRegion } from '@/lib/productFilters';

const normalizeArtisan = (artisan) => {
  if (!artisan) return artisan;
  const rating = Number(artisan.avgRating ?? artisan.rating ?? 0);
  const reviewCount = Number(artisan.reviewsCount ?? artisan.reviewCount ?? 0);

  return {
    ...artisan,
    name: artisan.name ?? artisan.user?.name ?? artisan.craftName ?? '',
    avatar: getSafeImageSrc(
      artisan.avatar ?? artisan.user?.avatar ?? artisan.profileImage ?? '',
      DEFAULT_ARTISAN_AVATAR
    ),
    craftSpecialty: artisan.craftSpecialty ?? artisan.craftName ?? artisan.specialties?.[0] ?? '',
    governorate: artisan.governorate ?? artisan.region ?? '',
    avgRating: rating,
    rating,
    reviewsCount: reviewCount,
    reviewCount,
  };
};

const normalizeProduct = (product) => {
  if (!product) return product;
  const normalizedCategory = normalizeProductCategory(product.category ?? product.craftType ?? '');
  const rating = Number(product.avgRating ?? product.rating ?? 0);
  const reviewCount = Number(product.reviewsCount ?? product.reviewCount ?? 0);
  const images = Array.isArray(product.images)
    ? product.images.map((image) => getSafeImageSrc(image)).filter(Boolean)
    : [];

  return {
    ...product,
    name: product.name ?? product.title ?? '',
    title: product.title ?? product.name ?? '',
    images: images.length ? images : [getPrimaryImageSrc(product.images)],
    craftType: normalizedCategory,
    category: normalizedCategory,
    governorate: normalizeRegion(product.governorate ?? product.artisan?.region ?? ''),
    artisan: normalizeArtisan(product.artisan),
    avgRating: rating,
    rating,
    reviewsCount: reviewCount,
    reviewCount,
  };
};

export const productsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      transformResponse: (response) => ({
        data: (response.products || []).map(normalizeProduct),
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => ({
        data: normalizeProduct(response.product),
      }),
      providesTags: (r, e, id) => [{ type: 'Products', id }],
    }),
    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
      transformResponse: (response) => ({
        data: (response.products || []).map(normalizeProduct),
      }),
      providesTags: ['Products'],
    }),
    getMyProducts: builder.query({
      query: (params) => ({ url: '/products/mine', params }),
      transformResponse: (response) => ({
        data: (response.products || []).map(normalizeProduct),
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    getAllProducts: builder.query({
      query: (params) => ({ url: '/admin/products', params }),
      transformResponse: (response) => ({
        data: (response.products || []).map(normalizeProduct),
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useGetMyProductsQuery,
} = productsApi;
