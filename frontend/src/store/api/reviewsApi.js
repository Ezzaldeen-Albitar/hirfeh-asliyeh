import { baseApi } from './baseApi';

const normalizeReview = (review) => {
  if (!review) return review;
  return {
    ...review,
    user: review.user ?? review.reviewer,
    comment: review.comment ?? review.body ?? '',
  };
};

export const reviewsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
      transformResponse: (response) => ({
        data: (response.reviews || []).map(normalizeReview),
        pagination: response.pagination,
      }),
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Reviews'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const { useGetProductReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } = reviewsApi;
