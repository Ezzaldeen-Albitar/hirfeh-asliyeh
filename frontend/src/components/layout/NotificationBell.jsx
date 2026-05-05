'use client';
import { useSelector, useDispatch } from 'react-redux';
import { markAllRead } from '@/store/slices/notificationSlice';

export default function NotificationBell() {
  const { items, unread } = useSelector(s => s.notifications);
  const dispatch = useDispatch();

  return (
    <div className="dropdown">
      <button className="btn btn-sm position-relative"
        style={{background:'none',border:'none',fontSize:'1.1rem',color:'var(--warm-gray)'}}
        data-bs-toggle="dropdown" onClick={() => dispatch(markAllRead())}>
        <i className="bi bi-bell"/>
        {unread > 0 && (
          <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill"
            style={{background:'var(--burgundy)',fontSize:'0.6rem'}}>
            {unread}
          </span>
        )}
      </button>
      <div className="dropdown-menu dropdown-menu-start p-0 border-0 shadow"
        style={{borderRadius:14,minWidth:300,maxHeight:380,overflowY:'auto'}}>
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center"
          style={{borderColor:'var(--stone)'}}>
          <strong style={{fontFamily:'Amiri,serif',fontSize:'1rem'}}>الإشعارات</strong>
          <small style={{color:'var(--warm-gray)',cursor:'pointer'}}
            onClick={() => dispatch(markAllRead())}>تحديد الكل كمقروء</small>
        </div>
        {items.length === 0 ? (
          <div className="p-4 text-center" style={{color:'var(--warm-gray)'}}>
            <i className="bi bi-bell-slash fs-3 d-block mb-2"/>
            لا توجد إشعارات
          </div>
        ) : (
          items.slice(0, 8).map((n, i) => (
            <div key={i} className="p-3 border-bottom"
              style={{background: n.read ? '#fff' : 'rgba(184,150,60,0.06)', borderColor:'var(--gold-pale)',fontSize:'0.85rem'}}>
              <div className="fw-500">{n.message}</div>
              {n.time && <small style={{color:'var(--warm-gray)'}}>{n.time}</small>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
