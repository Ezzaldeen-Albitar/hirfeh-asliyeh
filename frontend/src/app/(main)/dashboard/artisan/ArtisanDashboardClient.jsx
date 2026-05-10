'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useGetArtisanDashboardQuery, useUpdateArtisanProfileMutation } from '@/store/api/artisansApi';
import { useGetArtisanOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/ordersApi';
import { useGetMyProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '@/store/api/productsApi';
import { useGetCustomizationsQuery, useSendMessageMutation, useUpdateCustomizationStatusMutation } from '@/store/api/customizationsApi';
import { useGetWorkshopsQuery, useCreateWorkshopMutation, useDeleteWorkshopMutation } from '@/store/api/workshopsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast, confirm } from '@/lib/sweetalert';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrdersTable from '@/components/dashboard/OrdersTable';
import CustomizationChat from '@/components/dashboard/CustomizationChat';
import ImageUpload from '@/components/common/ImageUpload';
import { GOVERNORATE_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from '@/lib/productFilters';

const TABS   = ['الرئيسية','المنتجات','الطلبات','التخصيصات','الورش','الإعدادات'];
const CRAFTS = PRODUCT_CATEGORY_OPTIONS.map(({ value }) => value);
const GOVS   = GOVERNORATE_OPTIONS.map(({ value }) => value);

const EMPTY_PRODUCT = { name:'', price:'', stock:'', description:'', craftType:'', governorate:'', image:null };
const EMPTY_WORKSHOP = {
  title: '',
  description: '',
  category: '',
  coverImage: '',
  locationType: 'physical',
  address: '',
  city: '',
  governorate: '',
  meetingLink: '',
  date: '',
  startTime: '',
  endTime: '',
  durationMins: '',
  capacity: '',
  price: '',
  skillLevel: 'all',
  includes: '',
  requirements: '',
};

const getSenderId = (message) => {
  if (!message?.sender) return null;
  if (typeof message.sender === 'string') return message.sender;
  return message.sender._id || message.sender.toString?.() || null;
};

const mapChatMessages = (messages, currentUserId) =>
  (messages || []).map((message) => ({
    ...message,
    message: message.message ?? message.content ?? '',
    isOwn: getSenderId(message) === currentUserId,
  }));

function ArtisanDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab]       = useState(0);
  const [activeCustom, setActiveCustom] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [pForm, setPForm]   = useState(EMPTY_PRODUCT);
  const [wForm, setWForm] = useState(EMPTY_WORKSHOP);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '',
    craftSpecialty: user?.craftSpecialty || '', governorate: user?.governorate || '',
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      craftSpecialty: user?.craftSpecialty || '',
      governorate: user?.governorate || '',
    });
  }, [user?._id, user?.name, user?.phone, user?.bio, user?.craftSpecialty, user?.governorate]);

  const { data: dash }  = useGetArtisanDashboardQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetArtisanOrdersQuery({});
  const { data: productsData, isLoading: productsLoading } = useGetMyProductsQuery({ limit:50 });
  const { data: customsData }  = useGetCustomizationsQuery();
  const { data: workshopsData, isLoading: workshopsLoading } = useGetWorkshopsQuery(
    { artisan: user?.artisanProfileId, limit: 50, status: 'upcoming' },
    { skip: !user?.artisanProfileId }
  );

  const [updateStatus]     = useUpdateOrderStatusMutation();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct]    = useDeleteProductMutation();
  const [sendMessage]      = useSendMessageMutation();
  const [updateCusStatus]  = useUpdateCustomizationStatusMutation();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateArtisanProfileMutation();
  const [createWorkshop, { isLoading: creatingWorkshop }] = useCreateWorkshopMutation();
  const [deleteWorkshop] = useDeleteWorkshopMutation();

  const stats    = dash?.data;
  const orders   = ordersData?.data   || [];
  const products = productsData?.data || [];
  const customs  = customsData || [];
  const workshops = workshopsData?.data || [];
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const currentUserId = user?._id || user?.id;

  const setPF  = k => e => setPForm(f => ({ ...f, [k]: e.target.value }));
  const setPro = k => e => setProfileForm(f => ({ ...f, [k]: e.target.value }));
  const setWF  = k => e => setWForm(f => ({ ...f, [k]: e.target.value }));

  const openAddForm  = () => { setEditProduct(null); setPForm(EMPTY_PRODUCT); setShowForm(true); setTab(1); };
  const openEditForm = (p)  => { setEditProduct(p);  setPForm({ name:p.name, price:p.price, stock:p.stock||'', description:p.description||'', craftType:p.craftType||'', governorate:p.governorate||'', image:null }); setShowForm(true); };
  const openWorkshopForm = () => { setWForm(EMPTY_WORKSHOP); setShowWorkshopForm(true); setTab(4); };

  const uploadProductImage = async (file) => {
    const token = Cookies.get('token');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'products');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || 'تعذر رفع الصورة');
    }
    return data.url;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(pForm).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
    try {
      if (editProduct) {
        await updateProduct({ id: editProduct._id, body: fd }).unwrap();
        toast.success('تم تحديث المنتج ✓');
      } else {
        await createProduct(fd).unwrap();
        toast.success('تم إضافة المنتج بنجاح ✓');
      }
      setShowForm(false); setPForm(EMPTY_PRODUCT); setEditProduct(null);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر حفظ المنتج');
    }
  };

  const handleSaveProductFixed = async (e) => {
    e.preventDefault();
    try {
      const title = pForm.name.trim();
      const description = pForm.description.trim();
      const category = pForm.craftType;
      const price = Number(pForm.price);
      const stock = Number(pForm.stock || 1);

      if (title.length < 5) return toast.error('اسم المنتج يجب أن يكون 5 أحرف على الأقل');
      if (!description) return toast.error('أضف وصفًا للمنتج');
      if (!category) return toast.error('اختر نوع الحرفة');
      if (!Number.isFinite(price) || price <= 0) return toast.error('أدخل سعرًا صحيحًا');

      let images = editProduct?.images || [];
      if (pForm.image instanceof File) {
        const uploadedUrl = await uploadProductImage(pForm.image);
        images = [uploadedUrl];
      }
      if (!images.length) return toast.error('أضف صورة للمنتج');

      const body = {
        title,
        description,
        price,
        category,
        productType: 'ready-made',
        stock: Number.isFinite(stock) ? stock : 1,
        images,
        thumbnailIndex: 0,
      };

      if (editProduct) {
        await updateProduct({ id: editProduct._id, body }).unwrap();
        toast.success('تم تحديث المنتج');
      } else {
        await createProduct(body).unwrap();
        toast.success('تمت إضافة المنتج بنجاح');
      }

      setShowForm(false);
      setPForm(EMPTY_PRODUCT);
      setEditProduct(null);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'تعذر حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const { isConfirmed } = await confirm({ title:`حذف "${name}"؟`, text:'لا يمكن التراجع عن هذا الإجراء', confirmButtonText:'حذف', confirmButtonColor:'#ef4444' });
    if (!isConfirmed) return;
    try { await deleteProduct(id).unwrap(); toast.success('تم حذف المنتج'); }
    catch { toast.error('تعذر الحذف'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await updateStatus({ id, status }).unwrap(); toast.success('تم تحديث الحالة'); }
    catch { toast.error('تعذر التحديث'); }
  };

  const handleSendMessage = async (msg) => {
    if (!activeCustom) return;
    try { await sendMessage({ id: activeCustom._id, message: msg }).unwrap(); }
    catch { toast.error('تعذر إرسال الرسالة'); }
  };

  const handleCusStatus = async (id, status) => {
    try { await updateCusStatus({ id, status }).unwrap(); toast.success('تم تحديث الحالة'); }
    catch { toast.error('تعذر التحديث'); }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm).unwrap();
      updateUser(profileForm);
      toast.success('تم حفظ التغييرات ✓');
    } catch { toast.error('تعذر الحفظ'); }
  };

  const splitList = (value) =>
    value
      .split(/\r?\n|،|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleCreateWorkshop = async (e) => {
    e.preventDefault();
    try {
      if (!wForm.title.trim()) return toast.error('أدخل عنوان الورشة');
      if (!wForm.description.trim()) return toast.error('أدخل وصف الورشة');
      if (!wForm.date) return toast.error('اختر تاريخ الورشة');
      if (!wForm.capacity || Number(wForm.capacity) < 1) return toast.error('أدخل عدد مقاعد صحيح');
      if (wForm.price === '' || Number(wForm.price) < 0) return toast.error('أدخل سعر صحيح');
      if (wForm.locationType === 'physical' && !wForm.governorate) return toast.error('اختر محافظة الورشة');
      if (wForm.locationType === 'online' && !wForm.meetingLink.trim()) return toast.error('أدخل رابط الورشة عن بعد');

      const body = {
        title: wForm.title.trim(),
        description: wForm.description.trim(),
        category: wForm.category,
        coverImage: wForm.coverImage.trim(),
        locationType: wForm.locationType,
        location: {
          address: wForm.address.trim(),
          city: wForm.city.trim(),
          governorate: wForm.governorate,
          meetingLink: wForm.meetingLink.trim(),
        },
        schedule: {
          date: wForm.date,
          startTime: wForm.startTime,
          endTime: wForm.endTime,
          durationMins: Number(wForm.durationMins || 0) || undefined,
        },
        capacity: Number(wForm.capacity),
        price: Number(wForm.price),
        skillLevel: wForm.skillLevel,
        includes: splitList(wForm.includes),
        requirements: splitList(wForm.requirements),
      };

      await createWorkshop(body).unwrap();
      toast.success('تم إنشاء الورشة بنجاح');
      setWForm(EMPTY_WORKSHOP);
      setShowWorkshopForm(false);
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إنشاء الورشة');
    }
  };

  const handleCancelWorkshop = async (workshop) => {
    const { isConfirmed } = await confirm({
      title: `إلغاء "${workshop.title}"؟`,
      text: 'سيتم إخفاء الورشة من الحجوزات القادمة',
      confirmButtonText: 'إلغاء الورشة',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    try {
      await deleteWorkshop(workshop._id).unwrap();
      toast.success('تم إلغاء الورشة');
    } catch (err) {
      toast.error(err?.data?.message || 'تعذر إلغاء الورشة');
    }
  };

  return (
    <div className="bg-cream" style={{minHeight:'80vh'}}>
      <div style={{background:'linear-gradient(135deg,var(--burgundy-dark),var(--burgundy))',padding:'32px 0'}}>
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 style={{fontFamily:'Amiri,serif',fontSize:'1.9rem',color:'#fff',marginBottom:4}}>
              مرحباً، {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{color:'rgba(255,255,255,.75)',margin:0,fontSize:'0.88rem'}}>لوحة تحكم الحرفي</p>
          </div>
          <button onClick={openAddForm} className="btn d-flex align-items-center gap-2"
            style={{background:'var(--gold)',color:'var(--charcoal)',borderRadius:10,fontWeight:700,padding:'10px 22px',border:'none'}}>
            <i className="bi bi-plus-circle-fill"/>إضافة منتج جديد
          </button>
          <button onClick={openWorkshopForm} className="btn d-flex align-items-center gap-2"
            style={{background:'#fff',color:'var(--burgundy)',borderRadius:10,fontWeight:700,padding:'10px 22px',border:'none'}}>
            <i className="bi bi-calendar-plus-fill"/>إضافة ورشة
          </button>
        </div>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid var(--gold-pale)',position:'sticky',top:61,zIndex:100}}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto" style={{scrollbarWidth:'none'}}>
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)} className="btn"
                style={{padding:'14px 20px',borderRadius:0,borderBottom:`2.5px solid ${tab===i?'var(--burgundy)':'transparent'}`,
                  color:tab===i?'var(--burgundy)':'var(--warm-gray)',fontWeight:tab===i?700:500,fontSize:'0.88rem',whiteSpace:'nowrap',transition:'all .2s'}}>
                {t}
                {t==='الطلبات' && pendingOrders > 0 && (
                  <span className="badge rounded-pill ms-2" style={{background:'var(--burgundy)',fontSize:'0.65rem'}}>{pendingOrders}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{padding:'32px 12px 60px'}}>

        {tab===0 && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-6 col-lg-3"><StatsCard title="إجمالي الإيرادات" value={stats ? `${stats.revenue?.toLocaleString('ar-EG')} د.أ` : '—'} change={stats?.revenueChange||'+0%'} icon="currency-dollar" color="var(--burgundy)"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="الطلبات المنجزة" value={stats?.orders||orders.length||'—'} change={stats?.ordersChange||'+0%'} icon="bag-check-fill" color="#22c55e"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="مشاهدات المتجر" value={stats?.views ? stats.views.toLocaleString('ar-EG') : '—'} change={stats?.viewsChange||'+0%'} icon="eye-fill" color="#3b82f6"/></div>
              <div className="col-6 col-lg-3"><StatsCard title="المنتجات النشطة" value={stats?.products||products.length||'—'} change={stats?.productsChange||'+0'} icon="box-seam-fill" color="var(--gold)"/></div>
            </div>
            <div className="row g-4">
              <div className="col-lg-8"><RevenueChart data={dash?.revenueChart}/></div>
              <div className="col-lg-4">
                <div className="ha-card p-4 h-100">
                  <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:16}}>
                    <i className="bi bi-clock-history me-2 text-burgundy"/>آخر الطلبات
                  </h6>
                  {orders.length===0 ? (
                    <div className="text-center py-3" style={{color:'var(--warm-gray)',fontSize:'0.85rem'}}>
                      <i className="bi bi-inbox d-block mb-2 fs-3"/>لا توجد طلبات بعد
                    </div>
                  ) : orders.slice(0,6).map(o=>{
                    const cl = {pending:'#F59E0B',confirmed:'#0F766E','in-progress':'#3B82F6',processing:'#3B82F6',shipped:'#8B5CF6',delivered:'#22C55E',cancelled:'#EF4444'}[o.status]||'#94A3B8';
                    return (
                      <div key={o._id} className="d-flex justify-content-between align-items-center py-2"
                        style={{borderBottom:'1px solid var(--gold-pale)',fontSize:'0.83rem'}}>
                        <div>
                          <div style={{fontWeight:500,color:'var(--charcoal)'}}>{o.items?.[0]?.name||'منتج'}</div>
                          <small style={{color:'var(--warm-gray)'}}>{o.customer?.name}</small>
                        </div>
                        <span style={{color:cl,fontWeight:600,fontSize:'0.8rem'}}>{o.total} د.أ</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {tab===1 && (
          <div>
            {showForm && (
              <div className="ha-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                    {editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h5>
                  <button className="btn btn-sm btn-light" onClick={()=>{setShowForm(false);setEditProduct(null);}}>
                    <i className="bi bi-x-lg"/>
                  </button>
                </div>
                <form onSubmit={handleSaveProductFixed}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>اسم المنتج</label>
                          <input type="text" className="form-control" value={pForm.name} onChange={setPF('name')} required minLength={5} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>السعر (د.أ)</label>
                          <input type="number" min="0" step="0.5" className="form-control" value={pForm.price} onChange={setPF('price')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المخزون</label>
                          <input type="number" min="0" className="form-control" value={pForm.stock} onChange={setPF('stock')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نوع الحرفة</label>
                          <select className="form-select" value={pForm.craftType} onChange={setPF('craftType')} required style={{borderRadius:8,borderColor:'var(--stone)'}}>
                            <option value="">اختر...</option>
                            {CRAFTS.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة</label>
                          <select className="form-select" value={pForm.governorate} onChange={setPF('governorate')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                            <option value="">اختر...</option>
                            {GOVS.map(g=><option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الوصف</label>
                          <textarea className="form-control" rows={3} value={pForm.description} onChange={setPF('description')} required style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>صورة المنتج</label>
                      <ImageUpload
                        currentImage={editProduct?.images?.[0]}
                        onChange={file=>setPForm(f=>({...f,image:file}))}/>
                    </div>
                  </div>
                  <div className="mt-4 d-flex gap-2">
                    <button type="submit" disabled={creating||updating} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                      {(creating||updating) ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                      {editProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                    </button>
                    <button type="button" className="btn btn-outline-primary" style={{borderRadius:8}} onClick={()=>{setShowForm(false);setEditProduct(null);}}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {!showForm && (
              <div className="d-flex justify-content-end mb-3">
                <button onClick={openAddForm} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                  <i className="bi bi-plus-lg me-2"/>إضافة منتج
                </button>
              </div>
            )}

            <div className="ha-card overflow-hidden">
              {productsLoading ? (
                <div className="text-center py-5"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
              ) : products.length===0 ? (
                <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
                  <i className="bi bi-box-seam fs-1 d-block mb-3"/>
                  <p>لا توجد منتجات بعد</p>
                  <button onClick={openAddForm} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>أضف أول منتج</button>
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
                            <div style={{width:48,height:48,borderRadius:"inherit",overflow:"hidden",position:"relative",flexShrink:0}}>
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt="" fill sizes="48px" style={{objectFit:"cover"}}/>
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100" style={{background:'var(--parchment)',color:'var(--stone)'}}>
                                  <i className="bi bi-image"/>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3">
                            <div style={{fontWeight:600}}>{p.name}</div>
                            <small style={{color:'var(--warm-gray)'}}>{p.craftType}</small>
                          </td>
                          <td className="px-3">
                            <strong style={{color:'var(--burgundy)',fontFamily:'Playfair Display,serif'}}>{p.price} د.أ</strong>
                          </td>
                          <td className="px-3">
                            <span style={{fontWeight:600,color: (p.stock||0) > 5 ? '#22c55e' : (p.stock||0) > 0 ? '#F59E0B' : '#ef4444'}}>
                              {p.stock ?? '∞'}
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="px-2 py-1 rounded-pill" style={{fontSize:'0.74rem',fontWeight:600,
                              background:p.isActive?'#F0FDF4':'#FEF2F2',color:p.isActive?'#22c55e':'#ef4444'}}>
                              {p.isActive ? 'نشط' : 'معطّل'}
                            </span>
                          </td>
                          <td className="px-3">
                            <div className="d-flex gap-2">
                              <button onClick={()=>openEditForm(p)} className="btn btn-sm btn-outline-primary" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem'}}>
                                <i className="bi bi-pencil"/>
                              </button>
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
              )}
            </div>
          </div>
        )}

        {tab===2 && (
          <div className="ha-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>
                <i className="bi bi-bag-check text-burgundy me-2"/>إدارة الطلبات
              </h5>
              {pendingOrders > 0 && (
                <span className="badge rounded-pill" style={{background:'var(--burgundy)',fontSize:'0.82rem'}}>
                  {pendingOrders} طلب جديد
                </span>
              )}
            </div>
            {ordersLoading
              ? <div className="text-center py-4"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
              : <OrdersTable orders={orders} onStatusChange={handleStatusChange}/>
            }
          </div>
        )}

        {tab===3 && (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="ha-card p-3">
                <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',marginBottom:12}}>طلبات التخصيص</h6>
                {customs.length===0 ? (
                  <div className="text-center py-4" style={{color:'var(--warm-gray)',fontSize:'0.85rem'}}>
                    <i className="bi bi-chat-square-x fs-2 d-block mb-2"/>لا توجد طلبات
                  </div>
                ) : customs.map(c=>(
                  <div key={c._id} onClick={()=>setActiveCustom(c)}
                    className="p-3 mb-2 rounded-3"
                    style={{cursor:'pointer',border:`1.5px solid ${activeCustom?._id===c._id?'var(--burgundy)':'var(--gold-pale)'}`,
                      background:activeCustom?._id===c._id?'rgba(122,28,46,.04)':'#fff',transition:'all .2s'}}>
                    <div className="d-flex justify-content-between mb-1">
                      <strong style={{fontSize:'0.88rem'}}>{c.customer?.name||'عميل'}</strong>
                      <small style={{color:'var(--warm-gray)'}}>{c.updatedAt?.slice(0,10)}</small>
                    </div>
                    <div style={{fontSize:'0.78rem',color:'var(--warm-gray)',marginBottom:6}}>{c.description?.slice(0,50)}...</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{fontSize:'0.7rem',fontWeight:600,padding:'2px 8px',borderRadius:20,background:'var(--parchment)',color:'var(--warm-gray)'}}>{c.status}</span>
                      {c.status==='pending' && (
                        <div className="d-flex gap-1" onClick={e=>e.stopPropagation()}>
                          <button className="btn btn-sm py-0 px-2" style={{fontSize:'0.7rem',color:'#22c55e',border:'1px solid #22c55e',borderRadius:5}} onClick={()=>handleCusStatus(c._id,'processing')}>قبول</button>
                          <button className="btn btn-sm py-0 px-2" style={{fontSize:'0.7rem',color:'#ef4444',border:'1px solid #ef4444',borderRadius:5}} onClick={()=>handleCusStatus(c._id,'cancelled')}>رفض</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-8">
              {activeCustom
                ? <CustomizationChat messages={mapChatMessages(activeCustom.messages, currentUserId)} onSend={handleSendMessage}/>
                : <div className="ha-card p-5 text-center" style={{color:'var(--warm-gray)'}}>
                    <i className="bi bi-chat-square-dots fs-1 d-block mb-3"/>اختر طلب تخصيص لعرض المحادثة
                  </div>
              }
            </div>
          </div>
        )}

        {tab===4 && (
          <div>
            {showWorkshopForm && (
              <div className="ha-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',margin:0}}>إضافة ورشة جديدة</h5>
                  <button className="btn btn-sm btn-light" onClick={()=>setShowWorkshopForm(false)} type="button">
                    <i className="bi bi-x-lg"/>
                  </button>
                </div>
                <form onSubmit={handleCreateWorkshop}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>عنوان الورشة</label>
                      <input className="form-control" value={wForm.title} onChange={setWF('title')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الفئة</label>
                      <select className="form-select" value={wForm.category} onChange={setWF('category')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                        <option value="">اختر...</option>
                        {CRAFTS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>الوصف</label>
                      <textarea className="form-control" rows={3} value={wForm.description} onChange={setWF('description')} required style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نوع الورشة</label>
                      <select className="form-select" value={wForm.locationType} onChange={setWF('locationType')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                        <option value="physical">حضورية</option>
                        <option value="online">عن بعد</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة</label>
                      <select className="form-select" value={wForm.governorate} onChange={setWF('governorate')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                        <option value="">اختر...</option>
                        {GOVS.map(g=><option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المدينة</label>
                      <input className="form-control" value={wForm.city} onChange={setWF('city')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    {wForm.locationType === 'online' ? (
                      <div className="col-12">
                        <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>رابط الورشة</label>
                        <input className="form-control" value={wForm.meetingLink} onChange={setWF('meetingLink')} placeholder="https://..." style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                      </div>
                    ) : (
                      <div className="col-12">
                        <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>العنوان</label>
                        <input className="form-control" value={wForm.address} onChange={setWF('address')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                      </div>
                    )}
                    <div className="col-md-3">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>التاريخ</label>
                      <input type="date" className="form-control" value={wForm.date} onChange={setWF('date')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>البداية</label>
                      <input type="time" className="form-control" value={wForm.startTime} onChange={setWF('startTime')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>النهاية</label>
                      <input type="time" className="form-control" value={wForm.endTime} onChange={setWF('endTime')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المدة بالدقائق</label>
                      <input type="number" min="1" className="form-control" value={wForm.durationMins} onChange={setWF('durationMins')} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>عدد المقاعد</label>
                      <input type="number" min="1" className="form-control" value={wForm.capacity} onChange={setWF('capacity')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>السعر</label>
                      <input type="number" min="0" step="0.5" className="form-control" value={wForm.price} onChange={setWF('price')} required style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المستوى</label>
                      <select className="form-select" value={wForm.skillLevel} onChange={setWF('skillLevel')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                        <option value="all">مناسب للجميع</option>
                        <option value="beginner">مبتدئ</option>
                        <option value="intermediate">متوسط</option>
                        <option value="advanced">متقدم</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>رابط صورة الغلاف</label>
                      <input className="form-control" value={wForm.coverImage} onChange={setWF('coverImage')} placeholder="اختياري" style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>ماذا تشمل؟</label>
                      <textarea className="form-control" rows={3} value={wForm.includes} onChange={setWF('includes')} placeholder="كل عنصر في سطر" style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المتطلبات</label>
                      <textarea className="form-control" rows={3} value={wForm.requirements} onChange={setWF('requirements')} placeholder="كل عنصر في سطر" style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
                    </div>
                  </div>
                  <div className="mt-4 d-flex gap-2">
                    <button type="submit" disabled={creatingWorkshop} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                      {creatingWorkshop ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                      إنشاء الورشة
                    </button>
                    <button type="button" className="btn btn-outline-primary" style={{borderRadius:8}} onClick={()=>setShowWorkshopForm(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {!showWorkshopForm && (
              <div className="d-flex justify-content-end mb-3">
                <button onClick={openWorkshopForm} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>
                  <i className="bi bi-calendar-plus me-2"/>إضافة ورشة
                </button>
              </div>
            )}

            <div className="ha-card overflow-hidden">
              {workshopsLoading ? (
                <div className="text-center py-5"><span className="spinner-border" style={{color:'var(--burgundy)'}}/></div>
              ) : workshops.length === 0 ? (
                <div className="text-center py-5" style={{color:'var(--warm-gray)'}}>
                  <i className="bi bi-calendar-event fs-1 d-block mb-3"/>
                  <p>لا توجد ورش قادمة بعد</p>
                  <button onClick={openWorkshopForm} className="btn btn-primary" style={{borderRadius:8,fontWeight:700}}>أضف أول ورشة</button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0" style={{fontSize:'0.88rem'}}>
                    <thead>
                      <tr style={{background:'var(--parchment)'}}>
                        {['العنوان','التاريخ','النوع','المقاعد','السعر','إجراءات'].map(h=>(
                          <th key={h} className="py-3 px-3" style={{fontWeight:600,color:'var(--warm-gray)',fontSize:'0.78rem'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workshops.map(w=>(
                        <tr key={w._id} style={{borderBottom:'1px solid var(--gold-pale)'}}>
                          <td className="px-3">
                            <div style={{fontWeight:600}}>{w.title}</div>
                            <small style={{color:'var(--warm-gray)'}}>{w.locationLabel}</small>
                          </td>
                          <td className="px-3">{w.dateLabel || 'غير محدد'}</td>
                          <td className="px-3">{w.locationType === 'online' ? 'عن بعد' : 'حضورية'}</td>
                          <td className="px-3">
                            <span style={{fontWeight:600,color:w.spotsLeft > 0 ? '#22c55e' : '#ef4444'}}>
                              {w.bookedCount}/{w.capacity}
                            </span>
                          </td>
                          <td className="px-3"><strong style={{color:'var(--burgundy)'}}>{w.price} {w.currency === 'JOD' ? 'د.أ' : w.currency}</strong></td>
                          <td className="px-3">
                            <div className="d-flex gap-2">
                              <a href={`/workshops/${w._id}`} target="_blank" className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'var(--warm-gray)',border:'1px solid var(--stone)'}}>
                                <i className="bi bi-eye"/>
                              </a>
                              <button onClick={()=>handleCancelWorkshop(w)} className="btn btn-sm" style={{borderRadius:6,padding:'3px 10px',fontSize:'0.78rem',color:'#ef4444',border:'1px solid #ef4444'}}>
                                <i className="bi bi-calendar-x"/>
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

        {tab===5 && (
          <div className="ha-card p-4" style={{maxWidth:600}}>
            <h5 style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',marginBottom:20}}>إعدادات الحساب</h5>
            <div className="row g-3">
              {[['الاسم الكامل','name','text'],['رقم الهاتف','phone','tel']].map(([l,k,t])=>(
                <div key={k} className="col-md-6">
                  <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>{l}</label>
                  <input type={t} className="form-control" value={profileForm[k]} onChange={setPro(k)} style={{borderRadius:8,borderColor:'var(--stone)'}}/>
                </div>
              ))}
              <div className="col-md-6">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نوع الحرفة</label>
                <select className="form-select" value={profileForm.craftSpecialty} onChange={setPro('craftSpecialty')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                  <option value="">اختر...</option>
                  {CRAFTS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>المحافظة</label>
                <select className="form-select" value={profileForm.governorate} onChange={setPro('governorate')} style={{borderRadius:8,borderColor:'var(--stone)'}}>
                  <option value="">اختر...</option>
                  {GOVS.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" style={{fontSize:'0.85rem',fontWeight:500}}>نبذة عنك</label>
                <textarea className="form-control" rows={4} value={profileForm.bio} onChange={setPro('bio')} style={{borderRadius:8,borderColor:'var(--stone)',resize:'none'}}/>
              </div>
            </div>
            <button className="btn btn-primary mt-4" style={{borderRadius:8,fontWeight:700}} disabled={savingProfile} onClick={handleSaveProfile}>
              {savingProfile ? <span className="spinner-border spinner-border-sm me-2"/> : null}
              حفظ التغييرات
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ArtisanDashboardClient() {
  return <ArtisanDashboard />;
}
