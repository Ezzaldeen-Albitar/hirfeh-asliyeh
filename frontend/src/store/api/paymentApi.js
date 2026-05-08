import { baseApi } from './baseApi';

export const paymentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (body) => ({
        url: '/payment/create-intent',
        method: 'POST',
        body,
      }),
    }),
    confirmPaymentIntent: builder.mutation({
      query: (body) => ({
        url: '/payment/confirm-intent',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentIntentMutation,
} = paymentApi;
