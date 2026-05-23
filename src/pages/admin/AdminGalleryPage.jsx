import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, FolderOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const CATEGORIES = ['Training', 'Exercise', 'Event', 'Behind the Scenes']
const EMPTY_IMG = { title: '', description: '', category: '', image_url: '', display_order: 0, published: true, gallery_id: '', image_date: '' }
const EMPTY_GAL = { name: '', slug: '', description: '', cover_image: '', published: true }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminGalleryPage({ galleryType = 'stella' }) {
  const [galleries, setGalleries] = useState([])
  const [images, setImages] = useState([])
  const [activeGallery, setActiveGallery] = useState(null)
  const [editingImg, setEditingImg] = useState(null)
  const [editingGal, setEditingGal] = useState(null)
  const [imgForm, setImgForm] = useState(EMPTY_IMG)
  const [galForm, setGalForm] = useState(EMPTY_GAL)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    const [galRes, imgRes] = await Promise.all([
      supabase.from('galleries').select('*').eq('gallery_type', galleryType).order('created_at'),
      activeGallery
        ? supabase.from('gallery_images').select('*').eq('gallery_id', activeGallery).order('display_order')
        : supabase.from('gallery_images').select('*, galleries!inner(gallery_type)').eq('galleries.gallery_type', galleryType).order('display_order'),
    ])
    setGalleries(galRes.data || [])
    setImages(imgRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [activeGallery, galleryType])

  // Gallery CRUD
  function openNewGal() { setEditingGal('new'); setGalForm(EMPTY_GAL) }
  function openEditGal(g) { setEditingGal(g.id); setGalForm({ ...EMPTY_GAL, ...g }) }
  function cancelGal() { setEditingGal(null); setGalForm(EMPTY_GAL) }
  async function saveGal() {
    if (!galForm.name.trim()) { toast.error('Gallery name required'); return }
    const slug = galForm.slug || slugify(galForm.name)
    setSaving(true)
    try {
      const payload = { ...galForm, slug, gallery_type: galleryType }
      if (editingGal === 'new') { await supabase.from('galleries').insert(payload); toast.success('Gallery created!') }
      else { await supabase.from('galleries').update(payload).eq('id', editingGal); toast.success('Gallery updated!') }
      await load(); cancelGal()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  async function delGal(id) {
    if (!confirm('Delete this gallery and all its images?')) return
    await supabase.from('galleries').delete().eq('id', id)
    setActiveGallery(null); await load(); toast.success('Gallery deleted')
  }

  // Image CRUD
  function openNewImg() { setEditingImg('new'); setImgForm({ ...EMPTY_IMG, gallery_id: activeGallery || '' }) }
  function openEditImg(img) { setEditingImg(img.id); setImgForm({ ...EMPTY_IMG, ...img }) }
  function cancelImg() { setEditingImg(null); setImgForm(EMPTY_IMG) }
  async function saveImg() {
    if (!imgForm.gallery_id) { toast.error('Please select a gallery'); return }
    setSaving(true)
    try {
      const payload = { ...imgForm, display_order: parseInt(imgForm.display_order) || 0 }
      if (editingImg === 'new') { await supabase.from('gallery_images').insert(payload); toast.success('Photo added!') }
      else { await supabase.from('gallery_images').update(payload).eq('id', editingImg); toast.success('Photo updated!') }
      await load(); cancelImg()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  async function delImg(id) {
    if (!confirm('Delete this photo?')) return
    await supabase.from('gallery_images').delete().eq('id', id)
    await load(); toast.success('Photo deleted')
  }
  async function toggleImg(img) {
    await supabase.from('gallery_images').update({ published: !img.published }).eq('id', img.id)
    await load()
  }

  const title = galleryType === 'stella' ? 'Stella Gallery' : 'Community Gallery'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-white">{title}</h1>
          <p className="text-brand-white/50 text-sm mt-1">Manage albums and photos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNewGal} className="btn-outline-gold text-xs py-2 px-4"><Plus size={14} /> Album</button>
          <button onClick={openNewImg} className="btn-gold"><Plus size={16} /> Upload Photo</button>
        </div>
      </div>

      {/* Gallery album editor */}
      {editingGal && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-lg text-brand-white mb-4">{editingGal === 'new' ? 'New Album' : 'Edit Album'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Album Name *</label>
              <input className="admin-input" value={galForm.name} onChange={(e) => setGalForm({ ...galForm, name: e.target.value, slug: galForm.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input className="admin-input" value={galForm.slug} onChange={(e) => setGalForm({ ...galForm, slug: slugify(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <input className="admin-input" value={galForm.description} onChange={(e) => setGalForm({ ...galForm, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveGal} disabled={saving} className="btn-gold text-xs py-2 px-4">{saving ? 'Saving...' : 'Save Album'}</button>
            <button onClick={cancelGal} className="btn-outline-gold text-xs py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Image editor */}
      {editingImg && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-lg text-brand-white mb-4">{editingImg === 'new' ? 'Upload Photo' : 'Edit Photo'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Album *</label>
              <select className="admin-select" value={imgForm.gallery_id} onChange={(e) => setImgForm({ ...imgForm, gallery_id: e.target.value })}>
                <option value="">Select album</option>
                {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Category</label>
              <select className="admin-select" value={imgForm.category} onChange={(e) => setImgForm({ ...imgForm, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Title</label>
              <input className="admin-input" value={imgForm.title} onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Date</label>
              <input type="date" className="admin-input" value={imgForm.image_date} onChange={(e) => setImgForm({ ...imgForm, image_date: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <input className="admin-input" value={imgForm.description} onChange={(e) => setImgForm({ ...imgForm, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Photo *</label>
              <ImageUpload bucket="gallery" value={imgForm.image_url} onChange={(url) => setImgForm({ ...imgForm, image_url: url || '' })} path={`${galleryType}/${Date.now()}`} label="Upload photo" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveImg} disabled={saving} className="btn-gold">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
            <button onClick={cancelImg} className="btn-outline-gold">Cancel</button>
          </div>
        </div>
      )}

      {/* Albums sidebar + images grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-xs tracking-widest uppercase text-brand-white/40 mb-3">Albums</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveGallery(null)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${!activeGallery ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'text-brand-white/60 hover:text-brand-white'}`}
            >
              All Photos
            </button>
            {galleries.map((g) => (
              <div key={g.id} className={`flex items-center gap-1 rounded border transition-colors ${activeGallery === g.id ? 'border-brand-gold/20 bg-brand-gold/5' : 'border-transparent'}`}>
                <button
                  onClick={() => setActiveGallery(g.id)}
                  className={`flex-1 text-left px-3 py-2 text-sm ${activeGallery === g.id ? 'text-brand-gold' : 'text-brand-white/60 hover:text-brand-white'}`}
                >
                  {g.name}
                </button>
                <button onClick={() => openEditGal(g)} className="p-1 text-brand-white/20 hover:text-brand-gold"><Edit2 size={11} /></button>
                <button onClick={() => delGal(g.id)} className="p-1 text-brand-white/20 hover:text-red-400"><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-brand-white/30 border-2 border-dashed border-brand-gold/10 rounded-lg">
              <FolderOpen size={32} className="mx-auto mb-3 opacity-40" />
              <p>No photos yet. Upload the first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded overflow-hidden border border-brand-gold/10 hover:border-brand-gold/30 transition-all">
                  <img src={img.image_url || img.preview_url} alt={img.title || ''} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      {img.title && <p className="text-xs text-white truncate">{img.title}</p>}
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => toggleImg(img)} className={`flex-1 py-1 rounded text-[10px] ${img.published ? 'bg-green-600/40 text-green-300' : 'bg-brand-white/10 text-white/50'}`}>
                          {img.published ? <Eye size={10} className="mx-auto" /> : <EyeOff size={10} className="mx-auto" />}
                        </button>
                        <button onClick={() => openEditImg(img)} className="flex-1 py-1 bg-brand-gold/20 text-brand-gold rounded"><Edit2 size={10} className="mx-auto" /></button>
                        <button onClick={() => delImg(img.id)} className="flex-1 py-1 bg-red-600/20 text-red-400 rounded"><Trash2 size={10} className="mx-auto" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
