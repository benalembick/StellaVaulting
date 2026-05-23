import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', price: '', emoji: '', image: '', display_order: 0, published: true }

export default function AdminFundraisingPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('fundraising_products').select('*').order('display_order')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setEditing('new'); setForm({ ...EMPTY, display_order: products.length + 1 }) }
  function openEdit(p) { setEditing(p.id); setForm({ ...EMPTY, ...p, price: p.price?.toString() || '' }) }
  function cancel() { setEditing(null); setForm(EMPTY) }

  async function save() {
    if (!form.name.trim() || !form.price) { toast.error('Name and price required'); return }
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (editing === 'new') {
        await supabase.from('fundraising_products').insert(payload)
        toast.success('Product added!')
      } else {
        await supabase.from('fundraising_products').update(payload).eq('id', editing)
        toast.success('Product updated!')
      }
      await load(); cancel()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('fundraising_products').delete().eq('id', id)
    await load(); toast.success('Deleted')
  }

  async function toggle(p) {
    await supabase.from('fundraising_products').update({ published: !p.published }).eq('id', p.id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Fundraising Products</h1>
          <p className="text-brand-ink/50 text-sm mt-1">Manage donation items in the fundraising shop</p>
        </div>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> Add Product</button>
      </div>

      {editing && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-xl text-brand-ink mb-5">{editing === 'new' ? 'Add Product' : 'Edit Product'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-label">Product Name *</label>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Buy our lunger a coffee" />
            </div>
            <div>
              <label className="admin-label">Price (AUD) *</label>
              <input type="number" step="0.01" className="admin-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5.00" />
            </div>
            <div>
              <label className="admin-label">Emoji</label>
              <input className="admin-input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="☕ 🎂 🐴" maxLength={4} />
            </div>
            <div>
              <label className="admin-label">Display Order</label>
              <input type="number" className="admin-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="admin-label mb-0">Published</label>
              <button type="button" onClick={() => setForm({ ...form, published: !form.published })} className={`w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.published ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short description shown to donors" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Product Image (optional)</label>
              <ImageUpload bucket="images" value={form.image} onChange={(url) => setForm({ ...form, image: url || '' })} path={`fundraising/${Date.now()}`} label="Upload product image" />
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
          {products.map((p) => (
            <div key={p.id} className="admin-card flex items-center gap-4">
              <GripVertical size={16} className="text-brand-ink/20" />
              <div className="w-10 h-10 bg-brand-gold/10 rounded flex items-center justify-center text-xl flex-shrink-0">
                {p.emoji || '🎁'}
              </div>
              {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <button onClick={() => openEdit(p)} className="text-brand-ink font-medium truncate hover:text-brand-gold transition-colors text-left w-full block">{p.name}</button>
                {p.description && <p className="text-brand-ink/40 text-xs mt-0.5 truncate">{p.description}</p>}
              </div>
              <span className="text-brand-gold font-semibold text-sm flex-shrink-0">${p.price.toFixed(2)}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggle(p)} className={p.published ? 'text-green-400' : 'text-brand-ink/30'}>{p.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => openEdit(p)} className="text-brand-ink/50 hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(p.id)} className="text-brand-ink/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="text-center py-12 text-brand-ink/30"><p>No products yet.</p></div>}
        </div>
      )}
    </div>
  )
}
