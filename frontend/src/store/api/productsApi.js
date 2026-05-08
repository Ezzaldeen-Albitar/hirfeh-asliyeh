import { baseApi } from './baseApi';

export const productsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (r, e, id) => [{ type: 'Products', id }],
    }),
    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
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
        data: response.products,
        pagination: response.pagination,
      }),
      providesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery, useGetProductQuery, useGetFeaturedProductsQuery,
  useCreateProductMutation, useUpdateProductMutation,
  useDeleteProductMutation, useGetAllProductsQuery,
} = productsApi;