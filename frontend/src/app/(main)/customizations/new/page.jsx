'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCreateCustomizationMutation } from '@/store/api/customizationsApi';
import { toast } from '@/lib/sweetalert';

function NewCustomizationForm() {
  const params  = useSearchParams();
  const router  = useRouter();
  const artisanId = params.get('artisan') || '';
  const [createCustomization, { isLoading }] = useCreateCustomizationMutation();
  const [form, setForm] = useState({ description:'', budget:'', deadline:'', referenceImage:null });
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomization({ artisan: artisanId, ...form }).unwrap();
      toast.success('تم إرسال طلب التخصيص! 🎉');
      router.push('/customizations');
    } catch { toast.error('تعذر إرسال الطلب'); }
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div className="container" style={{padding:'48px 12px 60px',maxWidth:620}}>
        <div className="ha-card p-4 p-md-5">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'1.9rem',color:'var(--charcoal)',marginBottom:6}}>طلب تخصيص جديد</h1>
          <p style={{color:'var(--warm-gray)',marginBottom:28,fontSize:'0.9rem'}}>أخبر الحرفي بما تريد وسيتواصل معك قريباً</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>وصف ما تريد</label>
              <textarea className="form-control" rows={5} required placeholder="اوصف المنتج الذي تريد تخصيصه..."
                value={form.description} onChange={set('description')} style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الميزانية (د.أ)</label>
                <input type="number" className="form-control" value={form.budget} onChange={set('budget')} placeholder="100" style={{borderRadius:8,borderColor:'var(--stone)'}}/>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الموعد المطلوب</label>
                <input type="date" className="form-control" value={form.deadline} onChange={set('deadline')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
              </div>
            </div>
            <div className="mt-4 d-flex gap-3">
              <button type="submit" disabled={isLoading} className="btn btn-primary flex-grow-1 py-3" style={{borderRadius:10,fontWeight:700}}>
                {isLoading ? <span className="spinner-border spinner-border-sm me-2"/> : null}إرسال الطلب
              </button>
              <button type="button" className="btn btn-outline-primary" style={{borderRadius:10}} onClick={()=>router.back()}>إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewCustomizationPage() {
  return <Suspense fallback={<div className="text-center py-5"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>}><NewCustomizationForm/></Suspense>;
}
