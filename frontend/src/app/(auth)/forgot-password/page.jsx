'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/lib/sweetalert';
import { useForgotPasswordMutation } from '@/store/api/authApi';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email }).unwrap();
      setSent(true);
      toast.success(res?.message || 'تم إرسال رمز الاسترداد إلى الإيميل');
    } catch {
      toast.error('تعذر إرسال الرمز، تحقق من الإيميل');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'var(--parchment)' }}>
      <div className="ha-card p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: 420 }}>
        <i className="bi bi-lock-fill fs-1 text-burgundy mb-3 d-block" />
        <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.7rem', color: 'var(--charcoal)', marginBottom: 8 }}>استرداد كلمة المرور</h2>
        {sent ? (
          <div>
            <div className="alert" style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 10, color: '#16a34a' }}>
              <i className="bi bi-check-circle-fill me-2" />
              تم إرسال رمز الاسترداد بنجاح
            </div>
            <Link
              href={`/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`}
              className="btn btn-primary w-100 py-3"
              style={{ borderRadius: 10, fontWeight: 700 }}
            >
              إدخال الرمز
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', marginBottom: 24 }}>
              أدخل إيميلك وسنرسل لك رمز الاسترداد
            </p>
            <input
              type="email"
              className="form-control mb-4"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
            />
            <button type="submit" disabled={isLoading} className="btn btn-primary w-100 py-3 mb-3" style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}>
              {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              إرسال الرمز
            </button>
            <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>
              <i className="bi bi-arrow-right me-1" />
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
