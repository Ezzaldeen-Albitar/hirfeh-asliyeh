'use client';
import AuthGuard from '@/components/auth/AuthGuard';
import { useState } from 'react';
import { useGetCustomizationsQuery, useSendMessageMutation, useUpdateCustomizationStatusMutation } from '@/store/api/customizationsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/sweetalert';
import CustomizationChat from '@/components/dashboard/CustomizationChat';

function CustomizationsPage() {
  const { isArtisan } = useAuth();
  const { data, isLoading } = useGetCustomizationsQuery();
  const [sendMessage] = useSendMessageMutation();
  const [updateStatus] = useUpdateCustomizationStatusMutation();
  const [active, setActive] = useState(null);
  const customs = data?.data || [];

  const handleSend = async (msg) => {
    if (!active) return;
    try { await sendMessage({ id: active._id, message: msg }).unwrap(); }
    catch { toast.error('تعذر إرسال الرسالة'); }
  };

  const handleStatus = async (id, status) => {
    try { await updateStatus({ id, status }).unwrap(); toast.success('تم تحديث الحالة'); }
    catch { toast.error('تعذر التحديث'); }
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'var(--parchment)',borderBottom:'1px solid var(--gold-pale)',padding:'32px 0'}}>
        <div className="container">
          <h1 style={{fontFamily:'Amiri,serif',fontSize:'2rem',color:'var(--charcoal)',marginBottom:0}}>
            طلبات التخصيص
          </h1>
        </div>
      </div>
      <div className="container" style={{padding:'32px 12px 60px'}}>
        {isLoading ? (
          <div className="text-center py-5"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
        ) : (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="ha-card p-3">
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:14}}>المحادثات</h6>
                {customs.length === 0 ? (
                  <div className="text-center py-4" style={{color:'var(--warm-gray)'}}>
                    <i className="bi bi-chat-square-x fs-2 d-block mb-2"/>لا توجد طلبات
                  </div>
                ) : customs.map(c => (
                  <div key={c._id} onClick={()=>setActive(c)}
                    className="p-3 mb-2 rounded-3"
                    style={{cursor:'pointer',border:`1.5px solid ${active?._id===c._id?'var(--burgundy)':'var(--gold-pale)'}`,
                      background:active?._id===c._id?'rgba(122,28,46,.04)':'#fff'}}>
                    <div className="d-flex justify-content-between mb-1">
                      <strong style={{fontSize:'0.88rem'}}>{isArtisan ? c.customer?.name : c.artisan?.name}</strong>
                      <small style={{color:'var(--warm-gray)'}}>{c.updatedAt?.slice(0,10)}</small>
                    </div>
                    <div style={{fontSize:'0.78rem',color:'var(--warm-gray)',marginBottom:4}}>{c.description?.slice(0,45)}…</div>
                    <span style={{fontSize:'0.68rem',fontWeight:600,padding:'2px 8px',borderRadius:20,
                      background:'var(--parchment)',color:'var(--warm-gray)'}}>{c.status}</span>
                    {isArtisan && c.status==='pending' && (
                      <div className="d-flex gap-1 mt-2" onClick={e=>e.stopPropagation()}>
                        <button className="btn btn-sm py-0" style={{fontSize:'0.72rem',color:'#22c55e',border:'1px solid #22c55e',borderRadius:6}}
                          onClick={()=>handleStatus(c._id,'processing')}>قبول</button>
                        <button className="btn btn-sm py-0" style={{fontSize:'0.72rem',color:'#ef4444',border:'1px solid #ef4444',borderRadius:6}}
                          onClick={()=>handleStatus(c._id,'cancelled')}>رفض</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-8">
              {active
                ? <CustomizationChat messages={active.messages||[]} onSend={handleSend}/>
                : <div className="ha-card p-5 text-center" style={{color:'var(--warm-gray)'}}>
                    <i className="bi bi-chat-dots fs-1 d-block mb-3"/>
                    اختر محادثة للبدء
                  </div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CustomizationsPage />
    </AuthGuard>
  );
}
