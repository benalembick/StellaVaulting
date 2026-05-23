import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, FolderOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const EMPTY_IMG = {
  title: '', description: '', preview_url: '', highres_url: '', price: '',
  event_name: '', club_name: '', rider_name: '', for_sale: true,
  display_order: 0, published: true, gallery_id: '', image_date: '',
}
const EMPTY_GAL = { name: '', slug: '', description: '', published: true }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCommunityGalleryPage() {
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
      supabase.from('galleries').select('*').eq('gallery_type', 'community').order('created_at'),
      activeGallery
        ? supabase.from('gallery_images').select('*').eq('gallery_id', activeGallery).order('display_order')
        : supabase.from('gallery_images').select('*, galleries!inner(gallery_type)').eq('galleries.gallery_type', 'community').order('display_order'),
    ])
    setGalleries(galRes.data || [])
    setImages(imgRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [activeGallery])

  function openNewGal() { setEditingGal('new'); setGalForm(EMPTY_GAL) }
  function openEditGal(g) { setEditingGal(g.id); setGalForm({ ...EMPTY_GAL, ...g }) }
  function cancelGal() { setEditingGal(null) }
  async function saveGal() {
    const slug = galForm.slug || slugify(galForm.name)
    setSaving(true)
    try {
      const payload = { ...galForm, slug, gallery_type: 'community' }
      if (editingGal === 'new') { await supabase.from('galleries').insert(payload) }
      else { await supabase.from('galleries').update(payload).eq('id', editingGal) }
      toast.success('Album saved!'); await load(); cancelGal()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  function openNewImg() { setEditingImg('new'); setImgForm({ ...EMPTY_IMG, gallery_id: activeGallery || '' }) }
  function openEditImg(img) { setEditingImg(img.id); setImgForm({ ...EMPTY_IMG, ...img, price: img.price?.toString() || '' }) }
  function cancelImg() { setEditingImg(null); setImgForm(EMPTY_IMG) }
  async function saveImg() {
    if (!imgForm.gallery_id) { toast.error('Select an album'); return }
    setSaving(true)
    try {
      const payload = { ...imgForm, price: imgForm.price ? parseFloat(imgForm.price) : null }
      if (editingImg === 'new') { await supabase.from('gallery_images').insert(payload) }
      else { await supabase.from('gallery_images').update(payload).eq('id', editingImg) }
      toast.success('Photo saved!'); await load(); cancelImg()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  async function delImg(id) {
    if (!confirm('Delete photo?')) return
    await supabase.from('gallery_images').delete().eq('id', id)
    await load(); toast.success('Deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Community Gallery</h1>
          <p className="text-brand-ink/50 text-sm mt-1">Manage community event photos and sales</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNewGal} className="btn-outline-gold text-xs py-2 px-4"><Plus size={14} /> Album</button>
          <button onClick={openNewImg} className="btn-gold"><Plus size={16} /> Upload Photo</button>
        </div>
      </div>

      {editingGal && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-lg text-brand-ink mb-4">{editingGal === 'new' ? 'New Event Album' : 'Edit Album'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Album / Event Name *</label>
              <input className="admin-input" value={galForm.name} onChange={(e) => setGalForm({ ...galForm, name: e.target.value, slug: galForm.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Description</label>
              <input className="admin-input" value={galForm.description} onChange={(e) => setGalForm({ ...galForm, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveGal} disabled={saving} className="btn-gold text-xs py-2 px-4">Save Album</button>
            <button onClick={cancelGal} className="btn-outline-gold text-xs py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      {editingImg && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-lg text-brand-ink mb-4">{editingImg === 'new' ? 'Upload Community Photo' : 'Edit Photo'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Event Album *</label>
              <select className="admin-select" value={imgForm.gallery_id} onChange={(e) => setImgForm({ ...imgForm, gallery_id: e.target.value })}>
                <option value="">Select album</option>
                {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Price (AUD)</label>
              <input type="number" step="0.01" className="admin-input" value={imgForm.price} onChange={(e) => setImgForm({ ...imgForm, price: e.target.value })} placeholder="10.00" />
            </div>
            <div>
              <label className="admin-label">Event Name</label>
              <input className="admin-input" value={imgForm.event_name} onChange={(e) => setImgForm({ ...imgForm, event_name: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Club Name</label>
              <input className="admin-input" value={imgForm.club_name} onChange={(e) => setImgForm({ ...imgForm, club_name: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Rider / Vaulter Name</label>
              <input className="admin-input" value={imgForm.rider_name} onChange={(e) => setImgForm({ ...imgForm, rider_name: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Photo Date</label>
              <input type="date" className="admin-input" value={imgForm.image_date} onChange={(e) => setImgForm({ ...imgForm, image_date: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Title / Caption</label>
              <input className="admin-input" value={imgForm.title} onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })} />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">For Sale</label>
                <button type="button" onClick={() => setImgForm({ ...imgForm, for_sale: !imgForm.for_sale })} className={`w-10 h-5 rounded-full transition-colors ${imgForm.for_sale ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${imgForm.for_sale ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">Published</label>
                <button type="button" onClick={() => setImgForm({ ...imgForm, published: !imgForm.published })} className={`w-10 h-5 rounded-full transition-colors ${imgForm.published ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${imgForm.published ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="admin-label">Preview Image (watermarked / low-res) *</label>
              <ImageUpload bucket="gallery" value={imgForm.preview_url} onChange={(url) => setImgForm({ ...imgForm, preview_url: url || '' })} path={`community/preview/${Date.now()}`} label="Upload preview" />
            </div>
            <div>
              <label className="admin-label">High-Res Original (private)</label>
              <ImageUpload bucket="community-gallery" value={imgForm.highres_url} onChange={(url) => setImgForm({ ...imgForm, highres_url: url || '' })} path={`highres/${Date.now()}`} label="Upload high-res (stored privately)" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveImg} disabled={saving} className="btn-gold">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Photo'}
            </button>
            <button onClick={cancelImg} className="btn-outline-gold">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-xs tracking-widest uppercase text-brand-ink/40 mb-3">Event Albums</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveGallery(null)} className={`w-full text-left px-3 py-2 rounded text-sm ${!activeGallery ? 'bg-brand-gold/10 text-brand-gold' : 'text-brand-ink/60 hover:text-brand-ink'}`}>
              All Photos
            </button>
            {galleries.map((g) => (
              <div key={g.id} className={`flex items-center rounded border transition-colors ${activeGallery === g.id ? 'border-brand-gold/20 bg-brand-gold/5' : 'border-transparent'}`}>
                <button onClick={() => setActiveGallery(g.id)} className={`flex-1 text-left px-3 py-2 text-sm ${activeGallery === g.id ? 'text-brand-gold' : 'text-brand-ink/60'}`}>{g.name}</button>
                <button onClick={() => openEditGal(g)} className="p-1 text-brand-ink/20 hover:text-brand-gold"><Edit2 size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-brand-ink/30 border-2 border-dashed border-brand-gold/10 rounded-lg">
              <FolderOpen size={32} className="mx-auto mb-3 opacity-40" />
              <p>No community photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded overflow-hidden border border-brand-gold/10 hover:border-brand-gold/30 transition-all">
                  <img src={img.preview_url} alt={img.title || ''} className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 right-1 flex gap-1">
                    {img.for_sale && <span className="text-[9px] bg-brand-gold px-1 py-0.5 rounded text-brand-black font-bold">${img.price}</span>}
                  </div>
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      {img.rider_name && <p className="text-xs text-white">{img.rider_name}</p>}
                      {img.club_name && <p className="text-[10px] text-brand-pink">{img.club_name}</p>}
                      <div className="flex gap-1 mt-1">
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
