'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useGetFeaturedProductsQuery } from '@/store/api/productsApi';
import { useGetFeaturedArtisansQuery } from '@/store/api/artisansApi';
import ProductCard from '@/components/products/ProductCard';
import ArtisanCard from '@/components/artisans/ArtisanCard';

const CRAFTS = [
  { label: 'السيراميك', q: 'السيراميك', img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=70' },
  { label: 'النسيج', q: 'النسيج', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
  { label: 'الفسيفساء', q: 'الفسيفساء', img: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/465d6c152336785.631c38da7b8fa.png' },
  { label: 'التطريز', q: 'التطريز', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { label: 'الفخار', q: 'الفخار', img: 'https://hura7.com/wp-content/uploads/2024/02/see_smell_savour_sensory_exploration_tri_2023_nov_19_cultural_foundation_86940-full-en1681198550.jpg' },
  { label: 'المجوهرات', q: 'المجوهرات', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=70' },
];

function Skeleton({ h = 230 }) {
  return <div className="placeholder-glow"><div className="placeholder w-100 rounded-3" style={{ height: h, background: 'var(--parchment)' }} /></div>;
}

export default function HomePage() {
  const { data: productsData, isLoading: lp } = useGetFeaturedProductsQuery();
  const { data: artisansData, isLoading: la } = useGetFeaturedArtisansQuery();
  const products = productsData?.data || [];
  const artisans = artisansData?.data || [];
  const meta = productsData?.meta || artisansData?.meta;

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="container hero-content w-100">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="hero-tag fade-up mb-3"><i className="bi bi-gem me-1" />منصة الحرف الأردنية الأصيلة</div>
              <h1 className="fade-up delay-1" style={{ fontFamily: 'Amiri,serif', fontSize: 'clamp(2.6rem,6vw,4.4rem)', color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>اكتشف أصالة الحرفة</h1>
              <p className="fade-up delay-2" style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.6rem,4vw,2.8rem)', color: 'var(--gold-light)', fontStyle: 'italic', marginBottom: 16 }}>Discover the Art of Origin</p>
              <p className="fade-up delay-3" style={{ color: 'rgba(255,255,255,.8)', fontSize: '1.05rem', marginBottom: 36 }}>استكشف حرفاً أردنية أصيلة من أمهر الحرفيين — كل قطعة لها قصة، وكل صانع له روح</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap fade-up delay-4">
                <Link href="/products" className="btn btn-primary px-4 py-3 d-inline-flex align-items-center gap-2" style={{ borderRadius: 50, fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 30px rgba(122,28,46,.4)' }}>تسوّق الآن <i className="bi bi-arrow-left" /></Link>
                <Link href="/register" className="btn px-4 py-3 d-inline-flex align-items-center gap-2" style={{ borderRadius: 50, fontWeight: 600, fontSize: '1rem', border: '1.5px solid rgba(255,255,255,.5)', color: '#fff', background: 'transparent' }}><i className="bi bi-person-plus" />انضم كحرفي</Link>
              </div>
            </div>
          </div>
          <div className="row justify-content-center mt-5 pt-4">
            <div className="col-auto">
              <div className="d-flex flex-wrap justify-content-center">
                {[
                  { num: meta?.totalArtisans ? `${meta.totalArtisans}+` : '500+', label: 'حرفي معتمد' },
                  { num: meta?.totalProducts ? meta.totalProducts.toLocaleString('ar-EG') : '2,400', label: 'منتج أصيل' },
                  { num: '12', label: 'محافظة أردنية' },
                  { num: meta?.totalOrders ? `${meta.totalOrders.toLocaleString('ar-EG')}+` : '8,000+', label: 'عميل سعيد' },
                ].map((s, i, a) => (
                  <div key={i} className="text-center px-4 py-2" style={{ borderRight: i < a.length - 1 ? '1px solid rgba(255,255,255,.2)' : 'none' }}>
                    <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '2rem', fontWeight: 700, color: 'var(--gold-light)' }}>{s.num}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">كيف تعمل المنصة</p>
            <h2 className="section-title">ثلاث خطوات إلى <span>الأصالة</span></h2>
            <div className="gold-divider" />
          </div>
          <div className="row g-4">
            {[
              { n: '١', icon: 'bi-search-heart', title: 'تصفّح', desc: 'استعرض مئات الحرف الأردنية الأصيلة واكتشف منتجات فريدة لا تجدها في أي مكان آخر' },
              { n: '٢', icon: 'bi-chat-heart', title: 'تواصل', desc: 'تحدث مباشرةً مع الحرفي، اعرف قصة المنتج، واطلب تخصيصه حسب رغبتك' },
              { n: '٣', icon: 'bi-box-seam', title: 'استلم', desc: 'احصل على منتجك الأصيل مع شهادة توثيق رسمية معتمدة من حِرفة أصلية' },
            ].map(s => (
              <div key={s.n} className="col-md-4">
                <div className="ha-card p-4 text-center h-100 position-relative">
                  <div className="position-absolute" style={{ top: -14, right: 20, width: 30, height: 30, background: 'var(--burgundy)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Amiri,serif', fontWeight: 700, fontSize: '0.9rem' }}>{s.n}</div>
                  <div style={{ width: 72, height: 72, background: 'var(--parchment)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.8rem', color: 'var(--burgundy)', border: '2px solid var(--gold-pale)' }}><i className={`bi ${s.icon}`} /></div>
                  <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem' }}>{s.title}</h5>
                  <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-parchment">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">استكشف حسب النوع</p>
            <h2 className="section-title">أنواع <span>الحرف</span></h2>
            <div className="gold-divider" />
          </div>
          <div className="row g-3">
            {CRAFTS.map(c => (
              <div key={c.label} className="col-6 col-md-4 col-lg-2">
                <Link href={`/products?category=${encodeURIComponent(c.q)}`} className="text-decoration-none">
                  <div style={{ position: 'relative', height: 180, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform .3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <Image src={c.img} alt={c.label} className="w-100 h-100" fill sizes="(max-width: 768px) 100vw, 50vw" style={{objectFit:"cover"}}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(90,20,34,.85) 0%,rgba(90,20,34,.15) 60%,transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
                      <div style={{ fontFamily: 'Amiri,serif', fontSize: '1.15rem', color: '#fff' }}>{c.label}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py" id="artisans">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <p className="section-label">نجوم المنصة</p>
              <h2 className="section-title mb-0">الحرفيون <span>المميزون</span></h2>
            </div>
            <Link href="/artisans" className="btn btn-outline-primary d-none d-md-inline-flex align-items-center gap-2" style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' }}>عرض الكل <i className="bi bi-arrow-left" /></Link>
          </div>
          <div className="row g-4">
            {la ? [...Array(3)].map((_, i) => (
              <div key={i} className="col-sm-6 col-lg-4">
                <div className="ha-card overflow-hidden"><Skeleton h={200} /><div className="p-3 pt-5"><Skeleton h={18} /><div className="mt-2"><Skeleton h={14} /></div></div></div>
              </div>
            )) : artisans.length > 0 ? artisans.map(a => (
              <div key={a._id} className="col-sm-6 col-lg-4"><ArtisanCard artisan={a} /></div>
            )) : (
              <div className="col-12 text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                <i className="bi bi-people fs-1 d-block mb-3" />لا يوجد حرفيون مميزون حالياً
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-py bg-parchment">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <p className="section-label">اختارها الخبراء</p>
              <h2 className="section-title mb-0">منتجات <span>مميزة</span></h2>
            </div>
            <Link href="/products" className="btn btn-outline-primary d-none d-md-inline-flex align-items-center gap-2" style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' }}>جميع المنتجات <i className="bi bi-arrow-left" /></Link>
          </div>
          <div className="row g-4">
            {lp ? [...Array(4)].map((_, i) => (
              <div key={i} className="col-6 col-lg-3">
                <div className="ha-card overflow-hidden"><Skeleton h={230} /><div className="p-3"><Skeleton h={16} /><div className="mt-2"><Skeleton h={32} /></div></div></div>
              </div>
            )) : products.length > 0 ? products.map(p => (
              <div key={p._id} className="col-6 col-lg-3"><ProductCard product={p} /></div>
            )) : (
              <div className="col-12 text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                <i className="bi bi-box-seam fs-1 d-block mb-3" />لا توجد منتجات مميزة حالياً
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg,var(--burgundy-dark) 0%,var(--burgundy) 50%,var(--burgundy-light) 100%)', padding: '80px 0', overflow: 'hidden' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start">
              <p style={{ fontSize: '0.72rem', letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', fontFamily: 'Playfair Display,serif', marginBottom: 8 }}>انضم لمجتمعنا</p>
              <h2 style={{ fontFamily: 'Amiri,serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', marginBottom: 16 }}>أنت حرفي أردني؟<br />شارك إبداعك مع العالم</h2>
              <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: 30, fontSize: '0.95rem' }}>انضم إلى مئات الحرفيين الموثّقين وابدأ ببيع منتجاتك. نحن نعتني بالتوثيق والتسويق، أنت تركّز على الإبداع.</p>
              <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                <Link href="/register" className="btn px-4 py-3 d-inline-flex align-items-center gap-2" style={{ borderRadius: 50, fontWeight: 700, background: 'var(--gold)', color: 'var(--charcoal)', fontSize: '0.95rem', border: 'none' }}><i className="bi bi-person-plus-fill" />سجّل كحرفي</Link>
                <Link href="/artisans" className="btn px-4 py-3 d-inline-flex align-items-center gap-2" style={{ borderRadius: 50, fontWeight: 600, border: '1.5px solid rgba(255,255,255,.5)', color: '#fff', background: 'transparent', fontSize: '0.95rem' }}>تعرف على حرفيينا <i className="bi bi-arrow-left" /></Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-center gap-3 mt-4">
              {[{ icon: 'bi-shield-check', label: 'توثيق رسمي لكل منتج' }, { icon: 'bi-graph-up-arrow', label: 'لوحة تحكم احترافية' }, { icon: 'bi-chat-dots', label: 'تواصل مباشر مع العملاء' }].map((f, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: '24px 20px', textAlign: 'center', minWidth: 130 }}>
                  <i className={`bi ${f.icon} fs-2 d-block mb-2`} style={{ color: 'var(--gold-light)' }} />
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,.85)' }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
