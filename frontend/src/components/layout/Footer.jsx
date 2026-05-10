import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    'المنصة': [
      ['المنتجات', '/products'],
      ['الحرفيون', '/artisans'],
      ['الورش', '/workshops'],
    ],
    'الحرفيون': [
      ['انضم كحرفي', '/register'],
      ['لوحة التحكم', '/dashboard/artisan'],
      ['دليل الحرفي', '#'],
    ],
    'الدعم': [
      ['تواصل معنا', '#'],
      ['تتبع الطلب', '#'],
      ['سياسة الإرجاع', '#'],
    ],
  };

  const teamMembers = [
    {
      name: 'عز الدين البيطار',
      phoneLabel: '+962 77 940 9494',
      phoneHref: 'tel:+962779409494',
      email: 'ezzaldeenalbitar9@gmail.com',
      links: [
        { label: 'GitHub', href: 'https://github.com/Ezzaldeen-Albitar', icon: 'github' },
        { label: 'LinkedIn', href: 'http://www.linkedin.com/in/ezzaldeen-al-bitar-software-engineer', icon: 'linkedin' },
      ],
    },
    {
      name: 'أيهم الربضي',
      phoneLabel: '+962 77 570 1980',
      phoneHref: 'tel:+962775701980',
      email: 'ayhamrabadi6@gmail.com',
      links: [
        { label: 'GitHub', href: 'https://github.com/ayhamrabadi20', icon: 'github' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ayham-rabadi-4214ab327', icon: 'linkedin' },
      ],
    },
  ];

  return (
    <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,.7)', padding: '70px 0 28px' }}>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Image
                src="/professional_minimalist_logo_for_hirfeh_asliyeh_1.png"
                alt="Logo"
                width={44}
                height={50}
                style={{ background: 'transparent', display: 'block' }}
              />
              <div>
                <span
                  style={{
                    fontFamily: 'Amiri,serif',
                    fontSize: '1.5rem',
                    color: 'var(--gold-light)',
                    display: 'block',
                    lineHeight: 1.1,
                  }}
                >
                  حِرفة أصيلة
                </span>
                <span
                  style={{
                    fontFamily: 'Playfair Display,serif',
                    fontSize: '0.6rem',
                    letterSpacing: '2px',
                    color: 'var(--gold)',
                    textTransform: 'uppercase',
                  }}
                >
                  Hirfeh Asliyeh
                </span>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              منصة أردنية لتوثيق وتسويق الحرف اليدوية الأصيلة، تربط الحرفيين بمحبي التراث حول العالم.
            </p>
          </div>

          {Object.entries(links).map(([title, cols]) => (
            <div key={title} className="col-6 col-md-4 col-lg-2">
              <p
                style={{
                  fontFamily: 'Playfair Display,serif',
                  fontSize: '0.68rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: 16,
                }}
              >
                {title}
              </p>
              {cols.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="footer-link d-block mb-2 text-decoration-none"
                  style={{ color: 'rgba(255,255,255,.55)', fontSize: '0.85rem', transition: 'color .2s' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}

          <div className="col-12 col-lg-3">
            <p
              style={{
                fontFamily: 'Playfair Display,serif',
                fontSize: '0.68rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: 16,
              }}
            >
              فريق المشروع
            </p>

            <div className="d-grid gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  style={{
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.03)',
                    padding: '16px 18px',
                  }}
                >
                  <div className="mb-2">
                    <strong style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>{member.name}</strong>
                  </div>

                  <div className="d-flex flex-column gap-2" dir="ltr">
                    <a
                      href={member.phoneHref}
                      className="footer-link d-inline-flex align-items-center gap-2 text-decoration-none"
                      style={{ color: 'rgba(255,255,255,.62)', fontSize: '0.82rem' }}
                    >
                      <i className="bi bi-telephone" />
                      <span>{member.phoneLabel}</span>
                    </a>

                    <a
                      href={`mailto:${member.email}`}
                      className="footer-link d-inline-flex align-items-center gap-2 text-decoration-none"
                      style={{ color: 'rgba(255,255,255,.62)', fontSize: '0.82rem' }}
                    >
                      <i className="bi bi-envelope" />
                      <span>{member.email}</span>
                    </a>

                    <div className="d-flex flex-wrap gap-2 pt-1">
                      {member.links.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="footer-social-link d-inline-flex align-items-center gap-2 text-decoration-none"
                          style={{
                            border: '1px solid rgba(255,255,255,.14)',
                            borderRadius: 10,
                            color: 'rgba(255,255,255,.62)',
                            padding: '7px 10px',
                            fontSize: '0.8rem',
                            transition: 'all .22s',
                          }}
                        >
                          <i className={`bi bi-${item.icon}`} />
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,.1)', margin: '40px 0 24px' }} />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="mb-0" style={{ color: 'rgba(255,255,255,.3)', fontSize: '0.77rem' }}>
            © {year} حِرفة أصيلة. جميع الحقوق محفوظة.
          </p>
          <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.77rem' }}>الأردن</span>
        </div>
      </div>
    </footer>
  );
}
