'use client';
import { useState } from 'react';
import { useGetAdminStatsQuery, useGetAllUsersQuery, useGetAllOrdersQuery, useGetPendingArtisansQuery, useApproveArtisanMutation, useDeleteUserMutation } from '@/store/api/adminApi';
import { useGetAllProductsQuery, useDeleteProductMutation } from '@/store/api/productsApi';
import { toast, confirm } from '@/lib/sweetalert';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrdersTable from '@/components/dashboard/OrdersTable';

const TABS = ['نظرة عامة','المستخدمون','المنتجات','الطلبات','الحرفيون المعلّقون'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const { data: statsData }    = useGetAdminStatsQuery();
  const { data: usersData }    = useGetAllUsersQuery({});
  const { data: ordersData }   = useGetAllOrdersQuery({});
  const { data: productsData } = useGetAllProductsQuery({});
  const { data: pendingData }  = useGetPendingArtisansQuery();
  const [approveArtisan]       = useApproveArtisanMutation();
  const [deleteUser]           = useDeleteUserMutation();
  const [deleteProduct]        = useDeleteProductMutation();

  const stats    = statsData?.data    || { users:1240, artisans:520, orders:3800, revenue:142000 };
  const users    = usersData?.data    || [];
  const orders   = ordersData?.data   || [];
  const products = productsData?.data || [];
  const pending  = pendingData?.data  || [];

  const handleApprove = async (id, name) => {
    try { await approveArtisan(id).unwrap(); toast.success(`تم قبول ${name}`); }
    catch { toast.error('تعذر القبول'); }
  };

  const handleDeleteUser = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟`, text:'لا يمكن التراجع' });
    if (!isConfirmed) return;
    try { await deleteUser(id).unwrap(); toast.success('تم حذف المستخدم'); }
    catch { toast.error('تعذر الحذف'); }
  };

  const handleDeleteProduct = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟` });
    if (!isConfirmed) return;
    try { await deleteProduct(id).unwrap(); toast.success('تم حذف المنتج'); }
    catch { toast.error('تعذر الحذف'); }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--cream)'}}>
      {/* Admin header */}
      <div style={{background:'linear-gradient(135deg,var(--sidebar-bg),#3D2518)',padding:'24px 0'}}>
        <div className="container d-flex align-items-center gap-3">
          <div style={{width:44,height:44,borderRadius:12,background:'rgba(184,150,60,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className="bi bi-shield-check" style={{color:'var(--gold-light)',fontSize:'1.2rem'}}/>
          </div>
          <div>
            <h1 style={{fontFamily:'Amiri,serif',fontSize:'1.5rem',color:'#fff',margin:0}}>لوحة الإدارة</h1>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,.55)'}}>حِرفة أصلية — Admin</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'#fff',borderBottom:'1px solid var(--gold-pale)',position:'sticky',top:0,zIndex:100}}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto" style={{scrollbarWidth:'none'}}>
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)}
                className="btn"
                style={{padding:'14px 18px',borderRadius:0,whiteSpace:'nowrap',
                  borderBottom:`2.5px solid ${tab===i?'var(--burgundy)':'transparent'}`,
                  color:tab===i?'var(--burgundy)':'var(--warm-gray)',
                  fontWeight:tab===i?700:500,fontSize:'0.88rem',transition:'all .2s'}}>
                {t}
                {t==='الحرفيون المعلّقون' && pending.length>0 && (
                  <span className="badge rounded-pill ms-2" style={{background:'var(--burgundy)',fontSize:'0.65rem'}}>{pending.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{padding:'32px 12px 60px'}}>
        {/* Tab 0: Overview */}
        {tab===0 && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-6 col-lg-3"><StatsCard title="إجمالي المستخدمين" value={stats.users?.toLocaleString()}    change="+12%" icon="people-fill"     color="#3b82f6"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الحرفيون"           value={stats.artisans?.toLocaleString()}  change="+8%"  icon="tools"            color="var(--burgundy)"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="إجمالي الطلبات"    value={stats.orders?.toLocaleString()}    change="+22%" icon="bag-check-fill"   color="#22c55e"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الإيرادات (د.أ)"   value={stats.revenue?.toLocaleString()}   change="+18%" icon="cash-coin"        color="var(--gold)"/></div>
            </div>
            <RevenueChart/>
          </>
        )}

        {/* Tab 1: Users */}
        {tab===1 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom" style={{borderColor:'var(--gold-pale)'}}>
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>إدارة المستخدمين</h5>
            </div>
            {users.length===0 ? (
              <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
                <i className="bi bi-people fs-1 d-block mb-2"/>لا توجد بيانات
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{fontSize:'0.87rem'}}>
                  <thead>
                    <tr style={{background:'var(--parchment)'}}>
                      {['الاسم','الهاتف','الدور','تاريخ الانضمام','إجراءات'].map(h=>(
                        <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.76rem'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                        <td className="px-3 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div style={{width:34,height:34,borderRadius:'50%',background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <i className="bi bi-person" style={{color:'var(--burgundy)'}}/>
                            </div>
                            <div style={{fontWeight:600}}>{u.name}</div>
                          </div>
                        </td>
                        <td className="px-3" style={{color:'var(--warm-gray)'}}>{u.phone}</td>
                        <td className="px-3">
                          <span style={{fontSize:'0.74rem',fontWeight:600,padding:'3px 10px',borderRadius:20,
                            background:u.role==='admin'?'rgba(122,28,46,.12)':u.role==='artisan'?'rgba(184,150,60,.15)':'rgba(59,130,246,.1)',
                            color:u.role==='admin'?'var(--burgundy)':u.role==='artisan'?'var(--gold)':'#3b82f6'}}>
                            {u.role==='admin'?'مدير':u.role==='artisan'?'حرفي':'عميل'}
                          </span>
                        </td>
                        <td className="px-3" style={{color:'var(--warm-gray)',fontSize:'0.8rem'}}>{u.createdAt?.slice(0,10)}</td>
                        <td className="px-3">
                          <button onClick={()=>handleDeleteUser(u._id,u.name)}
                            className="btn btn-sm" style={{color:'#ef4444',border:'1px solid #ef4444',borderRadius:6,padding:'3px 10px',fontSize:'0.78rem'}}>
                            <i className="bi bi-trash3"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products */}
        {tab===2 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom" style={{borderColor:'var(--gold-pale)'}}>
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>إدارة المنتجات</h5>
            </div>
            {products.length===0 ? (
              <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>لا توجد منتجات</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{fontSize:'0.87rem'}}>
                  <thead>
                    <tr style={{background:'var(--parchment)'}}>
                      {['المنتج','الحرفي','السعر','التقييم','الحالة','إجراءات'].map(h=>(
                        <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.76rem'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p=>(
                      <tr key={p._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                        <td className="px-3 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <img src={p.images?.[0]||'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=50&q=60'} style={{width:40,height:40,borderRadius:8,objectFit:'cover'}}/>
                            <span style={{fontWeight:600}}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-3" style={{color:'var(--warm-gray)'}}>{p.artisan?.name}</td>
                        <td className="px-3"><strong style={{color:'var(--burgundy)'}}>{p.price} د.أ</strong></td>
                        <td className="px-3">{p.avgRating||'—'} ★</td>
                        <td className="px-3">
                          <span style={{fontSize:'0.74rem',fontWeight:600,padding:'3px 10px',borderRadius:20,
                            background:p.isActive?'#F0FDF4':'#FEF2F2',color:p.isActive?'#22c55e':'#ef4444'}}>
                            {p.isActive?'نشط':'معطّل'}
                          </span>
                        </td>
                        <td className="px-3">
                          <button onClick={()=>handleDeleteProduct(p._id,p.name)}
                            className="btn btn-sm" style={{color:'#ef4444',border:'1px solid #ef4444',borderRadius:6,padding:'3px 10px',fontSize:'0.78rem'}}>
                            <i className="bi bi-trash3"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Orders */}
        {tab===3 && (
          <div className="ha-card p-4">
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>جميع الطلبات</h5>
            <OrdersTable orders={orders}/>
          </div>
        )}

        {/* Tab 4: Pending Artisans */}
        {tab===4 && (
          <div className="ha-card p-4">
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>
              <i className="bi bi-person-check text-burgundy me-2"/>الحرفيون بانتظار الموافقة
            </h5>
            {pending.length===0 ? (
              <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
                <i className="bi bi-check-circle fs-1 d-block mb-3 text-success"/>
                لا يوجد حرفيون معلّقون
              </div>
            ) : (
              <div className="row g-3">
                {pending.map(a=>(
                  <div key={a._id} className="col-md-6">
                    <div style={{border:'1.5px solid var(--gold-pale)',borderRadius:14,padding:20,background:'#fff'}}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{width:50,height:50,borderRadius:'50%',background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <i className="bi bi-person" style={{color:'var(--burgundy)',fontSize:'1.3rem'}}/>
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:'0.95rem'}}>{a.name}</div>
                          <div style={{fontSize:'0.8rem',color:'var(--burgundy)'}}>{a.craftSpecialty}</div>
                          <div style={{fontSize:'0.75rem',color:'var(--warm-gray)'}}><i className="bi bi-geo-alt-fill" style={{fontSize:'0.65rem'}}/> {a.governorate}</div>
                        </div>
                      </div>
                      {a.bio && <p style={{fontSize:'0.82rem',color:'var(--warm-gray)',lineHeight:1.7,marginBottom:12}}>{a.bio?.slice(0,100)}…</p>}
                      <div className="d-flex gap-2">
                        <button onClick={()=>handleApprove(a._id, a.name)}
                          className="btn flex-grow-1" style={{background:'#22c55e',color:'#fff',borderRadius:8,fontWeight:700,fontSize:'0.85rem',border:'none'}}>
                          <i className="bi bi-check-lg me-1"/>قبول
                        </button>
                        <button className="btn" style={{border:'1px solid #ef4444',color:'#ef4444',borderRadius:8,fontWeight:700,fontSize:'0.85rem'}}>
                          <i className="bi bi-x-lg me-1"/>رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
