'use client';
import { useState } from 'react';
import { useGetArtisansQuery } from '@/store/api/artisansApi';
import ArtisanCard from '@/components/artisans/ArtisanCard';
import Pagination from '@/components/common/Pagination';

const GOVS = ['الكل','عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','الكرك','العقبة'];
const CRAFTS = ['الكل','السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات'];

const MOCK = [
  { _id:'a1', name:'عائشة العزيزي',  craftSpecialty:'فنانة فسيفساء',  avgRating:4.8, governorate:'إربد',  isVerified:true, yearsExp:20, productsCount:34, coverImage:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=75', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { _id:'a2', name:'خليل الفاحوم',   craftSpecialty:'صانع فخار',       avgRating:5.0, governorate:'عزرق', isVerified:true, yearsExp:40, productsCount:51, coverImage:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=75', avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
  { _id:'a3', name:'فاطمة الحريري',  craftSpecialty:'ماسترة نسيج',    avgRating:4.6, governorate:'مأدبا', isVerified:true, yearsExp:35, productsCount:29, coverImage:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75', avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
  { _id:'a4', name:'يوسف النجار',    craftSpecialty:'نجار خشب',        avgRating:4.3, governorate:'جرش',  isVerified:true, yearsExp:25, productsCount:18, coverImage:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { _id:'a5', name:'ليلى السلطي',    craftSpecialty:'مطرّزة تقليدية', avgRating:4.9, governorate:'عمان',  isVerified:true, yearsExp:15, productsCount:42, coverImage:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=75', avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
  { _id:'a6', name:'سالم البدوي',    craftSpecialty:'صائغ مجوهرات',   avgRating:4.7, governorate:'العقبة',isVerified:true, yearsExp:30, productsCount:23, coverImage:'https://images.unsplash.com/photo-1578598336003-a41a7d9c77ae?w=600&q=75', avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
];

export default function ArtisansPage() {
  const [gov,   setGov]   = useState('الكل');
  const [craft, setCraft] = useState('الكل');
  const [search,setSearch]= useState('');
  const [page,  setPage]  = useState(1);

  const params = { page, limit:12, ...(gov!=='الكل'&&{governorate:gov}), ...(craft!=='الكل'&&{craftSpecialty:craft}), ...(search&&{search}) };
  const { data, isLoading } = useGetArtisansQuery(params);
  const artisans   = data?.data || MOCK;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      {/* Header */}
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'36px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2.2rem',color:'var(--charcoal)',marginBottom:6}}>
            الحرفيون الأردنيون
          </h1>
          <p style={{color:'var(--warm-gray)',fontSize:'0.92rem',margin:0}}>
            تعرّف على أمهر الحرفيين وأصحاب الموهبة الأردنية الأصيلة
          </p>
        </div>
      </div>

      <div className="container" style={{padding:'40px 12px 60px'}}>
        {/* Filters bar */}
        <div className="ha-card p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text" style={{background:'var(--parchment)',borderColor:'var(--stone)'}}>
                  <i className="bi bi-search" style={{color:'var(--warm-gray)'}}/>
                </span>
                <input type="text" className="form-control" placeholder="ابحث عن حرفي..."
                  value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                  style={{borderColor:'var(--stone)',borderRadius:'0 8px 8px 0'}}/>
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={gov} onChange={e=>{setGov(e.target.value);setPage(1);}}
                style={{borderRadius:8,borderColor:'var(--stone)',fontSize:'0.88rem'}}>
                {GOVS.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={craft} onChange={e=>{setCraft(e.target.value);setPage(1);}}
                style={{borderRadius:8,borderColor:'var(--stone)',fontSize:'0.88rem'}}>
                {CRAFTS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="row g-4">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="col-sm-6 col-lg-4">
                <div className="ha-card overflow-hidden placeholder-glow">
                  <div style={{height:200,background:'var(--parchment)'}} className="placeholder w-100"/>
                  <div className="p-3"><span className="placeholder col-8 d-block mb-2"/><span className="placeholder col-5"/></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="row g-4">
              {artisans.map(a=>(
                <div key={a._id} className="col-sm-6 col-lg-4">
                  <ArtisanCard artisan={a}/>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
          </>
        )}
      </div>
    </div>
  );
}
