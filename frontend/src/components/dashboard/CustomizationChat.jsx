'use client';
import { useState, useRef, useEffect } from 'react';

export default function CustomizationChat({ messages = [], onSend, disabled }) {
  const [text, setText] = useState('');
  const messagesViewportRef = useRef(null);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend?.(text.trim());
    setText('');
  };

  return (
    <div className="ha-card d-flex flex-column" style={{height:480}}>
      <div className="p-3 border-bottom d-flex align-items-center gap-2"
        style={{borderColor:'var(--gold-pale)'}}>
        <i className="bi bi-chat-dots-fill text-burgundy fs-5"/>
        <strong style={{fontFamily:'Amiri,serif',fontSize:'1.05rem'}}>محادثة التخصيص</strong>
      </div>

      <div
        ref={messagesViewportRef}
        className="flex-grow-1 overflow-auto p-3"
        style={{gap:12,display:'flex',flexDirection:'column'}}
      >
        {messages.length === 0 && (
          <div className="text-center my-auto" style={{color:'var(--warm-gray)'}}>
            <i className="bi bi-chat-square-text fs-2 d-block mb-2"/>
            ابدأ المحادثة مع الحرفي
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m._id || `${m.sentAt || m.time || i}-${m.message || m.content || ''}`}
            className={`d-flex ${m.isOwn ? 'justify-content-start' : 'justify-content-end'}`}
          >
            <div className="px-3 py-2" style={{
              maxWidth:'72%', borderRadius: m.isOwn ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
              background: m.isOwn ? 'var(--parchment)' : 'var(--burgundy)',
              color: m.isOwn ? 'var(--charcoal)' : '#fff',
              fontSize:'0.88rem', lineHeight:1.6,
            }}>
              {m.message || m.content}
              {m.time && (
                <div style={{fontSize:'0.68rem',opacity:.65,marginTop:3,textAlign:'left'}}>{m.time}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-top d-flex gap-2" style={{borderColor:'var(--gold-pale)'}}>
        <input className="form-control" placeholder="اكتب رسالتك..." value={text}
          style={{borderRadius:20,borderColor:'var(--stone)',fontSize:'0.88rem'}}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={disabled}/>
        <button onClick={handleSend} disabled={!text.trim() || disabled}
          className="btn btn-primary d-flex align-items-center justify-content-center"
          style={{borderRadius:'50%',width:42,height:42,flexShrink:0,padding:0}}>
          <i className="bi bi-send-fill"/>
        </button>
      </div>
    </div>
  );
}
