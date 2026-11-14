import { apiFetch } from '../../shared/api.js';
import React, { useId, useRef, useState, useEffect } from 'react';
import { UserRound, Phone, Ruler, ChevronDown, Send, Weight, Loader2 } from 'lucide-react';
import { API_BASE } from '../../shared/api.js';
import { readLocation } from '../../shared/location.js';
import { kgPerSquareFoot } from './weight.js';

const initial = { name: '', phone: '', width: '', height: '', unit: 'Feet', shutterType: 'Manual', message: '' };

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span>{label}</span>
      <span className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817464]" />
        <input className="quote-control pl-10" {...props} />
      </span>
    </label>
  );
}

function Choice({ label, options, value, onChange }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  return (
    <div className="relative grid gap-2" onBlur={e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }} onKeyDown={e => {
      if (e.key === 'Escape') { setOpen(false); trigger.current.focus(); }
    }}>
      <span id={id}>{label}</span>
      <button type="button" ref={trigger} aria-labelledby={id + ' ' + id + '-value'} aria-expanded={open}
        onClick={() => setOpen(!open)} className="quote-control flex items-center justify-between px-3">
        <span id={id + '-value'}>{value === 'Motorized' ? 'Motorized / automatic' : value}</span><ChevronDown size={16} />
      </button>
      {open && <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-[#d7cbbd] bg-[#fffcf7] p-1 shadow-xl">
        {options.map(option => <button type="button" key={option} aria-pressed={option === value}
          className="block w-full rounded-md px-3 py-2 text-left hover:bg-[#eee7dd] focus:bg-[#eee7dd] aria-pressed:text-[#825737]"
          onClick={() => { onChange(option); setOpen(false); trigger.current.focus(); }}>
          {option === 'Motorized' ? 'Motorized / automatic' : option}
        </button>)}
      </div>}
    </div>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const readDraft = () => {
      try {
        const raw = sessionStorage.getItem('tameerInquiryDraft');
        if (!raw) return;
        const draft = JSON.parse(raw);
        const safe = {};
        for (const key of ['width', 'height']) if (Number(draft[key]) > 0 && Number(draft[key]) <= 10000) safe[key] = String(draft[key]);
        if (['Feet', 'Inches'].includes(draft.unit)) safe.unit = draft.unit;
        if (['Manual', 'Gear', 'Motorized'].includes(draft.shutterType)) safe.shutterType = draft.shutterType;
        if (typeof draft.message === 'string') safe.message = draft.message.slice(0, 2000);
        setForm(previous => ({...previous, ...safe}));
        setStatus({text: 'Your chat inquiry is ready to review. Add your name and phone, then submit when ready.'});
        sessionStorage.removeItem('tameerInquiryDraft');
      } catch { sessionStorage.removeItem('tameerInquiryDraft'); }
    };
    readDraft();
    window.addEventListener('tameer:inquiry-draft', readDraft);
    return () => window.removeEventListener('tameer:inquiry-draft', readDraft);
  }, []);

  const update = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setStatus(null);
  };
  const bind = name => ({ name, value: form[name], onChange: e => update(name, e.target.value) });
  const dimensionsValid = [form.width, form.height].every(n => Number(n) > 0 && Number(n) <= 10000);
  const area = form.width * form.height / (form.unit === 'Inches' ? 144 : 1);
  const weight = area * kgPerSquareFoot(form.shutterType.toLowerCase());

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await apiFetch(API_BASE + '/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, location: readLocation() || undefined })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setForm(initial);
        setStatus({ text: 'Request received. We’ll call you about your shutter.' });
      } else {
        setStatus({ error: true, text: data.message || 'Please check your details and try again.' });
      }
    } catch {
      setStatus({ error: true, text: 'We couldn’t send your request. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="quote-card rounded-2xl border border-[#d7cbbd] bg-[#fffcf7] p-5 text-sm text-[#302b25] sm:p-8">
      <fieldset disabled={busy} className="grid min-w-0 gap-5">
        <legend className="mb-5 text-xl font-semibold">Request a shutter quote</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" icon={UserRound} autoComplete="name" placeholder="Your name" required maxLength={100} {...bind('name')} />
          <Field label="Phone number" icon={Phone} type="tel" autoComplete="tel" placeholder="Mobile number" required maxLength={22} {...bind('phone')} />
        </div>
        <fieldset className="grid min-w-0 gap-4 border-t border-[#e3dbd0] pt-3">
          <legend className="pr-3 font-semibold">Opening details <small className="font-normal text-[#817464]">Optional</small></legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {['width', 'height'].map(key => <Field key={key} label={key === 'width' ? 'Width' : 'Height'} icon={Ruler}
              type="number" inputMode="decimal" step="any" min="0.000001" max="10000" placeholder="0" {...bind(key)} />)}
            <Choice label="Unit" value={form.unit} options={['Feet', 'Inches']} onChange={v => update('unit', v)} />
          </div>
          <Choice label="Shutter type" value={form.shutterType} options={['Manual', 'Gear', 'Motorized']} onChange={v => update('shutterType', v)} />
        </fieldset>
        <div className="flex items-center gap-3 rounded-xl border border-[#d7cbbd] bg-[#f1ece4] p-3">
          <Weight size={21} className="shrink-0 text-[#825737]" />
          <div><span className="font-medium">Estimated shutter weight</span>
            <p className="text-xs text-[#655b50]">{dimensionsValid ? 'Approximate, based on opening size and shutter type.' : 'Enter width and height for an estimate.'}</p></div>
          <output className="ml-auto shrink-0 font-semibold tabular-nums text-[#825737]">{dimensionsValid ? weight.toLocaleString('en-IN', { maximumFractionDigits: 1 }) + ' kg' : '—'}</output>
        </div>
        <label className="grid gap-2">Requirements (optional)
          <textarea rows={3} maxLength={2000} placeholder="Installation location, finish or anything else we should know" className="quote-control resize-y p-3" {...bind('message')} />
        </label>
        <button className="quote-submit flex min-h-12 items-center justify-center gap-2 rounded-lg font-bold motion-safe:transition-transform motion-safe:hover:scale-[1.01] disabled:opacity-70">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          {busy ? 'Sending request…' : 'Submit Quote Request'}
        </button>
      </fieldset>
      {status && <p role={status.error ? 'alert' : 'status'} className={'mt-4 ' + (status.error ? 'text-[#9b3025]' : 'text-[#42633b]')}>{status.text}</p>}
    </form>
  );
}
