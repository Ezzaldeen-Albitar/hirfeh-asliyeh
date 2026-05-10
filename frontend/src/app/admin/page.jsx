'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuth, selectRole } from '@/store/slices/authSlice';
import {
  useApproveArtisanMutation,
  useDeleteUserMutation,
  useGetAdminStatsQuery,
  useGetAllAdminProductsQuery,
  useGetAllOrdersQuery,
  useGetAllUsersQuery,
  useGetAdminWorkshopsQuery,
  useGetPendingArtisansQuery,
  useUpdateUserRoleMutation,
} from '@/store/api/adminApi';
import { useDeleteProductMutation } from '@/store/api/productsApi';
import { useDeleteWorkshopMutation, useUpdateWorkshopMutation } from '@/store/api/workshopsApi';
import { useUpdateOrderStatusMutation } from '@/store/api/ordersApi';
import { confirm, toast } from '@/lib/sweetalert';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrdersTable from '@/components/dashboard/OrdersTable';
import { DEFAULT_ARTISAN_AVATAR, DEFAULT_PRODUCT_IMAGE, getPrimaryImageSrc, getSafeImageSrc } from '@/lib/imageUtils';

const TABS = ['نظرة عامة', 'المستخدمون', 'المنتجات', 'الطلبات', 'الورش', 'الحرفيون المعلّقون'];
const ROLES = ['customer', 'artisan', 'admin'];
const WORKSHOP_STATUSES = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'];
const WORKSHOP_STATUS_LABELS = {
  draft: 'مسودة',
  upcoming: 'قادمة',
  ongoing: 'جارية',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
};

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const isAuth = useSelector(selectIsAuth);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const { data: statsData } = useGetAdminStatsQuery();
  const { data: usersData } = useGetAllUsersQuery({ search });
  const { data: ordersData } = useGetAllOrdersQuery({});
  const { data: productsData } = useGetAllAdminProductsQuery({});
  const { data: workshopsData } = useGetAdminWorkshopsQuery({ status: 'all', limit: 50 });
  const { data: pendingData } = useGetPendingArtisansQuery();

  const [approveArtisan] = useApproveArtisanMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteWorkshop] = useDeleteWorkshopMutation();
  const [updateWorkshop] = useUpdateWorkshopMutation();
  const [updateStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (isAuth === false || (role && role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [isAuth, role, router]);

  if (!isAuth || role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border" style={{ color: 'var(--burgundy)' }} role="status" />
          <div style={{ marginTop: 12, color: 'var(--warm-gray)', fontFamily: 'Tajawal,sans-serif' }}>جاري التحقق...</div>
        </div>
      </div>
    );
  }

  const stats = statsData?.data;
  const users = usersData?.data || [];
  const orders = ordersData?.data || [];
  const products = productsData?.data || [];
  const workshops = workshopsData?.data || [];
  const pending = pendingData?.data || [];

  const handleApprove = async (id, name) => {
    try {
      await approveArtisan(id).unwrap();
      toast.success(`تم قبول ${name}`);
    } catch (err) {
      console.error(err);
      toast.error('تعذر القبول');
    }
  };

  const handleDeleteUser = async (id, name) => {
    const { isConfirmed } = await confirm({
      title: `حذف "${name}"؟`,
      text: 'لا يمكن التراجع',
      confirmButtonText: 'حذف',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('تم حذف المستخدم');
    } catch {
      toast.error('تعذر الحذف');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const { isConfirmed } = await confirm({
      title: `حذف "${name}"؟`,
      confirmButtonText: 'حذف',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('تم حذف المنتج');
    } catch {
      toast.error('تعذر الحذف');
    }
  };

  const handleRoleChange = async (id, nextRole) => {
    try {
      await updateRole({ id, role: nextRole }).unwrap();
      toast.success('تم تغيير الدور');
    } catch {
      toast.error('تعذر التغيير');
    }
  };

  const handleWorkshopStatus = async (id, status) => {
    try {
      await updateWorkshop({ id, body: { status } }).unwrap();
      toast.success('تم تحديث حالة الورشة');
    } catch {
      toast.error('تعذر تحديث الورشة');
    }
  };

  const handleCancelWorkshop = async (id, title) => {
    const { isConfirmed } = await confirm({
      title: `إلغاء "${title}"؟`,
      text: 'سيتم تغيير حالة الورشة إلى ملغاة',
      confirmButtonText: 'إلغاء الورشة',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    try {
      await deleteWorkshop(id).unwrap();
      toast.success('تم إلغاء الورشة');
    } catch {
      toast.error('تعذر إلغاء الورشة');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--sidebar-bg),#3D2518)', padding: '24px 0' }}>
        <div className="container d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(184,150,60,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-check" style={{ color: 'var(--gold-light)', fontSize: '1.2rem' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '1.5rem', color: '#fff', margin: 0 }}>لوحة الإدارة</h1>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.55)' }}>حِرفة أصيلة - Admin Panel</div>
          </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn d-flex align-items-center gap-2"
            style={{
              background: 'rgba(255,255,255,.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,.22)',
              borderRadius: 10,
              padding: '9px 16px',
              fontWeight: 700,
            }}
          >
            <i className="bi bi-box-arrow-left" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid var(--gold-pale)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tabLabel, index) => (
              <button
                key={tabLabel}
                onClick={() => setTab(index)}
                className="btn"
                style={{
                  padding: '14px 18px',
                  borderRadius: 0,
                  whiteSpace: 'nowrap',
                  borderBottom: `2.5px solid ${tab === index ? 'var(--burgundy)' : 'transparent'}`,
                  color: tab === index ? 'var(--burgundy)' : 'var(--warm-gray)',
                  fontWeight: tab === index ? 700 : 500,
                  fontSize: '0.88rem',
                  transition: 'all .2s',
                }}
              >
                {tabLabel}
                {tabLabel === 'الحرفيون المعلّقون' && pending.length > 0 && (
                  <span className="badge rounded-pill ms-2" style={{ background: '#ef4444', fontSize: '0.65rem' }}>
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 12px 60px' }}>
        {tab === 0 && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-6 col-lg-3">
                <StatsCard
                  title="المستخدمون"
                  value={stats?.users?.toLocaleString('ar-EG') || users.length || '—'}
                  change={stats?.usersChange || '+0%'}
                  trend={stats?.trends?.users}
                  icon="people-fill"
                  color="#3b82f6"
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatsCard
                  title="الحرفيون"
                  value={stats?.artisans?.toLocaleString('ar-EG') || '—'}
                  change={stats?.artisansChange || '+0%'}
                  trend={stats?.trends?.artisans}
                  icon="tools"
                  color="var(--gold)"
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatsCard
                  title="الطلبات الكلية"
                  value={stats?.orders?.toLocaleString('ar-EG') || orders.length || '—'}
                  change={stats?.ordersChange || '+0%'}
                  trend={stats?.trends?.orders}
                  icon="bag-check-fill"
                  color="#22c55e"
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={stats?.revenue !== undefined ? `${stats.revenue.toLocaleString('ar-EG')} د.أ` : '—'}
                  change={stats?.revenueChange || '+0%'}
                  trend={stats?.trends?.revenue}
                  icon="currency-dollar"
                  color="var(--burgundy)"
                />
              </div>
            </div>
            <RevenueChart data={statsData?.revenueChart} />
          </>
        )}

        {tab === 1 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ borderColor: 'var(--gold-pale)' }}>
              <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', margin: 0 }}>
                <i className="bi bi-people-fill text-burgundy me-2" />
                إدارة المستخدمين
              </h5>
              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text" style={{ background: 'var(--parchment)', borderColor: 'var(--stone)' }}>
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ borderColor: 'var(--stone)' }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: '0.87rem' }}>
                <thead>
                  <tr style={{ background: 'var(--parchment)' }}>
                    {['المستخدم', 'رقم الهاتف', 'الدور', 'تاريخ التسجيل', 'إجراءات'].map((header) => (
                      <th key={header} className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                        لا يوجد مستخدمون
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--gold-pale)' }}>
                        <td className="px-3 py-2">
                          <div className="d-flex align-items-center gap-2">
                            {user.avatar ? (
                              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                <Image src={getSafeImageSrc(user.avatar, DEFAULT_ARTISAN_AVATAR)} alt="" fill sizes="36px" style={{ objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--burgundy)', fontFamily: 'Amiri,serif', fontWeight: 700 }}>
                                {user.name?.[0]}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.name}</div>
                              <small style={{ color: 'var(--warm-gray)' }}>{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-3">
                          <span style={{ fontFamily: 'monospace' }}>{user.phone || '—'}</span>
                        </td>
                        <td className="px-3">
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto', borderRadius: 6, fontSize: '0.8rem', borderColor: 'var(--stone)' }}
                            value={user.role}
                            onChange={(event) => handleRoleChange(user._id, event.target.value)}
                          >
                            {ROLES.map((allowedRole) => (
                              <option key={allowedRole} value={allowedRole}>
                                {allowedRole === 'customer' ? 'مشتري' : allowedRole === 'artisan' ? 'حرفي' : 'مدير'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3" style={{ color: 'var(--warm-gray)', fontSize: '0.8rem' }}>
                          {user.createdAt?.slice(0, 10) || '—'}
                        </td>
                        <td className="px-3">
                          <button onClick={() => handleDeleteUser(user._id, user.name)} className="btn btn-sm" style={{ borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: '#ef4444', border: '1px solid #ef4444' }}>
                            <i className="bi bi-trash3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom" style={{ borderColor: 'var(--gold-pale)' }}>
              <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', margin: 0 }}>
                <i className="bi bi-box-seam-fill text-burgundy me-2" />
                إدارة المنتجات
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: '0.87rem' }}>
                <thead>
                  <tr style={{ background: 'var(--parchment)' }}>
                    {['الصورة', 'الاسم', 'الحرفي', 'السعر', 'المخزون', 'إجراءات'].map((header) => (
                      <th key={header} className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                        لا توجد منتجات
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} style={{ borderBottom: '1px solid var(--gold-pale)' }}>
                        <td className="px-3 py-2">
                          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                            <Image src={getSafeImageSrc(product.image, getPrimaryImageSrc(product.images, DEFAULT_PRODUCT_IMAGE))} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
                          </div>
                        </td>
                        <td className="px-3">
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <small style={{ color: 'var(--warm-gray)' }}>{product.craftType}</small>
                        </td>
                        <td className="px-3">{product.artisan?.name || '—'}</td>
                        <td className="px-3">
                          <strong style={{ color: 'var(--burgundy)', fontFamily: 'Playfair Display,serif' }}>{product.price} د.أ</strong>
                        </td>
                        <td className="px-3">{product.stock ?? '∞'}</td>
                        <td className="px-3">
                          <div className="d-flex gap-2">
                            <a href={`/products/${product._id}`} target="_blank" className="btn btn-sm" style={{ borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: 'var(--warm-gray)', border: '1px solid var(--stone)' }}>
                              <i className="bi bi-eye" />
                            </a>
                            <button onClick={() => handleDeleteProduct(product._id, product.name)} className="btn btn-sm" style={{ borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: '#ef4444', border: '1px solid #ef4444' }}>
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 3 && (
          <div className="ha-card p-4">
            <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', marginBottom: 20 }}>
              <i className="bi bi-bag-check text-burgundy me-2" />
              إدارة الطلبات
            </h5>
            <OrdersTable
              orders={orders}
              onStatusChange={(id, status) =>
                updateStatus({ id, status })
                  .unwrap()
                  .then(() => toast.success('تم التحديث'))
                  .catch(() => toast.error('خطأ'))
              }
            />
          </div>
        )}

        {tab === 4 && (
          <div className="ha-card overflow-hidden">
            <div className="p-4 border-bottom" style={{ borderColor: 'var(--gold-pale)' }}>
              <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.3rem', margin: 0 }}>
                <i className="bi bi-calendar-event text-burgundy me-2" />
                إدارة الورش
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: '0.87rem' }}>
                <thead>
                  <tr style={{ background: 'var(--parchment)' }}>
                    {['الورشة', 'الحرفي', 'التاريخ', 'الحجوزات', 'المقاعد', 'الحالة', 'إجراءات'].map((header) => (
                      <th key={header} className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workshops.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
                        لا توجد ورش
                      </td>
                    </tr>
                  ) : (
                    workshops.map((workshop) => {
                      const date = workshop.schedule?.date ? new Date(workshop.schedule.date).toLocaleDateString('ar-JO') : '—';
                      const artisanName = workshop.artisan?.user?.name || workshop.artisan?.craftName || '—';
                      return (
                        <tr key={workshop._id} style={{ borderBottom: '1px solid var(--gold-pale)' }}>
                          <td className="px-3 py-3">
                            <div style={{ fontWeight: 600 }}>{workshop.title}</div>
                            <small style={{ color: 'var(--warm-gray)' }}>{workshop.locationType === 'online' ? 'عن بعد' : 'حضورية'}</small>
                          </td>
                          <td className="px-3">{artisanName}</td>
                          <td className="px-3">{date}</td>
                          <td className="px-3">{workshop.bookingsCount || 0}</td>
                          <td className="px-3">
                            <span style={{ fontWeight: 600 }}>
                              {workshop.participantsCount ?? workshop.bookedCount ?? 0}/{workshop.capacity}
                            </span>
                          </td>
                          <td className="px-3">
                            <select
                              className="form-select form-select-sm"
                              value={workshop.status}
                              onChange={(event) => handleWorkshopStatus(workshop._id, event.target.value)}
                              style={{ width: 'auto', borderRadius: 6, fontSize: '0.8rem', borderColor: 'var(--stone)' }}
                            >
                              {WORKSHOP_STATUSES.map((status) => (
                                <option key={status} value={status}>{WORKSHOP_STATUS_LABELS[status] || status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3">
                            <div className="d-flex gap-2">
                              <a href={`/workshops/${workshop._id}`} target="_blank" className="btn btn-sm" style={{ borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: 'var(--warm-gray)', border: '1px solid var(--stone)' }}>
                                <i className="bi bi-eye" />
                              </a>
                              <button onClick={() => handleCancelWorkshop(workshop._id, workshop.title)} className="btn btn-sm" style={{ borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: '#ef4444', border: '1px solid #ef4444' }}>
                                <i className="bi bi-calendar-x" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 5 && (
          <div>
            <h5 style={{ fontFamily: 'Amiri,serif', fontSize: '1.4rem', marginBottom: 20 }}>
              <i className="bi bi-person-check text-burgundy me-2" />
              الحرفيون بانتظار الموافقة
            </h5>
            {pending.length === 0 ? (
              <div className="ha-card p-5 text-center" style={{ color: 'var(--warm-gray)' }}>
                <i className="bi bi-check-circle fs-1 d-block mb-3 text-success" />
                <h5 style={{ fontFamily: 'Amiri,serif' }}>لا يوجد طلبات معلّقة</h5>
                <p style={{ fontSize: '0.9rem' }}>جميع طلبات الحرفيين تمت مراجعتها</p>
              </div>
            ) : (
              <div className="row g-4">
                {pending.map((artisan) => (
                  <div key={artisan._id} className="col-md-6 col-lg-4">
                    <div className="ha-card p-4">
                      <div className="d-flex gap-3 mb-3">
                        {artisan.avatar ? (
                          <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold-pale)', flexShrink: 0, position: 'relative' }}>
                            <Image src={getSafeImageSrc(artisan.avatar, DEFAULT_ARTISAN_AVATAR)} alt="" fill sizes="60px" style={{ objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--burgundy)', flexShrink: 0 }}>
                            {artisan.name?.[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{artisan.name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--burgundy)', fontWeight: 600 }}>{artisan.craftSpecialty || 'حرفي'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}>
                            <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '0.68rem' }} /> {artisan.governorate || '—'}
                          </div>
                        </div>
                      </div>
                      {artisan.bio && <p style={{ fontSize: '0.83rem', color: 'var(--warm-gray)', marginBottom: 16, lineHeight: 1.6 }}>{artisan.bio.slice(0, 120)}...</p>}
                      <div className="d-flex gap-2">
                        <button onClick={() => handleApprove(artisan._id, artisan.name)} className="btn btn-primary flex-grow-1" style={{ borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' }}>
                          <i className="bi bi-check-circle me-1" />
                          قبول
                        </button>
                        <button onClick={() => handleDeleteUser(artisan._id, artisan.name)} className="btn" style={{ borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', color: '#ef4444', border: '1px solid #ef4444' }}>
                          <i className="bi bi-x-circle me-1" />
                          رفض
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
