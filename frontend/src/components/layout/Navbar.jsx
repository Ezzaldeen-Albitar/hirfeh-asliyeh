'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { toggleSearch } from '@/store/slices/uiSlice';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuth, isArtisan, isAdmin, logout } = useAuth();
  const { count } = useCart();

  const links = [
    { href: '/products',  label: 'المنتجات' },
    { href: '/artisans',  label: 'الحرفيون' },
    { href: '/workshops', label: 'الورش' },
  ];

  return (
    <nav className="topbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">

          {/* Brand */}
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <svg width="38" height="38" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 14L38 30L22 40L6 30L6 14Z" stroke="#B8963C" strokeWidth="1.5" fill="rgba(184,150,60,0.07)"/>
              <circle cx="22" cy="22" r="8" stroke="#7A1C2E" strokeWidth="2" fill="rgba(122,28,46,0.1)"/>
              <circle cx="22" cy="22" r="3" fill="#7A1C2E"/>
            </svg>
            <div>
              <span style={{fontFamily:'var(--font-amiri,Amiri),serif',fontSize:'1.3rem',color:'var(--burgundy)',display:'block',lineHeight:1.1}}>
                حِرفة أصلية
              </span>
              <span style={{fontFamily:'Playfair Display,serif',fontSize:'0.62rem',letterSpacing:'2px',color:'var(--gold)',textTransform:'uppercase'}}>
                Hirfeh Asliyeh
              </span>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`nav-link-ha${pathname.startsWith(l.href) ? ' text-burgundy fw-bold' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Search */}
            <button className="btn btn-sm btn-light border-0 rounded-circle p-2"
              onClick={() => dispatch(toggleSearch())} aria-label="بحث">
              <i className="bi bi-search" style={{color:'var(--warm-gray)'}}/>
            </button>

            {/* Cart */}
            <Link href="/checkout" className="btn btn-sm position-relative"
              style={{border:'1.5px solid var(--gold)',color:'var(--gold)',borderRadius:8,padding:'5px 12px'}}>
              <i className="bi bi-bag"/>
              {count > 0 && (
                <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill"
                  style={{background:'var(--burgundy)',fontSize:'0.6rem'}}>
                  {count}
                </span>
              )}
            </Link>

            {isAuth ? (
              <>
                <NotificationBell />
                <div className="dropdown">
                  <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2"
                    style={{background:'var(--parchment)',border:'1px solid var(--stone)',borderRadius:8,fontSize:'0.85rem'}}
                    data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle text-burgundy"/>
                    <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-start border-0 shadow-sm" style={{borderRadius:12,minWidth:180}}>
                    {isArtisan && (
                      <li><Link className="dropdown-item" href="/dashboard/artisan">
                        <i className="bi bi-speedometer2 me-2 text-burgundy"/>لوحة الحرفي
                      </Link></li>
                    )}
                    {isAdmin && (
                      <li><Link className="dropdown-item" href="/admin">
                        <i className="bi bi-shield-check me-2 text-burgundy"/>لوحة الإدارة
                      </Link></li>
                    )}
                    <li><Link className="dropdown-item" href="/dashboard">
                      <i className="bi bi-person me-2 text-burgundy"/>حسابي
                    </Link></li>
                    <li><Link className="dropdown-item" href="/dashboard/wishlist">
                      <i className="bi bi-heart me-2 text-burgundy"/>المفضلة
                    </Link></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout}>
                        <i className="bi bi-box-arrow-left me-2"/>تسجيل الخروج
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link href="/login"
                className="btn btn-primary btn-sm px-3"
                style={{borderRadius:8,fontWeight:600,fontSize:'0.85rem'}}>
                دخول
              </Link>
            )}

            {/* Mobile toggle */}
            <button className="btn btn-sm btn-light border-0 d-lg-none"
              data-bs-toggle="collapse" data-bs-target="#mobileNav">
              <i className="bi bi-list fs-5"/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="collapse mt-2" id="mobileNav">
          <div className="d-flex flex-column gap-1 pb-2 border-top pt-2" style={{borderColor:'var(--stone)'}}>
            {links.map(l => (
              <Link key={l.href} href={l.href} className="nav-link-ha py-2">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
