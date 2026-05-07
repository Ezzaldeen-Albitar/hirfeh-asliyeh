'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import OTPInput from '@/components/auth/OTPInput';
import { toast } from '@/lib/sweetalert';
import { useResendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const purpose = searchParams.get('purpose') || 'verify';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('يرجى إدخال الإيميل');
    if (otp.length < 6) return toast.error('يرجى إدخال الرمز كاملًا');

    try {
      const res = await verifyOtp({ email, otp, purpose }).unwrap();
      if (purpose === 'reset') {
        toast.success('تم التحقق من الرمز');
        router.push(`/reset-password?email=${encodeURIComponent(res.email || email)}`);
        return;
      }
      dispatch(setCredentials(res));
      toast.success('تم تفعيل الحساب بنجاح');
      router.push('/');
    } catch {
      toast.error('الرمز غير صحيح أو منتهي الصلاحية');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('أدخل الإيميل أولًا');
      return;
    }
    try {
      const res = await resendOtp({ email, purpose }).unwrap();
      toast.success(res?.message || 'تم إرسال رمز جديد');
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إعادة إرسال الرمز');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'var(--parchment)' }}>
      <div className="ha-card p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: 440 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(122,28,46,.1)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="bi bi-shield-check fs-2 text-burgundy" />
        </div>
        <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.7rem', color: 'var(--charcoal)', marginBottom: 8 }}>التحقق من الرمز</h2>
        <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', marginBottom: 20 }}>
          أدخل الإيميل ثم رمز التحقق المرسل إليه.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-4"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
          />
          <div className="mb-4">
            <OTPInput length={6} onChange={setOtp} />
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="btn btn-primary w-100 py-3 mb-3"
            style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}
          >
            {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            تأكيد الرمز
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="btn btn-link"
            style={{ color: 'var(--warm-gray)', fontSize: '0.85rem' }}
          >
            <i className="bi bi-arrow-counterclockwise me-1" />
            {isResending ? 'جارٍ إعادة الإرسال...' : 'إعادة إرسال الرمز'}
          </button>
        </form>
      </div>
    </div>
  );
}
