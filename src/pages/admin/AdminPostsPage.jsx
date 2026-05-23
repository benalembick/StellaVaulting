import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Pin, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const EMPTY = { slug: '', title: '', short_description: '', body: '', image: '', published: true, pinned: false, pin_order: 0 }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('posts').select('*').order('pin_order').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setEditing('new'); setForm(EMPTY) }
  function openEdit(p) { setEditing(p.id); setForm({ ...EMPTY, ...p }) }
  function cancel() { setEditing(null); setForm(EMPTY) }

  async function save() {
    if (!form.title.trim()) { toast.error('Title required'); return }
    const slug = form.slug || slugify(form.title)
    setSaving(true)
    try {
      if (editing === 'new') {
        await supabase.from('posts').insert({ ...form, slug })
        toast.success('Post created!')
      } else {
        await supabase.from('posts').update({ ...form, slug }).eq('id', editing)
        toast.success('Post updated!')
      }
      await load(); cancel()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', id)
    await load(); toast.success('Deleted')
  }

  async function toggleField(p, field) {
    await supabase.from('posts').update({ [field]: !p[field] }).eq('id', p.id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-white">Posts & Pinned Posts</h1>
          <p className="text-brand-white/50 text-sm mt-1">Manage news posts and homepage pinned items</p>
        </div>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> New Post</button>
      </div>

      {editing && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-xl text-brand-white mb-5">{editing === 'new' ? 'New Post' : 'Edit Post'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-label">Title *</label>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="Post title" />
            </div>
            <div>
              <label className="admin-label">Slug (URL)</label>
              <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="auto-generated-from-title" />
            </div>
            <div>
              <label className="admin-label">Pin Order (1 = first)</label>
              <input type="number" className="admin-input" value={form.pin_order} onChange={(e) => setForm({ ...form, pin_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">Published</label>
                <button type="button" onClick={() => setForm({ ...form, published: !form.published })} className={`w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-brand-gold' : 'bg-brand-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.published ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">Pinned to Home</label>
                <button type="button" onClick={() => setForm({ ...form, pinned: !form.pinned })} className={`w-10 h-5 rounded-full transition-colors ${form.pinned ? 'bg-brand-pink' : 'bg-brand-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.pinned ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Short Description (shown on homepage card)</label>
              <textarea className="admin-textarea" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Full Body</label>
              <textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Featured Image</label>
              <ImageUpload bucket="images" value={form.image} onChange={(url) => setForm({ ...form, image: url || '' })} path={`posts/${Date.now()}`} label="Upload post image" />
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
          {posts.map((p) => (
            <div key={p.id} className={`admin-card flex items-center gap-4 ${p.pinned ? 'border-brand-pink/30' : ''}`}>
              {p.image && <img src={p.image} alt={p.title} className="w-14 h-14 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-brand-white font-medium truncate">{p.title}</p>
                  {p.pinned && <span className="text-[10px] bg-brand-pink/20 text-brand-pink px-1.5 py-0.5 rounded tracking-wide">Pinned #{p.pin_order}</span>}
                </div>
                {p.short_description && <p className="text-brand-white/40 text-xs mt-0.5 truncate">{p.short_description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleField(p, 'pinned')} className={p.pinned ? 'text-brand-pink' : 'text-brand-white/30'} title="Toggle pin"><Pin size={14} /></button>
                <button onClick={() => toggleField(p, 'published')} className={p.published ? 'text-green-400' : 'text-brand-white/30'}>{p.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => openEdit(p)} className="text-brand-white/50 hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(p.id)} className="text-brand-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="text-center py-12 text-brand-white/30"><p>No posts yet.</p></div>}
        </div>
      )}
    </div>
  )
}
