'use client';
import { useState } from 'react';

// خريطة الحالات مع التصميم الموحد
const STATUS_MAP = {
  pending:     { label: 'قيد الانتظار', className: 'bg-warning-subtle text-warning-emphasis', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:   { label: 'تم التأكيد',   className: 'bg-info-subtle text-info-emphasis',       color: '#0F766E', bg: '#CCFBF1' },
  'in-progress': { label: 'جاري التجهيز', className: 'bg-primary-subtle text-primary-emphasis', color: '#3B82F6', bg: '#EFF6FF' },
  processing:  { label: 'جاري التجهيز', className: 'bg-primary-subtle text-primary-emphasis', color: '#3B82F6', bg: '#EFF6FF' },
  shipped:     { label: 'تم الشحن',     className: 'bg-purple-subtle text-purple',            color: '#8B5CF6', bg: '#F5F3FF' },
  delivered:   { label: 'تم التسليم',   className: 'bg-success-subtle text-success-emphasis', color: '#22C55E', bg: '#F0FDF4' },
  cancelled:   { label: 'ملغي',         className: 'bg-danger-subtle text-danger-emphasis',   color: '#EF4444', bg: '#FEF2F2' },
};

// منطق الانتقالات المسموحة للحالة
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in-progress', 'cancelled'],
  'in-progress': ['shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ── helpers ──────────────────────────────────────────────────────────────────
function resolveCustomer(o) {
  const src = o.customer || o.user || o.buyer || o.userId || o.buyerId || {};
  return {
    name:  src.name || src.fullName || src.username
        || o.customerName || o.userName
        || [src.firstName, src.lastName].filter(Boolean).join(' ')
        || '—',
    email: src.email || o.customerEmail || o.email || '',
    phone: src.phone || src.phoneNumber || o.customerPhone || o.phone || '',
  };
}

// ── ProductList ───────────────────────────────────────────────────────────────
function ProductList({ items = [] }) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return <span className="text-muted">—</span>;

  const first = items[0];
  const rest  = items.slice(1);

  return (
    <div style={{ fontSize: '0.82rem' }}>
      <div className="fw-medium">
        {first.name || first.title}
        {first.quantity > 1 && (
          <span className="text-muted fw-normal"> ×{first.quantity}</span>
        )}
      </div>

      {rest.length > 0 && !expanded && (
        <button className="btn btn-link btn-sm p-0 text-decoration-underline"
          style={{ fontSize: '0.75rem' }}
          onClick={() => setExpanded(true)}>
          +{rest.length} منتج آخر
        </button>
      )}

      {expanded && rest.map((item, i) => (
        <div key={i} className="text-muted mt-1">
          {item.name || item.title}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
        </div>
      ))}

      {expanded && rest.length > 0 && (
        <button className="btn btn-link btn-sm p-0 text-muted text-decoration-underline"
          style={{ fontSize: '0.73rem' }}
          onClick={() => setExpanded(false)}>
          إخفاء
        </button>
      )}
    </div>
  );
}

// ── OrderModal ────────────────────────────────────────────────────────────────
function OrderModal({ order, onClose }) {
  if (!order) return null;

  const orderNum = order.orderNumber || order._id?.slice(-8)?.toUpperCase();
  const st       = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const total    = order.totalAmount ?? order.total ?? 0;
  const shipping = order.shippingCost ?? 0;
  const subtotal = total - shipping;
  const cust     = resolveCustomer(order);

  return (
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1050 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header text-white border-0 rounded-0"
            style={{ background: 'var(--burgundy, #7A1C2E)' }}>
            <div>
              <h5 className="modal-title mb-1" style={{ fontFamily: 'Amiri,serif' }}>طلب #{orderNum}</h5>
              <span className="badge rounded-pill" style={{ background: st.bg, color: st.color, fontSize: '0.72rem' }}>
                {st.label}
              </span>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body p-4">
            <p className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: 1 }}>معلومات العميل</p>
            <div className="card border rounded-3 mb-3">
              <div className="card-body py-2 px-3">
                <div className="fw-semibold">{cust.name}</div>
                {cust.email && <div className="text-muted small">{cust.email}</div>}
                {cust.phone && <div className="text-muted small">{cust.phone}</div>}
              </div>
            </div>

            <p className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: 1 }}>المنتجات</p>
            <ul className="list-group list-group-flush border rounded-3 mb-3">
              {(order.items || []).map((item, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-medium small">{item.name || item.title}</div>
                    <div className="text-muted extra-small">{item.quantity} × {item.price} د.أ</div>
                  </div>
                  <span className="fw-bold small">{(item.quantity * item.price).toFixed(2)} د.أ</span>
                </li>
              ))}
            </ul>

            <div className="rounded-3 p-3 border" style={{ background: '#faf7f3' }}>
              <div className="d-flex justify-content-between fw-bold pt-2" style={{ color: '#7A1C2E' }}>
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} د.أ</span>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>🖨 طباعة</button>
            <button className="btn btn-sm text-white" style={{ background: '#7A1C2E' }} onClick={onClose}>إغلاق</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
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
        .orders-table tbody tr { transition: background 0.15s; }
        .orders-table tbody tr:hover { background: rgba(122,28,46,0.05) !important; }
      `}</style>

      <div className="table-responsive">
        <table className="table orders-table align-middle mb-0" style={{ fontSize: '0.87rem' }}>
          <thead className="table-light">
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              {['رقم الطلب','العميل','المنتجات','المبلغ','الحالة', ...(onStatusChange ? ['تغيير الحالة'] : [])].map((h, i) => (
                <th key={i} className="fw-semibold text-uppercase text-muted py-3 px-3" style={{ fontSize: '0.74rem', letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
              const orderNum = o.orderNumber || o._id?.slice(-8)?.toUpperCase();
              const total = o.totalAmount ?? o.total ?? 0;
              const cust = resolveCustomer(o);
              const options = [o.status, ...(VALID_TRANSITIONS[o.status] || [])].filter((val, idx, arr) => arr.indexOf(val) === idx);

              return (
                <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td>
                    <button className="btn btn-link btn-sm p-0 fw-bold text-decoration-underline"
                      style={{ fontFamily: 'monospace', color: '#7A1C2E' }}
                      onClick={() => setSelectedOrder(o)}>
                      #{orderNum}
                    </button>
                  </td>
                  <td>
                    <div className="fw-medium">{cust.name}</div>
                    <div className="text-muted extra-small">{cust.phone}</div>
                  </td>
                  <td style={{ maxWidth: 200 }}><ProductList items={o.items} /></td>
                  <td className="fw-bold" style={{ color: '#7A1C2E' }}>
                    {total.toFixed(2)} <small className="fw-normal text-muted">د.أ</small>
                  </td>
                  <td>
                    <span className="badge rounded-pill" style={{ background: st.bg, color: st.color, fontSize: '0.74rem' }}>
                      {st.label}
                    </span>
                  </td>
                  {onStatusChange && (
                    <td>
                      <select className="form-select form-select-sm"
                        style={{ fontSize: '0.78rem', borderRadius: 8 }}
                        value={o.status}
                        onChange={e => onStatusChange(o._id, e.target.value)}>
                        {options.map(opt => (
                          <option key={opt} value={opt}>{(STATUS_MAP[opt] || STATUS_MAP.pending).label}</option>
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