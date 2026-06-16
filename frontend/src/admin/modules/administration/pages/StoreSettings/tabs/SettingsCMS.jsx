import React, { useState, useEffect } from 'react';
import { Save, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import './TabShared.css';

const SUB_TABS = [
  { key: 'about',     label: 'Nosotros' },
  { key: 'contact',   label: 'Contacto' },
  { key: 'locations', label: 'Locales' },
  { key: 'returns',   label: 'Devoluciones' },
  { key: 'faq',       label: 'FAQ' },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
function useSection(cms, key, defaultVal) {
  const [val, setVal] = useState(defaultVal);
  useEffect(() => { if (cms?.[key] !== undefined) setVal(cms[key]); }, [cms, key]);
  return [val, setVal];
}

/* ── sub-sections ──────────────────────────────────────────────────────────*/

function AboutSection({ cms, onChange }) {
  const [title, setTitle]   = useState('');
  const [body,  setBody]    = useState('');
  const [img,   setImg]     = useState('');

  useEffect(() => {
    if (!cms?.about) return;
    setTitle(cms.about.title ?? '');
    setBody(cms.about.body   ?? '');
    setImg(cms.about.image   ?? '');
  }, [cms]);

  useEffect(() => { onChange({ title, body, image: img }); }, [title, body, img]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="tab-field">
        <label>Título</label>
        <input className="tab-input" placeholder="Sobre nosotros" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="tab-field">
        <label>Texto</label>
        <textarea className="tab-textarea" placeholder="Contá la historia de tu tienda..." value={body} onChange={e => setBody(e.target.value)} />
      </div>
      <div className="tab-field">
        <label>URL de imagen</label>
        <input className="tab-input" placeholder="https://..." value={img} onChange={e => setImg(e.target.value)} />
      </div>
    </div>
  );
}

function ContactSection({ cms, onChange }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ig,    setIg]    = useState('');
  const [tw,    setTw]    = useState('');
  const [fb,    setFb]    = useState('');

  useEffect(() => {
    if (!cms?.contact) return;
    const c = cms.contact;
    setEmail(c.email ?? '');
    setPhone(c.phone ?? '');
    setIg(c.instagram ?? '');
    setTw(c.twitter   ?? '');
    setFb(c.facebook  ?? '');
  }, [cms]);

  useEffect(() => {
    onChange({ email, phone, instagram: ig, twitter: tw, facebook: fb });
  }, [email, phone, ig, tw, fb]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="tab-grid-2">
        <div className="tab-field">
          <label>Email de contacto</label>
          <input className="tab-input" placeholder="hola@mitienda.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="tab-field">
          <label>Teléfono / WhatsApp</label>
          <input className="tab-input" placeholder="+54 9 11..." value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="tab-grid-3">
        <div className="tab-field">
          <label>Instagram</label>
          <input className="tab-input" placeholder="@usuario" value={ig} onChange={e => setIg(e.target.value)} />
        </div>
        <div className="tab-field">
          <label>Twitter / X</label>
          <input className="tab-input" placeholder="@usuario" value={tw} onChange={e => setTw(e.target.value)} />
        </div>
        <div className="tab-field">
          <label>Facebook</label>
          <input className="tab-input" placeholder="@pagina" value={fb} onChange={e => setFb(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function ListSection({ items, onChange, renderItem, emptyText, renderForm }) {
  const [adding,   setAdding]   = useState(false);
  const [editIdx,  setEditIdx]  = useState(null);

  const handleAdd    = (item) => { onChange([...items, item]); setAdding(false); };
  const handleEdit   = (i, item) => { const n = [...items]; n[i] = item; onChange(n); setEditIdx(null); };
  const handleDelete = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.length === 0 && !adding && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{emptyText}</p>
      )}
      {items.map((item, i) => (
        editIdx === i
          ? <div key={i} className="cms-add-form">
              {renderForm({ initial: item, onSubmit: (v) => handleEdit(i, v), onCancel: () => setEditIdx(null) })}
            </div>
          : <div key={i} className="cms-list-item">
              <div className="cms-list-item-body">{renderItem(item)}</div>
              <div className="cms-item-actions">
                <button className="cms-icon-btn" onClick={() => setEditIdx(i)}><Pencil size={13} /></button>
                <button className="cms-icon-btn cms-icon-btn--del" onClick={() => handleDelete(i)}><Trash2 size={13} /></button>
              </div>
            </div>
      ))}
      {adding
        ? <div className="cms-add-form">
            {renderForm({ initial: null, onSubmit: handleAdd, onCancel: () => setAdding(false) })}
          </div>
        : <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '8px 14px', color: 'rgba(255,255,255,0.45)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Agregar
          </button>
      }
    </div>
  );
}

function LocationsSection({ cms, onChange }) {
  const [locs, setLocs] = useState([]);
  useEffect(() => { if (cms?.locations) setLocs(cms.locations); }, [cms]);
  const update = (v) => { setLocs(v); onChange(v); };

  const renderItem = (loc) => (
    <>
      <p className="cms-list-item-title">{loc.name}</p>
      <p className="cms-list-item-sub">{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>
    </>
  );

  const renderForm = ({ initial, onSubmit, onCancel }) => {
    const [d, setD] = useState(initial ?? { name: '', address: '', city: '', phone: '', hours: '' });
    const s = (k, v) => setD(p => ({ ...p, [k]: v }));
    return (
      <>
        <div className="tab-grid-2">
          <div className="tab-field"><label>Nombre</label><input className="tab-input" value={d.name}    onChange={e => s('name', e.target.value)} placeholder="Sucursal Centro" /></div>
          <div className="tab-field"><label>Dirección</label><input className="tab-input" value={d.address} onChange={e => s('address', e.target.value)} placeholder="Av. Corrientes 1234" /></div>
        </div>
        <div className="tab-grid-3">
          <div className="tab-field"><label>Ciudad</label><input className="tab-input" value={d.city}  onChange={e => s('city', e.target.value)} /></div>
          <div className="tab-field"><label>Teléfono</label><input className="tab-input" value={d.phone} onChange={e => s('phone', e.target.value)} /></div>
          <div className="tab-field"><label>Horario</label><input className="tab-input" value={d.hours} onChange={e => s('hours', e.target.value)} placeholder="L-V 9-18" /></div>
        </div>
        <div className="cms-add-form-actions">
          <button className="cms-cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="cms-submit-btn" onClick={() => onSubmit(d)}>Guardar</button>
        </div>
      </>
    );
  };

  return <ListSection items={locs} onChange={update} renderItem={renderItem} emptyText="No hay locales cargados." renderForm={renderForm} />;
}

function ReturnsSection({ cms, onChange }) {
  const [policy, setPolicy] = useState('');
  useEffect(() => { if (cms?.returns?.policy !== undefined) setPolicy(cms.returns.policy); }, [cms]);
  useEffect(() => { onChange({ policy }); }, [policy]);

  return (
    <div className="tab-field">
      <label>Política de devoluciones</label>
      <textarea
        className="tab-textarea"
        style={{ minHeight: 140 }}
        placeholder="Describí tu política de devoluciones..."
        value={policy}
        onChange={e => setPolicy(e.target.value)}
      />
    </div>
  );
}

function FAQSection({ cms, onChange }) {
  const [faqs, setFaqs] = useState([]);
  useEffect(() => { if (cms?.faq) setFaqs(cms.faq); }, [cms]);
  const update = (v) => { setFaqs(v); onChange(v); };

  const renderItem = (faq) => (
    <>
      <p className="cms-list-item-title">{faq.question}</p>
      <p className="cms-list-item-sub">{faq.answer?.slice(0, 80)}{faq.answer?.length > 80 ? '…' : ''}</p>
    </>
  );

  const renderForm = ({ initial, onSubmit, onCancel }) => {
    const [d, setD] = useState(initial ?? { question: '', answer: '' });
    return (
      <>
        <div className="tab-field"><label>Pregunta</label><input className="tab-input" value={d.question} onChange={e => setD(p => ({ ...p, question: e.target.value }))} /></div>
        <div className="tab-field"><label>Respuesta</label><textarea className="tab-textarea" value={d.answer} onChange={e => setD(p => ({ ...p, answer: e.target.value }))} /></div>
        <div className="cms-add-form-actions">
          <button className="cms-cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="cms-submit-btn" onClick={() => onSubmit(d)}>Guardar</button>
        </div>
      </>
    );
  };

  return <ListSection items={faqs} onChange={update} renderItem={renderItem} emptyText="No hay preguntas frecuentes." renderForm={renderForm} />;
}

/* ── main component ─────────────────────────────────────────────────────── */
export default function SettingsCMS({ cms, onSave }) {
  const [activeTab, setActiveTab] = useState('about');
  const [draft,     setDraft]     = useState({});
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState(null);

  useEffect(() => { if (cms) setDraft(cms); }, [cms]);

  const patch = (section, value) => setDraft(d => ({ ...d, [section]: value }));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      showMsg('Contenido guardado.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-root">
      <div className="tab-card">
        <p className="tab-card-title">Sección</p>
        <div className="cms-sub-tabs">
          {SUB_TABS.map(t => (
            <button
              key={t.key}
              className={`cms-sub-tab ${activeTab === t.key ? 'cms-sub-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-card">
        {activeTab === 'about'     && <AboutSection     cms={draft} onChange={v => patch('about', v)} />}
        {activeTab === 'contact'   && <ContactSection   cms={draft} onChange={v => patch('contact', v)} />}
        {activeTab === 'locations' && <LocationsSection cms={draft} onChange={v => patch('locations', v)} />}
        {activeTab === 'returns'   && <ReturnsSection   cms={draft} onChange={v => patch('returns', v)} />}
        {activeTab === 'faq'       && <FAQSection       cms={draft} onChange={v => patch('faq', v)} />}
      </div>

      <div className="tab-save-bar">
        {msg && (
          <span className={`tab-save-msg ${msg.ok ? 'tab-save-msg--ok' : 'tab-save-msg--err'}`}>
            {msg.text}
          </span>
        )}
        <button className="tab-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <span className="tab-spinner" /> : <Save size={14} />}
          <span>{saving ? 'Guardando…' : 'Guardar contenido'}</span>
        </button>
      </div>
    </div>
  );
}
