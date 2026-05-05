'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetProductQuery } from '@/store/api/productsApi';
import { useGetProductReviewsQuery, useCreateReviewMutation } from '@/store/api/reviewsApi';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';
import ProductImages from '@/components/products/ProductImages';
import OriginStorySection from '@/components/products/OriginStorySection';
import StarRating from '@/components/common/StarRating';

/* Fallback product */
const FALLBACK = {
  _id:'demo', name:'إبريق طيني هيبروني', price:85, avgRating:5,
  description:'إبريق طيني فريد يجسّد التراث الغني لصناعة الفخار الحبروني، المتوارثة عبر الأجيال.',
  craftType:'فخار', images:['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80'],
  artisan:{ _id:'a1', name:'خليل الفاحوم', specialty:'نفخ الزجاج', yearsExp:40, avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=70' },
};

export default function ProductDetailPage() {
  const { id }    = useParams();
  const { addItem } = useCart();
  const { isAuth } = useAuth();
  const [qty, setQty]   = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useGetProductQuery(id);
  const { data: reviewsData } = useGetProductReviewsQuery(id);
  const [createReview, { isLoading: reviewLoading }] = useCreateReviewMutation();

  const product = data?.data || FALLBACK;
  const reviews = reviewsData?.data || [];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`تمت إضافة "${product.name}" (${qty}) إلى السلة ✓`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('يرجى اختيار تقييم');
    try {
      await createReview({ productId: id, rating, comment }).unwrap();
      toast.success('تم إضافة تقييمك بنجاح');
      setRating(0); setComment('');
    } catch { toast.error('تعذر إضافة التقييم'); }
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height:'60vh'}}>
      <div className="spinner-border" style={{color:'var(--burgundy)'}}/>
    </div>
  );

  return (
    <div className="bg-cream">
      {/* Breadcrumb */}
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'14px 0'}}>
        <div className="container">
          <ol className="breadcrumb mb-0" style={{fontSize:'0.82rem'}}>
            <li className="breadcrumb-item"><Link href="/" style={{color:'var(--warm-gray)',textDecoration:'none'}}>الرئيسية</Link></li>
            <li className="breadcrumb-item"><Link href="/products" style={{color:'var(--warm-gray)',textDecoration:'none'}}>المنتجات</Link></li>
            {product.artisan && (
              <li className="breadcrumb-item">
                <Link href={`/artisans/${product.artisan._id}`} style={{color:'var(--warm-gray)',textDecoration:'none'}}>
                  {product.artisan.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" style={{color:'var(--burgundy)'}}>{product.name}</li>
          </ol>
        </div>
      </div>

      <div className="container" style={{padding:'48px 12px'}}>
        <div className="row g-5">
          {/* Images */}
          <div className="col-lg-5">
            <ProductImages images={product.images}/>
          </div>

          {/* Details */}
          <div className="col-lg-7">
            <h1 style={{fontFamily:'Amiri,serif',fontSize:'2.2rem',color:'var(--charcoal)',lineHeight:1.2,marginBottom:8}}>
              {product.name}
            </h1>

            {/* Artisan */}
            {product.artisan && (
              <Link href={`/artisans/${product.artisan._id}`}
                className="d-flex align-items-center gap-3 mb-4 text-decoration-none ha-card p-3"
                style={{display:'inline-flex !important'}}>
                <img src={product.artisan.avatar}
                  style={{width:50,height:50,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--gold)'}}/>
                <div>
                  <div style={{fontWeight:600,color:'var(--charcoal)'}}>{product.artisan.name}</div>
                  <div style={{fontSize:'0.8rem',color:'var(--burgundy)'}}>{product.artisan.specialty} · {product.artisan.yearsExp} سنة خبرة</div>
                  <StarRating value={product.avgRating || 0}/>
                </div>
              </Link>
            )}

            {/* Price */}
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:700,color:'var(--burgundy)',marginBottom:16}}>
              <small style={{fontSize:'1rem',fontWeight:400,color:'var(--warm-gray)',marginLeft:4}}>د.أ</small>
              {product.price}
            </div>

            {/* Description */}
            <p style={{color:'var(--warm-gray)',lineHeight:1.9,marginBottom:24,fontSize:'0.95rem'}}>
              {product.description}
            </p>

            {/* Qty + Cart */}
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div className="d-flex align-items-center" style={{border:'1.5px solid var(--stone)',borderRadius:10,overflow:'hidden'}}>
                <button className="btn" onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{padding:'8px 16px',color:'var(--burgundy)',fontWeight:700,fontSize:'1.1rem'}}>−</button>
                <span style={{padding:'8px 20px',fontWeight:600,fontSize:'1rem',borderLeft:'1px solid var(--stone)',borderRight:'1px solid var(--stone)'}}>
                  {qty}
                </span>
                <button className="btn" onClick={() => setQty(q => q+1)}
                  style={{padding:'8px 16px',color:'var(--burgundy)',fontWeight:700,fontSize:'1.1rem'}}>+</button>
              </div>
              <button onClick={handleAddToCart}
                className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                style={{borderRadius:10,fontWeight:700,padding:'12px 24px',fontSize:'1rem'}}>
                <i className="bi bi-bag-plus"/>أضف للسلة
              </button>
              <Link href={`/checkout`}
                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                style={{borderRadius:10,fontWeight:700,padding:'12px 20px'}}>
                <i className="bi bi-lightning-fill"/>اشتر الآن
              </Link>
            </div>

            {/* Tags */}
            <div className="d-flex gap-2 flex-wrap mt-3">
              <span className="badge-certified">{product.craftType || 'حرفة يدوية'}</span>
              <span style={{background:'rgba(122,28,46,.1)',color:'var(--burgundy)',borderRadius:20,padding:'3px 12px',fontSize:'0.75rem',fontWeight:600}}>
                <i className="bi bi-patch-check me-1"/>أصيل وموثّق
              </span>
              <span style={{background:'rgba(34,197,94,.1)',color:'#16a34a',borderRadius:20,padding:'3px 12px',fontSize:'0.75rem',fontWeight:600}}>
                <i className="bi bi-truck me-1"/>شحن مجاني
              </span>
            </div>
          </div>
        </div>

        {/* Origin Story */}
        <OriginStorySection product={product}/>

        {/* Reviews */}
        <div className="mt-5">
          <h3 className="section-title">آراء <span>العملاء</span></h3>
          <div className="gold-divider" style={{margin:'0 0 32px'}}/>

          {/* Review form */}
          {isAuth && (
            <div className="ha-card p-4 mb-4">
              <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>أضف تقييمك</h6>
              <form onSubmit={handleReview}>
                <div className="mb-3">
                  <label style={{fontSize:'0.85rem',fontWeight:500,marginBottom:8,display:'block'}}>التقييم</label>
                  <StarRating value={rating} size="1.4rem" onChange={setRating}/>
                </div>
                <textarea className="form-control mb-3" rows={3} placeholder="اكتب رأيك في هذا المنتج..."
                  value={comment} onChange={e => setComment(e.target.value)}
                  style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                <button type="submit" disabled={reviewLoading}
                  className="btn btn-primary" style={{borderRadius:8,fontWeight:600}}>
                  {reviewLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                  إرسال التقييم
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-4" style={{color:'var(--warm-gray)'}}>
              <i className="bi bi-chat-square-text fs-2 d-block mb-2"/>لا توجد تقييمات بعد
            </div>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="ha-card p-4 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong style={{fontSize:'0.92rem'}}>{r.user?.name}</strong>
                    <div className="mt-1"><StarRating value={r.rating}/></div>
                  </div>
                  <small style={{color:'var(--warm-gray)'}}>{r.createdAt?.slice(0,10)}</small>
                </div>
                <p style={{margin:0,fontSize:'0.88rem',color:'var(--warm-gray)',lineHeight:1.7}}>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
