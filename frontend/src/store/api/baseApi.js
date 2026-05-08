import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = Cookies.get('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Render free tier ينام بعد 15 دقيقة — أول request يمكن يرجع 403/502
// هذا الـ wrapper يعيد المحاولة تلقائياً حتى 3 مرات مع انتظار بين كل محاولة
const baseQueryWithRetry = async (args, api, extraOptions) => {
  const RETRYABLE_STATUSES = [502, 503, 504];
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [3000, 6000, 10000]; // ms — نعطي السيرفر وقت يصحى

  let result = await rawBaseQuery(args, api, extraOptions);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const status = result.error?.status;

    // 429 = rate limit — لا تعيد المحاولة
    if (status === 429) break;

    // 401/403/404/422 = أخطاء منطقية — لا تعيد المحاولة
    if (status === 401 || status === 403 || status === 404 || status === 422) break;

    if (!RETRYABLE_STATUSES.includes(status)) break;

    console.warn(`[API] ${status} — retry ${attempt + 1}/${MAX_RETRIES} in ${RETRY_DELAYS[attempt]}ms`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));

    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Products','Artisans','Orders','Workshops','Reviews','Customizations','Users','Badges','Wishlist'],
  endpoints: () => ({}),
});