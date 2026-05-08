'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectRole, selectIsAuth } from '@/store/slices/authSlice';
import {
  useGetAdminStatsQuery, useGetAllUsersQuery, useGetPendingArtisansQuery,
  useApproveArtisanMutation, useDeleteUserMutation, useUpdateUserRoleMutation,
  useGetAllOrdersQuery, useGetAllAdminProductsQuery
} from '@/store/api/adminApi';
import { useDeleteProductMutation } from '@/store/api/productsApi';
import { useUpdateOrderStatusMutation } from '@/store/api/ordersApi';
import { toast, confirm } from '@/lib/sweetalert';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrdersTable from '@/components/dashboard/OrdersTable';

const TABS = ['نظرة عامة', 'المستخدمون', 'المنتجات', 'الطلبات', 'الحرفيون المعلّقون'];
const ROLES = ['customer', 'artisan', 'admin'];

export default function AdminDashboard() {
  const router  = useRouter();
  const role    = useSelector(selectRole);
  const isAuth  = useSelector(selectIsAuth);
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');

  // ✅ All hooks BEFORE any early return
  const { data: statsData }    = useGetAdminStatsQuery();
  const { data: usersData }    = useGetAllUsersQuery({ search });
  const { data: ordersData }   = useGetAllOrdersQuery({});
  const { data: productsData } = useGetAllAdminProductsQuery({});
  const { data: pendingData }  = useGetPendingArtisansQuery();

  const [approveArtisan] = useApproveArtisanMutation();
  const [deleteUser]     = useDeleteUserMutation();
  const [updateRole]     = useUpdateUserRoleMutation();
  const [deleteProduct]  = useDeleteProductMutation();
  const [updateStatus]   = useUpdateOrderStatusMutation();

  // Client-side guard: redirect if not admin
  useEffect(() => {
    if (isAuth === false || (role && role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [role, isAuth, router]);

  // ✅ Early return AFTER all hooks
  if (!isAuth || role !== 'admin') {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)'}}>
        <div style={{textAlign:'center'}}>
          <div className="spinner-border" style={{color:'var(--burgundy)'}} role="status"/>
          <div style={{marginTop:12,color:'var(--warm-gray)',fontFamily:'Tajawal,sans-serif'}}>جاري التحقق...</div>
        </div>
      </div>
    );
  }

  const stats    = statsData?.data;
  const users    = usersData?.data    || [];
  const orders   = ordersData?.data   || [];
  const products = productsData?.data || [];
  const pending  = pendingData?.data  || [];

  const handleApprove = async (id, name) => {
    try { 
      await approveArtisan(id).unwrap(); 
      toast.success(`✓ تم قبول ${name}`); 
    }
    catch (err) { 
      console.error(err);
      toast.error('تعذر القبول - تأكد من وجود المسار في السيرفر'); 
    }
  };

  const handleDeleteUser = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟`, text:'لا يمكن التراجع', confirmButtonText:'حذف', confirmButtonColor:'#ef4444' });
    if (!isConfirmed) return;
    try { await deleteUser(id).unwrap(); toast.success('تم حذف المستخدم'); }
    catch { toast.error('تعذر الحذف'); }
  };

  const handleDeleteProduct = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟`, confirmButtonText:'حذف', confirmButtonColor:'#ef4444' });
    if (!isConfirmed) return;
    try { await deleteProduct(id).unwrap(); toast.success('تم حذف المنتج'); }
    catch { toast.error('تعذر الحذف'); }
  };

  const handleRoleChange = async (id, role) => {
    try { await updateRole({ id, role }).unwrap(); toast.success('تم تغيير الدور'); }
    catch { toast.error('تعذر التغيير'); }
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
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,.55)'}}>حِرفة أصلية — Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'#fff',borderBottom:'1px solid var(--gold-pale)',position:'sticky',top:0,zIndex:100}}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto" style={{scrollbarWidth:'none'}}>
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)} className="btn"
                style={{padding:'14px 18px',borderRadius:0,whiteSpace:'nowrap',
                  borderBottom:`2.5px solid ${tab===i?'var(--burgundy)':'transparent'}`,
                  color:tab===i?'var(--burgundy)':'var(--warm-gray)',fontWeight:tab===i?700:500,fontSize:'0.88rem',transition:'all .2s'}}>
                {t}
                {t==='الحرفيون المعلّقون' && pending.length>0 && (
                  <span className="badge rounded-pill ms-2" style={{background:'#ef4444',fontSize:'0.65rem'}}>{pending.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{padding:'32px 12px 60px'}}>

        {/* ── Tab 0: Overview ── */}
        {tab===0 && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-6 col-lg-3"><StatsCard title="المستخدمون" value={stats?.users?.toLocaleString('ar-EG')||users.length||'—'} change={stats?.usersChange||'+0%'} icon="people-fill" color="#3b82f6"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الحرفيون" value={stats?.artisans?.toLocaleString('ar-EG')||'—'} change={stats?.artisansChange||'+0%'} icon="tools" color="var(--gold)"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الطلبات الكلية" value={stats?.orders?.toLocaleString('ar-EG')||orders.length||'—'} change={stats?.ordersChange||'+0%'} icon="bag-check-fill" color="#22c55e"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="إجمالي الإيرادات" value={stats?.revenue ? `${stats.revenue.toLocaleString('ar-EG')} د.أ` : '—'} change={stats?.revenueChange||'+0%'} icon="currency-dollar" color="var(--burgundy)"/></div>
            </div>
            <RevenueChart data={statsData?.revenueChart}/>
          </>
        )}

        {/* ── Tab 1: Users ── */}
        {tab===1 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3" style={{borderColor:'var(--gold-pale)'}}>
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                <i className="bi bi-people-fill text-burgundy me-2"/>إدارة المستخدمين
              </h5>
              <div className="input-group" style={{maxWidth:280}}>
                <span className="input-group-text" style={{background:'var(--parchment)',borderColor:'var(--stone)'}}><i className="bi bi-search"/></span>
                <input type="text" className="form-control" placeholder="ابحث باسم أو هاتف..." value={search} onChange={e=>setSearch(e.target.value)} style={{borderColor:'var(--stone)'}}/>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{fontSize:'0.87rem'}}>
                <thead>
                  <tr style={{background:'var(--parchment)'}}>
                    {['المستخدم','رقم الهاتف','الدور','تاريخ التسجيل','إجراءات'].map(h=>(
                      <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.78rem'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length===0 ? (
                    <tr><td colSpan={5} className="text-center py-5" style={{color:'var(--warm-gray)'}}>لا يوجد مستخدمون</td></tr>
                  ) : users.map(u=>(
                    <tr key={u._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-2">
                          {u.avatar
                            ? <div style={{width:36,height:36,borderRadius:'50%',overflow:'hidden',position:'relative',flexShrink:0}}><Image src={u.avatar} alt="" fill sizes="36px" style={{objectFit:'cover'}}/></div>
                            : <div style={{width:36,height:36,borderRadius:'50%',background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--burgundy)',fontFamily:'Amiri,serif',fontWeight:700}}>{u.name?.[0]}</div>
                          }
                          <div>
                            <div style={{fontWeight:600}}>{u.name}</div>
                            <small style={{color:'var(--warm-gray)'}}>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-3"><span style={{fontFamily:'monospace'}}>{u.phone||'—'}</span></td>
                      <td className="px-3">
                        <select className="form-select form-select-sm" style={{width:'auto',borderRadius:6,fontSize:'0.8rem',borderColor:'var(--stone)'}}
                          value={u.role} onChange={e=>handleRoleChange(u._id, e.target.value)}>
                          {ROLES.map(r=><option key={r} value={r}>{r==='customer'?'مشتري':r==='artisan'?'حرفي':'مدير'}</option>)}
                        </select>
                      </td>
                      <td className="px-3" style={{color:'var(--warm-gray)',fontSize:'0.8rem'}}>{u.createdAt?.slice(0,10)||'—'}</td>
                      <td className="px-3">
                        <button onClick={()=>handleDeleteUser(u._id, u.name)} className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'#ef4444',border:'1px solid #ef4444'}}>
                          <i className="bi bi-trash3"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 2: Products ── */}
        {tab===2 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom" style={{borderColor:'var(--gold-pale)'}}>
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                <i className="bi bi-box-seam-fill text-burgundy me-2"/>إدارة المنتجات
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{fontSize:'0.87rem'}}>
                <thead>
                  <tr style={{background:'var(--parchment)'}}>
                    {['الصورة','الاسم','الحرفي','السعر','المخزون','إجراءات'].map(h=>(
                      <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.78rem'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length===0 ? (
                    <tr><td colSpan={6} className="text-center py-5" style={{color:'var(--warm-gray)'}}>لا توجد منتجات</td></tr>
                  ) : products.map(p=>(
                    <tr key={p._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                      <td className="px-3 py-2">
                        <div style={{width:48,height:48,borderRadius:8,overflow:'hidden',position:'relative',flexShrink:0}}><Image src={p.image} alt="" fill sizes="48px" style={{objectFit:'cover'}}/></div>
                      </td>
                      <td className="px-3">
                        <div style={{fontWeight:600}}>{p.name}</div>
                        <small style={{color:'var(--warm-gray)'}}>{p.craftType}</small>
                      </td>
                      <td className="px-3">{p.artisan?.name||'—'}</td>
                      <td className="px-3"><strong style={{color:'var(--burgundy)',fontFamily:'Playfair Display,serif'}}>{p.price} د.أ</strong></td>
                      <td className="px-3">{p.stock??'∞'}</td>
                      <td className="px-3">
                        <div className="d-flex gap-2">
                          <a href={`/products/${p._id}`} target="_blank" className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'var(--warm-gray)',border:'1px solid var(--stone)'}}>
                            <i className="bi bi-eye"/>
                          </a>
                          <button onClick={()=>handleDeleteProduct(p._id, p.name)} className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'#ef4444',border:'1px solid #ef4444'}}>
                            <i className="bi bi-trash3"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Orders ── */}
        {tab===3 && (
          <div className="ha-card p-4">
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>
              <i className="bi bi-bag-check text-burgundy me-2"/>إدارة الطلبات
            </h5>
            <OrdersTable orders={orders} onStatusChange={(id,status)=>updateStatus({id,status}).unwrap().then(()=>toast.success('تم التحديث')).catch(()=>toast.error('خطأ'))}/>
          </div>
        )}

        {/* ── Tab 4: Pending Artisans ── */}
        {tab===4 && (
          <div>
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.4rem',marginBottom:20}}>
              <i className="bi bi-person-check text-burgundy me-2"/>الحرفيون بانتظار الموافقة
            </h5>
            {pending.length===0 ? (
              <div className="ha-card p-5 text-center" style={{color:'var(--warm-gray)'}}>
                <i className="bi bi-check-circle fs-1 d-block mb-3 text-success"/>
                <h5 style={{fontFamily:'Amiri,serif'}}>لا يوجد طلبات معلّقة</h5>
                <p style={{fontSize:'0.9rem'}}>جميع طلبات الحرفيين تمت مراجعتها</p>
              </div>
            ) : (
              <div className="row g-4">
                {pending.map(a=>(
                  <div key={a._id} className="col-md-6 col-lg-4">
                    <div className="ha-card p-4">
                      <div className="d-flex gap-3 mb-3">
                        {a.avatar
                          ? <div style={{width:60,height:60,borderRadius:'50%',overflow:'hidden',border:'2px solid var(--gold-pale)',flexShrink:0,position:'relative'}}><Image src={a.avatar} alt="" fill sizes="60px" style={{objectFit:'cover'}}/></div>
                          : <div style={{width:60,height:60,borderRadius:'50%',background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',color:'var(--burgundy)',flexShrink:0}}>
                              {a.name?.[0]}
                            </div>
                        }
                        <div>
                          <div style={{fontWeight:600,fontSize:'1rem'}}>{a.name}</div>
                          <div style={{fontSize:'0.82rem',color:'var(--burgundy)',fontWeight:600}}>{a.craftSpecialty||'حرفي'}</div>
                          <div style={{fontSize:'0.78rem',color:'var(--warm-gray)'}}>
                            <i className="bi bi-geo-alt-fill text-danger" style={{fontSize:'0.68rem'}}/> {a.governorate||'—'}
                          </div>
                        </div>
                      </div>
                      {a.bio && <p style={{fontSize:'0.83rem',color:'var(--warm-gray)',marginBottom:16,lineHeight:1.6}}>{a.bio?.slice(0,120)}...</p>}
                      <div className="d-flex gap-2">
                        <button onClick={()=>handleApprove(a._id, a.name)}
                          className="btn btn-primary flex-grow-1" style={{borderRadius:8,fontWeight:700,fontSize:'0.88rem'}}>
                          <i className="bi bi-check-circle me-1"/>قبول
                        </button>
                        <button onClick={()=>handleDeleteUser(a._id, a.name)}
                          className="btn" style={{borderRadius:8,fontWeight:600,fontSize:'0.88rem',color:'#ef4444',border:'1px solid #ef4444'}}>
                          <i className="bi bi-x-circle me-1"/>رفض
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
