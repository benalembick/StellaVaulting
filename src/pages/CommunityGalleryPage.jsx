import { useEffect, useState } from 'react'
import { ShoppingCart, Lock, Plus, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'

export default function CommunityGalleryPage() {
  const [galleries, setGalleries] = useState([])
  const [images, setImages] = useState([])
  const [activeGallery, setActiveGallery] = useState(null)
  const [selected, setSelected] = useState(null)
  const [added, setAdded] = useState({})
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      const [galRes, imgRes] = await Promise.all([
        supabase.from('galleries').select('*').eq('gallery_type', 'community').eq('published', true).order('created_at'),
        supabase.from('gallery_images').select('id, title, description, preview_url, price, event_name, club_name, rider_name, gallery_id, for_sale, published').eq('published', true).eq('for_sale', true).order('display_order'),
      ])
      setGalleries(galRes.data || [])
      setImages(imgRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredImages = images.filter((img) =>
    !activeGallery || img.gallery_id === activeGallery
  )

  function handleAddToCart(img) {
    addItem({
      id: img.id,
      type: 'community_photo',
      name: img.title || `Photo — ${img.event_name || 'Community Event'}`,
      price: img.price || 10,
      image: img.preview_url,
    })
    setAdded((prev) => ({ ...prev, [img.id]: true }))
    toast.success('Photo added to cart! Purchase to receive the high-resolution download.', {
      style: { background: '#2A2828', color: '#FAF8F6', border: '1px solid rgba(176,141,60,0.3)' },
      duration: 3000,
    })
    setTimeout(() => setAdded((prev) => ({ ...prev, [img.id]: false })), 2000)
  }

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="label-gold mb-4">✦ Community ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-white font-light">Community Gallery</h1>
        <p className="mt-4 text-brand-white/50 max-w-2xl mx-auto leading-relaxed">
          Photos from events featuring vaulters from clubs across the region.
          Preview images are watermarked — purchase to receive the full high-resolution download.
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Info banner */}
        <div className="pink-panel p-5 flex items-center gap-4 mb-8">
          <Lock size={20} className="text-brand-pink flex-shrink-0" />
          <div>
            <p className="text-sm text-brand-white font-medium">Preview images are watermarked</p>
            <p className="text-xs text-brand-white/60 mt-0.5">
              Add photos to cart and complete checkout to receive full high-resolution downloads.
              Our team will fulfil digital orders within 48 hours of payment.
            </p>
          </div>
        </div>

        {/* Gallery filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveGallery(null)}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase rounded border transition-colors ${
              !activeGallery ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-gold/20 text-brand-white/50 hover:border-brand-gold/40'
            }`}
          >
            All Events
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20 text-brand-white/40">
            <div className="text-6xl mb-4">📷</div>
            <p>Community photos coming soon. Check back after the next event!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="card-premium group overflow-hidden cursor-pointer"
                onClick={() => setSelected(selected?.id === img.id ? null : img)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {img.preview_url ? (
                    <img
                      src={img.preview_url}
                      alt={img.title || 'Community photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-gold/5 flex items-center justify-center">
                      <span className="text-brand-gold/30 text-5xl">📷</span>
                    </div>
                  )}
                  {/* Watermark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="opacity-30 transform -rotate-12 text-center">
                      <p className="text-white text-xs font-serif tracking-[0.2em] uppercase border border-white px-3 py-1">
                        Stella Vaulting Academy
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-brand-black/70 border border-brand-gold/30 rounded px-2 py-0.5">
                    <span className="text-brand-gold text-xs font-semibold">${(img.price || 10).toFixed(0)}</span>
                  </div>
                </div>
                <div className="p-3">
                  {img.title && <p className="text-xs font-medium text-brand-white truncate">{img.title}</p>}
                  {img.rider_name && <p className="text-[10px] text-brand-pink mt-0.5">{img.rider_name}</p>}
                  {img.club_name && <p className="text-[10px] text-brand-white/40">{img.club_name}</p>}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(img) }}
                    className={`w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold tracking-wide uppercase rounded border transition-all ${
                      added[img.id]
                        ? 'border-green-500/30 text-green-400 bg-green-600/10'
                        : 'border-brand-gold/30 text-brand-gold bg-brand-gold/5 hover:bg-brand-gold hover:text-brand-black'
                    }`}
                  >
                    {added[img.id] ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add to Cart — ${(img.price || 10).toFixed(0)}</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
