import { useEffect, useState, useRef, useCallback } from 'react'
import {
  RefreshCw, Eye, EyeOff, Star, Trash2, AlertCircle,
  CheckCircle2, Loader2, ExternalLink, Clock, Search,
  ChevronLeft, ChevronRight, Image, Settings2, Share2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

const GRAPH_VERSION = 'v25.0'
const GRAPH_BASE = 'https://graph.facebook.com'
const PHOTO_FIELDS = 'id,images,name,created_time,link'
const FEED_FIELDS = 'id,message,created_time,attachments{type,description,media,url,subattachments{type,media,url}}'
const BATCH_SIZE = 50
const MAX_PHOTOS = 500

function preparePhotoPayload(photo, sourceId) {
  const images = photo.images || []
  const byWidth = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))
  const large = byWidth[0]
  const thumb = byWidth.slice().reverse().find((img) => (img.width || 0) >= 200) || byWidth[byWidth.length - 1]
  return {
    external_id: photo.id,
    source_id: sourceId,
    image_url: large?.source || null,
    thumbnail_url: thumb?.source || large?.source || null,
    facebook_url: photo.link || `https://www.facebook.com/photo?fbid=${photo.id}`,
    caption: photo.name || null,
    created_time: photo.created_time ? new Date(photo.created_time).toISOString() : null,
    metadata: { raw_images: images },
  }
}

function extractPhotosFromPost(post, sourceId) {
  const results = []
  const attachments = post.attachments?.data || []
  let idx = 0
  for (const att of attachments) {
    if (att.type === 'photo' && att.media?.image) {
      results.push({
        external_id: `${post.id}_${idx}`,
        source_id: sourceId,
        image_url: att.media.image.src,
        thumbnail_url: att.media.image.src,
        facebook_url: att.url || `https://www.facebook.com/${post.id}`,
        caption: att.description || post.message || null,
        created_time: post.created_time ? new Date(post.created_time).toISOString() : null,
        metadata: { post_id: post.id },
      })
      idx++
    } else if (att.subattachments?.data) {
      for (const sub of att.subattachments.data) {
        if (sub.type === 'photo' && sub.media?.image) {
          results.push({
            external_id: `${post.id}_${idx}`,
            source_id: sourceId,
            image_url: sub.media.image.src,
            thumbnail_url: sub.media.image.src,
            facebook_url: sub.url || att.url || `https://www.facebook.com/${post.id}`,
            caption: post.message || null,
            created_time: post.created_time ? new Date(post.created_time).toISOString() : null,
            metadata: { post_id: post.id },
          })
          idx++
        }
      }
    }
  }
  return results
}

export default function AdminFacebookPhotosPage() {
  const [source, setSource] = useState(null)
  const [form, setForm] = useState({
    page_id: '',
    access_token: '',
    enabled: true,
    default_title: 'Latest From Facebook',
    default_intro: '',
  })
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [photos, setPhotos] = useState([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('settings')
  const syncRef = useRef(false)

  const loadData = useCallback(async () => {
    const { data: sources } = await supabase.from('gallery_sources').select('*').eq('source_type', 'facebook').limit(1)
    const src = sources?.[0] || null
    setSource(src)
    if (src) {
      setForm({
        page_id: src.page_id || '',
        access_token: src.access_token || '',
        enabled: src.enabled ?? true,
        default_title: src.default_title || 'Latest From Facebook',
        default_intro: src.default_intro || '',
      })
      const { data: photoData } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('source_id', src.id)
        .order('sort_order', { ascending: true })
        .order('created_time', { ascending: false })
      setPhotos(photoData || [])
    }
    setLoading(false)
    setLoadingPhotos(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function saveSource() {
    if (!form.page_id.trim()) { toast.error('Page ID is required'); return }
    if (!form.access_token.trim()) { toast.error('Access Token is required'); return }
    setSaving(true)
    try {
      const title = form.default_title.trim() || 'Latest From Facebook'
      const intro = form.default_intro.trim()
      const payload = {
        page_id: form.page_id.trim(),
        access_token: form.access_token.trim(),
        enabled: form.enabled,
        default_title: title,
        default_intro: intro,
        updated_at: new Date().toISOString(),
      }
      let savedId = source?.id
      if (source) {
        await supabase.from('gallery_sources').update(payload).eq('id', source.id)
      } else {
        const { data: inserted } = await supabase
          .from('gallery_sources')
          .insert({ ...payload, source_type: 'facebook' })
          .select('id')
          .single()
        savedId = inserted?.id
      }

      // Mirror public-safe fields into site_settings so the public site can read them
      // without accessing the admin-only gallery_sources table (which contains the token).
      await supabase.from('site_settings').upsert([
        { key: 'facebook_gallery_enabled', value: form.enabled, updated_at: new Date().toISOString() },
        { key: 'facebook_gallery_title',   value: title,        updated_at: new Date().toISOString() },
        { key: 'facebook_gallery_intro',   value: intro || null, updated_at: new Date().toISOString() },
        { key: 'facebook_gallery_source_id', value: savedId,   updated_at: new Date().toISOString() },
      ])

      toast.success('Settings saved!')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function syncPhotos() {
    if (!source?.page_id || !source?.access_token) {
      toast.error('Save your settings before syncing')
      return
    }
    if (syncRef.current) return
    syncRef.current = true
    setSyncing(true)

    await supabase.from('gallery_sources').update({
      sync_status: 'syncing', sync_error: null, updated_at: new Date().toISOString(),
    }).eq('id', source.id)

    try {
      // Fetch albums then pull photos from each one.
      // This approach works with a standard page token and avoids permission issues
      // with the /photos?type=uploaded and /feed endpoints.
      const SKIP_ALBUMS = new Set(['Profile pictures', 'Cover photos', 'Videos', 'Reels'])

      const albumsRes = await fetch(
        `${GRAPH_BASE}/${GRAPH_VERSION}/${source.page_id}/albums?fields=id,name&limit=50&access_token=${source.access_token}`
      )
      const albumsJson = await albumsRes.json()
      if (albumsJson.error) throw new Error(albumsJson.error.message || 'Facebook API error fetching albums')

      const albums = (albumsJson.data || []).filter((a) => !SKIP_ALBUMS.has(a.name))
      if (albums.length === 0) throw new Error('No photo albums found on this page')

      const allPhotos = []
      for (const album of albums) {
        let nextUrl = `${GRAPH_BASE}/${GRAPH_VERSION}/${album.id}/photos?fields=${PHOTO_FIELDS}&limit=100&access_token=${source.access_token}`
        while (nextUrl && allPhotos.length < MAX_PHOTOS) {
          const res = await fetch(nextUrl)
          const json = await res.json()
          if (json.error) break // skip albums that fail silently
          allPhotos.push(...(json.data || []).map((p) => preparePhotoPayload(p, source.id)))
          nextUrl = json.paging?.next || null
        }
        if (allPhotos.length >= MAX_PHOTOS) break
      }

      if (allPhotos.length === 0) {
        toast('No photos found on this Facebook Page', { icon: 'ℹ️' })
        await supabase.from('gallery_sources').update({
          last_synced_at: new Date().toISOString(),
          sync_status: 'success',
          sync_error: null,
          updated_at: new Date().toISOString(),
        }).eq('id', source.id)
        await loadData()
        return
      }

      // Fetch existing external IDs for this source
      const { data: existing } = await supabase
        .from('gallery_photos')
        .select('id, external_id')
        .eq('source_id', source.id)
      const existingMap = new Map((existing || []).map((p) => [p.external_id, p.id]))

      const toInsert = []
      const toUpdate = []

      for (const payload of allPhotos) {
        if (existingMap.has(payload.external_id)) {
          toUpdate.push({ ...payload, id: existingMap.get(payload.external_id) })
        } else {
          toInsert.push(payload)
        }
      }

      // Batch-insert new photos
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const { error } = await supabase.from('gallery_photos').insert(toInsert.slice(i, i + BATCH_SIZE))
        if (error) throw error
      }

      // Update existing photos (preserve featured / enabled / sort_order)
      for (const photo of toUpdate) {
        await supabase.from('gallery_photos').update({
          image_url: photo.image_url,
          thumbnail_url: photo.thumbnail_url,
          facebook_url: photo.facebook_url,
          caption: photo.caption,
          metadata: photo.metadata,
          updated_at: new Date().toISOString(),
        }).eq('id', photo.id)
      }

      await supabase.from('gallery_sources').update({
        last_synced_at: new Date().toISOString(),
        sync_status: 'success',
        sync_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', source.id)

      toast.success(`Sync complete — ${toInsert.length} new, ${toUpdate.length} updated`)
      await loadData()
      setActiveTab('photos')
    } catch (err) {
      const msg = err.message || 'Sync failed'
      await supabase.from('gallery_sources').update({
        sync_status: 'error', sync_error: msg, updated_at: new Date().toISOString(),
      }).eq('id', source.id)
      toast.error(`Sync failed: ${msg}`)
      await loadData()
    } finally {
      setSyncing(false)
      syncRef.current = false
    }
  }

  async function togglePhoto(photo) {
    await supabase.from('gallery_photos').update({ enabled: !photo.enabled, updated_at: new Date().toISOString() }).eq('id', photo.id)
    setPhotos((p) => p.map((ph) => ph.id === photo.id ? { ...ph, enabled: !ph.enabled } : ph))
  }

  async function toggleFeatured(photo) {
    await supabase.from('gallery_photos').update({ featured: !photo.featured, updated_at: new Date().toISOString() }).eq('id', photo.id)
    setPhotos((p) => p.map((ph) => ph.id === photo.id ? { ...ph, featured: !ph.featured } : ph))
  }

  async function updateSortOrder(photo, value) {
    const order = parseInt(value) || 0
    await supabase.from('gallery_photos').update({ sort_order: order, updated_at: new Date().toISOString() }).eq('id', photo.id)
    setPhotos((p) => p.map((ph) => ph.id === photo.id ? { ...ph, sort_order: order } : ph))
  }

  async function removePhoto(photo) {
    if (!confirm('Remove this photo from the gallery? It will not be deleted from Facebook.')) return
    await supabase.from('gallery_photos').delete().eq('id', photo.id)
    setPhotos((p) => p.filter((ph) => ph.id !== photo.id))
    toast.success('Photo removed')
  }

  const filteredPhotos = photos
    .filter((p) => {
      if (filter === 'enabled') return p.enabled
      if (filter === 'featured') return p.featured
      return true
    })
    .filter((p) => {
      if (!search.trim()) return true
      return p.caption?.toLowerCase().includes(search.toLowerCase())
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-gold" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Facebook Photos</h1>
          <p className="text-brand-ink/50 text-sm mt-1">
            Sync and manage photos from your Facebook Page
          </p>
        </div>
        {source && (
          <button
            onClick={syncPhotos}
            disabled={syncing}
            className="btn-gold"
          >
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-brand-gold/15">
        {[
          { id: 'settings', label: 'Connection', icon: Settings2 },
          { id: 'photos', label: `Photos${photos.length ? ` (${photos.length})` : ''}`, icon: Image },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-ink/50 hover:text-brand-ink'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Connection Settings ── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {/* Sync status banner */}
          {source && (
            <SyncStatusBanner source={source} onSync={syncPhotos} syncing={syncing} />
          )}

          <div className="admin-card">
            <h2 className="font-serif text-lg text-brand-ink mb-1">Facebook Page Connection</h2>
            <p className="text-xs text-brand-ink/40 mb-6">
              Enter your Facebook Page ID and a long-lived Page Access Token.
              The token is stored securely and never exposed to public visitors.
            </p>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Facebook Page ID *</label>
                <input
                  className="admin-input"
                  placeholder="e.g. 123456789012345"
                  value={form.page_id}
                  onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                />
                <p className="text-[11px] text-brand-ink/40 mt-1">
                  Found in your Page settings under "About" → Page transparency
                </p>
              </div>

              <div>
                <label className="admin-label">Page Access Token *</label>
                <div className="flex gap-2">
                  <input
                    className="admin-input flex-1"
                    type={showToken ? 'text' : 'password'}
                    placeholder="EAAxxxxxxxxxx…"
                    value={form.access_token}
                    onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="px-3 rounded border border-brand-gold/20 text-brand-ink/40 hover:text-brand-ink text-xs"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-brand-ink/40 mt-1">
                  Use a long-lived Page Access Token (never expires or 60-day). Generate via Facebook Graph API Explorer.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-brand-gold/10">
                <div>
                  <label className="admin-label">Default Gallery Title</label>
                  <input
                    className="admin-input"
                    value={form.default_title}
                    onChange={(e) => setForm({ ...form, default_title: e.target.value })}
                    placeholder="Latest From Facebook"
                  />
                </div>
                <div>
                  <label className="admin-label">Enabled</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, enabled: !form.enabled })}
                      className={`w-10 h-5 rounded-full transition-colors ${form.enabled ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-xs text-brand-ink/50">{form.enabled ? 'Gallery visible on site' : 'Gallery hidden from site'}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="admin-label">Default Intro Text</label>
                  <textarea
                    className="admin-textarea"
                    value={form.default_intro}
                    onChange={(e) => setForm({ ...form, default_intro: e.target.value })}
                    rows={2}
                    placeholder="A short line shown below the gallery title…"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-brand-gold/10">
              <button onClick={saveSource} disabled={saving} className="btn-gold text-xs py-2">
                {saving ? 'Saving…' : source ? 'Save Settings' : 'Save & Connect'}
              </button>
            </div>
          </div>

          {!source && (
            <div className="admin-card bg-brand-blush/40">
              <p className="text-sm text-brand-ink/60 leading-relaxed">
                <strong className="text-brand-ink">Getting Started:</strong> Save your Facebook Page ID and Access Token above,
                then click <em>Sync Now</em> to import your photos. Once synced, the gallery will appear automatically
                on the homepage and can be added to any page via the CMS page builder.
              </p>
            </div>
          )}

          {/* Setup guide */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-brand-ink mb-3 flex items-center gap-2">
              <Share2 size={14} className="text-brand-gold" />
              How to get a Facebook Page Access Token
            </h3>
            <ol className="space-y-2 text-xs text-brand-ink/60 leading-relaxed list-decimal list-inside">
              <li>Go to <strong>developers.facebook.com</strong> and create an App (type: Business).</li>
              <li>Add the <strong>Pages API</strong> product to your app.</li>
              <li>Open <strong>Graph API Explorer</strong>, select your app, and generate a User Access Token with <code>pages_read_engagement</code> and <code>pages_show_list</code> permissions.</li>
              <li>Exchange for a long-lived User Token, then use <code>/{'{page-id}'}?fields=access_token</code> to get your Page Access Token.</li>
              <li>Paste the Page Access Token above — it typically does not expire for system users.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── Tab: Photos ── */}
      {activeTab === 'photos' && (
        <div>
          {!source ? (
            <div className="py-16 text-center border-2 border-dashed border-brand-gold/15 rounded-lg">
              <Image size={32} className="mx-auto text-brand-gold/30 mb-3" />
              <p className="text-brand-ink/50 text-sm">Configure your Facebook connection first</p>
              <button onClick={() => setActiveTab('settings')} className="btn-outline-gold text-xs mt-4">
                Go to Settings
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex gap-1">
                  {[['all', 'All'], ['enabled', 'Enabled'], ['featured', 'Featured']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilter(val)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        filter === val
                          ? 'border-brand-gold bg-brand-gold text-white'
                          : 'border-brand-gold/20 text-brand-ink/50 hover:border-brand-gold/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                  <input
                    className="admin-input pl-8 py-1.5 text-xs"
                    placeholder="Search captions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <p className="text-xs text-brand-ink/40 ml-auto">
                  {filteredPhotos.length} of {photos.length} photos
                </p>
              </div>

              {loadingPhotos ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={22} className="animate-spin text-brand-gold" />
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-brand-gold/15 rounded-lg">
                  <Image size={32} className="mx-auto text-brand-gold/30 mb-3" />
                  <p className="text-brand-ink/50 text-sm">
                    {photos.length === 0 ? 'No photos yet — click Sync Now to import' : 'No photos match your filter'}
                  </p>
                  {photos.length === 0 && (
                    <button onClick={syncPhotos} disabled={syncing} className="btn-gold text-xs mt-4">
                      {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      Sync Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredPhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onToggle={() => togglePhoto(photo)}
                      onFeature={() => toggleFeatured(photo)}
                      onRemove={() => removePhoto(photo)}
                      onSortChange={(v) => updateSortOrder(photo, v)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SyncStatusBanner({ source, onSync, syncing }) {
  const { sync_status, sync_error, last_synced_at } = source

  if (sync_status === 'error') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-700">Last sync failed</p>
          <p className="text-xs text-red-600 mt-1 break-words">{sync_error}</p>
        </div>
        <button onClick={onSync} disabled={syncing} className="btn-outline-gold text-xs py-1.5 shrink-0">
          Retry
        </button>
      </div>
    )
  }

  if (sync_status === 'syncing' || syncing) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-gold/5 border border-brand-gold/20">
        <Loader2 size={16} className="animate-spin text-brand-gold shrink-0" />
        <p className="text-sm text-brand-ink/70">Syncing photos from Facebook…</p>
      </div>
    )
  }

  if (sync_status === 'success' && last_synced_at) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
        <CheckCircle2 size={16} className="text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-700">
            Last synced{' '}
            <span className="font-medium">
              {formatDistanceToNow(parseISO(last_synced_at), { addSuffix: true })}
            </span>
          </p>
          <p className="text-xs text-green-600/70 mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {format(parseISO(last_synced_at), 'dd MMM yyyy HH:mm')}
          </p>
        </div>
      </div>
    )
  }

  return null
}

function PhotoCard({ photo, onToggle, onFeature, onRemove, onSortChange }) {
  const [orderVal, setOrderVal] = useState(String(photo.sort_order ?? 0))
  const [editing, setEditing] = useState(false)

  function commitOrder() {
    onSortChange(orderVal)
    setEditing(false)
  }

  return (
    <div className={`relative group rounded-lg overflow-hidden border transition-all duration-200 ${
      photo.enabled ? 'border-brand-gold/15' : 'border-brand-ink/10 opacity-50'
    }`}>
      {/* Thumbnail */}
      <div className="aspect-square bg-brand-surface-warm">
        {photo.thumbnail_url ? (
          <img
            src={photo.thumbnail_url}
            alt={photo.caption || ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-gold/20">
            <Image size={28} />
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="absolute top-1.5 left-1.5 flex gap-1">
        {photo.featured && (
          <span className="bg-brand-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            Featured
          </span>
        )}
        {!photo.enabled && (
          <span className="bg-brand-ink/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            Hidden
          </span>
        )}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onFeature}
          title={photo.featured ? 'Unfeature' : 'Feature'}
          className={`w-6 h-6 rounded flex items-center justify-center shadow ${
            photo.featured ? 'bg-brand-gold text-white' : 'bg-white/90 text-brand-ink/50 hover:text-brand-gold'
          }`}
        >
          <Star size={12} />
        </button>
        <button
          onClick={onToggle}
          title={photo.enabled ? 'Hide' : 'Show'}
          className="w-6 h-6 rounded bg-white/90 flex items-center justify-center shadow text-brand-ink/50 hover:text-brand-gold"
        >
          {photo.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        {photo.facebook_url && (
          <a
            href={photo.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Facebook"
            className="w-6 h-6 rounded bg-white/90 flex items-center justify-center shadow text-brand-ink/50 hover:text-brand-gold"
          >
            <ExternalLink size={11} />
          </a>
        )}
        <button
          onClick={onRemove}
          title="Remove"
          className="w-6 h-6 rounded bg-white/90 flex items-center justify-center shadow text-brand-ink/30 hover:text-red-500"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Caption + sort order */}
      <div className="p-2 bg-white">
        {photo.caption && (
          <p className="text-[10px] text-brand-ink/60 leading-tight line-clamp-2 mb-1">
            {photo.caption}
          </p>
        )}
        <div className="flex items-center justify-between gap-1">
          <p className="text-[9px] text-brand-ink/30">
            {photo.created_time ? format(parseISO(photo.created_time), 'dd MMM yy') : ''}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-brand-ink/30">Order:</span>
            {editing ? (
              <input
                type="number"
                className="w-10 text-[10px] border border-brand-gold/30 rounded px-1 py-0.5 text-center"
                value={orderVal}
                onChange={(e) => setOrderVal(e.target.value)}
                onBlur={commitOrder}
                onKeyDown={(e) => { if (e.key === 'Enter') commitOrder() }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] text-brand-ink/40 hover:text-brand-gold w-6 text-center"
              >
                {photo.sort_order ?? 0}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
