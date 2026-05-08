'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetProductQuery } from '@/store/api/productsApi';
import { useGetProductReviewsQuery, useCreateReviewMutation } from '@/store/api/reviewsApi';
import { useAddToWishlistMutation } from '@/store/api/wishlistApi';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';
import ProductImages from '@/components/products/ProductImages';
import OriginStorySection from '@/components/products/OriginStorySection';
import StarRating from '@/components/common/StarRating';

export default function ProductDetailPage() {
  const { id }             = useParams();
  const router             = useRouter();
  const { addItemWithQty } = useCart();
  const { isAuth }         = useAuth();
  const [qty, setQty]         = useState(1);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading, isError }          = useGetProductQuery(id);
  const { data: reviewsData }                 = useGetProductReviewsQuery(id);
  const [createReview, { isLoading: reviewLoading }] = useCreateReviewMutation();
  const [addToWishlist]                       = useAddToWishlistMutation();

  const product = data?.data;
  const reviews = reviewsData?.data || [];

  const handleAddToCart = () => {
    if (!product) return;
    // إضافة المنتج مرة واحدة بالكمية المحددة (بدل loop)
    addItemWithQty(product, qty);
    toast.success(`تمت إضافة "${product.name}" (${qty}) إلى السلة ✓`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItemWithQty(product, qty);
    router.push('/checkout?step=1');
  };

  const handleWishlist = async () => {
    if (!isAuth) { toast.info('يرجى تسجيل الدخول أولاً'); return; }
    try {
      await addToWishlist(id).unwrap();
      toast.success('تمت الإضافة إلى المفضلة ❤️');
    } catch (err) {
      if (err?.data?.message?.includes('already')) toast.info('المنتج موجود في مفضلتك');
      else toast.error('تعذر الإضافة');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('يرجى اختيار تقييم');
    if (!comment.trim()) return toast.error('يرجى كتابة تعليقك');
    if (comment.trim().length < 3) return toast.error('يرجى كتابة 3 أحرف على الأقل في التقييم');
    try {
      await createReview({ productId: id, rating, comment }).unwrap();
      toast.success('تم إضافة تقييمك بنجاح ✓');
      setRating(0); setComment('');
    } catch (err) {
      toast.error(err?.data?.errors?.[0] || err?.data?.message || 'تعذر إضافة التقييم');
    }
  };

  if (isLoading) return (
    <div className="bg-cream">
      <div className="container" style={{ padding: '48px 12px' }}>
        <div className="row g-5">
          <div className="col-lg-5">
            <div className="placeholder-glow">
              <div className="placeholder w-100 rounded-3" style={{ height: 400, background: 'var(--parchment)' }} />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="placeholder-glow">
              <span className="placeholder col-8 d-block mb-3" style={{ height: 36 }} />
              <span className="placeholder col-5 d-block mb-2" style={{ height: 20 }} />
              <span className="placeholder col-3 d-block mb-4" style={{ height: 40 }} />
              <span className="placeholder col-12 d-block mb-2" style={{ height: 14 }} />
              <span className="placeholder col-10 d-block mb-2" style={{ height: 14 }} />
              <span className="placeholder col-9 d-block" style={{ height: 14 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
      <i className="bi bi-box-seam fs-1 d-block mb-3" style={{ color: 'var(--stone)' }} />
      <h5 style={{ fontFamily: 'Amiri,serif', color: 'var(--charcoal)' }}>المنتج غير موجود</h5>
      <Link href="/products" className="btn btn-primary mt-3" style={{ borderRadius: 10 }}>
        العودة للمنتجات
      </Link>
    </div>
  );

  return (
    <div className="bg-cream">
      {/* Breadcrumb */}
      <div style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--gold-pale)', padding: '14px 0' }}>
        <div className="container">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" style={{ color: 'var(--warm-gray)', textDecoration: 'none' }}>الرئيسية</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products" style={{ color: 'var(--warm-gray)', textDecoration: 'none' }}>المنتجات</Link>
            </li>
            {product.artisan && (
              <li className="breadcrumb-item">
                <Link href={`/artisans/${product.artisan._id}`} style={{ color: 'var(--warm-gray)', textDecoration: 'none' }}>
                  {product.artisan.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" style={{ color: 'var(--burgundy)' }}>{product.name}</li>
          </ol>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 12px' }}>
        <div className="row g-5">
          {/* Images */}
          <div className="col-lg-5">
            <ProductImages images={product.images} />
          </div>

          {/* Details */}
          <div className="col-lg-7">
            <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '2.2rem', color: 'var(--charcoal)', lineHeight: 1.2, marginBottom: 8 }}>
              {product.name}
            </h1>

            {/* Artisan card */}
            {product.artisan && (
              <Link href={`/artisans/${product.artisan._id}`}
                className="d-flex align-items-center gap-3 mb-4 text-decoration-none ha-card p-3">
                <div style={{ width: 52, height: 52, borderRadius: 'inherit', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <Image
                    src={product.artisan.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=70'}
                    alt={product.artisan.name}
                    fill
                    sizes="52px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{product.artisan.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--burgundy)' }}>
                    {product.artisan.specialty || product.artisan.craftSpecialty}
                    {product.artisan.yearsExp ? ` · ${product.artisan.yearsExp} سنة خبرة` : ''}
                  </div>
                  <StarRating value={product.artisan.avgRating || 0} />
                </div>
                <i className="bi bi-arrow-left-circle" style={{ color: 'var(--stone)', fontSize: '1.2rem' }} />
              </Link>
            )}

            {/* Price */}
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '2.2rem', fontWeight: 700, color: 'var(--burgundy)', marginBottom: 8 }}>
              <small style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--warm-gray)', marginLeft: 4 }}>د.أ</small>
              {product.price}
              {product.oldPrice && (
                <small style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--stone)', marginRight: 12, textDecoration: 'line-through' }}>
                  {product.oldPrice}
                </small>
              )}
            </div>

            {/* Rating */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <StarRating value={product.avgRating || 0} />
              <small style={{ color: 'var(--warm-gray)' }}>({reviews.length} تقييم)</small>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--warm-gray)', lineHeight: 1.9, marginBottom: 24, fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Stock indicator */}
            {product.stock !== undefined && (
              <div className="mb-3">
                <span style={{
                  fontSize: '0.83rem', fontWeight: 600,
                  color: product.stock > 5 ? '#22c55e' : product.stock > 0 ? '#F59E0B' : '#ef4444'
                }}>
                  <i className={`bi bi-${product.stock > 0 ? 'check-circle' : 'x-circle'} me-1`} />
                  {product.stock > 5
                    ? 'متوفر في المخزون'
                    : product.stock > 0
                    ? `آخر ${product.stock} قطع!`
                    : 'نفذ المخزون'}
                </span>
              </div>
            )}

            {/* Qty + Cart */}
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div className="d-flex align-items-center"
                style={{ border: '1.5px solid var(--stone)', borderRadius: 10, overflow: 'hidden' }}>
                <button className="btn" onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ padding: '8px 16px', color: 'var(--burgundy)', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                <span style={{ padding: '8px 20px', fontWeight: 600, fontSize: '1rem', borderLeft: '1px solid var(--stone)', borderRight: '1px solid var(--stone)' }}>
                  {qty}
                </span>
                <button className="btn" onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  style={{ padding: '8px 16px', color: 'var(--burgundy)', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: 10, fontWeight: 700, padding: '12px 24px', fontSize: '1rem' }}>
                <i className="bi bi-bag-plus" />أضف للسلة
              </button>
              <button onClick={handleWishlist}
                className="btn d-flex align-items-center justify-content-center"
                style={{ borderRadius: 10, padding: '12px 14px', border: '1.5px solid var(--stone)', color: 'var(--warm-gray)' }}>
                <i className="bi bi-heart" />
              </button>
            </div>

            <button type="button" onClick={handleBuyNow} disabled={product.stock === 0}
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ borderRadius: 10, fontWeight: 700, padding: '12px' }}>
              <i className="bi bi-lightning-fill" />اشتر الآن
            </button>

            {/* Tags */}
            <div className="d-flex gap-2 flex-wrap mt-3">
              {product.craftType && <span className="badge-certified">{product.craftType}</span>}
              <span style={{ background: 'rgba(122,28,46,.1)', color: 'var(--burgundy)', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="bi bi-patch-check me-1" />أصيل وموثّق
              </span>
              <span style={{ background: 'rgba(34,197,94,.1)', color: '#16a34a', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="bi bi-truck me-1" />شحن مجاني
              </span>
            </div>
          </div>
        </div>

        {/* Origin Story */}
        <OriginStorySection product={product} />

        {/* Reviews */}
        <div className="mt-5">
          <h3 className="section-title">آراء <span>العملاء</span></h3>
          <div className="gold-divider" style={{ margin: '0 0 32px' }} />

          {/* Review form */}
          {isAuth && (
            <div className="ha-card p-4 mb-4">
              <h6 style={{ fontFamily: 'Amiri,serif', fontSize: '1.1rem', marginBottom: 16 }}>أضف تقييمك</h6>
              <form onSubmit={handleReview}>
                <div className="mb-3">
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, display: 'block' }}>التقييم</label>
                  <StarRating value={rating} size="1.6rem" onChange={setRating} />
                </div>
                <textarea className="form-control mb-3" rows={3}
                  placeholder="اكتب رأيك في هذا المنتج..."
                  value={comment} onChange={e => setComment(e.target.value)}
                  style={{ borderRadius: 8, borderColor: 'var(--stone)', resize: 'none' }} />
                <button type="submit" disabled={reviewLoading} className="btn btn-primary"
                  style={{ borderRadius: 8, fontWeight: 600 }}>
                  {reviewLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  إرسال التقييم
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--warm-gray)' }}>
              <i className="bi bi-chat-square-text fs-2 d-block mb-2" />
              لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج!
            </div>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="ha-card p-4 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex gap-3 align-items-center">
                    {r.user?.avatar
                      ? (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                          <Image src={r.user.avatar} alt="" fill sizes="36px" style={{ objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--burgundy)', fontWeight: 700 }}>
                          {r.user?.name?.[0]}
                        </div>
                      )
                    }
                    <div>
                      <strong style={{ fontSize: '0.92rem' }}>{r.user?.name || 'مستخدم'}</strong>
                      <div className="mt-1"><StarRating value={r.rating} /></div>
                    </div>
                  </div>
                  <small style={{ color: 'var(--warm-gray)' }}>{r.createdAt?.slice(0, 10)}</small>
                </div>
                {r.comment && (
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7 }}>{r.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
