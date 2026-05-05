'use client';
import { useState } from 'react';
import { useGetArtisanDashboardQuery } from '@/store/api/artisansApi';
import { useGetArtisanOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/ordersApi';
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation } from '@/store/api/productsApi';
import { useGetCustomizationsQuery } from '@/store/api/customizationsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast, confirm } from '@/lib/sweetalert';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrdersTable from '@/components/dashboard/OrdersTable';
import CustomizationChat from '@/components/dashboard/CustomizationChat';
import ImageUpload from '@/components/common/ImageUpload';

const TABS = ['الرئيسية','المنتجات','الطلبات','التخصيصات','الإعدادات'];
const CRAFTS = ['السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج'];
const GOVS   = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','الكرك','العقبة'];

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const [tab, setTab]     = useState(0);
  const [activeCustom, setActiveCustom] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name:'', price:'', description:'', craftType:'', governorate:'', image:null });

  const { data: dash }      = useGetArtisanDashboardQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetArtisanOrdersQuery({});
  const { data: productsData }   = useGetProductsQuery({ artisan:'me', limit:20 });
  const { data: customsData }    = useGetCustomizationsQuery();
  const [updateStatus]           = useUpdateOrderStatusMutation();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [deleteProduct]          = useDeleteProductMutation();

  const stats    = dash?.data || { revenue:12450, orders:387, views:15600, products:24 };
  const orders   = ordersData?.data || [];
  const products = productsData?.data || [];
  const customs  = customsData?.data || [];

  const setPF = k => e => setProductForm(f => ({...f, [k]: e.target.value}));

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(productForm).forEach(([k,v]) => { if(v) fd.append(k, v); });
    try {
      await createProduct(fd).unwrap();
      toast.success('تم إضافة المنتج بنجاح ✓');
      setShowAddProduct(false);
      setProductForm({ name:'', price:'', description:'', craftType:'', governorate:'', image:null });
    } catch { toast.error('تعذر إضافة المنتج'); }
  };

  const handleDeleteProduct = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟`, text:'لا يمكن التراجع عن هذا الإجراء' });
    if (!isConfirmed) return;
    try { await deleteProduct(id).unwrap(); toast.success('تم حذف المنتج'); }
    catch { toast.error('تعذر الحذف'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await updateStatus({id, status}).unwrap(); toast.success('تم تحديث الحالة'); }
    catch { toast.error('تعذر التحديث'); }
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,var(--burgundy-dark),var(--burgundy))',padding:'32px 0'}}>
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 style={{fontFamily:'Amiri,serif',fontSize:'1.9rem',color:'#fff',marginBottom:4}}>
              مرحباً، {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{color:'rgba(255,255,255,.75)',margin:0,fontSize:'0.88rem'}}>لوحة تحكم الحرفي</p>
          </div>
          <button onClick={()=>{setTab(1);setShowAddProduct(true);}}
            className="btn d-flex align-items-center gap-2"
            style={{background:'var(--gold)',color:'var(--charcoal)',borderRadius:10,fontWeight:700,padding:'10px 22px',border:'none'}}>
            <i className="bi bi-plus-circle-fill"/>إضافة منتج جديد
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'#fff',borderBottom:'1px solid var(--gold-pale)',position:'sticky',top:61,zIndex:100}}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto" style={{scrollbarWidth:'none'}}>
            {TABS.map((t,i) => (
              <button key={t} onClick={()=>setTab(i)}
                className="btn"
                style={{padding:'14px 20px',borderRadius:0,borderBottom:`2.5px solid ${tab===i?'var(--burgundy)':'transparent'}`,
                  color:tab===i?'var(--burgundy)':'var(--warm-gray)',fontWeight:tab===i?700:500,fontSize:'0.88rem',
                  whiteSpace:'nowrap',transition:'all .2s'}}>
                {t}
                {t==='الطلبات' && orders.filter(o=>o.status==='pending').length>0 && (
                  <span className="badge rounded-pill ms-2" style={{background:'var(--burgundy)',fontSize:'0.65rem'}}>
                    {orders.filter(o=>o.status==='pending').length}
                  </span>
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
              <div className="col-6 col-lg-3"><StatsCard title="إجمالي الإيرادات" value={`${stats.revenue?.toLocaleString()} د.أ`} change="+15%" icon="currency-dollar" color="var(--burgundy)"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الطلبات المنجزة"   value={stats.orders}    change="+8%"  icon="bag-check-fill"   color="#22c55e"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="مشاهدات المتجر"    value={stats.views?.toLocaleString()} change="+22%" icon="eye-fill"  color="#3b82f6"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="المنتجات النشطة"   value={stats.products}  change="+3"   icon="box-seam-fill"    color="var(--gold)"/></div>
            </div>
            <div className="row g-4">
              <div className="col-lg-8"><RevenueChart/></div>
              <div className="col-lg-4">
                <div className="ha-card p-4 h-100">
                  <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>
                    <i className="bi bi-clock-history me-2 text-burgundy"/>آخر الطلبات
                  </h6>
                  {orders.slice(0,5).map(o => {
                    const st = {pending:'#F59E0B',processing:'#3B82F6',delivered:'#22C55E',cancelled:'#EF4444'}[o.status]||'#94A3B8';
                    return (
                      <div key={o._id} className="d-flex justify-content-between align-items-center py-2"
                        style={{borderBottom:'1px solid var(--gold-pale)',fontSize:'0.83rem'}}>
                        <span style={{color:'var(--charcoal)',fontWeight:500}}>{o.items?.[0]?.name||'منتج'}</span>
                        <span style={{color:st,fontWeight:600,fontSize:'0.75rem'}}>{o.total} د.أ</span>
                      </div>
                    );
                  })}
                  {orders.length===0 && <div style={{color:'var(--warm-gray)',fontSize:'0.85rem',textAlign:'center',paddingTop:20}}>لا توجد طلبات بعد</div>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 1: Products */}
        {tab===1 && (
          <div>
            {showAddProduct && (
              <div className="ha-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>إضافة منتج جديد</h5>
                  <button className="btn btn-sm btn-light" onClick={()=>setShowAddProduct(false)}><i className="bi bi-x-lg"/></button>
                </div>
                <form onSubmit={handleAddProduct}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="row g-3">
                        {[['اسم المنتج','name'],['السعر (د.أ)','price','number']].map(([l,k,t='text'])=>(
                          <div key={k} className="col-md-6">
                            <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>{l}</label>
                            <input type={t} className="form-control" value={productForm[k]} onChange={setPF(k)} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                          </div>
                        ))}
                        <div className="col-md-6">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نوع الحرفة</label>
                          <select className="form-select" value={productForm.craftType} onChange={setPF('craftType')} required style={{borderRadius:8,borderColor:'var(--stone)'}}>
                            <option value="">اختر...</option>
                            {CRAFTS.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة</label>
                          <select className="form-select" value={productForm.governorate} onChange={setPF('governorate')} required style={{borderRadius:8,borderColor:'var(--stone)'}}>
                            <option value="">اختر...</option>
                            {GOVS.map(g=><option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الوصف</label>
                          <textarea className="form-control" rows={3} value={productForm.description} onChange={setPF('description')} required style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 d-flex flex-column align-items-center justify-content-start gap-2">
                      <label className="form-label align-self-start" style={{fontSize:'0.85rem',fontWeight:500}}>صورة المنتج</label>
                      <ImageUpload onChange={file=>setProductForm(f=>({...f,image:file}))}/>
                    </div>
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" disabled={creating} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                      {creating?<span className="spinner-border spinner-border-sm me-2"/>:null}حفظ المنتج
                    </button>
                    <button type="button" className="btn btn-outline-primary" style={{borderRadius:8}} onClick={()=>setShowAddProduct(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}
            {!showAddProduct && (
              <div className="d-flex justify-content-end mb-3">
                <button onClick={()=>setShowAddProduct(true)} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                  <i className="bi bi-plus-lg me-2"/>إضافة منتج
                </button>
              </div>
            )}
            <div className="ha-card overflow-hidden">
              {products.length===0 ? (
                <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
                  <i className="bi bi-box-seam fs-1 d-block mb-3"/>لا توجد منتجات بعد
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0" style={{fontSize:'0.88rem'}}>
                    <thead>
                      <tr style={{background:'var(--parchment)'}}>
                        {['الصورة','الاسم','السعر','المخزون','الحالة','إجراءات'].map(h=>(
                          <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.78rem'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p=>(
                        <tr key={p._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                          <td className="px-3 py-2">
                            <img src={p.images?.[0]||'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&q=60'}
                              style={{width:48,height:48,borderRadius:8,objectFit:'cover'}}/>
                          </td>
                          <td className="px-3">
                            <div style={{fontWeight:600}}>{p.name}</div>
                            <small style={{color:'var(--warm-gray)'}}>{p.craftType}</small>
                          </td>
                          <td className="px-3"><strong style={{color:'var(--burgundy)',fontFamily:'Playfair Display,serif'}}>{p.price} د.أ</strong></td>
                          <td className="px-3">{p.stock??'—'}</td>
                          <td className="px-3">
                            <span className="px-2 py-1 rounded-pill" style={{fontSize:'0.74rem',fontWeight:600,
                              background:p.isActive?'#F0FDF4':'#FEF2F2',color:p.isActive?'#22c55e':'#ef4444'}}>
                              {p.isActive?'نشط':'معطّل'}
                            </span>
                          </td>
                          <td className="px-3">
                            <div className="d-flex gap-2">
                              <a href={`/products/${p._id}`} className="btn btn-sm btn-outline-primary" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem'}}>
                                <i className="bi bi-eye"/>
                              </a>
                              <button onClick={()=>handleDeleteProduct(p._id, p.name)}
                                className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'#ef4444',border:'1px solid #ef4444'}}>
                                <i className="bi bi-trash3"/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {tab===2 && (
          <div className="ha-card p-4">
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>
              <i className="bi bi-bag-check text-burgundy me-2"/>إدارة الطلبات
            </h5>
            {ordersLoading
              ? <div className="text-center py-4"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
              : <OrdersTable orders={orders} onStatusChange={handleStatusChange}/>
            }
          </div>
        )}

        {/* Tab 3: Customizations */}
        {tab===3 && (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="ha-card p-3">
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:12}}>طلبات التخصيص</h6>
                {customs.length===0 ? (
                  <div className="text-center py-4" style={{color:'var(--warm-gray)',fontSize:'0.85rem'}}>لا توجد طلبات</div>
                ) : (
                  customs.map(c=>(
                    <div key={c._id} onClick={()=>setActiveCustom(c)}
                      className="p-3 mb-2 rounded-3"
                      style={{cursor:'pointer',border:`1.5px solid ${activeCustom?._id===c._id?'var(--burgundy)':'var(--gold-pale)'}`,
                        background:activeCustom?._id===c._id?'rgba(122,28,46,.04)':'#fff',transition:'all .2s'}}>
                      <div style={{fontWeight:600,fontSize:'0.88rem'}}>{c.customer?.name||'عميل'}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--warm-gray)'}}>{c.description?.slice(0,50)}...</div>
                      <span className="badge rounded-pill mt-1" style={{background:'var(--parchment)',color:'var(--warm-gray)',fontSize:'0.68rem'}}>{c.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="col-md-8">
              {activeCustom
                ? <CustomizationChat messages={activeCustom.messages||[]} onSend={msg=>console.log('send',msg)}/>
                : <div className="ha-card p-5 text-center" style={{color:'var(--warm-gray)'}}>
                    <i className="bi bi-chat-square-dots fs-1 d-block mb-3"/>
                    اختر طلب تخصيص لعرض المحادثة
                  </div>
              }
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {tab===4 && (
          <div className="ha-card p-4" style={{maxWidth:600}}>
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>إعدادات الحساب</h5>
            {[['الاسم الكامل','name'],['البريد الإلكتروني','email'],['رقم الهاتف','phone']].map(([l,k])=>(
              <div key={k} className="mb-3">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>{l}</label>
                <input type="text" className="form-control" defaultValue={user?.[k]||''} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
              </div>
            ))}
            <div className="mb-3">
              <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نبذة عنك</label>
              <textarea className="form-control" rows={4} defaultValue={user?.bio||''} style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
            </div>
            <button className="btn btn-primary" style={{borderRadius:8,fontWeight:700}} onClick={()=>toast.success('تم حفظ التغييرات ✓')}>
              حفظ التغييرات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
