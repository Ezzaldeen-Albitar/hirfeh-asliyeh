'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { useCancelOrderMutation } from '@/store/api/ordersApi';
import { toast, confirm } from '@/lib/sweetalert';

const STATUS_MAP = {
  pending:    { label:'قيد الانتظار', color:'#F59E0B', bg:'#FEF3C7' },
  processing: { label:'جاري التجهيز', color:'#3B82F6', bg:'#EFF6FF' },
  shipped:    { label:'تم الشحن',     color:'#8B5CF6', bg:'#F5F3FF' },
  delivered:  { label:'تم التسليم',   color:'#22C55E', bg:'#F0FDF4' },
  cancelled:  { label:'ملغي',         color:'#EF4444', bg:'#FEF2F2' },
};

const QUICK_LINKS = [
  { href:'/products',           icon:'bi-bag-heart',   label:'تسوّق الآن',      color:'var(--burgundy)' },
  { href:'/dashboard/wishlist', icon:'bi-heart',        label:'المفضلة',          color:'#EF4444' },
  { href:'/artisans',           icon:'bi-people',       label:'الحرفيون',          color:'var(--gold)' },
  { href:'/customizations',     icon:'bi-palette',      label:'طلبات التخصيص',   color:'#8B5CF6' },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetOrdersQuery({ limit:20 });
  const [cancelOrder] = useCancelOrderMutation();
  const orders = data?.data || [];

  const handleCancel = async (id) => {
    const { isConfirmed } = await confirm({ title:'إلغاء الطلب؟', text:'هل أنت متأكد من إلغاء هذا الطلب؟', confirmButtonText:'نعم، إلغاء', confirmButtonColor:'#ef4444' });
    if (!isConfirmed) return;
    try { await cancelOrder(id).unwrap(); toast.success('تم إلغاء الطلب'); }
    catch { toast.error('تعذر الإلغاء'); }
  };

  const totalSpent = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0), 0);
  const activeOrders = orders.filter(o=>!['delivered','cancelled'].includes(o.status)).length;

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'36px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:4}}>
            مرحباً، {user?.name?.split(' ')[0] || 'بك'} 👋
          </h1>
          <p style={{color:'var(--warm-gray)',margin:0,fontSize:'0.9rem'}}>مرحباً في لوحة حسابك</p>
        </div>
      </div>

      <div className="container" style={{padding:'40px 12px 60px'}}>
        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="ha-card p-3 text-center">
              <div style={{fontSize:'1.8rem',fontFamily:'Playfair Display,serif',fontWeight:700,color:'var(--burgundy)'}}>{orders.length}</div>
              <div style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>إجمالي الطلبات</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="ha-card p-3 text-center">
              <div style={{fontSize:'1.8rem',fontFamily:'Playfair Display,serif',fontWeight:700,color:'#22c55e'}}>{orders.filter(o=>o.status==='delivered').length}</div>
              <div style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>طلبات مستلمة</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="ha-card p-3 text-center">
              <div style={{fontSize:'1.8rem',fontFamily:'Playfair Display,serif',fontWeight:700,color:'#3b82f6'}}>{activeOrders}</div>
              <div style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>طلبات نشطة</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="ha-card p-3 text-center">
              <div style={{fontSize:'1.8rem',fontFamily:'Playfair Display,serif',fontWeight:700,color:'var(--gold)'}}>{totalSpent}</div>
              <div style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>د.أ مجموع المشتريات</div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="row g-3 mb-5">
          {QUICK_LINKS.map(a=>(
            <div key={a.href} className="col-6 col-md-3">
              <Link href={a.href} className="ha-card p-4 text-center text-decoration-none d-block">
                <div style={{width:52,height:52,borderRadius:14,background:a.color+'18',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',color:a.color}}>
                  <i className={'bi '+a.icon}/>
                </div>
                <div style={{fontWeight:600,fontSize:'0.88rem',color:'var(--charcoal)'}}>{a.label}</div>
              </Link>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="ha-card p-4">
          <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>
            <i className="bi bi-bag-check text-burgundy me-2"/>طلباتي
          </h5>
          {isLoading ? (
            <div className="text-center py-4"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
          ) : orders.length===0 ? (
            <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
              <i className="bi bi-bag fs-1 d-block mb-3" style={{color:'var(--stone)'}}/>
              <p className="mb-3">لا توجد طلبات بعد</p>
              <Link href="/products" className="btn btn-primary" style={{borderRadius:10,fontWeight:700}}>ابدأ التسوق</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle" style={{fontSize:'0.88rem'}}>
                <thead>
                  <tr style={{background:'var(--parchment)'}}>
                    {['رقم الطلب','المنتجات','الإجمالي','الحالة','التاريخ',''].map(h=>(
                      <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.78rem'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o=>{
                    const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
                    return (
                      <tr key={o._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                        <td className="px-3 py-3">
                          <span style={{fontFamily:'monospace',fontSize:'0.8rem',color:'var(--warm-gray)'}}>
                            #HA-{o._id?.slice(-6)?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3">
                          <div className="d-flex align-items-center gap-2">
                            {o.items?.[0]?.product?.images?.[0] && (
                              <div style={{width:32,height:32,borderRadius:"inherit",overflow:"hidden",position:"relative",flexShrink:0}}><Image src={o.items[0].product.images[0]} alt="" fill sizes="32px" style={{objectFit:"cover"}}/></div>
                            )}
                            <span>{o.items?.length||1} منتج</span>
                          </div>
                        </td>
                        <td className="px-3">
                          <strong style={{color:'var(--burgundy)',fontFamily:'Playfair Display,serif'}}>{o.total} د.أ</strong>
                        </td>
                        <td className="px-3">
                          <span className="px-2 py-1 rounded-pill"
                            style={{background:st.bg,color:st.color,fontSize:'0.76rem',fontWeight:600}}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-3" style={{color:'var(--warm-gray)',fontSize:'0.8rem'}}>{o.createdAt?.slice(0,10)||'—'}</td>
                        <td className="px-3">
                          {o.status==='pending' && (
                            <button onClick={()=>handleCancel(o._id)} className="btn btn-sm" style={{fontSize:'0.75rem',color:'#ef4444',border:'1px solid #ef4444',borderRadius:6}}>
                              إلغاء
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
