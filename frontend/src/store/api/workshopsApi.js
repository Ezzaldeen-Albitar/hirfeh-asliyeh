import { baseApi } from './baseApi';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-JO', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const normalizeWorkshop = (session) => {
  if (!session) return session;

  const artisanName = session.artisan?.user?.name || session.artisan?.craftName || '';
  const bookedCount = session.bookedCount ?? session.booked ?? 0;
  const capacity = session.capacity ?? 0;
  const date = session.schedule?.date || session.date || '';
  const startTime = session.schedule?.startTime || session.time || '';
  const endTime = session.schedule?.endTime || '';
  const durationMins = session.schedule?.durationMins ?? session.duration ?? '';
  const city = session.location?.city || session.location?.governorate || session.artisan?.region || '';
  const address = session.locationType === 'online'
    ? session.location?.meetingLink || ''
    : session.location?.address || city;

  return {
    ...session,
    artisanName,
    bookedCount,
    booked: bookedCount,
    spotsLeft: Math.max(capacity - bookedCount, 0),
    coverImage: session.coverImage || session.images?.[0] || session.image || session.img || '',
    date,
    dateLabel: formatDate(date),
    timeLabel: [startTime, endTime].filter(Boolean).join(' - '),
    durationMins,
    duration: durationMins,
    locationLabel: address || city,
    city,
  };
};

export const workshopsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWorkshops: builder.query({
      query: (params) => ({ url: '/workshops', params }),
      transformResponse: (response) => ({
        data: (response.sessions || []).map(normalizeWorkshop),
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
        pagination: response.pagination,
      }),
      providesTags: ['Workshops'],
    }),
    getWorkshop: builder.query({
      query: (id) => `/workshops/${id}`,
      transformResponse: (response) => ({
        data: normalizeWorkshop(response.session),
      }),
      providesTags: (r, e, id) => [{ type: 'Workshops', id }],
    }),
    getMyWorkshopBookings: builder.query({
      query: () => '/workshops/my-bookings',
      transformResponse: (response) => ({
        data: (response.bookings || []).map((booking) => ({
          ...booking,
          session: normalizeWorkshop(booking.session),
        })),
      }),
      providesTags: ['Workshops'],
    }),
    createWorkshop: builder.mutation({
      query: (body) => ({ url: '/workshops', method: 'POST', body }),
      invalidatesTags: ['Workshops'],
    }),
    updateWorkshop: builder.mutation({
      query: ({ id, body }) => ({ url: `/workshops/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => ['Workshops', { type: 'Workshops', id }],
    }),
    deleteWorkshop: builder.mutation({
      query: (id) => ({ url: `/workshops/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, id) => ['Workshops', { type: 'Workshops', id }],
    }),
    getWorkshopBookings: builder.query({
      query: (id) => `/workshops/${id}/bookings`,
      providesTags: (r, e, id) => [{ type: 'Workshops', id }],
    }),
    bookWorkshop: builder.mutation({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const body = typeof arg === 'string' ? undefined : arg.body;
        return { url: `/workshops/${id}/book`, method: 'POST', body };
      },
      invalidatesTags: (r, e, arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        return ['Workshops', { type: 'Workshops', id }];
      },
    }),
  }),
});

export const {
  useGetWorkshopsQuery, useGetWorkshopQuery, useGetMyWorkshopBookingsQuery,
  useCreateWorkshopMutation, useUpdateWorkshopMutation, useDeleteWorkshopMutation,
  useGetWorkshopBookingsQuery, useBookWorkshopMutation,
} = workshopsApi;
