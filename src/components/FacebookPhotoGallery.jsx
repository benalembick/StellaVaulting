import { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AUTOPLAY_DELAY = 5000

function sortPhotos(photos, sortMode) {
  return [...photos].sort((a, b) => {
    if (sortMode === 'newest') {
      return new Date(b.created_time || 0) - new Date(a.created_time || 0)
    }
    if (sortMode === 'manual') {
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    }
    // featured_first (default): featured → manual order → newest
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
    if (orderDiff !== 0) return orderDiff
    return new Date(b.created_time || 0) - new Date(a.created_time || 0)
  })
}

export default function FacebookPhotoGallery({
  sourceId = null,
  title = null,
  intro = null,
  displayMode = 'slideshow',
  maxImages = 12,
  sortMode = 'featured_first',
  className = '',
}) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null) // index or null

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)

      let query = supabase
        .from('gallery_photos')
        .select('id, image_url, thumbnail_url, facebook_url, caption, created_time, featured, sort_order')
        .eq('enabled', true)
        .limit(maxImages * 3) // fetch extra so sorting still respects maxImages after filtering

      if (sourceId) {
        query = query.eq('source_id', sourceId)
      } else {
        // Look up the primary source ID from site_settings (publicly readable)
        const { data: settingsRows } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['facebook_gallery_source_id', 'facebook_gallery_enabled'])
        const settings = Object.fromEntries((settingsRows || []).map((r) => [r.key, r.value]))
        if (!settings.facebook_gallery_enabled || !settings.facebook_gallery_source_id) {
          if (active) { setPhotos([]); setLoading(false) }
          return
        }
        query = query.eq('source_id', settings.facebook_gallery_source_id)
      }

      const { data } = await query
      if (!active) return
      const sorted = sortPhotos(data || [], sortMode).slice(0, maxImages)
      setPhotos(sorted)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [sourceId, maxImages, sortMode])

  if (loading) return <GalleryLoading />
  if (photos.length === 0) return null

  return (
    <div className={className}>
      {displayMode === 'grid' ? (
        <GalleryGrid photos={photos} onOpen={setLightbox} />
      ) : (
        <Slideshow photos={photos} />
      )}

      {lightbox !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

// ── Slideshow ──────────────────────────────────────────────────────────────

function Slideshow({ photos }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState({})
  const timerRef = useRef(null)
  const touchRef = useRef(null)
  const count = photos.length

  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])
  const goNext = useCallback(() => setCurrent((c) => (c + 1) % count), [count])

  useEffect(() => {
    if (paused || count <= 1) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(goNext, AUTOPLAY_DELAY)
    return () => clearInterval(timerRef.current)
  }, [paused, count, goNext])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goPrev, goNext])

  function handleTouchStart(e) { touchRef.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchRef.current === null) return
    const delta = e.changedTouches[0].clientX - touchRef.current
    if (Math.abs(delta) > 50) delta < 0 ? goNext() : goPrev()
    touchRef.current = null
  }

  const photo = photos[current]
  const showDots = count > 1 && count <= 24

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-premium"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      <div className="relative aspect-[16/9] bg-brand-black-soft">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Blurred background fills space around portrait images */}
            <img
              src={p.image_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-50"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Sharp foreground — fully contained, never cropped */}
            <img
              src={p.image_url}
              alt={p.caption || ''}
              onLoad={() => setLoaded((l) => ({ ...l, [p.id]: true }))}
              className="absolute inset-0 w-full h-full object-contain"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Caption gradient + text */}
        {photo.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent pt-16 pb-6 px-6 md:px-8">
            <p className="text-white/90 text-sm md:text-base font-light leading-snug line-clamp-2">
              {photo.caption}
            </p>
          </div>
        )}

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* View on Facebook link */}
        {photo.facebook_url && (
          <a
            href={photo.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 hover:bg-black/55 text-white/80 hover:text-white rounded-full px-2.5 py-1 text-[10px] transition-colors"
          >
            <ExternalLink size={10} /> Facebook
          </a>
        )}

        {/* Progress bar */}
        {count > 1 && !paused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              key={current}
              className="h-full bg-brand-gold/70"
              style={{
                animation: `slideProgress ${AUTOPLAY_DELAY}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {showDots && (
        <div className="flex justify-center gap-1.5 py-3 bg-white">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-brand-gold w-4 h-1.5'
                  : 'bg-brand-gold/25 w-1.5 h-1.5 hover:bg-brand-gold/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip for large sets */}
      {count > 24 && (
        <div className="flex gap-1 p-2 bg-white overflow-x-auto scrollbar-thin">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-colors ${
                i === current ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p.thumbnail_url || p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Grid ───────────────────────────────────────────────────────────────────

function GalleryGrid({ photos, onOpen }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onOpen(i)}
          className="group relative aspect-square overflow-hidden rounded-lg bg-brand-surface-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <img
            src={photo.thumbnail_url || photo.image_url}
            alt={photo.caption || ''}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {photo.caption && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-xs leading-tight line-clamp-3">{photo.caption}</p>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Lightbox ───────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const touchRef = useRef(null)
  const count = photos.length

  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])
  const goNext = useCallback(() => setCurrent((c) => (c + 1) % count), [count])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  function handleTouchStart(e) { touchRef.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchRef.current === null) return
    const delta = e.changedTouches[0].clientX - touchRef.current
    if (Math.abs(delta) > 50) delta < 0 ? goNext() : goPrev()
    touchRef.current = null
  }

  const photo = photos[current]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        ×
      </button>

      {/* Image */}
      <div
        className="max-w-5xl max-h-[85vh] mx-auto px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image_url}
          alt={photo.caption || ''}
          className="max-w-full max-h-[80vh] object-contain rounded"
        />
        {photo.caption && (
          <p className="text-white/70 text-sm text-center mt-3 px-4">{photo.caption}</p>
        )}
        {photo.facebook_url && (
          <div className="text-center mt-2">
            <a
              href={photo.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-gold-light text-xs transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={11} /> View on Facebook
            </a>
          </div>
        )}
      </div>

      {/* Navigation */}
      {count > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        {current + 1} / {count}
      </div>
    </div>
  )
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function GalleryLoading() {
  return (
    <div className="aspect-[16/9] rounded-xl bg-brand-surface-warm flex items-center justify-center animate-pulse">
      <Loader2 size={28} className="text-brand-gold/30 animate-spin" />
    </div>
  )
}
