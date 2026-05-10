'use client';
import Link from 'next/link';
import StarRating from '@/components/common/StarRating';

export default function ArtisanCard({ artisan }) {
  const rating = artisan.avgRating ?? artisan.rating ?? 0;
  const productsCount = artisan.productsCount ?? artisan.totalProducts ?? 0;
  const yearsOfExperience = artisan.yearsExp ?? artisan.yearsOfExperience ?? 0;
  const coverImage = typeof artisan.coverImage === 'string' ? artisan.coverImage.trim() : '';
  const avatar = typeof artisan.avatar === 'string' ? artisan.avatar.trim() : '';

  return (
    <div className="ha-card overflow-hidden h-100">
      <div className="position-relative" style={{ height: 200 }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={artisan.name || 'حرفي'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100" style={{ background: 'var(--parchment)', color: 'var(--stone)' }}>
            <i className="bi bi-image fs-1" />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top,rgba(44,37,32,.7) 0%,transparent 60%)',
          }}
        />

        {artisan.isVerified && (
          <span className="badge-certified position-absolute" style={{ top: 10, right: 10, zIndex: 1 }}>
            <i className="bi bi-patch-check-fill me-1" />
            معتمد
          </span>
        )}

        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--gold)',
            position: 'absolute',
            bottom: -24,
            right: 20,
            zIndex: 1,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100" style={{ background: '#fff', color: 'var(--stone)' }}>
              <i className="bi bi-person" />
            </div>
          )}
        </div>
      </div>

      <div className="p-3 pt-5">
        <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)', marginBottom: 2 }}>
          {artisan.name}
        </h5>
        <div style={{ fontSize: '0.8rem', color: 'var(--burgundy)', fontWeight: 600, marginBottom: 4 }}>
          {artisan.craftSpecialty}
        </div>
        <StarRating value={rating} />
        <div
          className="d-flex align-items-center gap-1 mt-2 mb-3"
          style={{ fontSize: '0.8rem', color: 'var(--warm-gray)' }}
        >
          <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '0.72rem' }} />
          {artisan.governorate}، الأردن
        </div>
        <div className="d-flex gap-3 mb-3" style={{ fontSize: '0.8rem', color: 'var(--warm-gray)' }}>
          <span>
            <i className="bi bi-box-seam me-1 text-gold" />
            {productsCount} منتج
          </span>
          <span>
            <i className="bi bi-award me-1 text-gold" />
            {yearsOfExperience} سنة خبرة
          </span>
        </div>
        <Link
          href={`/artisans/${artisan._id}`}
          className="btn btn-primary w-100"
          style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', padding: '8px' }}
        >
          اعرف قصته
        </Link>
      </div>
    </div>
  );
}
