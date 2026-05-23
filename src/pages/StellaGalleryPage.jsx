import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionHeading from '../components/SectionHeading'

const CATEGORIES = ['All', 'Training', 'Exercise', 'Event', 'Behind the Scenes']

export default function StellaGalleryPage() {
  const [galleries, setGalleries] = useState([])
  const [images, setImages] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeGallery, setActiveGallery] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [galRes, imgRes] = await Promise.all([
        supabase.from('galleries').select('*').eq('gallery_type', 'stella').eq('published', true).order('created_at'),
        supabase.from('gallery_images').select('*, galleries!inner(gallery_type)').eq('galleries.gallery_type', 'stella').eq('published', true).order('display_order'),
      ])
      setGalleries(galRes.data || [])
      setImages(imgRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredImages = images.filter((img) => {
    const categoryMatch = activeCategory === 'All' || img.category === activeCategory
    const galleryMatch = !activeGallery || img.gallery_id === activeGallery
    return categoryMatch && galleryMatch
  })

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="label-gold mb-4">✦ The Academy ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-white font-light">Stella Gallery</h1>
        <p className="mt-4 text-brand-white/50 max-w-2xl mx-auto">
          Behind the scenes, in training, and on the competition floor — moments from our journey.
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Gallery filter */}
          <button
            onClick={() => setActiveGallery(null)}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase rounded border transition-colors ${
              !activeGallery ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-gold/20 text-brand-white/50 hover:border-brand-gold/40'
            }`}
          >
            All Albums
          </button>
          {galleries.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGallery(g.id)}
              className={`px-4 py-1.5 text-xs tracking-wider uppercase rounded border transition-colors ${
                activeGallery === g.id ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-gold/20 text-brand-white/50 hover:border-brand-gold/40'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                activeCategory === cat ? 'border-brand-pink text-brand-pink bg-brand-pink/10' : 'border-brand-white/10 text-brand-white/40 hover:border-brand-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20 text-brand-white/40">
            <div className="text-6xl mb-4">📷</div>
            <p>No photos in this category yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg border border-brand-gold/10 hover:border-brand-gold/30 transition-all"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={img.image_url}
                  alt={img.title || 'Gallery photo'}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  {(img.title || img.category) && (
                    <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.title && <p className="text-xs font-medium text-brand-white">{img.title}</p>}
                      {img.category && <p className="text-[10px] text-brand-gold/80">{img.category}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.title || ''}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            {(lightbox.title || lightbox.description) && (
              <div className="mt-4 text-center">
                {lightbox.title && <p className="text-brand-white font-serif text-lg">{lightbox.title}</p>}
                {lightbox.description && <p className="text-brand-white/60 text-sm mt-1">{lightbox.description}</p>}
              </div>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
