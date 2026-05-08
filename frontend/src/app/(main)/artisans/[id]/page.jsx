'use client';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetArtisanQuery } from '@/store/api/artisansApi';
import { useGetProductsQuery } from '@/store/api/productsApi';
import ProductCard from '@/components/products/ProductCard';
import BadgeDisplay from '@/components/artisans/BadgeDisplay';
import StarRating from '@/components/common/StarRating';
import MapView from '@/components/common/MapView';
import { DEFAULT_ARTISAN_AVATAR, DEFAULT_ARTISAN_COVER, getSafeImageSrc } from '@/lib/imageUtils';

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetArtisanQuery(id);
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ artisan: id, limit: 8 });

  const artisan  = data?.data;
  const products = productsData?.data || [];

  if (isLoading) return (
    <div className="bg-cream">
      {/* Cover skeleton */}
      <div className="placeholder-glow"><div className="placeholder w-100" style={{height:320,background:'var(--parchment)'}}/></div>
      <div className="container" style={{marginTop:-60,position:'relative',zIndex:2,paddingBottom:60}}>
        <div className="ha-card p-4 mb-4 placeholder-glow">
          <div className="d-flex gap-4">
            <div className="placeholder rounded-circle" style={{width:100,height:100,background:'var(--parchment)',flexShrink:0,marginTop:-40}}/>
            <div className="flex-grow-1">
              <span className="placeholder col-5 d-block mb-2" style={{height:28}}/>
              <span className="placeholder col-3 d-block mb-2" style={{height:18}}/>
              <span className="placeholder col-8 d-block" style={{height:14}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isError || !artisan) return (
    <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
      <i className="bi bi-person-x fs-1 d-block mb-3" style={{color:'var(--stone)'}}/>
      <h5 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)'}}>الحرفي غير موجود</h5>
      <Link href="/artisans" className="btn btn-primary mt-3" style={{borderRadius:10}}>العودة للحرفيين</Link>
    </div>
  );

  return (
    <div className="bg-cream">
      {/* Cover */}
      <div style={{position:'relative',height:320,overflow:'hidden'}}>
        <Image
          src={getSafeImageSrc(artisan.coverImage, getSafeImageSrc(artisan.avatar, DEFAULT_ARTISAN_COVER))}
          alt="cover"
          className="w-100 h-100"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{objectFit:"cover"}}
        />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(44,37,32,.8) 0%,rgba(44,37,32,.2) 60%,transparent 100%)'}}/>
        {artisan.isVerified && (
          <div className="position-absolute" style={{top:20,right:20}}>
            <span className="badge-certified"><i className="bi bi-patch-check-fill me-1"/>حرفي معتمد</span>
          </div>
        )}
      </div>

      <div className="container" style={{marginTop:-60,paddingBottom:60,position:'relative',zIndex:2}}>
        {/* Profile card */}
        <div className="ha-card p-4 mb-4">
          <div className="d-flex flex-column flex-md-row gap-4 align-items-start align-items-md-center">
            <div style={{width:100,height:100,borderRadius:'50%',overflow:'hidden',position:'relative',flexShrink:0,marginTop:-40,border:'4px solid #fff'}}>
              <Image
                src={getSafeImageSrc(artisan.avatar, DEFAULT_ARTISAN_AVATAR)}
                alt={artisan.name}
                fill
                sizes="100px"
                style={{objectFit:"cover"}}
              />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:4}}>{artisan.name}</h1>
                  <div style={{color:'var(--burgundy)',fontWeight:600,marginBottom:6}}>{artisan.craftSpecialty}</div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <StarRating value={artisan.avgRating||0}/>
                    <small style={{color:'var(--warm-gray)'}}>({artisan.reviewsCount||0} تقييم)</small>
                    <span style={{color:'var(--stone)'}}>·</span>
                    <small style={{color:'var(--warm-gray)'}}>
                      <i className="bi bi-geo-alt-fill text-danger" style={{fontSize:'0.72rem'}}/> {artisan.governorate}، الأردن
                    </small>
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
          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="ha-card p-4 mb-4">
              <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>إحصائيات</h6>
              {[
                {icon:'bi-box-seam',   label:'المنتجات',     val: artisan.productsCount||0},
                {icon:'bi-star-fill',  label:'التقييم',      val: `${(artisan.avgRating||0).toFixed(1)} / 5`, color:'var(--gold)'},
                {icon:'bi-award',      label:'سنوات الخبرة', val: `${artisan.yearsExp||0} سنة`},
                {icon:'bi-chat-text',  label:'التقييمات',    val: artisan.reviewsCount||0},
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
            {(artisan.origin?.lat || artisan.governorate) && (
              <div className="ha-card p-4">
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>
                  <i className="bi bi-geo-alt text-burgundy me-2"/>الموقع
                </h6>
                <MapView lat={artisan.origin?.lat||31.95} lng={artisan.origin?.lng||35.93} label={artisan.governorate||'الأردن'}/>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="col-lg-8">
            {artisan.bio && (
              <div className="ha-card p-4 mb-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:14}}>
                  <i className="bi bi-person-lines-fill text-burgundy me-2"/>قصتي
                </h5>
                <p style={{color:'var(--warm-gray)',lineHeight:1.95,fontSize:'0.93rem',margin:0}}>{artisan.bio}</p>
              </div>
            )}
            <div className="ha-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                  <i className="bi bi-box-seam text-burgundy me-2"/>منتجاته
                </h5>
                <Link href={`/products?artisan=${artisan._id}`} style={{fontSize:'0.85rem',color:'var(--burgundy)',textDecoration:'none',fontWeight:600}}>
                  عرض الكل <i className="bi bi-arrow-left"/>
                </Link>
              </div>
              {loadingProducts ? (
                <div className="row g-3">
                  {[...Array(4)].map((_,i)=>(
                    <div key={i} className="col-sm-6">
                      <div className="ha-card overflow-hidden placeholder-glow">
                        <div className="placeholder w-100" style={{height:180,background:'var(--parchment)'}}/>
                        <div className="p-3"><span className="placeholder col-7 d-block" style={{height:14}}/></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-4" style={{color:'var(--warm-gray)'}}>
                  <i className="bi bi-inbox fs-2 d-block mb-2"/>لا توجد منتجات بعد
                </div>
              ) : (
                <div className="row g-3">
                  {products.slice(0,4).map(p=>(
                    <div key={p._id} className="col-sm-6"><ProductCard product={p}/></div>
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
