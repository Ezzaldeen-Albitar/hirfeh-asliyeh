'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetWorkshopsQuery, useBookWorkshopMutation } from '@/store/api/workshopsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';
import Pagination from '@/components/common/Pagination';

const LOCATION_TYPES = [
  { value: '', label: 'كل الورش' },
  { value: 'physical', label: 'حضورية' },
  { value: 'online', label: 'عن بعد' },
];

const SKILL_LEVELS = [
  { value: '', label: 'كل المستويات' },
  { value: 'all', label: 'مناسبة للجميع' },
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

const levelLabel = {
  all: 'للجميع',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export default function WorkshopsPage() {
  const router = useRouter();
  const { isAuth, isCustomer } = useAuth();
  const [page, setPage] = useState(1);
  const [locationType, setLocationType] = useState('');
  const [skillLevel, setSkillLevel] = useState('');

  const params = {
    page,
    limit: 9,
    status: 'upcoming',
    ...(locationType && { locationType }),
    ...(skillLevel && { skillLevel }),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetWorkshopsQuery(params);
  const [bookWorkshop, { isLoading: booking }] = useBookWorkshopMutation();
  const workshops = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleBook = async (workshop) => {
    if (!isAuth) {
      toast.info('يرجى تسجيل الدخول لحجز الورشة');
      router.push('/login');
      return;
    }
    if (!isCustomer) {
      toast.warning('الحجز متاح لحسابات العملاء فقط');
      return;
    }
    if (workshop.spotsLeft <= 0) return;

    try {
      const result = await bookWorkshop({ id: workshop._id, body: { participants: 1 } }).unwrap();
      toast.success(`تم الحجز بنجاح. رمز التأكيد: ${result.confirmationCode}`);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إتمام الحجز، حاول مجددا');
    }
  };

  const resetFilters = () => {
    setLocationType('');
    setSkillLevel('');
    setPage(1);
  };

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--gold-pale)', padding: '36px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '2rem', color: 'var(--charcoal)', marginBottom: 6 }}>الورش الحرفية</h1>
          <p style={{ color: 'var(--warm-gray)', margin: 0, fontSize: '0.9rem' }}>تعلم من الحرفيين مباشرة واحجز مقعدك في تجربة عملية أصيلة</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 12px 60px' }}>
        <div className="ha-card p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <select
                className="form-select"
                value={locationType}
                onChange={(e) => { setLocationType(e.target.value); setPage(1); }}
                style={{ borderRadius: 8, borderColor: 'var(--stone)', fontSize: '0.88rem' }}
              >
                {LOCATION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={skillLevel}
                onChange={(e) => { setSkillLevel(e.target.value); setPage(1); }}
                style={{ borderRadius: 8, borderColor: 'var(--stone)', fontSize: '0.88rem' }}
              >
                {SKILL_LEVELS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-outline-primary" type="button" onClick={resetFilters} style={{ borderRadius: 8, fontWeight: 600 }}>
                مسح
              </button>
            </div>
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="row g-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="ha-card overflow-hidden placeholder-glow">
                  <div style={{ height: 210, background: 'var(--parchment)' }} className="placeholder w-100" />
                  <div className="p-4">
                    <span className="placeholder col-8 d-block mb-2" style={{ height: 20, borderRadius: 4 }} />
                    <span className="placeholder col-5 d-block mb-3" style={{ height: 14, borderRadius: 4 }} />
                    <span className="placeholder col-12 d-block" style={{ height: 38, borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
            <i className="bi bi-wifi-off fs-1 d-block mb-3" style={{ color: 'var(--stone)' }} />
            <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>تعذر تحميل الورش</h5>
            <button className="btn btn-primary mt-2" type="button" onClick={refetch} style={{ borderRadius: 8 }}>
              إعادة المحاولة
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
            <i className="bi bi-calendar-x fs-1 d-block mb-3" style={{ color: 'var(--stone)' }} />
            <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>لا توجد ورش مطابقة حاليا</h5>
            <button className="btn btn-outline-primary mt-2" type="button" onClick={resetFilters} style={{ borderRadius: 8 }}>
              عرض كل الورش
            </button>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {workshops.map((workshop) => {
                const cover = workshop.coverImage || workshop.artisan?.profileImage || '';
                const isFull = workshop.spotsLeft <= 0;
                return (
                  <div key={workshop._id} className="col-md-6 col-lg-4">
                    <div className="ha-card overflow-hidden h-100 d-flex flex-column">
                      <Link href={`/workshops/${workshop._id}`} className="text-decoration-none">
                        <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                          {cover ? (
                            <img
                              src={cover}
                              alt={workshop.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100" style={{ background: 'var(--parchment)', color: 'var(--stone)' }}>
                              <i className="bi bi-image fs-1" />
                            </div>
                          )}
                          <span className="position-absolute top-0 start-0 m-2 badge" style={{ background: workshop.locationType === 'online' ? '#0f766e' : 'var(--burgundy)', fontSize: '0.72rem' }}>
                            {workshop.locationType === 'online' ? 'عن بعد' : 'حضورية'}
                          </span>
                          {workshop.spotsLeft <= 3 && workshop.spotsLeft > 0 && (
                            <span className="position-absolute top-0 end-0 m-2 badge" style={{ background: '#ef4444', fontSize: '0.72rem' }}>
                              آخر {workshop.spotsLeft} مقاعد
                            </span>
                          )}
                          {isFull && (
                            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ inset: 0, background: 'rgba(0,0,0,.5)' }}>
                              <span className="badge fs-6" style={{ background: '#ef4444' }}>مكتملة</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 flex-grow-1 d-flex flex-column">
                        <Link href={`/workshops/${workshop._id}`} className="text-decoration-none">
                          <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.2rem', marginBottom: 6, color: 'var(--charcoal)' }}>{workshop.title}</h5>
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--burgundy)', fontWeight: 600, marginBottom: 12 }}>
                          {workshop.artisanName ? `مع ${workshop.artisanName}` : null}
                        </div>
                        <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.8rem', color: 'var(--warm-gray)' }}>
                          {workshop.dateLabel ? <span><i className="bi bi-calendar3 ms-1" />{workshop.dateLabel}</span> : null}
                          {workshop.timeLabel ? <span><i className="bi bi-clock ms-1" />{workshop.timeLabel}</span> : null}
                          {workshop.locationLabel ? <span><i className="bi bi-geo-alt ms-1" />{workshop.locationLabel}</span> : null}
                        </div>
                        <div className="d-flex flex-wrap gap-2 mb-3 mt-auto">
                          <span className="badge" style={{ background: 'var(--parchment)', color: 'var(--warm-gray)' }}>{levelLabel[workshop.skillLevel] || workshop.skillLevel}</span>
                          {workshop.durationMins ? <span className="badge" style={{ background: 'var(--parchment)', color: 'var(--warm-gray)' }}>{workshop.durationMins} دقيقة</span> : null}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--burgundy)' }}>
                            {workshop.price} <small style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--warm-gray)' }}>{workshop.currency === 'JOD' ? 'د.أ' : workshop.currency}</small>
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: workshop.spotsLeft <= 3 ? '#ef4444' : '#22c55e' }}>
                            <i className="bi bi-people ms-1" />{workshop.spotsLeft} متبقي
                          </span>
                        </div>
                        <button
                          onClick={() => handleBook(workshop)}
                          disabled={isFull || booking}
                          className="btn btn-primary w-100"
                          type="button"
                          style={{ borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}
                        >
                          {isFull ? 'مكتملة' : 'احجز مقعدا'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
