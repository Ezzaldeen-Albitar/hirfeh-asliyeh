'use client';

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed: { label: 'تم التأكيد', color: '#0F766E', bg: '#CCFBF1' },
  'in-progress': { label: 'جاري التجهيز', color: '#3B82F6', bg: '#EFF6FF' },
  processing: { label: 'جاري التجهيز', color: '#3B82F6', bg: '#EFF6FF' },
  shipped: { label: 'تم الشحن', color: '#8B5CF6', bg: '#F5F3FF' },
  delivered: { label: 'تم التسليم', color: '#22C55E', bg: '#F0FDF4' },
  cancelled: { label: 'ملغي', color: '#EF4444', bg: '#FEF2F2' },
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

export default function OrdersTable({ orders = [], onStatusChange }) {
  if (!orders.length) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--warm-gray)' }}>
        <i className="bi bi-inbox fs-1 d-block mb-2" />
        لا توجد طلبات
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle" style={{ fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: 'var(--parchment)', borderBottom: '2px solid var(--gold-pale)' }}>
            <th className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>رقم الطلب</th>
            <th className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>العميل</th>
            <th className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>المنتج</th>
            <th className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>المبلغ</th>
            <th className="py-3 px-3" style={{ fontWeight: 600, color: 'var(--warm-gray)', fontSize: '0.78rem' }}>الحالة</th>
            {onStatusChange && <th className="py-3 px-3" />}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
            const options = [o.status, ...(VALID_TRANSITIONS[o.status] || [])].filter(
              (status, index, arr) => arr.indexOf(status) === index
            );

            return (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--gold-pale)' }}>
                <td className="px-3 py-3">
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--warm-gray)' }}>
                    #{o._id?.slice(-8)?.toUpperCase()}
                  </span>
                </td>
                <td className="px-3">
                  <div style={{ fontWeight: 500 }}>{o.customer?.name || '—'}</div>
                  <small style={{ color: 'var(--warm-gray)' }}>{o.customer?.phone}</small>
                </td>
                <td className="px-3">
                  <div>{o.product?.name || o.items?.[0]?.name || '—'}</div>
                </td>
                <td className="px-3">
                  <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, color: 'var(--burgundy)' }}>
                    {o.total} <small style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--warm-gray)' }}>د.أ</small>
                  </span>
                </td>
                <td className="px-3">
                  <span
                    className="px-2 py-1 rounded-pill"
                    style={{ background: st.bg, color: st.color, fontSize: '0.76rem', fontWeight: 600 }}
                  >
                    {st.label}
                  </span>
                </td>
                {onStatusChange && (
                  <td className="px-3">
                    <select
                      className="form-select form-select-sm"
                      style={{ borderRadius: 8, fontSize: '0.8rem', width: 'auto' }}
                      value={o.status}
                      onChange={(e) => onStatusChange(o._id, e.target.value)}
                    >
                      {options.map((status) => (
                        <option key={status} value={status}>
                          {(STATUS_MAP[status] || STATUS_MAP.pending).label}
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
  );
}
