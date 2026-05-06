'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { toggleSearch, closeAll } from '@/store/slices/uiSlice';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuth, isArtisan, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const searchOpen = useSelector((s) => s.ui.searchOpen);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef(null);

  const links = [
    { href: '/products', label: 'المنتجات' },
    { href: '/artisans', label: 'الحرفيون' },
    { href: '/workshops', label: 'الورش' },
  ];

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        dispatch(closeAll());
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch(closeAll());
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <>
      <nav className="topbar">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">

            {/* Brand */}
            <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/professional_minimalist_logo_for_hirfeh_asliyeh_1.png"
                alt="Logo"
                width={44}
                height={50}
                style={{ background: 'transparent', display: 'block' }}
              />
              <div>
                <span style={{ fontFamily: 'var(--font-amiri,Amiri),serif', fontSize: '1.3rem', color: 'var(--burgundy)', display: 'block', lineHeight: 1.1 }}>
                  حِرفة أصلية
                </span>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                  Hirfeh Asliyeh
                </span>
              </div>
            </Link>

            {/* Nav links — desktop only */}
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

              {/* Search button — clearly visible on light topbar */}
              <button
                className="btn btn-sm border-0 rounded-circle p-2 navbar-icon-btn"
                onClick={() => dispatch(toggleSearch())}
                aria-label="بحث"
                title="بحث"
                suppressHydrationWarning
              >
                <i className="bi bi-search" />
              </button>

              {/* Cart */}
              <Link href="/checkout" className="btn btn-sm position-relative navbar-cart-btn"
                style={{ border: '1.5px solid var(--gold)', borderRadius: 8, padding: '5px 12px' }}>
                <i className="bi bi-bag" style={{ color: 'var(--gold)' }} />
                {count > 0 && (
                  <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill"
                    style={{ background: 'var(--burgundy)', fontSize: '0.6rem' }}>
                    {count}
                  </span>
                )}
              </Link>

              {isAuth ? (
                <>
                  <NotificationBell />
                  <div className="dropdown">
                    <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2"
                      style={{ background: 'rgba(122,28,46,.08)', border: '1px solid rgba(122,28,46,.2)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--charcoal)' }}
                      data-bs-toggle="dropdown">
                      <i className="bi bi-person-circle text-burgundy" />
                      <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-start border-0 shadow-sm" style={{ borderRadius: 12, minWidth: 180 }}>
                      {isArtisan && (
                        <li><Link className="dropdown-item" href="/dashboard/artisan">
                          <i className="bi bi-speedometer2 me-2 text-burgundy" />لوحة الحرفي
                        </Link></li>
                      )}
                      {isAdmin && (
                        <li><Link className="dropdown-item" href="/admin">
                          <i className="bi bi-shield-check me-2 text-burgundy" />لوحة الإدارة
                        </Link></li>
                      )}
                      <li><Link className="dropdown-item" href="/dashboard">
                        <i className="bi bi-person me-2 text-burgundy" />حسابي
                      </Link></li>
                      <li><Link className="dropdown-item" href="/dashboard/wishlist">
                        <i className="bi bi-heart me-2 text-burgundy" />المفضلة
                      </Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={logout}>
                          <i className="bi bi-box-arrow-left me-2" />تسجيل الخروج
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <Link href="/login"
                  className="btn btn-primary btn-sm px-3"
                  style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' }}>
                  دخول
                </Link>
              )}

              {/* Hamburger — mobile ONLY via d-lg-none */}
              <button
                className="btn btn-sm border-0 d-lg-none navbar-icon-btn"
                data-bs-toggle="collapse"
                data-bs-target="#mobileNav"
                aria-label="القائمة"
                aria-expanded="false"
                aria-controls="mobileNav"
                suppressHydrationWarning
              >
                <i className="bi bi-list fs-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu — hidden by default, shown only on small screens */}
          <div className="collapse mt-2" id="mobileNav">
            <div className="d-flex flex-column gap-1 pb-3 border-top pt-2"
              style={{ borderColor: 'rgba(122,28,46,.15)' }}>
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className={`nav-link-ha py-2${pathname.startsWith(l.href) ? ' text-burgundy fw-bold' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Overlay — full-width dropdown under navbar */}
      {searchOpen && (
        <div
          className="search-overlay-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              dispatch(closeAll());
              setQuery('');
            }
          }}
        >
          <div className="search-overlay-box">
            <div className="container">
              <form onSubmit={handleSearch} className="d-flex align-items-center gap-3">
                <i className="bi bi-search" style={{ color: 'var(--burgundy)', fontSize: '1.1rem', flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-overlay-input"
                  placeholder="ابحث عن منتجات، حرفيين، ورش..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {query && (
                  <button type="button" className="btn btn-sm border-0 p-1"
                    style={{ color: 'var(--warm-gray)', flexShrink: 0 }}
                    onClick={() => setQuery('')}
                    aria-label="مسح">
                    <i className="bi bi-x-lg" />
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4"
                  style={{ borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  بحث
                </button>
                <button
                  type="button"
                  className="btn btn-sm border-0"
                  style={{ color: 'var(--warm-gray)', flexShrink: 0 }}
                  onClick={() => { dispatch(closeAll()); setQuery(''); }}
                  aria-label="إغلاق البحث">
                  <i className="bi bi-x-circle fs-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}