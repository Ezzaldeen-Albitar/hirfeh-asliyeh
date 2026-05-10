
import https from 'https';

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

const PING_INTERVAL_MS = 14 * 60 * 1000; // كل 14 دقيقة

function ping() {
    if (!RENDER_URL) {
        console.warn('[KeepAlive] No RENDER_URL found in environment variables.');
        return;
    }

    const url = `${RENDER_URL}/api/health`;
    
    https.get(url, (res) => {
        console.log(`[KeepAlive] ping → ${res.statusCode}`);
    }).on('error', (err) => {
        console.warn('[KeepAlive] ping failed:', err.message);
    });
}

setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL_MS);
}, 2 * 60 * 1000);

export default {};
