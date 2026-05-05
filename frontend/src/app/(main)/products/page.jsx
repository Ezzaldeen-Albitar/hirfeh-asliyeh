'use client';
import { useState } from 'react';
import { useGetProductsQuery } from '@/store/api/productsApi';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/common/Pagination';

const SORT_OPTIONS = [
  { value:'newest',    label:'الأحدث' },
  { value:'price_asc', label:'السعر: الأقل أولاً' },
  { value:'price_desc',label:'السعر: الأعلى أولاً' },
  { value:'rating',    label:'الأعلى تقييماً' },
];

export default function ProductsPage() {
  const [filters, setFilters] = useState({});
  const [sort, setSort]       = useState('newest');
  const [page, setPage]       = useState(1);

  const { data, isLoading } = useGetProductsQuery({ ...filters, sort, page, limit:12 });

  const products    = data?.data    || [];
  const totalPages  = data?.totalPages || 1;
  const totalCount  = data?.total   || 0;

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      {/* Page header */}
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'32px 0'}}>
        <div className="container">
          <nav aria-label="breadcrumb" style={{marginBottom:8}}>
            <ol className="breadcrumb" style={{fontSize:'0.82rem',marginBottom:0}}>
              <li className="breadcrumb-item"><a href="/" style={{color:'var(--warm-gray)',textDecoration:'none'}}>الرئيسية</a></li>
              <li className="breadcrumb-item active" style={{color:'var(--burgundy)'}}>المنتجات</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:0}}>
                استكشف الحرف الأردنية
              </h1>
              {!isLoading && <small style={{color:'var(--warm-gray)'}}>{totalCount} منتج متاح</small>}
            </div>
            <select className="form-select" value={sort} onChange={e=>setSort(e.target.value)}
              style={{width:'auto',borderRadius:8,borderColor:'var(--stone)',fontSize:'0.88rem'}}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container section-py" style={{paddingTop:40,paddingBottom:60}}>
        <div className="row g-4">
          {/* Sidebar filters */}
          <div className="col-lg-3">
            <ProductFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }}/>
          </div>
          {/* Grid */}
          <div className="col-lg-9">
            <ProductGrid products={products} loading={isLoading}/>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
          </div>
        </div>
      </div>
    </div>
  );
}
