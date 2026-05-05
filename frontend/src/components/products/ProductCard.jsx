'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/lib/sweetalert';
import StarRating from '@/components/common/StarRating';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`تمت إضافة "${product.name}" إلى السلة ✓`);
  };

  return (
    <div className="ha-card h-100 overflow-hidden">
      <Link href={`/products/${product._id}`} className="text-decoration-none">
        {/* Image */}
        <div className="position-relative overflow-hidden" style={{height:230}}>
          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75'}
            alt={product.name}
            className="w-100 h-100"
            style={{objectFit:'cover',transition:'transform .4s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          />
          {/* Certified badge */}
          <span className="badge-certified position-absolute" style={{bottom:10,right:10}}>
            ✓ موثّق
          </span>
          {/* Quick actions */}
          <div className="position-absolute top-0 start-0 p-2 d-flex gap-1"
            style={{opacity:0,transition:'opacity .3s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity=1}
            onMouseLeave={e=>e.currentTarget.style.opacity=0}>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          {/* Artisan */}
          {product.artisan && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src={product.artisan.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&q=70'}
                alt="" style={{width:26,height:26,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--gold-pale)'}}/>
              <small style={{color:'var(--warm-gray)',fontSize:'0.75rem'}}>{product.artisan.name}</small>
            </div>
          )}
          <h6 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:4,lineHeight:1.3}}>
            {product.name}
          </h6>
          <StarRating value={product.avgRating || 0}/>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:'var(--burgundy)',fontWeight:700}}>
              <small style={{fontWeight:400,color:'var(--warm-gray)',fontSize:'0.72rem',marginLeft:3}}>د.أ</small>
              {product.price}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button onClick={handleAddToCart}
          className="btn btn-primary w-100"
          style={{borderRadius:8,fontWeight:600,fontSize:'0.88rem',padding:'8px'}}>
          <i className="bi bi-bag-plus me-2"/>أضف للسلة
        </button>
      </div>
    </div>
  );
}
