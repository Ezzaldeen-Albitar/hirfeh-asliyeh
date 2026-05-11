'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGetWorkshopQuery, useBookWorkshopMutation } from '@/store/api/workshopsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';
import { DEFAULT_WORKSHOP_IMAGE, setImageFallback } from '@/lib/imageUtils';

const levelLabel = {
  all: 'مناسبة للجميع',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isArtisan, isAuth, isCustomer } = useAuth();
  const { data, isLoading, isError, refetch } = useGetWorkshopQuery(id, { skip: !id });
  const [bookWorkshop, { isLoading: booking }] = useBookWorkshopMutation();
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const workshop = data?.data;
  const canBookWorkshop = isCustomer || isArtisan;

  const maxParticipants = Math.max(workshop?.spotsLeft || 0, 0);
  const totalPrice = useMemo(() => {
    const count = Math.min(Math.max(Number(participants) || 1, 1), Math.max(maxParticipants, 1));
    return (workshop?.price || 0) * count;
  }, [participants, maxParticipants, workshop?.price]);

  const handleBook = async (event) => {
    event.preventDefault();
    if (!workshop || maxParticipants <= 0) return;
    if (!isAuth) {
      toast.info('يرجى تسجيل الدخول لحجز الورشة');
      router.push('/login');
      return;
    }
    if (!canBookWorkshop) {
      toast.warning('الحجز متاح لحسابات العملاء فقط');
      return;
    }

    const safeParticipants = Math.min(Math.max(Number(participants) || 1, 1), maxParticipants);
    try {
      const result = await bookWorkshop({
        id: workshop._id,
        body: {
          participants: safeParticipants,
          specialRequests: specialRequests.trim(),
        },
      }).unwrap();
      toast.success(`تم الحجز بنجاح. رمز التأكيد: ${result.confirmationCode}`);
      setSpecialRequests('');
      setParticipants(1);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إتمام الحجز');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <span className="spinner-border" style={{ color: 'var(--burgundy)' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
        <i className="bi bi-wifi-off fs-1 d-block mb-3" />
        <p>تعذر تحميل تفاصيل الورشة</p>
        <button className="btn btn-primary" style={{ borderRadius: 10 }} onClick={refetch} type="button">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
        <i className="bi bi-calendar-x fs-1 d-block mb-3" />
        <p>الورشة غير موجودة</p>
        <button className="btn btn-primary" style={{ borderRadius: 10 }} onClick={() => router.back()} type="button">
          رجوع
        </button>
      </div>
    );
  }

  const cover = workshop.coverImage || workshop.artisan?.profileImage || '';
  const isFull = maxParticipants <= 0;

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        {cover ? (
          <img
            src={cover}
            alt={workshop.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(event) => setImageFallback(event, DEFAULT_WORKSHOP_IMAGE)}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100" style={{ background: 'var(--parchment)', color: 'var(--stone)' }}>
            <i className="bi bi-image fs-1" />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(44,37,32,.78) 0%,rgba(44,37,32,.15) 70%)' }} />
      </div>

      <div className="container" style={{ marginTop: -70, position: 'relative', zIndex: 2, paddingBottom: 60 }}>
        <div className="ha-card p-4 p-md-5">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge" style={{ background: workshop.locationType === 'online' ? '#0f766e' : 'var(--burgundy)' }}>
                  {workshop.locationType === 'online' ? 'عن بعد' : 'حضورية'}
                </span>
                <span className="badge" style={{ background: 'var(--gold)', color: '#fff' }}>
                  {levelLabel[workshop.skillLevel] || workshop.skillLevel}
                </span>
              </div>

              <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '2rem', color: 'var(--charcoal)', marginBottom: 8 }}>{workshop.title}</h1>
              <div style={{ color: 'var(--burgundy)', fontWeight: 600, marginBottom: 16 }}>
                {workshop.artisanName ? `مع ${workshop.artisanName}` : null}
                {workshop.artisan?.isVerified ? <i className="bi bi-patch-check-fill me-2 text-gold" /> : null}
              </div>

              <div className="d-flex flex-wrap gap-4 mb-4" style={{ fontSize: '0.9rem', color: 'var(--warm-gray)' }}>
                {workshop.dateLabel ? <span><i className="bi bi-calendar3 ms-2" />{workshop.dateLabel}</span> : null}
                {workshop.timeLabel ? <span><i className="bi bi-clock ms-2" />{workshop.timeLabel}</span> : null}
                {workshop.durationMins ? <span><i className="bi bi-hourglass-split ms-2" />{workshop.durationMins} دقيقة</span> : null}
                {workshop.locationLabel ? <span><i className="bi bi-geo-alt ms-2" />{workshop.locationLabel}</span> : null}
                <span><i className="bi bi-people ms-2" />{maxParticipants} مقعد متبقي من {workshop.capacity}</span>
              </div>

              {workshop.description ? (
                <p style={{ color: 'var(--warm-gray)', lineHeight: 1.9, fontSize: '0.95rem' }}>{workshop.description}</p>
              ) : null}

              {workshop.includes?.length ? (
                <div className="mt-4">
                  <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>ماذا تشمل الورشة؟</h5>
                  <div className="row g-2 mt-1">
                    {workshop.includes.map((item) => (
                      <div key={item} className="col-sm-6">
                        <div className="d-flex align-items-center gap-2" style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>
                          <i className="bi bi-check-circle-fill text-success" />
                          <span>{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {workshop.requirements?.length ? (
                <div className="mt-4">
                  <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>المتطلبات</h5>
                  <ul style={{ color: 'var(--warm-gray)', lineHeight: 1.9 }}>
                    {workshop.requirements.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ) : null}

              {workshop.artisan ? (
                <div className="mt-4 p-3" style={{ background: 'var(--parchment)', borderRadius: 12, border: '1px solid var(--gold-pale)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      {workshop.artisan?.user?.avatar || workshop.artisan?.profileImage ? (
                        <img
                          src={workshop.artisan?.user?.avatar || workshop.artisan?.profileImage}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100" style={{ background: '#fff', color: 'var(--stone)' }}>
                          <i className="bi bi-person" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{workshop.artisanName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--warm-gray)' }}>{workshop.artisan?.craftName} - {workshop.artisan?.region}</div>
                    </div>
                  </div>
                  {workshop.artisan?.bio ? <p className="mb-0 mt-3" style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', lineHeight: 1.8 }}>{workshop.artisan.bio}</p> : null}
                </div>
              ) : null}
            </div>

            <div className="col-lg-4">
              <form onSubmit={handleBook} style={{ background: 'var(--parchment)', borderRadius: 16, padding: 24, border: '1px solid var(--gold-pale)', position: 'sticky', top: 92 }}>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '2rem', fontWeight: 700, color: 'var(--burgundy)', marginBottom: 16 }}>
                  {workshop.price} <small style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--warm-gray)' }}>{workshop.currency === 'JOD' ? 'د.أ' : workshop.currency}</small>
                </div>

                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>عدد المشاركين</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(maxParticipants, 1)}
                  value={participants}
                  disabled={isFull}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="form-control mb-3"
                  style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
                />

                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>ملاحظات خاصة</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  disabled={isFull}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="form-control mb-3"
                  style={{ borderRadius: 8, borderColor: 'var(--stone)', resize: 'none' }}
                  placeholder="مثلا: مستوى الخبرة أو أي احتياج خاص"
                />

                <div className="d-flex justify-content-between mb-3" style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>
                  <span>الإجمالي</span>
                  <strong style={{ color: 'var(--burgundy)' }}>{totalPrice.toFixed(2)} {workshop.currency === 'JOD' ? 'د.أ' : workshop.currency}</strong>
                </div>

                <button
                  disabled={isFull || booking}
                  className="btn btn-primary w-100 py-3 mb-3"
                  style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}
                  type="submit"
                >
                  {booking ? <span className="spinner-border spinner-border-sm ms-2" /> : null}
                  {isFull ? 'الورشة مكتملة' : 'تأكيد الحجز'}
                </button>
                <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', textAlign: 'center' }}>
                  <i className="bi bi-shield-check ms-1 text-success" />يتم تأكيد الحجز مباشرة
                </div>
              </form>
              <Link href="/workshops" className="btn btn-outline-primary w-100 mt-3" style={{ borderRadius: 10 }}>
                العودة للورش
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
