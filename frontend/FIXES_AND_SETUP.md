# Frontend Fixes and Setup Guide

## ✅ التعديلات التي تمت

### 1. إصلاح إعدادات الربط مع الباك إند

**الملف:** `.env.local`

**التغيير:**
```env
# قديم (كان يشير إلى Render production)
NEXT_PUBLIC_API_URL=https://hirfeh-asliyeh.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://hirfeh-asliyeh.onrender.com

# جديد (يشير إلى localhost للتطوير)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**السبب:** الفرونت كان يحاول الاتصال بـ Render production بدلاً من الباك الجديد على localhost.

---

### 2. تحديث API Endpoints في Redux RTK Query

تم تحديث الـ `transformResponse` في الـ API slices لمطابقة هيكلية البيانات المرجعة من الباك الجديد:

#### `src/store/api/adminApi.js`
- ✅ `getAdminStats`: يرجع `stats` + `revenueChart` + `categoryStats`
- ✅ `getAllUsers`: يرجع `users` + `pagination`
- ✅ `getAllOrders`: يرجع `orders` + `pagination`
- ✅ `getAllAdminProducts`: يرجع `products` + `pagination`
- ✅ `getPendingArtisans`: يرجع `artisans` + `pagination`
- ✅ `approveArtisan`: يستخدم الـ endpoint الصحيح `/admin/artisans/{id}/verify`

#### `src/store/api/ordersApi.js`
- ✅ `getOrders`: يرجع `orders` + `pagination`
- ✅ `getArtisanOrders`: يرجع `orders` + `pagination`

#### `src/store/api/productsApi.js`
- ✅ `getAllProducts`: يرجع `products` + `pagination`

---

### 3. صفحة الأدمن (`src/app/admin/page.jsx`)

**الحالة الحالية:**
- ✅ تستخدم الـ Redux hooks الصحيحة
- ✅ تجلب البيانات من الباك الجديد مباشرة
- ✅ لا توجد بيانات hardcoded وهمية
- ✅ تعرض البيانات الحقيقية من الداتابيز

**الميزات المدعومة:**
1. **Tab 0 - نظرة عامة:** إحصائيات الداشبورد (المستخدمون، الحرفيون، الطلبات، الإيرادات)
2. **Tab 1 - المستخدمون:** قائمة المستخدمين مع البحث وتغيير الدور والحذف
3. **Tab 2 - المنتجات:** قائمة المنتجات مع عرض وحذف
4. **Tab 3 - الطلبات:** قائمة الطلبات مع تحديث الحالة
5. **Tab 4 - الحرفيون المعلّقون:** قائمة الحرفيين بانتظار الموافقة مع قبول/رفض

---

## 🔄 تدفق البيانات

```
Frontend (React)
    ↓
Redux RTK Query (baseApi)
    ↓
HTTP Request to: http://localhost:5000/api/admin/*
    ↓
Backend (Node.js + Express)
    ↓
MongoDB Database
    ↓
Response with: { stats, users, orders, products, artisans, pagination }
    ↓
Frontend (transformResponse) → { data, pagination }
    ↓
React Component renders data
```

---

## 🚀 كيفية التشغيل

### 1. تشغيل الباك إند

```bash
cd /home/ubuntu/backendnew
npm install
npm run dev  # أو: node server.js
```

**المتوقع:** السيرفر يشتغل على `http://localhost:5000`

### 2. تشغيل الفرونت إند

```bash
cd /home/ubuntu/frontend_fixed
npm install
npm run dev  # أو: npm start
```

**المتوقع:** الفرونت يشتغل على `http://localhost:3000`

### 3. اختبار صفحة الأدمن

1. اذهب إلى `http://localhost:3000/admin/login`
2. سجّل دخول بحساب أدمن
3. اذهب إلى `http://localhost:3000/admin`
4. تأكد من أن البيانات تظهر من الداتابيز

---

## ⚙️ متغيرات البيئة المهمة

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=579050504946-es1g5bi7234juhvpbat63m911v2olhu9.apps.googleusercontent.com
```

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🔍 Troubleshooting

### المشكلة: صفحة الأدمن تظهر "لا يوجد بيانات"

**الحل:**
1. تأكد من أن الباك إند يشتغل على `http://localhost:5000`
2. تأكد من أن الـ `.env.local` يحتوي على الـ URLs الصحيحة
3. افتح Developer Tools (F12) وشوف Network tab للـ API calls
4. تأكد من أن الـ JWT token موجود في الـ cookies

### المشكلة: CORS errors

**الحل:**
1. تأكد من أن الباك إند يسمح بـ CORS من `http://localhost:3000`
2. تحقق من ملف `server.js` في الباك الجديد:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

### المشكلة: API returns 401 Unauthorized

**الحل:**
1. تأكد من أن المستخدم مسجل دخول كـ admin
2. تحقق من أن الـ JWT token صحيح
3. جرب تسجيل الخروج وإعادة تسجيل الدخول

---

## 📝 ملاحظات مهمة

1. **لا توجد بيانات hardcoded:** جميع البيانات تأتي من الداتابيز عبر الباك إند
2. **الربط ديناميكي:** الـ URLs تُقرأ من `.env.local` وليست hardcoded
3. **معالجة الأخطاء:** الـ API calls تتعامل مع الأخطاء بشكل صحيح
4. **التحديث التلقائي:** عند تحديث البيانات، الفرونت يعيد جلب البيانات تلقائياً

---

## ✨ الميزات الإضافية

- ✅ Search في المستخدمين
- ✅ تغيير الدور (customer/artisan/admin)
- ✅ حذف المستخدمين والمنتجات
- ✅ قبول/رفض الحرفيين
- ✅ تحديث حالة الطلبات
- ✅ عرض الإحصائيات والرسوم البيانية

---

## 🎯 الخطوات التالية

1. اختبر جميع الـ tabs في صفحة الأدمن
2. تأكد من أن جميع الـ CRUD operations تعمل
3. اختبر البحث والتصفية
4. اختبر الأخطاء (مثل حذف مستخدم غير موجود)
5. اختبر الـ pagination إذا كان موجوداً
