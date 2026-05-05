import MapView from '@/components/common/MapView';

export default function OriginStorySection({ product }) {
  const steps = product?.makingProcess || [
    { title: 'المواد الخام', desc: 'جمع المواد الخام الطبيعية من مصادر محلية' },
    { title: 'التشكيل اليدوي', desc: 'تشكيل المنتج يدوياً باستخدام أدوات تقليدية' },
    { title: 'المعالجة', desc: 'معالجة المنتج لضمان الجودة والمتانة' },
    { title: 'التشطيب', desc: 'اللمسات النهائية والتدقيق في الجودة' },
  ];

  return (
    <div className="mt-5">
      <h3 className="section-title text-center mb-1">قصة المنشأ</h3>
      <p className="section-label text-center mb-4">Origin Story</p>
      <div className="gold-divider"/>

      <div className="row g-4">
        {/* Map */}
        <div className="col-md-6">
          <h5 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:16}}>
            <i className="bi bi-geo-alt text-burgundy me-2"/>منطقة التصنيع
          </h5>
          <MapView
            lat={product?.origin?.lat || 31.95}
            lng={product?.origin?.lng || 35.93}
            label={product?.origin?.region || 'الأردن'}
          />
        </div>

        {/* Process */}
        <div className="col-md-6">
          <h5 style={{fontFamily:'Amiri,serif',color:'var(--charcoal)',marginBottom:16}}>
            <i className="bi bi-diagram-3 text-burgundy me-2"/>عملية الصنع
          </h5>
          <div className="position-relative">
            {steps.map((s, i) => (
              <div key={i} className="d-flex gap-3 mb-4">
                <div className="flex-shrink-0 d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center justify-content-center"
                    style={{width:38,height:38,borderRadius:'50%',background:'var(--burgundy)',color:'#fff',
                      fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'0.85rem'}}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{width:2,flex:1,background:'var(--gold-pale)',minHeight:24,marginTop:4}}/>
                  )}
                </div>
                <div className="pb-2">
                  <div style={{fontWeight:600,fontSize:'0.9rem',color:'var(--charcoal)'}}>{s.title}</div>
                  <div style={{fontSize:'0.82rem',color:'var(--warm-gray)',lineHeight:1.7}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="certificate-box mt-4 text-center">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="text-start">
            <div style={{fontFamily:'Amiri,serif',fontSize:'1.3rem',color:'var(--burgundy)',fontWeight:700}}>
              شهادة الأصالة
            </div>
            <div style={{fontSize:'0.8rem',color:'var(--warm-gray)'}}>Certificate of Authenticity</div>
          </div>
          <div className="text-center">
            <div style={{fontFamily:'Amiri,serif',fontSize:'1.1rem',color:'var(--charcoal)'}}>{product?.artisan?.name}</div>
            <div style={{fontSize:'0.78rem',color:'var(--warm-gray)'}}>{product?.craftType}</div>
            <span className="badge-certified d-inline-block mt-1">
              <i className="bi bi-patch-check-fill me-1"/>HA-{product?._id?.slice(-8)?.toUpperCase() || '2024-001'}
            </span>
          </div>
          <div>
            <div style={{width:60,height:60,background:'var(--parchment)',borderRadius:8,
              border:'1px solid var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'0.6rem',color:'var(--warm-gray)',flexDirection:'column',gap:2}}>
              <i className="bi bi-qr-code fs-4 text-burgundy"/>
              <span>QR CODE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
