'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetArtisanQuery } from '@/store/api/artisansApi';
import { useGetProductsQuery } from '@/store/api/productsApi';
import ProductCard from '@/components/products/ProductCard';
import BadgeDisplay from '@/components/artisans/BadgeDisplay';
import StarRating from '@/components/common/StarRating';
import MapView from '@/components/common/MapView';

const FALLBACK_ARTISAN = {
  _id:'a1', name:'خليل الفاحوم', craftSpecialty:'صانع فخار وزجاج', bio:'حرفي أردني من مدينة عزرق، يعمل في صناعة الفخار منذ أكثر من 40 عاماً. تعلّم الحرفة من والده الذي تعلّمها بدوره من جده. يُعدّ من أمهر صنّاع الفخار في الأردن.', avgRating:5.0, governorate:'عزرق', isVerified:true, yearsExp:40, productsCount:51, reviewsCount:128, coverImage:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80', avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80', badges:[{type:'gold',name:'حرفي ذهبي'},{type:'master',name:'ماستر'}], origin:{ lat:31.82, lng:36.57 },
};

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const { data, isLoading } = useGetArtisanQuery(id);
  const { data: productsData } = useGetProductsQuery({ artisan: id, limit: 8 });

  const artisan  = data?.data || FALLBACK_ARTISAN;
  const products = productsData?.data || [];

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height:'60vh'}}>
      <div className="spinner-border" style={{color:'var(--burgundy)'}}/>
    </div>
  );

  return (
    <div className="bg-cream">
      {/* Cover */}
      <div style={{position:'relative',height:320,overflow:'hidden'}}>
        <img src={artisan.coverImage} alt="cover" className="w-100 h-100" style={{objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(44,37,32,.8) 0%,rgba(44,37,32,.2) 60%,transparent 100%)'}}/>
        {artisan.isVerified && (
          <div className="position-absolute" style={{top:20,right:20}}>
            <span className="badge-certified"><i className="bi bi-patch-check-fill me-1"/>حرفي معتمد</span>
          </div>
        )}
      </div>

      <div className="container" style={{marginTop:-60,paddingBottom:60,position:'relative',zIndex:2}}>
        {/* Profile header card */}
        <div className="ha-card p-4 mb-4">
          <div className="d-flex flex-column flex-md-row gap-4 align-items-start align-items-md-center">
            <img src={artisan.avatar} alt={artisan.name}
              style={{width:100,height:100,borderRadius:'50%',objectFit:'cover',border:'4px solid var(--gold)',flexShrink:0,marginTop:-60}}/>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:4}}>{artisan.name}</h1>
                  <div style={{color:'var(--burgundy)',fontWeight:600,marginBottom:6}}>{artisan.craftSpecialty}</div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <StarRating value={artisan.avgRating||0}/>
                    <small style={{color:'var(--warm-gray)'}}>({artisan.reviewsCount||0} تقييم)</small>
                    <span style={{color:'var(--stone)'}}>·</span>
                    <small style={{color:'var(--warm-gray)'}}><i className="bi bi-geo-alt-fill text-danger" style={{fontSize:'0.72rem'}}/> {artisan.governorate}، الأردن</small>
                  </div>
                </div>
                <Link href={`/customizations/new?artisan=${artisan._id}`}
                  className="btn btn-primary d-flex align-items-center gap-2"
                  style={{borderRadius:10,fontWeight:700,padding:'10px 22px'}}>
                  <i className="bi bi-chat-dots-fill"/>تواصل معه
                </Link>
              </div>
              {artisan.badges?.length > 0 && (
                <div className="mt-3"><BadgeDisplay badges={artisan.badges}/></div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left column */}
          <div className="col-lg-4">
            {/* Stats */}
            <div className="ha-card p-4 mb-4">
              <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>إحصائيات</h6>
              {[
                { icon:'bi-box-seam',   label:'المنتجات',    val: artisan.productsCount||0 },
                { icon:'bi-star-fill',  label:'التقييم',     val: `${artisan.avgRating||0} / 5`, color:'var(--gold)' },
                { icon:'bi-award',      label:'سنوات الخبرة',val: `${artisan.yearsExp||0} سنة` },
                { icon:'bi-chat-text',  label:'التقييمات',   val: artisan.reviewsCount||0 },
              ].map(s=>(
                <div key={s.label} className="d-flex align-items-center justify-content-between py-2"
                  style={{borderBottom:'1px solid var(--gold-pale)'}}>
                  <div className="d-flex align-items-center gap-2" style={{color:'var(--warm-gray)',fontSize:'0.87rem'}}>
                    <i className={`bi ${s.icon}`} style={{color:s.color||'var(--burgundy)'}}/>
                    {s.label}
                  </div>
                  <strong style={{color:'var(--charcoal)',fontSize:'0.92rem'}}>{s.val}</strong>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="ha-card p-4">
              <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>
                <i className="bi bi-geo-alt text-burgundy me-2"/>الموقع
              </h6>
              <MapView lat={artisan.origin?.lat||31.95} lng={artisan.origin?.lng||35.93} label={artisan.governorate||'الأردن'}/>
            </div>
          </div>

          {/* Right column */}
          <div className="col-lg-8">
            {/* Bio */}
            <div className="ha-card p-4 mb-4">
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:14}}>
                <i className="bi bi-person-lines-fill text-burgundy me-2"/>قصتي
              </h5>
              <p style={{color:'var(--warm-gray)',lineHeight:1.95,fontSize:'0.93rem',margin:0}}>
                {artisan.bio || 'حرفي أردني موهوب يحمل إرثاً من الأجداد ويواصل مسيرة الإبداع.'}
              </p>
            </div>

            {/* Products */}
            <div className="ha-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                  <i className="bi bi-box-seam text-burgundy me-2"/>منتجاته
                </h5>
                <Link href={`/products?artisan=${artisan._id}`} style={{fontSize:'0.85rem',color:'var(--burgundy)',textDecoration:'none',fontWeight:600}}>
                  عرض الكل <i className="bi bi-arrow-left"/>
                </Link>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-4" style={{color:'var(--warm-gray)'}}>
                  <i className="bi bi-inbox fs-2 d-block mb-2"/>لا توجد منتجات بعد
                </div>
              ) : (
                <div className="row g-3">
                  {products.slice(0,4).map(p=>(
                    <div key={p._id} className="col-sm-6">
                      <ProductCard product={p}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
