'use client';
import AuthGuard from '@/components/auth/AuthGuard';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { toast } from '@/lib/sweetalert';

const STEPS = ['السلة', 'الشحن', 'الدفع', 'التأكيد'];
const GOVS  = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','الطفيلة','معان','العقبة','عجلون'];

function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const { isAuth, user } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [step, setStep]   = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [shipping, setShipping] = useState({
    name:        user?.name   || '',
    phone:       user?.phone  || '',
    address:     '',
    governorate: '',
    notes:       '',
  });
  const [payMethod, setPayMethod] = useState('cash');

  const setShip = (k) => (e) => setShipping(s => ({ ...s, [k]: e.target.value }));

  const handleOrder = async () => {
    try {
      const res = await createOrder({
        items: items.map(i => ({ product: i._id, qty: i.qty, price: i.price })),
        shipping,
        paymentMethod: payMethod,
        total,
      }).unwrap();
      clearCart();
      setOrderId(res?.data?._id || res?._id || 'N/A');
      toast.success('تم تقديم طلبك بنجاح! 🎉');
      setStep(3);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إتمام الطلب، حاول مجدداً');
    }
  };

  if (!items.length && step !== 3) return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3" style={{background:'var(--cream)'}}>
      <i className="bi bi-bag-x fs-1" style={{color:'var(--stone)'}}/>
      <h3 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)'}}>سلتك فارغة</h3>
      <p style={{color:'var(--warm-gray)',fontSize:'0.9rem'}}>أضف منتجات من متجرنا لإتمام الشراء</p>
      <Link href="/products" className="btn btn-primary" style={{borderRadius:10,fontWeight:700}}>تسوّق الآن</Link>
    </div>
  );

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div className="container" style={{padding:'40px 12px 60px'}}>
        <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:32}}>إتمام الشراء</h1>

        {/* Steps indicator */}
        <div className="d-flex align-items-center mb-4 flex-wrap gap-1">
          {STEPS.map((s,i)=>(
            <div key={s} className="d-flex align-items-center gap-2">
              <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.82rem',
                background: i<step ? 'var(--gold)' : i===step ? 'var(--burgundy)' : 'var(--parchment)',
                color:      i<=step ? '#fff' : 'var(--warm-gray)',
                border:     i>step ? '2px solid var(--stone)' : 'none',transition:'all .3s'}}>
                {i < step ? <i className="bi bi-check-lg"/> : i+1}
              </div>
              <span style={{fontSize:'0.85rem',fontWeight:i===step?700:400,color:i===step?'var(--burgundy)':'var(--warm-gray)',transition:'all .3s'}}>{s}</span>
              {i < STEPS.length-1 && <div style={{width:24,height:2,background:'var(--stone)',borderRadius:2}}/>}
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            {/* Step 0 — Cart */}
            {step === 0 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>مراجعة السلة</h5>
                {items.map(item => (
                  <div key={item._id} className="d-flex align-items-center gap-3 py-3"
                    style={{borderBottom:'1px solid var(--gold-pale)'}}>
                    <div style={{width:72,height:72,borderRadius:"inherit",overflow:"hidden",position:"relative",flexShrink:0}}><Image src={item.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=80&q=70'} alt="" fill sizes="72px" style={{objectFit:"cover"}}/></div>
                    <div className="flex-grow-1 min-width-0">
                      <div style={{fontWeight:600,fontSize:'0.92rem',color:'var(--charcoal)'}} className="text-truncate">{item.name}</div>
                      {item.artisan?.name && <div style={{color:'var(--warm-gray)',fontSize:'0.78rem'}}>{item.artisan.name}</div>}
                    </div>
                    <div className="d-flex align-items-center gap-1" style={{flexShrink:0}}>
                      <button className="btn btn-sm" onClick={()=>updateQty(item._id, Math.max(1, item.qty-1))}
                        style={{width:28,height:28,padding:0,border:'1px solid var(--stone)',borderRadius:6,fontSize:'1rem',lineHeight:1}}>−</button>
                      <span style={{width:32,textAlign:'center',fontWeight:600,fontSize:'0.92rem'}}>{item.qty}</span>
                      <button className="btn btn-sm" onClick={()=>updateQty(item._id, item.qty+1)}
                        style={{width:28,height:28,padding:0,border:'1px solid var(--stone)',borderRadius:6,fontSize:'1rem',lineHeight:1}}>+</button>
                    </div>
                    <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,color:'var(--burgundy)',minWidth:65,textAlign:'start',flexShrink:0}}>
                      {item.price * item.qty} <small style={{fontWeight:400,fontSize:'0.68rem',color:'var(--warm-gray)'}}>د.أ</small>
                    </div>
                    <button className="btn btn-sm" onClick={()=>removeItem(item._id)}
                      style={{color:'var(--warm-gray)',background:'none',border:'none',fontSize:'1.1rem',flexShrink:0}}>
                      <i className="bi bi-trash3"/>
                    </button>
                  </div>
                ))}
                <div className="mt-4 text-end">
                  <button className="btn btn-primary px-5 py-2" style={{borderRadius:10,fontWeight:700}} onClick={()=>setStep(1)}>
                    متابعة إلى الشحن <i className="bi bi-arrow-left ms-2"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 — Shipping */}
            {step === 1 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>بيانات الشحن</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الاسم الكامل <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="text" className="form-control" value={shipping.name} onChange={setShip('name')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>رقم الهاتف <span style={{color:'#ef4444'}}>*</span></label>
                    <div className="input-group">
                      <span className="input-group-text" style={{background:'var(--parchment)',borderColor:'var(--stone)',fontSize:'0.82rem'}}>🇯🇴</span>
                      <input type="tel" className="form-control" value={shipping.phone} onChange={setShip('phone')} required style={{borderColor:'var(--stone)'}}/>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>العنوان التفصيلي <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="text" className="form-control" placeholder="الشارع، الحي، رقم المبنى..." value={shipping.address} onChange={setShip('address')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة <span style={{color:'#ef4444'}}>*</span></label>
                    <select className="form-select" value={shipping.governorate} onChange={setShip('governorate')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                      <option value="">اختر...</option>
                      {GOVS.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>ملاحظات إضافية</label>
                    <textarea className="form-control" rows={2} placeholder="أي تعليمات خاصة للتوصيل..."
                      value={shipping.notes} onChange={setShip('notes')} style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4 justify-content-between">
                  <button className="btn btn-outline-primary" style={{borderRadius:10}} onClick={()=>setStep(0)}>
                    <i className="bi bi-arrow-right me-2"/>رجوع
                  </button>
                  <button className="btn btn-primary px-5" style={{borderRadius:10,fontWeight:700}}
                    onClick={()=>{
                      if (!shipping.name || !shipping.phone || !shipping.address || !shipping.governorate)
                        return toast.error('يرجى ملء جميع الحقول المطلوبة');
                      setStep(2);
                    }}>
                    متابعة إلى الدفع <i className="bi bi-arrow-left ms-2"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>طريقة الدفع</h5>
                {[
                  { k:'cash',   label:'الدفع عند الاستلام', icon:'bi-cash-stack',    desc:'ادفع نقداً عند وصول طلبك' },
                  { k:'card',   label:'بطاقة ائتمانية',     icon:'bi-credit-card',   desc:'Visa / Mastercard (يتم التحقق عند الاستلام)' },
                  { k:'cliq',   label:'CliQ',                icon:'bi-phone-fill',    desc:'الدفع عبر خدمة CliQ الأردنية' },
                ].map(m=>(
                  <div key={m.k} onClick={()=>setPayMethod(m.k)}
                    className="d-flex align-items-center gap-3 p-3 mb-3"
                    style={{borderRadius:12,border:`2px solid ${payMethod===m.k?'var(--burgundy)':'var(--stone)'}`,
                      background:payMethod===m.k?'rgba(122,28,46,.04)':'#fff',cursor:'pointer',transition:'all .2s'}}>
                    <div style={{width:46,height:46,borderRadius:10,background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',color:'var(--burgundy)',flexShrink:0}}>
                      <i className={`bi ${m.icon}`}/>
                    </div>
                    <div className="flex-grow-1">
                      <div style={{fontWeight:600,fontSize:'0.92rem'}}>{m.label}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--warm-gray)'}}>{m.desc}</div>
                    </div>
                    <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${payMethod===m.k?'var(--burgundy)':'var(--stone)'}`,
                      background:payMethod===m.k?'var(--burgundy)':'transparent',transition:'all .2s',flexShrink:0}}/>
                  </div>
                ))}

                {/* Security notice */}
                <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)'}}>
                  <i className="bi bi-shield-lock-fill" style={{color:'#22c55e',fontSize:'1.1rem'}}/>
                  <small style={{color:'#166534'}}>جميع معلوماتك محمية ومشفرة بالكامل</small>
                </div>

                <div className="d-flex gap-3 justify-content-between">
                  <button className="btn btn-outline-primary" style={{borderRadius:10}} onClick={()=>setStep(1)}>
                    <i className="bi bi-arrow-right me-2"/>رجوع
                  </button>
                  <button className="btn btn-primary px-5" style={{borderRadius:10,fontWeight:700,fontSize:'0.95rem'}}
                    disabled={isLoading} onClick={handleOrder}>
                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2"/>جاري التأكيد...</> : <>تأكيد الطلب <i className="bi bi-check-circle ms-2"/></>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Confirmation */}
            {step === 3 && (
              <div className="ha-card p-5 text-center">
                <div style={{width:88,height:88,borderRadius:'50%',background:'rgba(34,197,94,.12)',margin:'0 auto 24px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className="bi bi-check-circle-fill" style={{color:'#22c55e',fontSize:'3rem'}}/>
                </div>
                <h3 style={{fontFamily:'Amiri,serif',fontSize:'2.2rem',color:'var(--charcoal)',marginBottom:8}}>تم تقديم طلبك! 🎉</h3>
                {orderId && (
                  <div className="mb-3 p-3 rounded-3" style={{background:'var(--parchment)',border:'1px solid var(--gold-pale)',display:'inline-block'}}>
                    <small style={{color:'var(--warm-gray)',fontSize:'0.8rem'}}>رقم طلبك</small>
                    <div style={{fontFamily:'monospace',fontWeight:700,color:'var(--burgundy)',fontSize:'1rem'}}>
                      #HA-{orderId?.slice(-8)?.toUpperCase()}
                    </div>
                  </div>
                )}
                <p style={{color:'var(--warm-gray)',marginBottom:28,maxWidth:400,margin:'0 auto 28px'}}>
                  سيتواصل معك الحرفي لتأكيد الطلب خلال 24 ساعة. يمكنك متابعة حالة طلبك من حسابك.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/dashboard" className="btn btn-primary px-4" style={{borderRadius:10,fontWeight:700}}>
                    <i className="bi bi-bag-check me-2"/>متابعة طلباتي
                  </Link>
                  <Link href="/products" className="btn btn-outline-primary px-4" style={{borderRadius:10,fontWeight:700}}>
                    <i className="bi bi-shop me-2"/>متابعة التسوق
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {step < 3 && (
            <div className="col-lg-4">
              <div className="ha-card p-4" style={{position:'sticky',top:80}}>
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.15rem',marginBottom:16,borderBottom:'1px solid var(--gold-pale)',paddingBottom:12}}>
                  ملخص الطلب
                </h6>
                {items.map(i=>(
                  <div key={i._id} className="d-flex justify-content-between align-items-start mb-3" style={{fontSize:'0.85rem'}}>
                    <div className="d-flex gap-2 align-items-center" style={{flex:1,minWidth:0}}>
                      <div style={{width:36,height:36,borderRadius:"inherit",overflow:"hidden",position:"relative",flexShrink:0}}><Image src={i.images?.[0]} alt="" fill sizes="36px" style={{objectFit:"cover"}}/></div>
                      <div className="min-width-0">
                        <div style={{color:'var(--charcoal)',fontWeight:500,fontSize:'0.82rem'}} className="text-truncate">{i.name}</div>
                        <div style={{color:'var(--stone)',fontSize:'0.75rem'}}>× {i.qty}</div>
                      </div>
                    </div>
                    <span style={{fontWeight:600,flexShrink:0,marginRight:8}}>{i.price * i.qty} د.أ</span>
                  </div>
                ))}
                <hr style={{borderColor:'var(--gold-pale)'}}/>
                <div className="d-flex justify-content-between mb-2" style={{fontSize:'0.85rem',color:'var(--warm-gray)'}}>
                  <span>المجموع الفرعي</span>
                  <span>{total} د.أ</span>
                </div>
                <div className="d-flex justify-content-between mb-3" style={{fontSize:'0.85rem'}}>
                  <span style={{color:'var(--warm-gray)'}}>الشحن</span>
                  <span style={{color:'#22c55e',fontWeight:600}}>مجاني</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 rounded-3"
                  style={{background:'var(--parchment)',border:'1px solid var(--gold-pale)'}}>
                  <strong style={{fontFamily:'Amiri,serif',fontSize:'1.05rem'}}>الإجمالي</strong>
                  <strong style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'var(--burgundy)'}}>
                    {total} <small style={{fontSize:'0.78rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CheckoutPage />
    </AuthGuard>
  );
}
