# Email Features — Hirfeh Asliyeh Backend

## ✅ الميزات المطبقة والمختبرة

### 1. إرسال OTP (التحقق من الإيميل)
- **الملف:** `services/mailer.service.js` → `sendOTPEmail(to, name, otp)`
- **يُستدعى من:** `controllers/auth.controller.js` → `register()` و `resendOTP()`
- **الـ Endpoint:** `POST /api/auth/register` و `POST /api/auth/resend-otp`
- **التصميم:** قالب HTML احترافي مع كود OTP بارز

### 2. إرسال OTP لإعادة تعيين كلمة المرور
- **الملف:** `services/mailer.service.js` → `sendPasswordResetEmail(to, name, otp)`
- **يُستدعى من:** `controllers/auth.controller.js` → `forgotPassword()` و `resendOTP()`
- **الـ Endpoint:** `POST /api/auth/forgot-password` و `POST /api/auth/resend-otp?purpose=reset`

### 3. تأكيد الطلبية (Order Confirmation)
- **الملف:** `services/mailer.service.js` → `sendOrderConfirmationEmail(to, name, orderNumber, total)`
- **يُستدعى من:** `controllers/orders.controller.js` → `confirmOrder()`
- **يُرسل تلقائياً عند:**
  - الدفع عند الاستلام (Cash on Delivery) — فور إنشاء الطلب
  - الدفع عبر Stripe — بعد نجاح الدفع (Webhook)

### 4. تأكيد حساب الحرفي
- **الملف:** `services/mailer.service.js` → `sendArtisanVerifiedEmail(to, name)`
- **يُستدعى من:** `controllers/admin.controller.js` → عند تفعيل حساب الحرفي من الأدمن

### 5. تسجيل الدخول عبر Google
- **الملف:** `controllers/auth.controller.js` → `googleAuth()`
- **الـ Endpoint:** `POST /api/auth/google`
- **طريقة العمل:** الفرونت يبعث `idToken` من Google، الباك يتحقق منه مع Google API
- **لا يحتاج Passport.js** — يستخدم Google tokeninfo endpoint مباشرة

---

## 📋 جميع Endpoints الخاصة بالـ Auth

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/register` | تسجيل حساب جديد + إرسال OTP |
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/logout` | تسجيل الخروج |
| GET  | `/api/auth/me` | بيانات المستخدم الحالي |
| POST | `/api/auth/verify-otp` | التحقق من كود OTP |
| POST | `/api/auth/resend-otp` | إعادة إرسال OTP |
| POST | `/api/auth/forgot-password` | طلب إعادة تعيين كلمة المرور |
| POST | `/api/auth/reset-password` | تعيين كلمة المرور الجديدة |
| POST | `/api/auth/google` | تسجيل الدخول عبر Google |

---

## ⚙️ إعدادات الإيميل في `.env`

```env
EMAIL_USER=ezzaldeenalbitar9@gmail.com
EMAIL_PASS=ghbs oesx jotk ycyu
```

> **ملاحظة:** `EMAIL_PASS` هو App Password من Gmail (مش كلمة مرور الحساب).
> إذا أردت تغيير الإيميل، اذهب إلى: Google Account → Security → 2-Step Verification → App passwords

---

## 🔄 تدفق OTP الكامل

```
1. المستخدم يسجل → POST /api/auth/register
   ↓
2. الباك يولد OTP (6 أرقام) ويحفظه مشفر في قاعدة البيانات
   ↓
3. الباك يرسل إيميل OTP للمستخدم
   ↓
4. المستخدم يدخل الكود → POST /api/auth/verify-otp
   ↓
5. الباك يتحقق من الكود → يفعّل الحساب ويرجع JWT token
```

---

## 🔐 تدفق Google Login

```
1. الفرونت يفتح Google Sign-In popup
   ↓
2. Google يرجع idToken للفرونت
   ↓
3. الفرونت يبعث idToken → POST /api/auth/google
   ↓
4. الباك يتحقق من idToken مع Google API
   ↓
5. الباك يجد أو يخلق المستخدم → يرجع JWT token
```

**مثال للفرونت (React):**
```javascript
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async (credentialResponse) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: credentialResponse.credential }),
      credentials: 'include',
    });
    const data = await res.json();
    // data.token + data.user
  }}
/>
```

---

## 📦 الـ Services المستخدمة

### `services/mailer.service.js`
- `sendOTPEmail(to, name, otp)` — إيميل التحقق
- `sendPasswordResetEmail(to, name, otp)` — إيميل إعادة تعيين كلمة المرور
- `sendOrderConfirmationEmail(to, name, orderNumber, total)` — تأكيد الطلبية
- `sendArtisanVerifiedEmail(to, name)` — تأكيد حساب الحرفي

### `services/otp.service.js`
- `generateOTP()` — توليد كود OTP عشوائي
- `hashOTP(otp)` — تشفير الكود قبل الحفظ
- `verifyOTP(input, hash)` — التحقق من الكود
- `buildOTPDoc(otp)` — بناء مستند OTP للحفظ في DB
- `canResendOTP(lastSentAt)` — التحقق من إمكانية إعادة الإرسال
- `isOTPExpired(expiresAt)` — التحقق من انتهاء صلاحية الكود
