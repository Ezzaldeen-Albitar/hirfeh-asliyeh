'use client';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-5" style={{flexWrap:'wrap'}}>
      <button
        className="btn btn-sm"
        style={{borderRadius:8,border:'1.5px solid var(--stone)',color:page===1?'var(--stone)':'var(--burgundy)',background:'#fff'}}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}>
        <i className="bi bi-chevron-right"/>
      </button>

      {pages[0] > 1 && (
        <>
          <button className="btn btn-sm" style={{borderRadius:8,border:'1.5px solid var(--stone)',color:'var(--warm-gray)',background:'#fff'}} onClick={()=>onPageChange(1)}>1</button>
          {pages[0] > 2 && <span style={{color:'var(--stone)'}}>...</span>}
        </>
      )}

      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className="btn btn-sm"
          style={{borderRadius:8,minWidth:36,fontWeight:p===page?700:400,
            border:`1.5px solid ${p===page?'var(--burgundy)':'var(--stone)'}`,
            background:p===page?'var(--burgundy)':'#fff',
            color:p===page?'#fff':'var(--charcoal)'}}>
          {p}
        </button>
      ))}

      {pages[pages.length-1] < totalPages && (
        <>
          {pages[pages.length-1] < totalPages - 1 && <span style={{color:'var(--stone)'}}>...</span>}
          <button className="btn btn-sm" style={{borderRadius:8,border:'1.5px solid var(--stone)',color:'var(--warm-gray)',background:'#fff'}} onClick={()=>onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="btn btn-sm"
        style={{borderRadius:8,border:'1.5px solid var(--stone)',color:page===totalPages?'var(--stone)':'var(--burgundy)',background:'#fff'}}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}>
        <i className="bi bi-chevron-left"/>
      </button>
    </div>
  );
}
