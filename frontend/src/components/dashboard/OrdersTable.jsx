'use client';
import { useState, useEffect } from 'react';

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', badge: 'text-bg-warning' },
  confirmed: { label: 'تم التأكيد', badge: 'text-bg-info' },
  'in-progress': { label: 'جاري التجهيز', badge: 'text-bg-primary' },
  processing: { label: 'جاري التجهيز', badge: 'text-bg-primary' },
  shipped: { label: 'تم الشحن', badge: 'text-bg-secondary' },
  delivered: { label: 'تم التسليم', badge: 'text-bg-success' },
  cancelled: { label: 'ملغي', badge: 'text-bg-danger' },
};

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in-progress', 'cancelled'],
  'in-progress': ['shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

function resolveCustomer(o) {
  const src = o.customer || o.user || o.buyer || o.userId || o.buyerId || {};
  return {
    name: src.name || src.fullName || src.username
      || o.customerName || o.userName
      || [src.firstName, src.lastName].filter(Boolean).join(' ')
      || '—',
    email: src.email || o.customerEmail || o.email || '',
    phone: src.phone || src.phoneNumber || o.customerPhone || o.phone || '',
  };
}

function ProductList({ items = [] }) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return <span className="text-muted">—</span>;
  const first = items[0];
  const rest = items.slice(1);
  return (
    <div className="small">
      <div className="fw-medium">
        {first.name || first.title || first.product?.title}
        {first.quantity > 1 && <span className="text-muted fw-normal"> ×{first.quantity}</span>}
      </div>
      {!expanded && rest.length > 0 && (
        <button className="btn btn-link p-0 btn-sm" onClick={() => setExpanded(true)}>
          +{rest.length} منتج آخر
        </button>
      )}
      {expanded && rest.map((item, i) => (
        <div key={i} className="text-muted">
          {item.name || item.title || item.product?.title}
          {item.quantity > 1 ? ` ×${item.quantity}` : ''}
        </div>
      ))}
      {expanded && (
        <button className="btn btn-link p-0 btn-sm text-muted" onClick={() => setExpanded(false)}>إخفاء</button>
      )}
    </div>
  );
}

function OrderModal({ order, onClose }) {
  useEffect(() => {
    document.body.style.overflow = order ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [order]);

  if (!order) return null;

  const orderNum = order.orderNumber || order._id?.slice(-8)?.toUpperCase();
  const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const total = order.totalAmount ?? order.total ?? 0;
  const shipping = order.shippingCost ?? 0;
  const subtotal = total - shipping;
  const cust = resolveCustomer(order);

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#orders-modal-root) { display: none !important; }
          #orders-modal-root { position: fixed; inset: 0; background: #fff; z-index: 9999; overflow: auto; }
          .modal-footer { display: none !important; }
          .modal { background: none !important; position: static !important; }
          .modal-dialog { max-width: 100% !important; margin: 0 !important; }
          .modal-content { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
        onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* ── Dialog ── */}
        <div
          id="orders-modal-root"
          style={{
            background: '#faf7f3', borderRadius: 16, width: '100%',
            maxWidth: 560, maxHeight: '88vh', display: 'flex',
            flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#7A1C2E', color: '#fff', padding: '18px 20px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                طلب #{orderNum}
              </div>
              <span className={`badge rounded-pill ${st.badge}`} style={{ fontSize: '0.72rem' }}>
                {st.label}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Body — scrollable */}
          <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>

            {/* Customer */}
            <p style={{ fontSize: '0.68rem', letterSpacing: 1, textTransform: 'uppercase', color: '#888', fontWeight: 600, marginBottom: 8 }}>
              معلومات العميل
            </p>
            <div className="card mb-3 border-0 shadow-sm">
              <div className="card-body py-2 px-3">
                <div className="fw-semibold">{cust.name}</div>
                {cust.email && <div className="text-muted small">{cust.email}</div>}
                {cust.phone && <div className="text-muted small">{cust.phone}</div>}
                {order.shippingAddress && (
                  <div className="mt-2 pt-2 border-top small text-secondary">
                    📍 {[order.shippingAddress.city, order.shippingAddress.address].filter(Boolean).join(' — ')}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <>
                <p style={{ fontSize: '0.68rem', letterSpacing: 1, textTransform: 'uppercase', color: '#888', fontWeight: 600, marginBottom: 8 }}>
                  المنتجات ({order.items.length})
                </p>
                <ul className="list-group list-group-flush mb-3 border-0 shadow-sm rounded-3 overflow-hidden">
                  {order.items.map((item, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium small">{item.name || item.title || item.product?.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.quantity} × {item.price} د.أ
                        </div>
                      </div>
                      <span className="fw-bold small" style={{ color: '#7A1C2E' }}>
                        {(item.quantity * item.price).toFixed(2)} د.أ
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Totals */}
            <div className="card border-0 shadow-sm">
              <div className="card-body py-2 px-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>المجموع الفرعي</span><span>{subtotal.toFixed(2)} د.أ</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>تكلفة الشحن</span><span>{shipping.toFixed(2)} د.أ</span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-2" style={{ color: '#7A1C2E' }}>
                  <span>الإجمالي</span><span>{total.toFixed(2)} د.أ</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            background: '#fff', padding: '12px 20px', borderTop: '1px solid #eee',
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
          }}>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
              🖨 طباعة
            </button>
            <button className="btn btn-sm text-white" style={{ background: '#7A1C2E' }} onClick={onClose}>
              إغلاق
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default function OrdersTable({ orders = [], onStatusChange }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!orders.length) return (
    <div className="text-center py-5 text-muted">
      <div style={{ fontSize: '2.5rem' }}>📭</div>
      <div className="fw-medium mt-2">لا توجد طلبات</div>
    </div>
  );

  return (
    <>
      <style>{`
        .orders-table > tbody > tr { transition: background-color 0.12s; }
        .orders-table > tbody > tr:hover { background-color: rgba(122,28,46,0.04) !important; }
      `}</style>

      <div className="table-responsive">
        <table className="table orders-table table-borderless align-middle mb-0">
          <thead>
            <tr className="table-light border-bottom">
              {['رقم الطلب', 'العميل', 'المنتجات', 'المبلغ', 'الحالة',
                ...(onStatusChange ? ['تغيير الحالة'] : [])
              ].map((h, i) => (
                <th key={i} className="text-uppercase text-muted fw-semibold py-3"
                  style={{ fontSize: '0.72rem', letterSpacing: 0.8 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
              const orderNum = o.orderNumber || o._id?.slice(-8)?.toUpperCase();
              const total = o.totalAmount ?? o.total ?? 0;
              const cust = resolveCustomer(o);
              const options = [o.status, ...(VALID_TRANSITIONS[o.status] || [])]
                .filter((v, i, a) => a.indexOf(v) === i);

              return (
                <tr key={o._id} className={idx % 2 !== 0 ? 'table-light' : ''}>
                  <td>
                    <button className="btn btn-link btn-sm p-0 fw-bold"
                      style={{ fontFamily: 'monospace', color: '#7A1C2E' }}
                      onClick={() => setSelectedOrder(o)}>
                      #{orderNum}
                    </button>
                  </td>
                  <td>
                    <div className="fw-medium small">{cust.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cust.phone || cust.email}</div>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <ProductList items={o.items} />
                  </td>
                  <td className="fw-bold small text-nowrap" style={{ color: '#7A1C2E' }}>
                    {typeof total === 'number' ? total.toFixed(2) : total}
                    <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.7rem' }}>د.أ</span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${st.badge}`} style={{ fontSize: '0.72rem' }}>
                      {st.label}
                    </span>
                  </td>
                  {onStatusChange && (
                    <td>
                      <select className="form-select form-select-sm"
                        value={o.status}
                        onChange={e => onStatusChange(o._id, e.target.value)}
                        style={{ fontSize: '0.78rem', maxWidth: 140 }}>
                        {options.map(opt => (
                          <option key={opt} value={opt}>
                            {(STATUS_MAP[opt] || STATUS_MAP.pending).label}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}