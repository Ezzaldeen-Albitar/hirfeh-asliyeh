import { baseApi } from './baseApi';

const normalizeWishlistProduct = (product) => {
  if (!product) return product;
  return {
    ...product,
    name: product.name ?? product.title ?? '',
    title: product.title ?? product.name ?? '',
    craftType: product.craftType ?? product.category ?? '',
    artisan: product.artisan
      ? {
          ...product.artisan,
          name: product.artisan.name ?? product.artisan.user?.name ?? product.artisan.craftName ?? '',
          avatar: product.artisan.avatar ?? product.artisan.user?.avatar ?? product.artisan.profileImage ?? '',
        }
      : product.artisan,
  };
};

export const wishlistApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => '/wishlist',
      transformResponse: (response) => ({
        data: (response.wishlist || []).map(normalizeWishlistProduct),
      }),
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({ url: '/wishlist', method: 'POST', body: { productId } }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
