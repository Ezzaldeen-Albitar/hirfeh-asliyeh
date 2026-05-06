'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [show,  setShow]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('يرجى إدخال جميع الحقول');
      return;
    }

    try {
      const res = await login(form).unwrap();

      if (res?.user?.role !== 'admin') {
        setError('هذا الحساب ليس لديه صلاحيات الإدارة');
        return;
      }

      // Store token in cookie so middleware can read it
      if (res.token) {
        Cookies.set('token', res.token, { expires: 7, sameSite: 'lax' });
      }

      dispatch(setCredentials({ user: res.user, token: res.token }));
      router.replace('/admin');
    } catch (err) {
      const msg = err?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(msg);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0a0e 0%, #2F1F15 50%, #1a1208 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
    }}>
      {/* Background pattern */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${200 + i * 80}px`, height: `${200 + i * 80}px`,
            border: '1px solid rgba(184,150,60,0.06)',
            borderRadius: '50%',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}/>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
            background: 'rgba(184,150,60,0.15)',
            border: '1.5px solid rgba(184,150,60,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="38" height="38" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 14L38 30L22 40L6 30L6 14Z" stroke="#B8963C" strokeWidth="1.5" fill="rgba(184,150,60,0.1)"/>
              <circle cx="22" cy="22" r="8" stroke="#7A1C2E" strokeWidth="2" fill="rgba(122,28,46,0.2)"/>
              <circle cx="22" cy="22" r="3" fill="#B8963C"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Amiri, serif', fontSize: '1.9rem', color: '#D4AE5E', margin: '0 0 4px', lineHeight: 1.2 }}>
            حِرفة أصلية
          </h1>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.65rem', letterSpacing: '4px', color: 'rgba(184,150,60,0.6)', textTransform: 'uppercase' }}>
            Admin Panel
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(184,150,60,0.2)',
          borderRadius: 20, padding: '36px 32px',
          backdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: '#fff', textAlign: 'center', marginBottom: 6 }}>
            دخول لوحة الإدارة
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 28 }}>
            للمديرين المعتمدين فقط
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0 }}/>
              <span style={{ color: '#fca5a5', fontSize: '0.86rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginBottom: 8, fontWeight: 500 }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(184,150,60,0.7)', fontSize: '1rem', pointerEvents: 'none' }}>
                  <i className="bi bi-envelope"/>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="admin@hirfeh.jo"
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1.5px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(184,150,60,0.25)'}`,
                    borderRadius: 10, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(184,150,60,0.7)'; setError(''); }}
                  onBlur={e  => e.target.style.borderColor = 'rgba(184,150,60,0.25)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginBottom: 8, fontWeight: 500 }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(184,150,60,0.7)', fontSize: '1rem', pointerEvents: 'none' }}>
                  <i className="bi bi-lock"/>
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 44px',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1.5px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(184,150,60,0.25)'}`,
                    borderRadius: 10, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color .2s', letterSpacing: show ? 0 : 2,
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(184,150,60,0.7)'; setError(''); }}
                  onBlur={e  => e.target.style.borderColor = 'rgba(184,150,60,0.25)'}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', padding: 0 }}>
                  <i className={`bi bi-eye${show ? '-slash' : ''}`}/>
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: isLoading ? 'rgba(184,150,60,0.4)' : 'linear-gradient(135deg, #7A1C2E, #A83245)',
                border: '1px solid rgba(184,150,60,0.3)',
                borderRadius: 10, color: '#fff', fontSize: '0.97rem', fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .2s',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(122,28,46,0.4)',
              }}>
              {isLoading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                  جاري التحقق...
                </>
              ) : (
                <><i className="bi bi-shield-lock-fill"/>دخول لوحة الإدارة</>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(184,150,60,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <i className="bi bi-arrow-right me-1"/>العودة للموقع
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <i className="bi bi-shield-check" style={{ color: 'rgba(184,150,60,0.5)', fontSize: '0.8rem' }}/>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>اتصال آمن ومشفر</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px rgba(47,31,21,0.95) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
