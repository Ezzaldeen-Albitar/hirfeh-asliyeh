# Backend | Hirfeh Asliyeh

الخادم الخلفي لمنصة **حِرفة أصيلة**، وهو مسؤول عن المصادقة، إدارة البيانات، الطلبات، الدفع، الإشعارات، والربط مع الخدمات الخارجية.

## إعداد المشروع

- عز الدين البيطار
- أيهم الربضي

## نظرة عامة

الباكند مبني باستخدام `Express` و`MongoDB` ويقدم REST API تحت المسار الأساسي:

```text
/api
```

كما يوفّر:

- مصادقة مبنية على `JWT`.
- تخزين التوكن في `cookies`.
- حماية المسارات حسب الدور.
- إشعارات لحظية باستخدام `Socket.IO`.
- إرسال رسائل بريدية لـ OTP والتأكيدات.
- دفع إلكتروني باستخدام `Stripe`.
- رفع صور إلى `Cloudinary`.

## التقنيات المستخدمة

- `Node.js`
- `Express`
- `MongoDB` و`Mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cookie-parser`
- `cors`
- `helmet`
- `compression`
- `express-rate-limit`
- `express-validator`
- `socket.io`
- `nodemailer`
- `otplib`
- `cloudinary`
- `multer`
- `stripe`

## الأدوار

- `customer`: عميل المنصة.
- `artisan`: حرفي يدير منتجاته وطلباته.
- `admin`: إدارة كاملة للنظام.

## النماذج الرئيسية

- `User`
- `ArtisanProfile`
- `Product`
- `Order`
- `Review`
- `Badge`
- `CraftCollection`
- `OriginStory`
- `CustomizationRequest`
- `Notification`
- `WorkshopSession`
- `WorkshopBooking`

## وحدات الـ API

- `auth.routes.js` للتسجيل، الدخول، OTP، واسترجاع كلمة المرور وGoogle login.
- `artisans.routes.js` لإدارة الحرفيين وعرضهم.
- `products.routes.js` للمنتجات، المنتجات المميزة، ومنتجات الحرفي.
- `craftcollections.routes.js` للمجموعات/التصنيفات.
- `originStories.routes.js` لقصص المنشأ.
- `customizations.routes.js` لطلبات التخصيص.
- `orders.routes.js` للطلبات.
- `reviews.routes.js` للمراجعات والتقييمات.
- `workshops.routes.js` للورش والحجوزات.
- `notifications.routes.js` للإشعارات.
- `payment.routes.js` للدفع والتحقق وwebhook.
- `upload.routes.js` لرفع الصور.
- `search.routes.js` للبحث.
- `wishlist.routes.js` للمفضلة.
- `admin.routes.js` لإدارة المستخدمين والحرفيين والطلبات والمنتجات والشارات.

## بنية المجلدات

```text
backend/
|-- config/
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- scripts/
|-- services/
|-- utils/
|-- Keepalive.js
|-- server.js
`-- package.json
```

## ملفات مهمة

- `server.js` نقطة التشغيل الرئيسية.
- `config/db.js` الاتصال بقاعدة البيانات.
- `config/socket.js` تهيئة المصادقة داخل Socket.IO.
- `config/cloudinary.js` ربط Cloudinary.
- `middleware/auth.middleware.js` التحقق من التوكن والصلاحيات.
- `middleware/error.middleware.js` توحيد الأخطاء.
- `services/mailer.service.js` رسائل OTP ورسائل البريد الأخرى.
- `services/otp.service.js` توليد وتشفير والتحقق من OTP.
- `controllers/payment.controller.js` منطق Stripe.
- `Keepalive.js` ping دوري لتخفيف sleep في بيئات مثل Render.

## متغيرات البيئة

أنشئ ملف `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hirfeh-asliyeh

JWT_SECRET=change-me
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
# أو
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
BACKEND_URL=https://your-backend-host
```

## أوامر التشغيل

```bash
npm install
npm run dev
npm start
```

## طريقة العمل باختصار

### المصادقة

- التسجيل وتسجيل الدخول يمرّان عبر `auth.controller.js`.
- التوكن يصدر عبر `utils/jwt.js`.
- يتم وضع `JWT` في cookie مع دعم `Authorization` header أيضًا.
- يوجد تسجيل دخول Google عبر إرسال `idToken` من الواجهة إلى `/api/auth/google`.

### OTP والبريد

- OTP يستخدم لتفعيل الحساب وإعادة تعيين كلمة المرور.
- البريد يرسل عبر `nodemailer`.
- يوجد شرح مفصل في [EMAIL_FEATURES_README.md](</c:/Users/ayham/OneDrive/Desktop/ezz + ayham/hirfeh-asliyeh/backend/EMAIL_FEATURES_README.md>).

### الطلبات والدفع

- إنشاء الطلبات يتم أولًا داخل المنصة.
- الدفع بالبطاقة يتم عبر `Stripe Payment Intent`.
- عند نجاح الدفع يتم تأكيد الطلب وتحديث حالته.
- يوجد `webhook` لمعالجة حالات الدفع من Stripe.

### الإشعارات

- الخادم ينشئ إشعارات ويُرسلها لحظيًا للمستخدمين عبر `Socket.IO`.
- العميل يستقبلها في الفرونت عند وجود جلسة مصادقة صالحة.

## ملاحظات مهمة

- يوجد `global rate limiter` على جميع مسارات `/api`.
- مسارات `auth` فيها rate limit منفصل لطلبات OTP.
- إعدادات `cors` و`cookies` تعتمد على `FRONTEND_URL` و`NODE_ENV`.
- عند استخدام الدفع الأردني بالدينار، يتم التحويل إلى USD في Stripe عبر `STRIPE_JOD_TO_USD_RATE`.

## أدوات إضافية

- `scripts/seed.js` لتهيئة بيانات أولية.
- `souqjo.rest` لاختبار الـ endpoints يدويًا.
