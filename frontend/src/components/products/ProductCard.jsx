'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAddToWishlistMutation } from '@/store/api/wishlistApi';
import { toast } from '@/lib/sweetalert';
import StarRating from '@/components/common/StarRating';

export default function ProductCard({ product }) {
  const { addItem }  = useCart();
  const { isAuth }   = useAuth();
  const [addToWishlist] = useAddToWishlistMutation();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`تمت إضافة "${product.name}" إلى السلة ✓`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.info('يرجى تسجيل الدخول أولاً'); return; }
    try {
      await addToWishlist(product._id).unwrap();
      toast.success('تمت الإضافة إلى المفضلة ❤️');
    } catch (err) {
      if (err?.data?.message?.includes('already')) toast.info('المنتج موجود في مفضلتك بالفعل');
      else toast.error('تعذر الإضافة للمفضلة');
    }
  };

  const imgSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75';

  return (
    <div className="ha-card h-100 overflow-hidden d-flex flex-column">
      <Link href={`/products/${product._id}`} className="text-decoration-none flex-grow-1 d-flex flex-column">
        {/* Image */}
        <div className="position-relative overflow-hidden" style={{height:230,flexShrink:0}}>
          <Image
            src={imgSrc}
            alt={product.name || 'منتج'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{objectFit:'cover',transition:'transform .4s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          />
          <span className="badge-certified position-absolute" style={{bottom:10,right:10}}>✓ موثّق</span>
          <button onClick={handleWishlist}
            className="position-absolute btn btn-sm"
            style={{top:8,left:8,background:'rgba(255,255,255,.9)',borderRadius:'50%',width:32,height:32,padding:0,border:'none',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
            <i className="bi bi-heart" style={{color:'var(--burgundy)',fontSize:'0.85rem'}}/>
          </button>
          {product.stock === 0 && (
            <div className="position-absolute d-flex align-items-center justify-content-center"
              style={{inset:0,background:'rgba(0,0,0,.45)',zIndex:1}}>
              <span className="badge fs-6" style={{background:'#ef4444'}}>نفذ المخزون</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3 flex-grow-1 d-flex flex-column">
          {product.artisan && (
            <div className="d-flex align-items-center gap-2 mb-2">
              {product.artisan.avatar && (
                <div style={{width:24,height:24,borderRadius:'50%',overflow:'hidden',border:'1.5px solid var(--gold-pale)',flexShrink:0,position:'relative'}}>
                  <Image
                    src={product.artisan.avatar}
                    alt=""
                    fill
                    sizes="24px"
                    style={{objectFit:'cover'}}
                  />
                </div>
              )}
              <small style={{color:'var(--warm-gray)',fontSize:'0.73rem'}}>{product.artisan.name}</small>
            </div>
          )}
          <h6 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:4,lineHeight:1.3,fontSize:'0.96rem'}}>
            {product.name}
          </h6>
          <div className="mt-auto">
            <StarRating value={product.avgRating||0}/>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:'var(--burgundy)',fontWeight:700}}>
                <small style={{fontWeight:400,color:'var(--warm-gray)',fontSize:'0.7rem',marginLeft:2}}>د.أ</small>
                {product.price}
              </span>
              {product.craftType && (
                <span style={{fontSize:'0.68rem',background:'var(--parchment)',color:'var(--warm-gray)',borderRadius:20,padding:'2px 8px'}}>
                  {product.craftType}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn btn-primary w-100"
          style={{borderRadius:8,fontWeight:600,fontSize:'0.88rem',padding:'8px'}}>
          {product.stock === 0
            ? <><i className="bi bi-x-circle me-2"/>نفذ المخزون</>
            : <><i className="bi bi-bag-plus me-2"/>أضف للسلة</>
          }
        </button>
      </div>
    </div>
  );
}
