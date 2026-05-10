# Hirfeh Asliyeh | حِرفة أصيلة

منصة رقمية لعرض وبيع الحرف الأردنية الأصيلة، وربط الحرفيين بالعملاء، مع دعم إدارة المنتجات، الطلبات، التخصيص، الورش، الإشعارات، والدفع الإلكتروني.

## إعداد المشروع

- عز الدين البيطار
- أيهم الربضي

## نظرة عامة

المشروع مبني كبنية `full-stack` من جزأين:

- `frontend`: واجهة مستخدم حديثة مبنية بـ `Next.js` و`React`.
- `backend`: واجهة API مبنية بـ `Node.js` و`Express` مع `MongoDB`.

المنصة تدعم ثلاثة أدوار رئيسية:

- `customer`: تصفح، شراء، إضافة للمفضلة، طلب تخصيص، وحجز ورش.
- `artisan`: إدارة المنتجات، التخصيصات، الطلبات، واللوحة الخاصة بالحرفي.
- `admin`: إدارة المستخدمين، الحرفيين، المنتجات، الطلبات، والشارات.

## أهم الميزات

- تسجيل حساب وتسجيل دخول عادي.
- تفعيل الحساب عبر `OTP` بالبريد الإلكتروني.
- إعادة تعيين كلمة المرور عبر `OTP`.
- تسجيل الدخول باستخدام Google.
- عرض المنتجات والحرفيين المميزين في الصفحة الرئيسية.
- تصفح المنتجات، الحرفيين، الورش، وقصص المنشأ.
- سلة مشتريات وصفحة Checkout متعددة الخطوات.
- دعم الدفع عبر `Stripe` بالإضافة إلى وسائل دفع أخرى داخل المنصة.
- لوحة تحكم للحرفي ولوحة تحكم للإدارة.
- نظام إشعارات لحظي باستخدام `Socket.IO`.
- رفع صور عبر `Cloudinary`.
- مفضلة `Wishlist`.
- طلبات تخصيص ومحادثات متعلقة بها.

## التقنيات المستخدمة

### Frontend

- `Next.js 16` مع `App Router`
- `React 19`
- `Redux Toolkit` و`RTK Query`
- `Bootstrap 5` و`Bootstrap Icons`
- `@react-oauth/google`
- `Stripe Elements`
- `Socket.IO Client`
- `Leaflet` و`react-leaflet`
- `SweetAlert2`

### Backend

- `Node.js`
- `Express`
- `MongoDB` و`Mongoose`
- `JWT` + `Cookies`
- `Socket.IO`
- `Cloudinary`
- `Nodemailer`
- `Stripe`
- `express-validator`
- `helmet`, `cors`, `compression`, `express-rate-limit`

### خدمات خارجية

- `MongoDB`
- `Cloudinary`
- `Google Identity Services`
- `Stripe`
- خدمة بريد إلكتروني عبر `Gmail App Password`

## هيكل المشروع

```text
hirfeh-asliyeh/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- scripts/
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/app/
|   |-- src/components/
|   |-- src/hooks/
|   |-- src/lib/
|   `-- src/store/
|-- netlify.toml
`-- souqjo.rest
```

## التشغيل المحلي

### 1. تشغيل الباكند

```bash
cd backend
npm install
npm run dev
```

### 2. تشغيل الفرونت

```bash
cd frontend
npm install
npm run dev
```

### 3. فتح التطبيق

- الواجهة الأمامية: `http://localhost:3000`
- الخادم الخلفي: `http://localhost:5000`
- فحص الصحة: `http://localhost:5000/api/health`

## متغيرات البيئة الأساسية

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_key
```

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hirfeh-asliyeh
JWT_SECRET=change-me
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
# أو عدة IDs مفصولة بفواصل
# GOOGLE_CLIENT_IDS=id1,id2

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password

STRIPE_SECRET_KEY=sk_test_or_sk_live_key
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_JOD_TO_USD_RATE=1.41

RENDER_EXTERNAL_URL=https://your-backend-host
```

## ملفات مهمة

- [frontend/README.md](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/frontend/README.md>) لشرح الواجهة الأمامية.
- [backend/README.md](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/backend/README.md>) لشرح الخادم الخلفي.
- [backend/EMAIL_FEATURES_README.md](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/backend/EMAIL_FEATURES_README.md>) لتفاصيل البريد وOTP وGoogle login.
- [souqjo.rest](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/souqjo.rest>) و[backend/souqjo.rest](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/backend/souqjo.rest>) لتجربة الـ API.

## النشر

- الواجهة الأمامية مهيأة للعمل مع `Netlify` عبر `@netlify/plugin-nextjs`.
- الخادم الخلفي يحتوي `Keepalive.js` لمعالجة بيئات شبيهة بـ `Render` التي قد تدخل في وضع السكون.
- الواجهة تعتمد على متغيرات البيئة لتحديد `API URL` و`Socket URL` ومفاتيح Google وStripe.

## ملاحظات مهمة

- الواجهة تستخدم `RTK Query` مع إعادة محاولة تلقائية لبعض أخطاء `502/503/504` لتخفيف أثر استيقاظ السيرفر.
- التوثيق في هذا الملف يشرح المشروع على مستوى النظام بالكامل، بينما الملفات داخل `frontend` و`backend` تشرح كل جزء بتفصيل أكبر.
