'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from '@/lib/sweetalert';
import OTPInput from '@/components/auth/OTPInput';

export default function VerifyOtpPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const dispatch     = useDispatch();
  const email        = searchParams.get('email') || '';
  // ✅ FIX 1: اقرأ الـ purpose من الـ URL بدل ما تحطه hardcoded
  const purpose      = searchParams.get('purpose') || 'verify';

  const [verifyOtp,  { isLoading }]             = useVerifyOtpMutation();
  const [resendOtp,  { isLoading: resendLoading }] = useResendOtpMutation();
  const [otp,        setOtp]                    = useState('');
  const [otpKey,     setOtpKey]                 = useState(0); // ✅ FIX 3: مفتاح لإعادة رسم OTPInput
  const [cooldown,   setCooldown]               = useState(0);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('يرجى إدخال الرمز كاملاً');
    if (!email)         return toast.error('لم يتم تحديد البريد الإلكتروني');
    try {
      // ✅ FIX 1: أرسل الـ purpose الصحيح للسيرفر
      const res = await verifyOtp({ email, otp, purpose }).unwrap();

      // ✅ FIX 2: بعد التحقق وجّه المستخدم حسب الـ purpose
      if (purpose === 'reset') {
        toast.success('تم التحقق! أدخل كلمة المرور الجديدة');
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        if (res.token) dispatch(setCredentials(res));
        toast.success('تم التحقق بنجاح! ✓');
        router.push('/');
      }
    } catch (err) {
      const remaining = err?.data?.remainingAttempts;
      if (remaining !== undefined) {
        toast.error(`الرمز غير صحيح — تبقّى ${remaining} محاولة`);
      } else {
        toast.error(err?.data?.message || 'الرمز غير صحيح أو منتهي الصلاحية');
      }
    }
  };

  const handleResend = async () => {
    if (!email)       return toast.error('لم يتم تحديد البريد الإلكتروني');
    if (cooldown > 0) return;
    try {
      // ✅ FIX 1: أرسل الـ purpose الصحيح عند إعادة الإرسال أيضاً
      await resendOtp({ email, purpose }).unwrap();
      toast.success('تم إرسال رمز جديد إلى بريدك الإلكتروني 📧');
      setCooldown(120);
      // ✅ FIX 3: صفّر مربعات الـ OTP بتغيير الـ key
      setOtp('');
      setOtpKey(k => k + 1);
    } catch (err) {
      const retry = err?.data?.retryAfterSeconds;
      if (retry) {
        setCooldown(retry);
        toast.info(`يرجى الانتظار ${retry} ثانية قبل الإعادة`);
      } else {
        toast.error(err?.data?.message || 'تعذر إرسال الرمز');
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'var(--parchment)' }}>
      <div className="ha-card p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: 440 }}>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(122,28,46,.1)', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-envelope-check fs-2 text-burgundy" />
        </div>

        <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.7rem', color: 'var(--charcoal)', marginBottom: 8 }}>
          {purpose === 'reset' ? 'رمز استعادة كلمة المرور' : 'التحقق من البريد الإلكتروني'}
        </h2>

        <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', marginBottom: 8 }}>
          أرسلنا رمز التحقق المكوّن من 6 أرقام إلى
        </p>

        {/* Email display */}
        <div style={{
          background: 'rgba(122,28,46,.06)', border: '1px solid rgba(122,28,46,.15)',
          borderRadius: 8, padding: '8px 16px', marginBottom: 28,
          fontWeight: 600, color: 'var(--burgundy)', fontSize: '0.92rem',
          wordBreak: 'break-all',
        }}>
          <i className="bi bi-envelope me-2" />
          {email || 'بريدك الإلكتروني'}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* ✅ FIX 3: key يجبر React على إعادة إنشاء المكوّن كاملاً عند الـ resend */}
            <OTPInput key={otpKey} length={6} onChange={setOtp} value={otp} />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            suppressHydrationWarning
            className="btn btn-primary w-100 py-3 mb-3"
            style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}
          >
            {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {purpose === 'reset' ? 'تأكيد والمتابعة' : 'تأكيد الرمز'}
          </button>

          {/* Resend button with countdown */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
            suppressHydrationWarning
            className="btn btn-link w-100"
            style={{ color: cooldown > 0 ? 'var(--stone)' : 'var(--burgundy)', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            {resendLoading ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : cooldown > 0 ? (
              <>
                <i className="bi bi-clock me-1" />
                إعادة الإرسال بعد {cooldown}ث
              </>
            ) : (
              <>
                <i className="bi bi-arrow-counterclockwise me-1" />
                لم يصلك الرمز؟ إعادة الإرسال
              </>
            )}
          </button>

          <p className="mt-3 mb-0" style={{ fontSize: '0.82rem', color: 'var(--warm-gray)' }}>
            تحقق من مجلد الـ Spam إذا لم يصلك الرمز
          </p>
        </form>
      </div>
    </div>
  );
}