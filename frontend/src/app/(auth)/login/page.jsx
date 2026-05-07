'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from '@/lib/sweetalert';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password: pass, role }).unwrap();
      dispatch(setCredentials(res));
      toast.success('تم تسجيل الدخول بنجاح');
      router.push(res.user?.role === 'artisan' ? '/dashboard/artisan' : res.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err?.data?.requiresVerification && err?.data?.email) {
        toast.error('يجب تفعيل الحساب من الإيميل أولًا');
        router.push(`/verify-otp?email=${encodeURIComponent(err.data.email)}&purpose=verify`);
        return;
      }
      toast.error(err?.data?.message || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'var(--cream)' }}>
      <div className="d-none d-lg-block col-lg-6 position-relative overflow-hidden">
        <Image
          src="/premium_digital_heritage_marketplace_brand_hero_im.png"
          alt="craft"
          fill
          sizes="50vw"
          style={{ objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(90,20,34,0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontFamily: 'Amiri,serif', fontSize: '3rem', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
            حِرفة أصلية
          </div>
          <div
            style={{
              fontFamily: 'Playfair Display,serif',
              fontSize: '1rem',
              color: 'rgba(255,255,255,.8)',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Hirfeh Asliyeh
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="text-center mb-5">
            <div style={{ fontFamily: 'Amiri,serif', fontSize: '1.6rem', color: 'var(--burgundy)' }}>حِرفة أصلية</div>
            <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.9rem', color: 'var(--charcoal)', margin: '8px 0 4px' }}>
              تسجيل الدخول
            </h2>
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          <div className="d-flex justify-content-center mb-4">
            <div style={{ display: 'flex', border: '1.5px solid var(--stone)', borderRadius: 12, overflow: 'hidden' }}>
              {[{ k: 'customer', l: 'مشتري' }, { k: 'artisan', l: 'حرفي' }].map(({ k, l }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRole(k)}
                  style={{
                    padding: '8px 28px',
                    border: 'none',
                    fontFamily: 'Tajawal,sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all .2s',
                    background: role === k ? 'var(--burgundy)' : 'transparent',
                    color: role === k ? '#fff' : 'var(--warm-gray)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-500" style={{ fontSize: '0.88rem' }}>الإيميل</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label fw-500" style={{ fontSize: '0.88rem' }}>كلمة المرور</label>
                <Link href="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--burgundy)' }}>
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 py-3 mb-3"
              style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem', letterSpacing: 0.5 }}
            >
              {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              تسجيل الدخول
            </button>

            <div className="d-flex align-items-center gap-3 mb-3">
              <hr className="flex-grow-1" style={{ borderColor: 'var(--stone)' }} />
              <small style={{ color: 'var(--warm-gray)' }}>أو</small>
              <hr className="flex-grow-1" style={{ borderColor: 'var(--stone)' }} />
            </div>

            <button
              type="button"
              className="btn w-100 py-2 mb-4 d-flex align-items-center justify-content-center gap-3"
              style={{ borderRadius: 10, border: '1.5px solid var(--stone)', background: '#fff', fontWeight: 600 }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              الاستمرار باستخدام Google
            </button>

            <p className="text-center mb-0" style={{ fontSize: '0.88rem', color: 'var(--warm-gray)' }}>
              ليس لديك حساب؟{' '}
              <Link href="/register" style={{ color: 'var(--burgundy)', fontWeight: 700 }}>
                إنشاء حساب جديد
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
