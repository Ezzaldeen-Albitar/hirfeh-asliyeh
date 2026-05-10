import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    resendOtp: builder.mutation({
      query: (body) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    googleLogin: builder.mutation({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation, useRegisterMutation, useVerifyOtpMutation,
  useResendOtpMutation, useForgotPasswordMutation, useResetPasswordMutation,
  useGoogleLoginMutation, useGetMeQuery,
} = authApi;
