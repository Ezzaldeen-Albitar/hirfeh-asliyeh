// keepAlive.js — يمنع Render من تنويم السيرفر
// استدعيه في server.js أو app.js:  require('./keepAlive')

const https = require('https');

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
// مثال: https://hirfeh-asliyeh.onrender.com

const PING_INTERVAL_MS = 14 * 60 * 1000; // كل 14 دقيقة (Render ينام بعد 15)

function ping() {
    if (!RENDER_URL) return;

    const url = `${RENDER_URL}/api/health`;
    https.get(url, (res) => {
        console.log(`[KeepAlive] ping → ${res.statusCode}`);
    }).on('error', (err) => {
        console.warn('[KeepAlive] ping failed:', err.message);
    });
}

// ابدأ بعد دقيقتين من تشغيل السيرفر
setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL_MS);
}, 2 * 60 * 1000);

module.exports = {};