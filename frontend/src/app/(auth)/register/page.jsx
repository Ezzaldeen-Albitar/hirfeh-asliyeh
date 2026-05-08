'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/store/api/authApi';
import { toast } from '@/lib/sweetalert';

const CRAFT_TYPES = ['السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج','أخرى'];
const GOVS = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','العقبة'];

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    craftSpecialty: '', governorate: '', bio: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('كلمات المرور غير متطابقة');
    if (form.password.length < 8) return toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');

    const { confirm, craftSpecialty, governorate, bio, ...base } = form;
    const payload = { ...base, role };
    if (role === 'artisan') {
      if (craftSpecialty) payload.craftSpecialty = craftSpecialty;
      if (governorate)    payload.governorate    = governorate;
      if (bio)            payload.bio            = bio;
    }

    try {
      await register(payload).unwrap();
      toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني 📧');
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&purpose=verify`);
    } catch (err) {
      const status  = err?.status;
      const message = err?.data?.message || '';

      // ✅ FIX: السيرفر حفظ الحساب بنجاح بس فشل في إرسال الإيميل
      // الأسباب الشائعة: ENETUNREACH، connect timeout، mail send failed
      // في هاي الحالة نوجّه المستخدم لصفحة OTP مع رسالة واضحة
      const isMailError =
        status === 500 &&
        (message.toLowerCase().includes('mail') ||
         message.toLowerCase().includes('email') ||
         message.toLowerCase().includes('send') ||
         message.toLowerCase().includes('smtp') ||
         message.toLowerCase().includes('connect'));

      // بعض السيرفرات بترجع 201 مع error في الإيميل
      const accountCreated = status === 201 || isMailError;

      if (accountCreated) {
        toast.info(
          'تم إنشاء حسابك ✓ — لم يصلك رمز التحقق؟ اضغط "إعادة الإرسال" في الصفحة التالية',
          { timer: 5000 }
        );
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&purpose=verify`);
      } else if (status === 409 || message.toLowerCase().includes('exist')) {
        // الحساب موجود مسبقاً
        toast.error('البريد الإلكتروني مسجّل مسبقاً — جرّب تسجيل الدخول');
      } else {
        toast.error(message || 'حدث خطأ ما، حاول مجدداً');
      }
    }
  };

  const input = (label, k, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={form[k]}
        onChange={set(k)}
        required
        suppressHydrationWarning
        style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
      />
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'var(--parchment)' }}>
      <div className="ha-card p-4 p-md-5" style={{ width: '100%', maxWidth: 560 }}>
        <div className="text-center mb-4">
          <div style={{ fontFamily: 'Amiri,serif', fontSize: '1.5rem', color: 'var(--burgundy)' }}>حِرفة أصلية</div>
          <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.8rem', color: 'var(--charcoal)', margin: '6px 0 4px' }}>
            إنشاء حساب جديد
          </h2>
          <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem' }}>Create an account</p>
        </div>

        {/* Role toggle */}
        <div className="d-flex justify-content-center mb-4">
          <div style={{ display: 'flex', border: '1.5px solid var(--stone)', borderRadius: 12, overflow: 'hidden' }}>
            {[{ k: 'customer', l: 'مشتري', icon: 'bi-person' }, { k: 'artisan', l: 'حرفي', icon: 'bi-tools' }].map(({ k, l, icon }) => (
              <button key={k} type="button" onClick={() => setRole(k)}
                suppressHydrationWarning
                style={{
                  padding: '8px 24px', border: 'none',
                  fontFamily: 'Tajawal,sans-serif', fontWeight: 600, fontSize: '0.88rem',
                  transition: 'all .2s',
                  background: role === k ? 'var(--burgundy)' : 'transparent',
                  color: role === k ? '#fff' : 'var(--warm-gray)',
                }}>
                <i className={`bi ${icon} me-2`} />{l}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {input('الاسم الكامل', 'name', 'text', 'محمد أحمد العلي')}

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={form.email}
              onChange={set('email')}
              required
              suppressHydrationWarning
              style={{ borderRadius: 8, borderColor: 'var(--stone)' }}
            />
            <small style={{ color: 'var(--warm-gray)', fontSize: '0.78rem' }}>
              <i className="bi bi-info-circle me-1" />سيُرسل رمز التحقق على هذا البريد
            </small>
          </div>

          {input('كلمة المرور (8 أحرف على الأقل)', 'password', 'password', '••••••••')}
          {input('تأكيد كلمة المرور', 'confirm', 'password', '••••••••')}

          {role === 'artisan' && (
            <>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 500 }}>نوع الحرفة</label>
                <select className="form-select" value={form.craftSpecialty} onChange={set('craftSpecialty')}
                  style={{ borderRadius: 8, borderColor: 'var(--stone)' }}>
                  <option value="">اختر نوع الحرفة</option>
                  {CRAFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 500 }}>المحافظة</label>
                <select className="form-select" value={form.governorate} onChange={set('governorate')}
                  style={{ borderRadius: 8, borderColor: 'var(--stone)' }}>
                  <option value="">اختر محافظتك</option>
                  {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 500 }}>نبذة عنك</label>
                <textarea className="form-control" rows={3}
                  placeholder="اكتب نبذة مختصرة عنك وعن حرفتك..."
                  value={form.bio} onChange={set('bio')}
                  style={{ borderRadius: 8, borderColor: 'var(--stone)', resize: 'none' }} />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            suppressHydrationWarning
            className="btn btn-primary w-100 py-3 mb-3"
            style={{ borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}
          >
            {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            إنشاء الحساب
          </button>

          <p className="text-center mb-0" style={{ fontSize: '0.88rem', color: 'var(--warm-gray)' }}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" style={{ color: 'var(--burgundy)', fontWeight: 700 }}>تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </div>
  );
}