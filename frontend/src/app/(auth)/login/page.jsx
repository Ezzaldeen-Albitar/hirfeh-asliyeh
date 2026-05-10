'use client';

import { GoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from '@/lib/sweetalert';
import { useGoogleLoginMutation, useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';

const isRetryableStatus = (status) => status === 502 || status === 503 || status === 504;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [googleSignIn, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [waking, setWaking] = useState(false);

  const isGoogleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());

  const redirectAfterAuth = (response) => {
    router.push(
      response.user?.role === 'artisan'
        ? '/dashboard/artisan'
        : response.user?.role === 'admin'
        ? '/admin'
        : '/'
    );
  };

  const applyAuthResponse = (response, successMessage) => {
    dispatch(setCredentials(response));
    toast.success(successMessage);
    redirectAfterAuth(response);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setWaking(false);

    try {
      const response = await login({ email, password }).unwrap();
      applyAuthResponse(response, 'مرحباً بك');
    } catch (error) {
      if (isRetryableStatus(error?.status)) {
        setWaking(true);
        toast.info('السيرفر يصحى من السبات. أعد المحاولة بعد ثوانٍ قليلة.');
        return;
      }

      setWaking(false);
      if (error?.data?.requiresVerification) {
        toast.info('حسابك غير مفعّل بعد. سنحوّلك لصفحة التحقق من البريد.');
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=verify`);
        return;
      }

      toast.error(error?.data?.message || 'بيانات الدخول غير صحيحة');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      toast.error('تعذر استلام بيانات Google. حاول مرة أخرى.');
      return;
    }

    setWaking(false);
    try {
      const response = await googleSignIn({ idToken }).unwrap();
      applyAuthResponse(response, 'تم تسجيل الدخول باستخدام Google');
    } catch (error) {
      if (isRetryableStatus(error?.status)) {
        setWaking(true);
        toast.info('السيرفر يصحى من السبات. أعد المحاولة بعد ثوانٍ قليلة.');
        return;
      }

      toast.error(error?.data?.message || 'تعذر تسجيل الدخول باستخدام Google');
    }
  };

  const handleGoogleError = () => {
    toast.error('تم إلغاء أو فشل تسجيل الدخول باستخدام Google');
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'var(--cream)' }}>
      <div className="d-none d-lg-block col-lg-6 position-relative overflow-hidden">
        <Image
          src="/premium_digital_heritage_marketplace_brand_hero_im.png"
          alt="craft"
          fill
          sizes="50vw"
          priority
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
          <div
            style={{
              fontFamily: 'Amiri,serif',
              fontSize: '3rem',
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            حِرفة أصيلة
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
            <div style={{ fontFamily: 'Amiri,serif', fontSize: '1.6rem', color: 'var(--burgundy)' }}>
              حِرفة أصيلة
            </div>
            <h2
              style={{
                fontFamily: 'Amiri,serif',
                fontSize: '1.9rem',
                color: 'var(--charcoal)',
                margin: '8px 0 4px',
              }}
            >
              مرحباً بك في تراث الأردن
            </h2>
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          {waking && (
            <div
              style={{
                background: 'rgba(122,28,46,.06)',
                border: '1px solid rgba(122,28,46,.2)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.85rem',
                color: 'var(--burgundy)',
              }}
            >
              <span className="spinner-border spinner-border-sm flex-shrink-0" />
              <span>السيرفر يصحى من السبات وقد يحتاج بضع ثوانٍ قبل أن يعمل.</span>
            </div>
          )}

          <div suppressHydrationWarning>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-500" style={{ fontSize: '0.88rem' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <label className="form-label fw-500" style={{ fontSize: '0.88rem' }}>
                    كلمة المرور
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--burgundy)' }}>
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
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

              {isGoogleConfigured ? (
                <div className="d-flex justify-content-center mb-4" dir="ltr">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    locale="ar"
                    width="390"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <button
                    type="button"
                    disabled
                    className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-3"
                    style={{
                      borderRadius: 10,
                      border: '1.5px solid var(--stone)',
                      background: '#fff',
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    الاستمرار باستخدام Google
                  </button>
                  <small className="d-block text-center mt-2" style={{ color: 'var(--warm-gray)' }}>
                  </small>
                </div>
              )}

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
    </div>
  );
}
