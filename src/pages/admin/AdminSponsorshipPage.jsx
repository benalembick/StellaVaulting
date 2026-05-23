import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const TIERS = ['platinum', 'gold', 'silver', 'bronze']
const EMPTY = { title: '', description: '', body: '', image: '', tier: 'gold', amount: '', cta_text: '', cta_url: '', display_order: 0, published: true }

export default function AdminSponsorshipPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('sponsorship_items').select('*').order('display_order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setEditing('new'); setForm(EMPTY) }
  function openEdit(s) { setEditing(s.id); setForm({ ...EMPTY, ...s, amount: s.amount?.toString() || '' }) }
  function cancel() { setEditing(null); setForm(EMPTY) }

  async function save() {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const payload = { ...form, amount: form.amount ? parseFloat(form.amount) : null }
      if (editing === 'new') { await supabase.from('sponsorship_items').insert(payload); toast.success('Created!') }
      else { await supabase.from('sponsorship_items').update(payload).eq('id', editing); toast.success('Updated!') }
      await load(); cancel()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete?')) return
    await supabase.from('sponsorship_items').delete().eq('id', id)
    await load(); toast.success('Deleted')
  }

  async function toggle(s) {
    await supabase.from('sponsorship_items').update({ published: !s.published }).eq('id', s.id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-white">Sponsorship</h1>
          <p className="text-brand-white/50 text-sm mt-1">Manage sponsorship opportunities and packages</p>
        </div>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> Add Opportunity</button>
      </div>

      {editing && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-xl text-brand-white mb-5">{editing === 'new' ? 'New Opportunity' : 'Edit Opportunity'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-label">Title *</label>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Indoor Arena Sponsor" />
            </div>
            <div>
              <label className="admin-label">Tier</label>
              <select className="admin-select" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Investment Amount ($)</label>
              <input type="number" className="admin-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
            </div>
            <div>
              <label className="admin-label">Short Description</label>
              <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Display Order</label>
              <input type="number" className="admin-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="admin-label">CTA Button Text</label>
              <input className="admin-input" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="Get in Touch" />
            </div>
            <div>
              <label className="admin-label">CTA Button URL</label>
              <input className="admin-input" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="mailto:sponsors@..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Full Description / Body</label>
              <textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Image</label>
              <ImageUpload bucket="images" value={form.image} onChange={(url) => setForm({ ...form, image: url || '' })} path={`sponsorship/${Date.now()}`} label="Upload sponsorship image" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving} className="btn-gold">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
            <button onClick={cancel} className="btn-outline-gold">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="admin-card flex items-center gap-4">
              {s.image && <img src={s.image} alt={s.title} className="w-14 h-14 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-brand-white font-medium truncate">{s.title}</p>
                  {s.tier && <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded capitalize">{s.tier}</span>}
                </div>
                {s.description && <p className="text-brand-white/40 text-xs truncate mt-0.5">{s.description}</p>}
                {s.amount && <p className="text-brand-gold text-xs mt-0.5">${s.amount.toLocaleString()}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggle(s)} className={s.published ? 'text-green-400' : 'text-brand-white/30'}>{s.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => openEdit(s)} className="text-brand-white/50 hover:text-brand-gold"><Edit2 size={14} /></button>
                <button onClick={() => del(s.id)} className="text-brand-white/30 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-12 text-brand-white/30"><p>No sponsorship items yet.</p></div>}
        </div>
      )}
    </div>
  )
}
