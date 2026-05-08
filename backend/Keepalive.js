// keepAlive.js — يمنع Render من تنويم السيرفر
// استدعاؤه في server.js يكون كالتالي: import './keepAlive.js';

import https from 'https';

// استحضار الروابط من البيئة المحيطة
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

const PING_INTERVAL_MS = 14 * 60 * 1000; // كل 14 دقيقة

function ping() {
    if (!RENDER_URL) {
        console.warn('[KeepAlive] No RENDER_URL found in environment variables.');
        return;
    }

    // تأكد أن المسار /api/health موجود في الـ Routes عندك
    const url = `${RENDER_URL}/api/health`;
    
    https.get(url, (res) => {
        console.log(`[KeepAlive] ping → ${res.statusCode}`);
    }).on('error', (err) => {
        console.warn('[KeepAlive] ping failed:', err.message);
    });
}

// ابدأ بعد دقيقتين من تشغيل السيرفر لتجنب التداخل مع بداية التشغيل
setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL_MS);
}, 2 * 60 * 1000);

export default {};