'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGetProductsQuery } from '@/store/api/productsApi';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/common/Pagination';
import { normalizeProductCategory, normalizeRegion } from '@/lib/productFilters';

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: الأقل أولاً' },
  { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
  { value: 'rating', label: 'الأعلى تقييماً' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({
    craftType: normalizeProductCategory(searchParams.get('category') || searchParams.get('craftType') || ''),
    governorate: normalizeRegion(searchParams.get('region') || searchParams.get('governorate') || ''),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    artisan: searchParams.get('artisan') || '',
  });

  const query = {
    page,
    sort,
    limit: 12,
    ...(filters.craftType && { category: filters.craftType }),
    ...(filters.governorate && { region: filters.governorate }),
    ...(filters.minPrice && { minPrice: filters.minPrice }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
    ...(filters.search && { search: filters.search }),
    ...(filters.artisan && { artisan: filters.artisan }),
  };

  const { data, isLoading, isFetching } = useGetProductsQuery(query);
  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="bg-cream" style={{ minHeight: '80vh' }}>
      <div
        style={{
          background: 'var(--parchment)',
          borderBottom: '1px solid var(--gold-pale)',
          padding: '32px 0',
        }}
      >
        <div className="container">
          <nav aria-label="breadcrumb" style={{ marginBottom: 8 }}>
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem' }}>
              <li className="breadcrumb-item">
                <Link href="/" style={{ color: 'var(--warm-gray)', textDecoration: 'none' }}>
                  الرئيسية
                </Link>
              </li>
              <li className="breadcrumb-item active" style={{ color: 'var(--burgundy)' }}>
                المنتجات
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1
                style={{
                  fontFamily: 'Amiri,serif',
                  fontSize: '2rem',
                  color: 'var(--charcoal)',
                  marginBottom: 0,
                }}
              >
                استكشف الحرف الأردنية
              </h1>
              {!isLoading && (
                <small style={{ color: 'var(--warm-gray)' }}>
                  {total > 0
                    ? `${total.toLocaleString('ar-EG')} منتج متاح`
                    : 'لا توجد منتجات بهذه المعايير'}
                </small>
              )}
            </div>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              style={{ width: 'auto', borderRadius: 8, borderColor: 'var(--stone)', fontSize: '0.88rem' }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="row g-4">
          <div className="col-lg-3">
            <ProductFilters
              filters={filters}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
            />
          </div>

          <div className="col-lg-9">
            {isLoading || isFetching ? (
              <div className="row g-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="ha-card overflow-hidden placeholder-glow">
                      <div className="placeholder w-100" style={{ height: 220, background: 'var(--parchment)' }} />
                      <div className="p-3">
                        <span className="placeholder col-7 d-block mb-2" style={{ height: 16, borderRadius: 4 }} />
                        <span className="placeholder col-4 d-block mb-3" style={{ height: 14, borderRadius: 4 }} />
                        <span className="placeholder col-12 d-block" style={{ height: 34, borderRadius: 8 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                <i className="bi bi-search fs-1 d-block mb-3" style={{ color: 'var(--stone)' }} />
                <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>لا توجد منتجات</h5>
                <p style={{ fontSize: '0.9rem' }}>جرّب تغيير معايير البحث أو الفلتر</p>
                <button
                  className="btn btn-outline-primary mt-2"
                  style={{ borderRadius: 8 }}
                  onClick={() => {
                    setFilters({
                      craftType: '',
                      governorate: '',
                      minPrice: '',
                      maxPrice: '',
                      search: '',
                      artisan: '',
                    });
                    setPage(1);
                  }}
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {products.map((product) => (
                    <div key={product._id} className="col-6 col-md-4">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: 'var(--burgundy)' }} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
