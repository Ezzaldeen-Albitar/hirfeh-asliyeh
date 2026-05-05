import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], loading }) {
  if (loading) return (
    <div className="row g-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <div className="ha-card overflow-hidden">
            <div style={{height:230,background:'var(--parchment)'}} className="placeholder-glow">
              <span className="placeholder w-100 h-100"/>
            </div>
            <div className="p-3">
              <span className="placeholder col-8 mb-2 d-block"/>
              <span className="placeholder col-5"/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!products.length) return (
    <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
      <i className="bi bi-inbox fs-1 d-block mb-3"/>
      <p>لا توجد منتجات</p>
    </div>
  );

  return (
    <div className="row g-4">
      {products.map(p => (
        <div key={p._id} className="col-6 col-md-4 col-lg-3">
          <ProductCard product={p}/>
        </div>
      ))}
    </div>
  );
}
