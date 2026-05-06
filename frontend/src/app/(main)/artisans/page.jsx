'use client';
import { useState } from 'react';
import { useGetArtisansQuery } from '@/store/api/artisansApi';
import ArtisanCard from '@/components/artisans/ArtisanCard';
import Pagination from '@/components/common/Pagination';

const GOVS   = ['الكل','عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','العقبة'];
const CRAFTS = ['الكل','السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج'];

export default function ArtisansPage() {
  const [gov,    setGov]    = useState('الكل');
  const [craft,  setCraft]  = useState('الكل');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const params = {
    page, limit: 12,
    ...(gov   !== 'الكل' && { governorate:   gov }),
    ...(craft !== 'الكل' && { craftSpecialty: craft }),
    ...(search && { search }),
  };

  const { data, isLoading, isFetching } = useGetArtisansQuery(params);
  const artisans   = data?.data       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'36px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2.2rem',color:'var(--charcoal)',marginBottom:6}}>الحرفيون الأردنيون</h1>
          <p style={{color:'var(--warm-gray)',fontSize:'0.92rem',margin:0}}>
            {!isLoading && total > 0 ? `${total.toLocaleString('ar-EG')} حرفي موثّق` : 'تعرّف على أمهر الحرفيين وأصحاب الموهبة الأردنية الأصيلة'}
          </p>
        </div>
      </div>

      <div className="container" style={{padding:'40px 12px 60px'}}>
        {/* Filters */}
        <div className="ha-card p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text" style={{background:'var(--parchment)',borderColor:'var(--stone)'}}>
                  <i className="bi bi-search" style={{color:'var(--warm-gray)'}}/>
                </span>
                <input type="text" className="form-control" placeholder="ابحث عن حرفي بالاسم أو الحرفة..."
                  value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                  style={{borderColor:'var(--stone)'}}/>
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
        {isLoading || isFetching ? (
          <div className="row g-4">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="col-sm-6 col-lg-4">
                <div className="ha-card overflow-hidden placeholder-glow">
                  <div style={{height:200,background:'var(--parchment)'}} className="placeholder w-100"/>
                  <div className="p-3 pt-5">
                    <span className="placeholder col-7 d-block mb-2" style={{height:18,borderRadius:4}}/>
                    <span className="placeholder col-5 d-block mb-2" style={{height:14,borderRadius:4}}/>
                    <span className="placeholder col-12 d-block" style={{height:34,borderRadius:8}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
            <i className="bi bi-people fs-1 d-block mb-3" style={{color:'var(--stone)'}}/>
            <h5 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)'}}>لا يوجد حرفيون بهذه المعايير</h5>
            <button className="btn btn-outline-primary mt-2" style={{borderRadius:8}}
              onClick={()=>{setGov('الكل');setCraft('الكل');setSearch('');setPage(1);}}>
              مسح الفلاتر
            </button>
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
