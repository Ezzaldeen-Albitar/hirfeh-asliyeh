'use client';
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button className="page-link" style={{color:'var(--burgundy)'}} onClick={() => onPageChange(page - 1)}>
            <i className="bi bi-chevron-right"/>
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
            <button className="page-link"
              style={p === page ? {background:'var(--burgundy)',borderColor:'var(--burgundy)'} : {color:'var(--burgundy)'}}
              onClick={() => onPageChange(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" style={{color:'var(--burgundy)'}} onClick={() => onPageChange(page + 1)}>
            <i className="bi bi-chevron-left"/>
          </button>
        </li>
      </ul>
    </nav>
  );
}
