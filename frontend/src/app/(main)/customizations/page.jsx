'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetCustomizationsQuery,
  useSendMessageMutation,
  useUpdateCustomizationStatusMutation,
} from '@/store/api/customizationsApi';
import { useAuth } from '@/hooks/useAuth';
import { useCustomizationSocket } from '@/hooks/useCustomizationSocket';
import { toast } from '@/lib/sweetalert';
import CustomizationChat from '@/components/dashboard/CustomizationChat';

function getSenderId(message) {
  if (!message?.sender) return null;
  if (typeof message.sender === 'string') return message.sender;
  return message.sender._id || message.sender.toString?.() || null;
}

function mapChatMessages(messages, currentUserId) {
  return (messages || []).map((message) => ({
    ...message,
    message: message.message ?? message.content ?? '',
    isOwn: getSenderId(message) === currentUserId,
  }));
}

function getArtisanProfileId(customization) {
  return customization?.artisan?._id || customization?.artisan?.id || null;
}

function CustomizationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isArtisan } = useAuth();
  const { data: customs = [], isLoading } = useGetCustomizationsQuery();
  const [sendMessage] = useSendMessageMutation();
  const [updateStatus] = useUpdateCustomizationStatusMutation();
  const [manualActiveId, setManualActiveId] = useState(null);

  const requestId = searchParams.get('request');
  const artisanId = searchParams.get('artisan');
  const currentUserId = user?._id || user?.id;
  const customizationIds = useMemo(
    () => customs.map((customization) => customization._id).filter(Boolean),
    [customs]
  );
  const linkedCustomization = artisanId
    ? customs.find((customization) => getArtisanProfileId(customization) === artisanId)
    : null;
  const activeId =
    (requestId && customs.some((customization) => customization._id === requestId) && requestId) ||
    linkedCustomization?._id ||
    (manualActiveId && customs.some((customization) => customization._id === manualActiveId) && manualActiveId) ||
    customs[0]?._id ||
    null;
  const active = customs.find((customization) => customization._id === activeId) || null;

  useCustomizationSocket(customizationIds);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (artisanId && !isArtisan) {
      if (linkedCustomization) {
        if (requestId !== linkedCustomization._id) {
          router.replace(`/customizations?request=${linkedCustomization._id}`, { scroll: false });
        }
        return;
      }

      router.replace(`/customizations/new?artisan=${artisanId}`);
      return;
    }

  }, [artisanId, isArtisan, isLoading, linkedCustomization, requestId, router]);

  const openCustomization = (id) => {
    setManualActiveId(id);
    if (requestId !== id) {
      router.replace(`/customizations?request=${id}`, { scroll: false });
    }
  };

  const handleSend = async (message) => {
    if (!active) return;
    try {
      await sendMessage({ id: active._id, message }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إرسال الرسالة');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success('تم تحديث الحالة');
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر التحديث');
    }
  };

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div
        style={{
          background: 'var(--parchment)',
          borderBottom: '1px solid var(--gold-pale)',
          padding: '32px 0',
        }}
      >
        <div className="container">
          <h1
            style={{
              fontFamily: 'Amiri,serif',
              fontSize: '2rem',
              color: 'var(--charcoal)',
              marginBottom: 0,
            }}
          >
            طلبات التخصيص
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 12px 60px' }}>
        {isLoading ? (
          <div className="text-center py-5">
            <span className="spinner-border" style={{ color: 'var(--burgundy)' }} />
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="ha-card p-3">
                <h6 style={{ fontFamily: 'Amiri,serif', fontSize: '1.1rem', marginBottom: 14 }}>
                  المحادثات
                </h6>

                {customs.length === 0 ? (
                  <div className="text-center py-4" style={{ color: 'var(--warm-gray)' }}>
                    <i className="bi bi-chat-square-x fs-2 d-block mb-2" />
                    لا توجد طلبات
                  </div>
                ) : (
                  customs.map((customization) => (
                    <div
                      key={customization._id}
                      onClick={() => openCustomization(customization._id)}
                      className="p-3 mb-2 rounded-3"
                      style={{
                        cursor: 'pointer',
                        border: `1.5px solid ${
                          activeId === customization._id ? 'var(--burgundy)' : 'var(--gold-pale)'
                        }`,
                        background: activeId === customization._id ? 'rgba(122,28,46,.04)' : '#fff',
                      }}
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <strong style={{ fontSize: '0.88rem' }}>
                          {isArtisan
                            ? customization.customer?.name
                            : customization.artisan?.name || customization.artisan?.user?.name}
                        </strong>
                        <small style={{ color: 'var(--warm-gray)' }}>
                          {customization.updatedAt?.slice(0, 10)}
                        </small>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', marginBottom: 4 }}>
                        {customization.description?.slice(0, 45)}
                        {customization.description?.length > 45 ? '…' : ''}
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: 'var(--parchment)',
                          color: 'var(--warm-gray)',
                        }}
                      >
                        {customization.status}
                      </span>

                      {isArtisan && customization.status === 'pending' && (
                        <div className="d-flex gap-1 mt-2" onClick={(event) => event.stopPropagation()}>
                          <button
                            className="btn btn-sm py-0"
                            style={{
                              fontSize: '0.72rem',
                              color: '#22c55e',
                              border: '1px solid #22c55e',
                              borderRadius: 6,
                            }}
                            onClick={() => handleStatus(customization._id, 'processing')}
                          >
                            قبول
                          </button>
                          <button
                            className="btn btn-sm py-0"
                            style={{
                              fontSize: '0.72rem',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: 6,
                            }}
                            onClick={() => handleStatus(customization._id, 'cancelled')}
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-md-8">
              {active ? (
                <CustomizationChat
                  messages={mapChatMessages(active.messages, currentUserId)}
                  onSend={handleSend}
                />
              ) : (
                <div className="ha-card p-5 text-center" style={{ color: 'var(--warm-gray)' }}>
                  <i className="bi bi-chat-dots fs-1 d-block mb-3" />
                  اختر محادثة للبدء
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CustomizationsPage />
    </AuthGuard>
  );
}
