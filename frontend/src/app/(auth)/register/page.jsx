'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from '@/lib/sweetalert';

const CRAFT_TYPES = ['السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج','أخرى'];
const GOVS = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','العقبة'];

export default function RegisterPage() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name:'', phone:'', password:'', confirm:'', craftSpecialty:'', governorate:'', bio:'' });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('كلمات المرور غير متطابقة');
    try {
      const res = await register({ ...form, role }).unwrap();
      dispatch(setCredentials(res));
      toast.success('تم إنشاء الحساب بنجاح! 🎉');
      router.push('/verify-otp');
    } catch (err) {
      toast.error(err?.data?.message || 'حدث خطأ ما، حاول مجدداً');
    }
  };

  const input = (label, k, type='text', placeholder='') => (
    <div className="mb-3">
      <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>{label}</label>
      <input type={type} className="form-control" placeholder={placeholder}
        value={form[k]} onChange={set(k)} required
        style={{borderRadius:8,borderColor:'var(--stone)'}}/>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{background:'var(--parchment)'}}>
      <div className="ha-card p-4 p-md-5" style={{width:'100%',maxWidth:560}}>
        <div className="text-center mb-4">
          <div style={{fontFamily:'Amiri,serif',fontSize:'1.5rem',color:'var(--burgundy)'}}>حِرفة أصلية</div>
          <h2 style={{fontFamily:'Amiri,serif',fontSize:'1.8rem',color:'var(--charcoal)',margin:'6px 0 4px'}}>
            إنشاء حساب جديد
          </h2>
          <p style={{color:'var(--warm-gray)',fontSize:'0.88rem'}}>Create an account</p>
        </div>

        {/* Role */}
        <div className="d-flex justify-content-center mb-4">
          <div style={{display:'flex',border:'1.5px solid var(--stone)',borderRadius:12,overflow:'hidden'}}>
            {[{k:'customer',l:'مشتري',icon:'bi-person'},{k:'artisan',l:'حرفي',icon:'bi-tools'}].map(({k,l,icon}) => (
              <button key={k} type="button" onClick={() => setRole(k)}
                style={{padding:'8px 24px',border:'none',fontFamily:'Tajawal,sans-serif',fontWeight:600,fontSize:'0.88rem',
                  transition:'all .2s',
                  background: role===k ? 'var(--burgundy)' : 'transparent',
                  color:      role===k ? '#fff' : 'var(--warm-gray)'}}>
                <i className={`bi ${icon} me-2`}/>{l}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-0">
            <div className="col-12">{input('الاسم الكامل','name','text','محمد أحمد العلي')}</div>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>رقم الهاتف</label>
                <div className="input-group">
                  <span className="input-group-text" style={{background:'var(--parchment)',borderColor:'var(--stone)',borderRadius:'8px 0 0 8px',fontSize:'0.85rem'}}>🇯🇴 +962</span>
                  <input type="tel" className="form-control" placeholder="7X XXX XXXX"
                    value={form.phone} onChange={set('phone')} required
                    style={{borderRadius:'0 8px 8px 0',borderColor:'var(--stone)'}}/>
                </div>
              </div>
            </div>
            <div className="col-12">{input('كلمة المرور','password','password','••••••••')}</div>
            <div className="col-12">{input('تأكيد كلمة المرور','confirm','password','••••••••')}</div>

            {role === 'artisan' && (
              <>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>نوع الحرفة</label>
                    <select className="form-select" value={form.craftSpecialty} onChange={set('craftSpecialty')}
                      style={{borderRadius:8,borderColor:'var(--stone)'}}>
                      <option value="">اختر نوع الحرفة</option>
                      {CRAFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>المحافظة</label>
                    <select className="form-select" value={form.governorate} onChange={set('governorate')}
                      style={{borderRadius:8,borderColor:'var(--stone)'}}>
                      <option value="">اختر محافظتك</option>
                      {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>نبذة عنك</label>
                    <textarea className="form-control" rows={3} placeholder="اكتب نبذة مختصرة عنك وعن حرفتك..."
                      value={form.bio} onChange={set('bio')}
                      style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={isLoading}
            className="btn btn-primary w-100 py-3 mb-3"
            style={{borderRadius:10,fontWeight:700,fontSize:'1rem'}}>
            {isLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
            إنشاء الحساب
          </button>

          <p className="text-center mb-0" style={{fontSize:'0.88rem',color:'var(--warm-gray)'}}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" style={{color:'var(--burgundy)',fontWeight:700}}>تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
