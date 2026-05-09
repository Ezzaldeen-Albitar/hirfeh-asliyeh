import { baseApi } from './baseApi';

const formatMessageTime = (sentAt) => {
  if (!sentAt) return undefined;
  try {
    return new Date(sentAt).toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return undefined;
  }
};

const normalizeMessage = (message) => ({
  ...message,
  message: message?.message ?? message?.content ?? '',
  time: message?.time ?? formatMessageTime(message?.sentAt),
});

const normalizeArtisan = (artisan) => {
  if (!artisan) return artisan;
  if (!artisan.user) return artisan;
  return {
    ...artisan,
    name: artisan.user.name,
    avatar: artisan.user.avatar,
  };
};

const normalizeCustomization = (item) => ({
  ...item,
  artisan: normalizeArtisan(item?.artisan),
  description: item?.description ?? item?.customerNotes ?? '',
  budget: item?.budget ?? item?.requestedBudget,
  deadline: item?.deadline ?? item?.requestedDeadline,
  messages: Array.isArray(item?.messages) ? item.messages.map(normalizeMessage) : [],
});

export const customizationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCustomizations: builder.query({
      query: () => '/customizations',
      transformResponse: (response) =>
        Array.isArray(response?.requests) ? response.requests.map(normalizeCustomization) : [],
      providesTags: ['Customizations'],
    }),
    getCustomization: builder.query({
      query: (id) => `/customizations/${id}`,
      transformResponse: (response) => normalizeCustomization(response?.request || {}),
      providesTags: (result, error, id) => [{ type: 'Customizations', id }],
    }),
    createCustomization: builder.mutation({
      query: (body) => ({ url: '/customizations', method: 'POST', body }),
      invalidatesTags: ['Customizations'],
    }),
    sendMessage: builder.mutation({
      query: ({ id, message }) => ({
        url: `/customizations/${id}/message`,
        method: 'POST',
        body: { content: message },
      }),
      invalidatesTags: ['Customizations'],
    }),
    updateCustomizationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/customizations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Customizations'],
    }),
  }),
});

export const {
  useGetCustomizationsQuery,
  useGetCustomizationQuery,
  useCreateCustomizationMutation,
  useSendMessageMutation,
  useUpdateCustomizationStatusMutation,
} = customizationsApi;
