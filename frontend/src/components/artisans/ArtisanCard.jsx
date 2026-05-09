'use client';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/components/common/StarRating';
import { getArtisanCoverSrc } from '@/lib/artisanCraftImages';

export default function ArtisanCard({ artisan }) {
  return (
    <div className="ha-card overflow-hidden h-100">
      <div className="position-relative" style={{ height: 200 }}>
        <Image
          src={getArtisanCoverSrc(artisan.coverImage, artisan.craftSpecialty)}
          alt={artisan.name || 'حرفي'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
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
          <Image
            src={artisan.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=70'}
            alt=""
            fill
            sizes="60px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

      <div className="p-3 pt-5">
        <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)', marginBottom: 2 }}>
          {artisan.name}
        </h5>
        <div style={{ fontSize: '0.8rem', color: 'var(--burgundy)', fontWeight: 600, marginBottom: 4 }}>
          {artisan.craftSpecialty}
        </div>
        <StarRating value={artisan.avgRating || 0} />
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
            {artisan.productsCount || 0} منتج
          </span>
          <span>
            <i className="bi bi-award me-1 text-gold" />
            {artisan.yearsExp || 0} سنة خبرة
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
