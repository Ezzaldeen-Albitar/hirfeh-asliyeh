'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useGetWorkshopQuery, useBookWorkshopMutation } from '@/store/api/workshopsApi';
import { toast } from '@/lib/sweetalert';
import { DEFAULT_PRODUCT_IMAGE, getSafeImageSrc } from '@/lib/imageUtils';

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetWorkshopQuery(id);
  const [bookWorkshop, { isLoading: booking }] = useBookWorkshopMutation();
  const w = data?.data;

  const handleBook = async () => {
    try {
      await bookWorkshop(id).unwrap();
      toast.success('تم حجزك بنجاح! 🎉');
    } catch { toast.error('تعذر الحجز'); }
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height:'60vh'}}>
      <span className="spinner-border" style={{color:'var(--burgundy)'}}/>
    </div>
  );

  if (!w) return (
    <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
      <i className="bi bi-calendar-x fs-1 d-block mb-3"/>
      <p>الورشة غير موجودة</p>
      <button className="btn btn-primary" style={{borderRadius:10}} onClick={()=>router.back()}>
        رجوع
      </button>
    </div>
  );

  const spotsLeft = w.capacity - w.booked;

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{position:'relative',height:320,overflow:'hidden'}}>
        <Image
          src={getSafeImageSrc(w.img || w.image || w.artisan?.avatar, DEFAULT_PRODUCT_IMAGE)}
          alt={w.title}
          className="w-100 h-100"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{objectFit:"cover"}}
        />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(44,37,32,.75) 0%,transparent 60%)'}}/>
      </div>
      <div className="container" style={{marginTop:-60,position:'relative',zIndex:2,paddingBottom:60}}>
        <div className="ha-card p-4 p-md-5">
          <div className="row g-4">
            <div className="col-lg-8">
              <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:8}}>{w.title}</h1>
              <div style={{color:'var(--burgundy)',fontWeight:600,marginBottom:16}}>مع {w.artisan?.name}</div>
              <div className="d-flex flex-wrap gap-4 mb-4" style={{fontSize:'0.87rem',color:'var(--warm-gray)'}}>
                <span><i className="bi bi-calendar3 me-2"/>{w.date}</span>
                <span><i className="bi bi-clock me-2"/>{w.time}</span>
                <span><i className="bi bi-hourglass-split me-2"/>{w.duration} دقيقة</span>
                <span><i className="bi bi-geo-alt me-2"/>{w.location}</span>
                <span><i className="bi bi-people me-2"/>{spotsLeft} مقعد متبقي من {w.capacity}</span>
              </div>
              {w.description && (
                <p style={{color:'var(--warm-gray)',lineHeight:1.9,fontSize:'0.93rem'}}>{w.description}</p>
              )}
            </div>
            <div className="col-lg-4">
              <div style={{background:'var(--parchment)',borderRadius:16,padding:24,border:'1px solid var(--gold-pale)'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',fontWeight:700,color:'var(--burgundy)',marginBottom:16}}>
                  {w.price} <small style={{fontSize:'1rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
                </div>
                <button onClick={handleBook} disabled={spotsLeft===0||booking}
                  className="btn btn-primary w-100 py-3 mb-3"
                  style={{borderRadius:10,fontWeight:700,fontSize:'1rem'}}>
                  {booking ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                  {spotsLeft===0 ? 'الورشة مكتملة' : 'احجز مقعدك الآن'}
                </button>
                <div style={{fontSize:'0.78rem',color:'var(--warm-gray)',textAlign:'center'}}>
                  <i className="bi bi-shield-check me-1 text-success"/>الدفع آمن ومضمون
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
