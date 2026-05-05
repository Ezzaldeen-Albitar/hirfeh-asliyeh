'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { toast } from '@/lib/sweetalert';

const STEPS = ['السلة','الشحن','الدفع','التأكيد'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const { isAuth } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({ name:'', phone:'', address:'', governorate:'', notes:'' });
  const [payMethod, setPayMethod] = useState('cash');

  const setShip = k => e => setShipping(s => ({...s,[k]:e.target.value}));

  const handleOrder = async () => {
    try {
      await createOrder({ items: items.map(i=>({product:i._id,qty:i.qty,price:i.price})), shipping, paymentMethod:payMethod, total }).unwrap();
      clearCart();
      toast.success('تم تقديم طلبك بنجاح! 🎉');
      setStep(3);
    } catch { toast.error('تعذر إتمام الطلب، حاول مجدداً'); }
  };

  if (!items.length && step !== 3) return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3" style={{background:'var(--cream)'}}>
      <i className="bi bi-bag-x fs-1" style={{color:'var(--stone)'}}/>
      <h3 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)'}}>سلتك فارغة</h3>
      <a href="/products" className="btn btn-primary" style={{borderRadius:10,fontWeight:700}}>تسوّق الآن</a>
    </div>
  );

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div className="container" style={{padding:'40px 12px 60px'}}>
        <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:32}}>إتمام الشراء</h1>

        {/* Steps indicator */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          {STEPS.map((s,i)=>(
            <div key={s} className="d-flex align-items-center gap-2">
              <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.82rem',
                background: i<step ? 'var(--gold)' : i===step ? 'var(--burgundy)' : 'var(--parchment)',
                color: i<=step ? '#fff' : 'var(--warm-gray)',
                border: i>step ? '2px solid var(--stone)' : 'none'}}>
                {i < step ? <i className="bi bi-check-lg"/> : i+1}
              </div>
              <span style={{fontSize:'0.85rem',fontWeight: i===step?700:400,color: i===step?'var(--burgundy)':'var(--warm-gray)'}}>
                {s}
              </span>
              {i < STEPS.length-1 && <div style={{width:32,height:2,background:'var(--stone)',borderRadius:2}}/>}
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Left: step content */}
          <div className="col-lg-8">
            {/* Step 0: Cart */}
            {step===0 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>مراجعة السلة</h5>
                {items.map(item=>(
                  <div key={item._id} className="d-flex align-items-center gap-3 py-3"
                    style={{borderBottom:'1px solid var(--gold-pale)'}}>
                    <img src={item.images?.[0]||'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=80&q=70'}
                      style={{width:72,height:72,borderRadius:10,objectFit:'cover',flexShrink:0}}/>
                    <div className="flex-grow-1">
                      <div style={{fontWeight:600,fontSize:'0.92rem'}}>{item.name}</div>
                      <div style={{color:'var(--warm-gray)',fontSize:'0.8rem'}}>{item.artisan?.name}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm" onClick={()=>updateQty(item._id,Math.max(1,item.qty-1))}
                        style={{width:28,height:28,padding:0,border:'1px solid var(--stone)',borderRadius:6,fontSize:'1rem',lineHeight:1}}>−</button>
                      <span style={{width:28,textAlign:'center',fontWeight:600}}>{item.qty}</span>
                      <button className="btn btn-sm" onClick={()=>updateQty(item._id,item.qty+1)}
                        style={{width:28,height:28,padding:0,border:'1px solid var(--stone)',borderRadius:6,fontSize:'1rem',lineHeight:1}}>+</button>
                    </div>
                    <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,color:'var(--burgundy)',minWidth:70,textAlign:'left'}}>
                      {item.price * item.qty} <small style={{fontWeight:400,fontSize:'0.7rem',color:'var(--warm-gray)'}}>د.أ</small>
                    </div>
                    <button className="btn btn-sm" onClick={()=>removeItem(item._id)}
                      style={{color:'var(--warm-gray)',background:'none',border:'none',fontSize:'1.1rem'}}>
                      <i className="bi bi-trash3"/>
                    </button>
                  </div>
                ))}
                <div className="mt-4 text-end">
                  <button className="btn btn-primary px-5 py-2" style={{borderRadius:10,fontWeight:700}}
                    onClick={()=>setStep(1)}>
                    متابعة إلى الشحن <i className="bi bi-arrow-left ms-2"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Shipping */}
            {step===1 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>بيانات الشحن</h5>
                <div className="row g-3">
                  {[['الاسم الكامل','name','col-md-6'],['رقم الهاتف','phone','col-md-6'],['العنوان التفصيلي','address','col-12'],['الملاحظات','notes','col-12']].map(([l,k,col])=>(
                    <div key={k} className={col}>
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>{l}</label>
                      {k==='notes'
                        ? <textarea className="form-control" rows={2} value={shipping[k]} onChange={setShip(k)} style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                        : <input type="text" className="form-control" value={shipping[k]} onChange={setShip(k)} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                      }
                    </div>
                  ))}
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة</label>
                    <select className="form-select" value={shipping.governorate} onChange={setShip('governorate')}
                      style={{borderRadius:8,borderColor:'var(--stone)'}}>
                      <option value="">اختر المحافظة</option>
                      {['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','الكرك','العقبة'].map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4 justify-content-between">
                  <button className="btn btn-outline-primary" style={{borderRadius:10}} onClick={()=>setStep(0)}>
                    <i className="bi bi-arrow-right me-2"/>رجوع
                  </button>
                  <button className="btn btn-primary px-5" style={{borderRadius:10,fontWeight:700}}
                    onClick={()=>{ if(!shipping.name||!shipping.phone||!shipping.address||!shipping.governorate) return toast.error('يرجى ملء جميع الحقول'); setStep(2); }}>
                    متابعة إلى الدفع <i className="bi bi-arrow-left ms-2"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step===2 && (
              <div className="ha-card p-4">
                <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>طريقة الدفع</h5>
                {[
                  { k:'cash',   label:'الدفع عند الاستلام', icon:'bi-cash-stack',    desc:'ادفع نقداً عند وصول الطلب' },
                  { k:'card',   label:'بطاقة ائتمان',       icon:'bi-credit-card',   desc:'Visa / Mastercard / Mada' },
                  { k:'cliq',   label:'CliQ',                icon:'bi-phone',         desc:'الدفع عبر خدمة CliQ الأردنية' },
                ].map(m=>(
                  <div key={m.k} onClick={()=>setPayMethod(m.k)}
                    className="d-flex align-items-center gap-3 p-3 mb-3"
                    style={{borderRadius:12,border:`2px solid ${payMethod===m.k?'var(--burgundy)':'var(--stone)'}`,
                      background: payMethod===m.k?'rgba(122,28,46,.04)':'#fff',cursor:'pointer',transition:'all .2s'}}>
                    <div style={{width:44,height:44,borderRadius:10,background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',color:'var(--burgundy)',flexShrink:0}}>
                      <i className={`bi ${m.icon}`}/>
                    </div>
                    <div className="flex-grow-1">
                      <div style={{fontWeight:600,fontSize:'0.92rem'}}>{m.label}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--warm-gray)'}}>{m.desc}</div>
                    </div>
                    <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${payMethod===m.k?'var(--burgundy)':'var(--stone)'}`,
                      background:payMethod===m.k?'var(--burgundy)':'transparent',transition:'all .2s'}}/>
                  </div>
                ))}
                <div className="d-flex gap-3 mt-2 justify-content-between">
                  <button className="btn btn-outline-primary" style={{borderRadius:10}} onClick={()=>setStep(1)}>
                    <i className="bi bi-arrow-right me-2"/>رجوع
                  </button>
                  <button className="btn btn-primary px-5" style={{borderRadius:10,fontWeight:700}} disabled={isLoading}
                    onClick={handleOrder}>
                    {isLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                    تأكيد الطلب <i className="bi bi-check-circle ms-2"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step===3 && (
              <div className="ha-card p-5 text-center">
                <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(34,197,94,.12)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className="bi bi-check-circle-fill fs-1" style={{color:'#22c55e'}}/>
                </div>
                <h3 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:8}}>تم تقديم طلبك! 🎉</h3>
                <p style={{color:'var(--warm-gray)',marginBottom:28}}>
                  سيتواصل معك الحرفي لتأكيد الطلب قريباً. يمكنك متابعة حالة طلبك من حسابك.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <a href="/dashboard" className="btn btn-primary px-4" style={{borderRadius:10,fontWeight:700}}>
                    <i className="bi bi-bag-check me-2"/>طلباتي
                  </a>
                  <a href="/products" className="btn btn-outline-primary px-4" style={{borderRadius:10,fontWeight:700}}>
                    <i className="bi bi-shop me-2"/>متابعة التسوق
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          {step < 3 && (
            <div className="col-lg-4">
              <div className="ha-card p-4" style={{position:'sticky',top:20}}>
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.15rem',marginBottom:16}}>ملخص الطلب</h6>
                {items.map(i=>(
                  <div key={i._id} className="d-flex justify-content-between align-items-center mb-2" style={{fontSize:'0.85rem'}}>
                    <span style={{color:'var(--warm-gray)'}}>{i.name} <span style={{color:'var(--stone)'}}>× {i.qty}</span></span>
                    <span style={{fontWeight:600}}>{i.price*i.qty} د.أ</span>
                  </div>
                ))}
                <hr style={{borderColor:'var(--gold-pale)'}}/>
                <div className="d-flex justify-content-between mb-2" style={{fontSize:'0.85rem',color:'var(--warm-gray)'}}>
                  <span>الشحن</span><span style={{color:'#22c55e',fontWeight:600}}>مجاني</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <strong style={{fontFamily:'Amiri,serif',fontSize:'1.1rem'}}>الإجمالي</strong>
                  <strong style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',color:'var(--burgundy)'}}>
                    {total} <small style={{fontSize:'0.8rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
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
