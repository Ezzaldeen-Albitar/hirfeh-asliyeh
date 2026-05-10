# Frontend | Hirfeh Asliyeh

واجهة المستخدم الخاصة بمنصة **حِرفة أصيلة**، وهي مبنية لعرض الحرف الأردنية، إدارة الحسابات، الشراء، المفضلة، التخصيصات، الورش، ولوحات التحكم.

## إعداد المشروع

- عز الدين البيطار
- أيهم الربضي

## ما الذي يقدمه هذا الجزء؟

الفرونت مسؤول عن:

- صفحات الزوار: الصفحة الرئيسية، المنتجات، الحرفيون، الورش.
- صفحات المصادقة: تسجيل، تسجيل دخول، Google login، OTP، إعادة تعيين كلمة المرور.
- صفحات العملاء: السلة، checkout، المفضلة، لوحة الحساب.
- صفحات الحرفيين: لوحة الحرفي، المنتجات، الطلبات، التخصيصات.
- صفحات الإدارة: المستخدمون، الطلبات، المنتجات، الحرفيون، الشارات.
- التكامل مع الـ API، الـ cookies، الإشعارات اللحظية، والدفع عبر Stripe.

## التقنيات المستخدمة

- `Next.js 16.2.4`
- `React 19`
- `Redux Toolkit`
- `RTK Query`
- `Bootstrap 5`
- `Bootstrap Icons`
- `@react-oauth/google`
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- `socket.io-client`
- `next-cloudinary`
- `leaflet` و`react-leaflet`
- `SweetAlert2`
- `date-fns`
- `clsx`
- `zod`

## أهم الصفحات

- `/` الصفحة الرئيسية وعرض المنتجات والحرفيين المميزين.
- `/products` و`/products/[id]` لعرض المنتجات والتفاصيل.
- `/artisans` و`/artisans/[id]` لعرض الحرفيين وملفاتهم.
- `/workshops` و`/workshops/[id]` لعرض الورش.
- `/customizations` و`/customizations/new` لطلبات التخصيص.
- `/checkout` لإتمام الشراء والدفع.
- `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`.
- `/dashboard` و`/dashboard/wishlist`.
- `/dashboard/artisan` للحرفي.
- `/admin` وما تحته للإدارة.

## إدارة الحالة والاتصال مع الـ API

المشروع يستخدم `Redux Toolkit` و`RTK Query` من خلال:

- `src/store/index.js` لإنشاء المتجر.
- `src/store/slices` لحالة المصادقة، السلة، الإشعارات، وواجهة المستخدم.
- `src/store/api/baseApi.js` لإنشاء `fetchBaseQuery` مع:
  - إرسال `JWT` من الـ cookies.
  - `credentials: include`.
  - إعادة المحاولة تلقائيًا في بعض أخطاء `502/503/504`.

### وحدات الـ API

- `authApi.js`
- `productsApi.js`
- `artisansApi.js`
- `ordersApi.js`
- `paymentApi.js`
- `customizationsApi.js`
- `reviewsApi.js`
- `wishlistApi.js`
- `notificationsApi.js`
- `workshopsApi.js`
- `adminApi.js`

## بنية المجلدات

```text
frontend/
|-- public/
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |-- (main)/
|   |   `-- admin/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   `-- store/
|-- next.config.mjs
|-- package.json
`-- README.md
```

## ملفات مهمة داخل الواجهة

- `src/app/layout.jsx` الهيكل العام للتطبيق.
- `src/app/providers.jsx` مزودات Redux وGoogle OAuth وتهيئة الجلسة.
- `src/proxy.js` منطق الحماية والتحويل لبعض المسارات.
- `src/hooks/useSocket.js` تهيئة الاتصال اللحظي.
- `src/components/auth/GoogleIdentityButton.jsx` زر Google Sign-In المخصص.
- `src/app/(main)/checkout/page.jsx` صفحة الدفع وStripe.
- `src/components/layout/MainShell.jsx` الغلاف الرئيسي للصفحات العامة.

## متغيرات البيئة

أنشئ ملف `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_key
```

### ملاحظات

- `NEXT_PUBLIC_API_URL` يجب أن يشير إلى الباكند مع `/api`.
- `NEXT_PUBLIC_SOCKET_URL` يستخدمه `Socket.IO` للاتصال بالخادم.
- إذا لم يتم ضبط `NEXT_PUBLIC_GOOGLE_CLIENT_ID` سيظهر زر Google بحالة غير مفعلة.
- إذا لم يتم ضبط `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` سيتعطل الدفع بالبطاقة فقط، بينما تبقى بقية المنصة تعمل.

## الأوامر

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## آلية التشغيل

1. الواجهة تطلب البيانات من `NEXT_PUBLIC_API_URL`.
2. `RTK Query` يضيف التوكن من الـ cookies تلقائيًا.
3. بعد تسجيل الدخول يتم حفظ حالة المستخدم في Redux مع دعم `localStorage` لبعض البيانات.
4. عند التوثيق، يتم فتح `Socket.IO` لاستقبال الإشعارات.
5. عند الدفع بالبطاقة، يتم استخدام Stripe Elements ثم التحقق من العملية عبر الباكند.

## التكاملات

- Google Sign-In للمصادقة.
- Stripe للدفع الإلكتروني.
- Socket.IO للإشعارات الحية.
- Cloudinary لعرض الصور المرفوعة.
- خرائط `Leaflet` لبعض وظائف العرض/الموقع داخل المكونات المشتركة.

## ملاحظات تطوير

- `next.config.mjs` يحتوي إعدادات صور خارجية وrewrites مرتبطة بالباكند.
- الواجهة تستهدف العربية وتستخدم اتجاه `RTL`.
- توجد وثيقة إضافية: `FIXES_AND_SETUP.md` فيها ملاحظات تشغيل وتصحيح إضافية.
