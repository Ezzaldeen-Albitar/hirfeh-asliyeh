'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useGetWorkshopsQuery, useBookWorkshopMutation } from '@/store/api/workshopsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';

export default function WorkshopsPage() {
  const { isAuth } = useAuth();
  const { data, isLoading } = useGetWorkshopsQuery({});
  const [bookWorkshop, { isLoading: booking }] = useBookWorkshopMutation();
  const workshops = data?.data || [];

  const handleBook = async (id, title) => {
    if (!isAuth) { toast.info('يرجى تسجيل الدخول أولاً'); return; }
    try {
      await bookWorkshop(id).unwrap();
      toast.success(`تم حجزك في ورشة "${title}"! 🎉`);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر الحجز، حاول مجدداً');
    }
  };

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--gold-pale)', padding: '36px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '2rem', color: 'var(--charcoal)', marginBottom: 6 }}>الورش الحرفية</h1>
          <p style={{ color: 'var(--warm-gray)', margin: 0, fontSize: '0.9rem' }}>تعلّم من أمهر الحرفيين في بيئة تفاعلية وأجواء أصيلة</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 12px 60px' }}>
        {isLoading ? (
          <div className="row g-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="ha-card overflow-hidden placeholder-glow">
                  <div style={{ height: 200, background: 'var(--parchment)' }} className="placeholder w-100" />
                  <div className="p-4">
                    <span className="placeholder col-8 d-block mb-2" style={{ height: 20, borderRadius: 4 }} />
                    <span className="placeholder col-5 d-block mb-3" style={{ height: 14, borderRadius: 4 }} />
                    <span className="placeholder col-12 d-block" style={{ height: 38, borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
            <i className="bi bi-calendar-x fs-1 d-block mb-3" style={{ color: 'var(--stone)' }} />
            <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>لا توجد ورش متاحة حالياً</h5>
            <p style={{ fontSize: '0.9rem' }}>تابعنا قريباً لمزيد من الورش الحرفية</p>
          </div>
        ) : (
          <div className="row g-4">
            {workshops.map(w => {
              const spotsLeft = (w.capacity || 0) - (w.booked || 0);
              const coverImg = w.img || w.image || w.artisan?.avatar || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75';
              return (
                <div key={w._id} className="col-md-6 col-lg-4">
                  <div className="ha-card overflow-hidden h-100 d-flex flex-column">
                    <Link href={`/workshops/${w._id}`} className="text-decoration-none">
                      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                        <Image
                          src={coverImg}
                          alt={w.title}
                          className="w-100 h-100"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        {spotsLeft <= 2 && spotsLeft > 0 && (
                          <span className="position-absolute top-0 end-0 m-2 badge" style={{ background: '#ef4444', fontSize: '0.72rem' }}>
                            آخر {spotsLeft} مقاعد!
                          </span>
                        )}
                        {spotsLeft === 0 && (
                          <div className="position-absolute inset-0 d-flex align-items-center justify-content-center"
                            style={{ inset: 0, background: 'rgba(0,0,0,.5)', position: 'absolute' }}>
                            <span className="badge fs-6" style={{ background: '#ef4444' }}>مكتمل</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4 flex-grow-1 d-flex flex-column">
                      <Link href={`/workshops/${w._id}`} className="text-decoration-none">
                        <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.2rem', marginBottom: 6, color: 'var(--charcoal)' }}>{w.title}</h5>
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--burgundy)', fontWeight: 600, marginBottom: 12 }}>
                        مع {w.artisan?.name}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-3 mt-auto" style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}>
                        <span><i className="bi bi-calendar3 me-1" />{w.date}</span>
                        <span><i className="bi bi-clock me-1" />{w.time}</span>
                        <span><i className="bi bi-hourglass-split me-1" />{w.duration} دقيقة</span>
                        <span><i className="bi bi-geo-alt me-1" />{w.location || w.governorate}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--burgundy)' }}>
                          {w.price} <small style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--warm-gray)' }}>د.أ</small>
                        </span>
                        {spotsLeft > 0 ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: spotsLeft <= 3 ? '#ef4444' : '#22c55e' }}>
                            <i className="bi bi-people me-1" />{spotsLeft} مقعد متبقي
                          </span>
                        ) : null}
                      </div>
                      <button onClick={() => handleBook(w._id, w.title)}
                        disabled={spotsLeft === 0 || booking}
                        className="btn btn-primary w-100"
                        style={{ borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
                        {spotsLeft === 0 ? 'مكتمل' : 'احجز مقعدك'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}