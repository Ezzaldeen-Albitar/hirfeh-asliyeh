'use client';
import Link from 'next/link';
import { useGetFeaturedProductsQuery } from '@/store/api/productsApi';
import { useGetFeaturedArtisansQuery } from '@/store/api/artisansApi';
import ProductCard from '@/components/products/ProductCard';
import ArtisanCard from '@/components/artisans/ArtisanCard';

/* ─── Static mock data ─── */
const MOCK_PRODUCTS = [
  { _id:'p1', name:'إبريق طيني هيبروني', price:85,  avgRating:5,  images:['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75'], artisan:{ name:'خليل الفاحوم', avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60' } },
  { _id:'p2', name:'لوح فسيفساء أصيل',   price:240, avgRating:4.5,images:['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=75'], artisan:{ name:'عائشة العزيزي', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60' } },
  { _id:'p3', name:'كليم عمّاني منسوج',   price:120, avgRating:4,  images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75'], artisan:{ name:'فاطمة الحريري', avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60' } },
  { _id:'p4', name:'سوار فضي بدوي منقوش', price:65,  avgRating:5,  images:['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=75'], artisan:{ name:'سالم البدوي',   avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60' } },
];

const MOCK_ARTISANS = [
  { _id:'a1', name:'عائشة العزيزي',  craftSpecialty:'فنانة فسيفساء',  avgRating:4.8, governorate:'إربد',  isVerified:true, yearsExp:20, productsCount:34, coverImage:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=75', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { _id:'a2', name:'خليل الفاحوم',   craftSpecialty:'صانع فخار',       avgRating:5.0, governorate:'عزرق', isVerified:true, yearsExp:40, productsCount:51, coverImage:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=75', avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
  { _id:'a3', name:'فاطمة الحريري',  craftSpecialty:'ماسترة نسيج',    avgRating:4.6, governorate:'مأدبا', isVerified:true, yearsExp:35, productsCount:29, coverImage:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75', avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
];

const CRAFTS = [
  { label:'السيراميك', count:142, img:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=70' },
  { label:'النسيج',    count:89,  img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
  { label:'الفسيفساء', count:64,  img:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=70' },
  { label:'التطريز',   count:198, img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { label:'الفخار',    count:77,  img:'https://images.unsplash.com/photo-1578598336003-a41a7d9c77ae?w=400&q=70' },
  { label:'المجوهرات', count:113, img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=70' },
];

const STATS = [
  { num:'500+',  label:'حرفي معتمد' },
  { num:'2,400', label:'منتج أصيل' },
  { num:'12',    label:'محافظة أردنية' },
  { num:'8,000+',label:'عميل سعيد' },
];

export default function HomePage() {
  const { data: products } = useGetFeaturedProductsQuery();
  const { data: artisans }  = useGetFeaturedArtisansQuery();

  const displayProducts = products?.data || MOCK_PRODUCTS;
  const displayArtisans = artisans?.data || MOCK_ARTISANS;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-bg"/>
        <div className="container hero-content w-100">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="hero-tag fade-up mb-3">
                <i className="bi bi-gem me-1"/>منصة الحرف الأردنية الأصيلة
              </div>
              <h1 style={{fontFamily:'Amiri,serif',fontSize:'clamp(2.6rem,6vw,4.4rem)',color:'#fff',lineHeight:1.15,marginBottom:8}} className="fade-up delay-1">
                اكتشف أصالة الحرفة
              </h1>
              <p style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.8rem)',color:'var(--gold-light)',fontStyle:'italic',marginBottom:16}} className="fade-up delay-2">
                Discover the Art of Origin
              </p>
              <p style={{color:'rgba(255,255,255,.8)',fontSize:'1.05rem',marginBottom:36}} className="fade-up delay-3">
                استكشف حرفاً أردنية أصيلة من أمهر الحرفيين — كل قطعة لها قصة، وكل صانع له روح
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap fade-up delay-4">
                <Link href="/products"
                  className="btn btn-primary px-4 py-3 d-inline-flex align-items-center gap-2"
                  style={{borderRadius:50,fontWeight:700,fontSize:'1rem',boxShadow:'0 8px 30px rgba(122,28,46,.4)'}}>
                  تسوّق الآن <i className="bi bi-arrow-left"/>
                </Link>
                <Link href="/register"
                  className="btn px-4 py-3 d-inline-flex align-items-center gap-2"
                  style={{borderRadius:50,fontWeight:600,fontSize:'1rem',border:'1.5px solid rgba(255,255,255,.5)',color:'#fff',background:'transparent'}}>
                  <i className="bi bi-person-plus"/>انضم كحرفي
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row justify-content-center mt-5 pt-4">
            <div className="col-auto">
              <div className="d-flex flex-wrap justify-content-center">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center px-4 py-2"
                    style={{borderRight: i < STATS.length-1 ? '1px solid rgba(255,255,255,.2)' : 'none'}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',fontWeight:700,color:'var(--gold-light)'}}>{s.num}</div>
                    <div style={{fontSize:'0.78rem',color:'rgba(255,255,255,.65)',textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section-py">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">كيف تعمل المنصة</p>
            <h2 className="section-title">ثلاث خطوات إلى <span>الأصالة</span></h2>
            <div className="gold-divider"/>
          </div>
          <div className="row g-4">
            {[
              { n:'١', icon:'bi-search-heart',  title:'تصفّح',  desc:'استعرض مئات الحرف الأردنية الأصيلة واكتشف منتجات فريدة لا تجدها في أي مكان آخر' },
              { n:'٢', icon:'bi-chat-heart',    title:'تواصل', desc:'تحدث مباشرةً مع الحرفي، اعرف قصة المنتج، وطلب تخصيصه حسب رغبتك' },
              { n:'٣', icon:'bi-box-seam',      title:'استلم', desc:'احصل على منتجك الأصيل مع شهادة توثيق رسمية معتمدة من حِرفة أصلية' },
            ].map(s => (
              <div key={s.n} className="col-md-4">
                <div className="ha-card p-4 text-center h-100 position-relative">
                  <div className="position-absolute"
                    style={{top:-14,right:20,width:30,height:30,background:'var(--burgundy)',color:'#fff',
                      borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontFamily:'Amiri,serif',fontWeight:700,fontSize:'0.9rem'}}>
                    {s.n}
                  </div>
                  <div style={{width:72,height:72,background:'var(--parchment)',borderRadius:'50%',
                    display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',
                    fontSize:'1.8rem',color:'var(--burgundy)',border:'2px solid var(--gold-pale)'}}>
                    <i className={`bi ${s.icon}`}/>
                  </div>
                  <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem'}}>{s.title}</h5>
                  <p style={{color:'var(--warm-gray)',fontSize:'0.88rem',lineHeight:1.7,margin:0}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Craft Categories ── */}
      <section className="section-py bg-parchment">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">استكشف حسب النوع</p>
            <h2 className="section-title">أنواع <span>الحرف</span></h2>
            <div className="gold-divider"/>
          </div>
          <div className="row g-3">
            {CRAFTS.map(c => (
              <div key={c.label} className="col-6 col-md-4 col-lg-2">
                <Link href={`/products?craft=${c.label}`} className="text-decoration-none">
                  <div style={{position:'relative',height:180,borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'transform .3s'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                    <img src={c.img} alt={c.label} className="w-100 h-100" style={{objectFit:'cover'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(90,20,34,.85) 0%,rgba(90,20,34,.15) 60%,transparent 100%)',
                      display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:14}}>
                      <div style={{fontFamily:'Amiri,serif',fontSize:'1.15rem',color:'#fff'}}>{c.label}</div>
                      <div style={{fontSize:'0.72rem',color:'var(--gold-light)'}}>{c.count} منتج</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Artisans ── */}
      <section className="section-py" id="artisans">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <p className="section-label">نجوم المنصة</p>
              <h2 className="section-title mb-0">الحرفيون <span>المميزون</span></h2>
            </div>
            <Link href="/artisans"
              className="btn btn-outline-primary d-none d-md-inline-flex align-items-center gap-2"
              style={{borderRadius:8,fontWeight:600,fontSize:'0.88rem'}}>
              عرض الكل <i className="bi bi-arrow-left"/>
            </Link>
          </div>
          <div className="row g-4">
            {displayArtisans.map(a => (
              <div key={a._id} className="col-sm-6 col-lg-4">
                <ArtisanCard artisan={a}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section-py bg-parchment">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <p className="section-label">اختارها الخبراء</p>
              <h2 className="section-title mb-0">منتجات <span>مميزة</span></h2>
            </div>
            <Link href="/products"
              className="btn btn-outline-primary d-none d-md-inline-flex align-items-center gap-2"
              style={{borderRadius:8,fontWeight:600,fontSize:'0.88rem'}}>
              جميع المنتجات <i className="bi bi-arrow-left"/>
            </Link>
          </div>
          <div className="row g-4">
            {displayProducts.map(p => (
              <div key={p._id} className="col-6 col-lg-3">
                <ProductCard product={p}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Heritage Banner ── */}
      <section style={{background:'linear-gradient(135deg,var(--burgundy-dark) 0%,var(--burgundy) 50%,var(--burgundy-light) 100%)',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start">
              <p style={{fontSize:'0.72rem',letterSpacing:4,textTransform:'uppercase',color:'rgba(255,255,255,.7)',fontFamily:'Playfair Display,serif',marginBottom:8}}>
                انضم لمجتمعنا
              </p>
              <h2 style={{fontFamily:'Amiri,serif',fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#fff',marginBottom:16}}>
                أنت حرفي أردني؟<br/>شارك إبداعك مع العالم
              </h2>
              <p style={{color:'rgba(255,255,255,.8)',marginBottom:30,fontSize:'0.95rem'}}>
                انضم إلى أكثر من 500 حرفي موثّق وابدأ ببيع منتجاتك. نحن نعتني بالتوثيق والتسويق، أنت تركّز على الإبداع.
              </p>
              <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                <Link href="/register"
                  className="btn px-4 py-3 d-inline-flex align-items-center gap-2"
                  style={{borderRadius:50,fontWeight:700,background:'var(--gold)',color:'var(--charcoal)',fontSize:'0.95rem',border:'none'}}>
                  <i className="bi bi-person-plus-fill"/>سجّل كحرفي
                </Link>
                <Link href="/artisans"
                  className="btn px-4 py-3 d-inline-flex align-items-center gap-2"
                  style={{borderRadius:50,fontWeight:600,border:'1.5px solid rgba(255,255,255,.5)',color:'#fff',background:'transparent',fontSize:'0.95rem'}}>
                  تعرف على حرفيينا <i className="bi bi-arrow-left"/>
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-center gap-3 mt-4">
              {[
                { icon:'bi-shield-check', label:'توثيق رسمي لكل منتج' },
                { icon:'bi-graph-up-arrow', label:'لوحة تحكم احترافية' },
                { icon:'bi-chat-dots', label:'تواصل مباشر مع العملاء' },
              ].map((f,i) => (
                <div key={i} style={{background:'rgba(255,255,255,.1)',borderRadius:14,padding:'24px 20px',textAlign:'center',minWidth:130}}>
                  <i className={`bi ${f.icon} fs-2 d-block mb-2`} style={{color:'var(--gold-light)'}}/>
                  <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,.85)'}}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
