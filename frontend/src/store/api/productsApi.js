import { baseApi } from './baseApi';
import { normalizeProductCategory, normalizeRegion } from '@/lib/productFilters';

const normalizeArtisan = (artisan) => {
  if (!artisan) return artisan;
  return {
    ...artisan,
    name: artisan.name ?? artisan.user?.name ?? artisan.craftName ?? '',
    avatar: artisan.avatar ?? artisan.user?.avatar ?? artisan.profileImage ?? '',
    craftSpecialty: artisan.craftSpecialty ?? artisan.craftName ?? artisan.specialties?.[0] ?? '',
    governorate: artisan.governorate ?? artisan.region ?? '',
  };
};

const normalizeProduct = (product) => {
  if (!product) return product;
  const normalizedCategory = normalizeProductCategory(product.category ?? product.craftType ?? '');
  return {
    ...product,
    name: product.name ?? product.title ?? '',
    title: product.title ?? product.name ?? '',
    craftType: normalizedCategory,
    category: normalizedCategory,
    governorate: normalizeRegion(product.governorate ?? product.artisan?.region ?? ''),
    artisan: normalizeArtisan(product.artisan),
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
        // إضافة الـ normalization لضمان عمل واجهة الأدمن بشكل صحيح
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
  useGetMyProductsQuery, // تم دمج هذا الخطاف لضمان عمل "منتجاتي" للحرفي
} = productsApi;
