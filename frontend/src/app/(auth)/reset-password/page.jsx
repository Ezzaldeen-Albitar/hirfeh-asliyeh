'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { toast } from '@/lib/sweetalert';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [form, setForm] = useState({ password:'', confirm:'' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('كلمات المرور غير متطابقة');
    try {
      await resetPassword({ password: form.password }).unwrap();
      toast.success('تم تغيير كلمة المرور بنجاح');
      router.push('/login');
    } catch { toast.error('حدث خطأ، حاول مجدداً'); }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{background:'var(--parchment)'}}>
      <div className="ha-card p-4 p-md-5" style={{width:'100%',maxWidth:420}}>
        <h2 style={{fontFamily:'Amiri,serif',fontSize:'1.7rem',color:'var(--charcoal)',marginBottom:8,textAlign:'center'}}>كلمة مرور جديدة</h2>
        <form onSubmit={handleSubmit}>
          {[['كلمة المرور الجديدة','password'],['تأكيد كلمة المرور','confirm']].map(([l,k]) => (
            <div key={k} className="mb-3">
              <label className="form-label" style={{fontSize:'0.88rem',fontWeight:500}}>{l}</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={form[k]} onChange={set(k)} required minLength={8}
                style={{borderRadius:8,borderColor:'var(--stone)'}}/>
            </div>
          ))}
          <button type="submit" disabled={isLoading} className="btn btn-primary w-100 py-3 mt-2" style={{borderRadius:10,fontWeight:700,fontSize:'1rem'}}>
            {isLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
            حفظ كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
}
