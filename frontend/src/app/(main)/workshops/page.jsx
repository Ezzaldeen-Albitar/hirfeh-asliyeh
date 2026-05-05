'use client';
import { useGetWorkshopsQuery, useBookWorkshopMutation } from '@/store/api/workshopsApi';
import { toast } from '@/lib/sweetalert';

const MOCK_WORKSHOPS = [
  { _id:'w1', title:'ورشة الفخار التقليدي', artisan:{ name:'خليل الفاحوم' }, date:'2025-07-15', time:'10:00', duration:180, price:35, capacity:10, booked:6, location:'عزرق', img:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75' },
  { _id:'w2', title:'فن الفسيفساء الأردني',  artisan:{ name:'عائشة العزيزي' }, date:'2025-07-20', time:'14:00', duration:240, price:50, capacity:8,  booked:3, location:'إربد', img:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=75' },
  { _id:'w3', title:'النسيج على النول',        artisan:{ name:'فاطمة الحريري'}  , date:'2025-07-25', time:'09:00', duration:300, price:45, capacity:6,  booked:5, location:'مأدبا',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75' },
];

export default function WorkshopsPage() {
  const { data, isLoading } = useGetWorkshopsQuery({});
  const [bookWorkshop] = useBookWorkshopMutation();
  const workshops = data?.data || MOCK_WORKSHOPS;

  const handleBook = async (id, title) => {
    try { await bookWorkshop(id).unwrap(); toast.success(`تم حجزك في "${title}"! 🎉`); }
    catch { toast.error('تعذر الحجز، حاول مجدداً'); }
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'36px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:6}}>الورش الحرفية</h1>
          <p style={{color:'var(--warm-gray)',margin:0,fontSize:'0.9rem'}}>تعلّم من أمهر الحرفيين في بيئة تفاعلية</p>
        </div>
      </div>
      <div className="container" style={{padding:'40px 12px 60px'}}>
        {isLoading ? (
          <div className="text-center py-5"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
        ) : (
          <div className="row g-4">
            {workshops.map(w => {
              const spotsLeft = w.capacity - w.booked;
              return (
                <div key={w._id} className="col-md-6 col-lg-4">
                  <div className="ha-card overflow-hidden h-100">
                    <div style={{height:200,overflow:'hidden'}}>
                      <img src={w.img} alt={w.title} className="w-100 h-100" style={{objectFit:'cover',transition:'transform .4s'}}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                    </div>
                    <div className="p-4">
                      <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.2rem',marginBottom:6}}>{w.title}</h5>
                      <div style={{fontSize:'0.8rem',color:'var(--burgundy)',fontWeight:600,marginBottom:12}}>
                        مع {w.artisan?.name}
                      </div>
                      <div className="d-flex flex-wrap gap-3 mb-3" style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>
                        <span><i className="bi bi-calendar3 me-1"/>{w.date}</span>
                        <span><i className="bi bi-clock me-1"/>{w.time}</span>
                        <span><i className="bi bi-hourglass-split me-1"/>{w.duration} دقيقة</span>
                        <span><i className="bi bi-geo-alt me-1"/>{w.location}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',fontWeight:700,color:'var(--burgundy)'}}>
                          {w.price} <small style={{fontSize:'0.75rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
                        </span>
                        <span style={{fontSize:'0.78rem',fontWeight:600,color:spotsLeft<=2?'#ef4444':'#22c55e'}}>
                          <i className="bi bi-people me-1"/>{spotsLeft} مقاعد متبقية
                        </span>
                      </div>
                      <button onClick={()=>handleBook(w._id, w.title)}
                        disabled={spotsLeft===0}
                        className="btn btn-primary w-100"
                        style={{borderRadius:8,fontWeight:700,fontSize:'0.9rem'}}>
                        {spotsLeft===0 ? 'مكتمل' : 'احجز مقعدك'}
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
