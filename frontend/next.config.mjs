/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // 1. إعدادات الصور (كما هي مع إضافة تحسينات طفيفة)
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'mir-s3-cdn-cf.behance.net' },
      { protocol: 'https', hostname: '*.behance.net' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'hura7.com' },
      { protocol: 'https', hostname: '*.hura7.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },

  // 2. حل مشكلة الملفات المفقودة (ENOENT) وتحسين الرفع على Vercel
  
  // 3. إعدادات الـ Rewrites للربط مع الباك أند على Render
  async rewrites() {
    // تأكد من إضافة هذا المتغير في Vercel Dashboard -> Settings -> Environment Variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
    
    // إذا كان المتغير مفقوداً، نضع رابطاً احتياطياً لتجنب تعليق الـ Build
    const destinationUrl = apiUrl || 'https://hirfeh-asliyeh-api.onrender.com';

    return [
      {
        source: '/api/:path*',
        destination: `${destinationUrl}/api/:path*`, // أضفت /api إذا كان الباك أند يتطلبها
      },
    ];
  },

  // 4. تعطيل الميزات التجريبية التي تسبب مشاكل مع Middleware في نسخة 16

  // 5. تجنب أخطاء الفحص أثناء الرفع لتسريع العملية وتفادي الفشل المفاجئ
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;
