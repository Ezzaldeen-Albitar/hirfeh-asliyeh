'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVerifyOtpMutation } from '@/store/api/authApi';
import { toast } from '@/lib/sweetalert';
import OTPInput from '@/components/auth/OTPInput';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('يرجى إدخال الرمز كاملاً');
    try {
      await verifyOtp({ otp }).unwrap();
      toast.success('تم التحقق بنجاح! ✓');
      router.push('/');
    } catch {
      toast.error('الرمز غير صحيح أو منتهي الصلاحية');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{background:'var(--parchment)'}}>
      <div className="ha-card p-4 p-md-5 text-center" style={{width:'100%',maxWidth:440}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(122,28,46,.1)',margin:'0 auto 20px',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className="bi bi-shield-check fs-2 text-burgundy"/>
        </div>
        <h2 style={{fontFamily:'Amiri,serif',fontSize:'1.7rem',color:'var(--charcoal)',marginBottom:8}}>التحقق من الرمز</h2>
        <p style={{color:'var(--warm-gray)',fontSize:'0.88rem',marginBottom:32}}>
          أرسلنا رمز التحقق إلى رقم هاتفك. أدخله أدناه.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <OTPInput length={6} onChange={setOtp}/>
          </div>
          <button type="submit" disabled={isLoading || otp.length < 6}
            className="btn btn-primary w-100 py-3 mb-3"
            style={{borderRadius:10,fontWeight:700,fontSize:'1rem'}}>
            {isLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
            تأكيد الرمز
          </button>
          <button type="button" className="btn btn-link" style={{color:'var(--warm-gray)',fontSize:'0.85rem'}}>
            <i className="bi bi-arrow-counterclockwise me-1"/>إعادة إرسال الرمز
          </button>
        </form>
      </div>
    </div>
  );
}
