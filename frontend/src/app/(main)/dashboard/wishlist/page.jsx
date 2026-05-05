'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/lib/sweetalert';

const MOCK_WISHLIST = [
  { _id:'p1', name:'إبريق طيني هيبروني', price:85,  images:['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75'], artisan:{ name:'خليل الفاحوم' } },
  { _id:'p2', name:'لوح فسيفساء مدني',   price:240, images:['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=75'], artisan:{ name:'عائشة العزيزي' } },
  { _id:'p3', name:'كليم عمّاني منسوج',   price:120, images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75'], artisan:{ name:'فاطمة الحريري' } },
];

export default function WishlistPage() {
  const { addItem } = useCart();
  const [items, setItems] = useState(MOCK_WISHLIST);

  const remove = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
    toast.info('تم الحذف من المفضلة');
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'32px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:0}}>
            <i className="bi bi-heart-fill text-burgundy me-2" style={{fontSize:'1.5rem'}}/>قائمة المفضلة
          </h1>
        </div>
      </div>

      <div className="container" style={{padding:'40px 12px 60px'}}>
        {items.length === 0 ? (
          <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
            <i className="bi bi-heart fs-1 d-block mb-3"/>
            <p className="mb-3">قائمة المفضلة فارغة</p>
            <Link href="/products" className="btn btn-primary" style={{borderRadius:10,fontWeight:700}}>
              استكشف المنتجات
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {items.map(item => (
              <div key={item._id} className="col-sm-6 col-lg-4">
                <div className="ha-card overflow-hidden h-100">
                  <div style={{position:'relative',height:220,overflow:'hidden'}}>
                    <img src={item.images?.[0]} alt={item.name}
                      className="w-100 h-100" style={{objectFit:'cover',transition:'transform .4s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                    <button onClick={()=>remove(item._id)}
                      className="btn btn-sm position-absolute"
                      style={{top:10,left:10,width:34,height:34,borderRadius:'50%',padding:0,
                        background:'rgba(255,255,255,.9)',border:'none',color:'#ef4444',fontSize:'1rem'}}>
                      <i className="bi bi-heart-fill"/>
                    </button>
                  </div>
                  <div className="p-3">
                    <div style={{fontSize:'0.75rem',color:'var(--warm-gray)',marginBottom:4}}>{item.artisan?.name}</div>
                    <h6 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:8}}>{item.name}</h6>
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:'var(--burgundy)'}}>
                        {item.price} <small style={{fontSize:'0.72rem',fontWeight:400,color:'var(--warm-gray)'}}>د.أ</small>
                      </span>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button onClick={()=>{ addItem(item); toast.success(`تمت الإضافة إلى السلة ✓`); }}
                        className="btn btn-primary flex-grow-1"
                        style={{borderRadius:8,fontWeight:600,fontSize:'0.85rem',padding:'8px'}}>
                        <i className="bi bi-bag-plus me-1"/>أضف للسلة
                      </button>
                      <Link href={'/products/'+item._id}
                        className="btn btn-outline-primary"
                        style={{borderRadius:8,padding:'8px 12px'}}>
                        <i className="bi bi-eye"/>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
