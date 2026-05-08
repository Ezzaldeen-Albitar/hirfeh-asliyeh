'use client';
import AuthGuard from '@/components/auth/AuthGuard';
import Image from 'next/image';
import Link from 'next/link';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/store/api/wishlistApi';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/lib/sweetalert';
import StarRating from '@/components/common/StarRating';
import { getPrimaryImageSrc } from '@/lib/imageUtils';

function WishlistPage() {
  const { data, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const { addItem } = useCart();
  const items = data?.data || [];

  const handleRemove = async (productId, name) => {
    try { await removeFromWishlist(productId).unwrap(); toast.success(`تمت إزالة "${name}" من المفضلة`); }
    catch { toast.error('تعذر الإزالة'); }
  };

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`تمت إضافة "${product.name}" إلى السلة ✓`);
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'36px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:4}}>
            <i className="bi bi-heart-fill text-danger me-2"/>المفضلة
          </h1>
          {!isLoading && <small style={{color:'var(--warm-gray)'}}>{items.length} منتج في مفضلتك</small>}
        </div>
      </div>

      <div className="container" style={{padding:'40px 12px 60px'}}>
        {isLoading ? (
          <div className="row g-4">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <div className="ha-card overflow-hidden placeholder-glow">
                  <div className="placeholder w-100" style={{height:220,background:'var(--parchment)'}}/>
                  <div className="p-3"><span className="placeholder col-7 d-block mb-2" style={{height:16}}/></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
            <i className="bi bi-heart fs-1 d-block mb-3" style={{color:'var(--stone)'}}/>
            <h5 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)'}}>مفضلتك فارغة</h5>
            <p style={{fontSize:'0.9rem'}}>ابدأ بإضافة منتجات تعجبك</p>
            <Link href="/products" className="btn btn-primary mt-2" style={{borderRadius:10,fontWeight:700}}>تصفح المنتجات</Link>
          </div>
        ) : (
          <div className="row g-4">
            {items.map(item => {
              const p = item.product || item;
              return (
                <div key={p._id} className="col-6 col-md-4 col-lg-3">
                  <div className="ha-card overflow-hidden h-100">
                    <Link href={`/products/${p._id}`} className="text-decoration-none">
                      <div style={{height:220,overflow:'hidden',position:'relative'}}>
                        <Image src={getPrimaryImageSrc(p.images)} alt={p.name} className="w-100 h-100" fill sizes="(max-width: 768px) 100vw, 50vw" style={{objectFit:"cover",transition:'transform .35s'}}
                          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                        <button
                          onClick={e=>{e.preventDefault();handleRemove(p._id, p.name);}}
                          className="position-absolute top-0 end-0 m-2 btn btn-sm"
                          style={{background:'rgba(255,255,255,.9)',borderRadius:'50%',width:32,height:32,padding:0,border:'none'}}>
                          <i className="bi bi-heart-fill text-danger" style={{fontSize:'0.9rem'}}/>
                        </button>
                      </div>
                    </Link>
                    <div className="p-3">
                      {p.artisan && (
                        <div style={{fontSize:'0.75rem',color:'var(--warm-gray)',marginBottom:4}}>{p.artisan.name}</div>
                      )}
                      <h6 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:4,fontSize:'0.95rem',lineHeight:1.3}}>{p.name}</h6>
                      <StarRating value={p.avgRating||0}/>
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:'var(--burgundy)'}}>
                          {p.price} <small style={{fontSize:'0.68rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
                        </span>
                      </div>
                      <button onClick={()=>handleAddToCart(p)} className="btn btn-primary w-100 mt-2"
                        style={{borderRadius:8,fontWeight:600,fontSize:'0.82rem',padding:'7px'}}>
                        <i className="bi bi-bag-plus me-1"/>أضف للسلة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <WishlistPage />
    </AuthGuard>
  );
}
