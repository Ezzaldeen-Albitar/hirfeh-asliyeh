import Image from 'next/image';
import Link from 'next/link';

// Server Component — لا يحتاج 'use client' لأنه ما عنده state أو event handlers
export default function Footer() {
  const links = {
    'المنصة':   [['المنتجات','/products'],['الحرفيون','/artisans'],['الورش','/workshops']],
    'الحرفيون': [['انضم كحرفي','/register'],['لوحة التحكم','/dashboard/artisan'],['دليل الحرفي','#']],
    'الدعم':    [['تواصل معنا','#'],['تتبع الطلب','#'],['سياسة الإرجاع','#']],
  };

  return (
    <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,.7)', padding: '70px 0 28px' }}>
      <div className="container">
        <div className="row g-5">
          {/* Brand */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Image
                src="/professional_minimalist_logo_for_hirfeh_asliyeh_1.png"
                alt="Logo"
                width={44}
                height={50}
                style={{ background: 'transparent', display: 'block' }}
              />
              <div>
                <span style={{ fontFamily: 'Amiri,serif', fontSize: '1.5rem', color: 'var(--gold-light)', display: 'block', lineHeight: 1.1 }}>
                  حِرفة أصلية
                </span>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                  Hirfeh Asliyeh
                </span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              منصة أردنية لتوثيق وتسويق الحرف اليدوية الأصيلة، تربط الحرفيين بمحبي التراث حول العالم.
            </p>
            <div className="d-flex gap-2 mt-3">
              {['instagram','facebook','twitter-x','youtube'].map(s => (
                <a key={s} href="#"
                  className="footer-social-link d-flex align-items-center justify-content-center"
                  aria-label={s}
                  style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .22s' }}>
                  <i className={`bi bi-${s}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, cols]) => (
            <div key={title} className="col-6 col-md-4 col-lg-2">
              <p style={{ fontFamily: 'Playfair Display,serif', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
                {title}
              </p>
              {cols.map(([label, href]) => (
                <Link key={label} href={href}
                  className="footer-link d-block mb-2 text-decoration-none"
                  style={{ color: 'rgba(255,255,255,.55)', fontSize: '0.85rem', transition: 'color .2s' }}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,.1)', margin: '40px 0 24px' }} />
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="mb-0" style={{ color: 'rgba(255,255,255,.3)', fontSize: '0.77rem' }}>
            © 2026 حِرفة أصلية. جميع الحقوق محفوظة.
          </p>
          <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.77rem' }}>الأردن 🇯🇴</span>
        </div>
      </div>
    </footer>
  );
}
