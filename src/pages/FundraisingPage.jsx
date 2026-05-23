import { useEffect, useState } from 'react'
import { ShoppingCart, Heart, Plus, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'

export default function FundraisingPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})
  const { addItem, setIsOpen } = useCart()

  useEffect(() => {
    supabase
      .from('fundraising_products')
      .select('*')
      .eq('published', true)
      .order('display_order')
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  function handleAdd(product) {
    addItem({
      id: product.id,
      type: 'donation',
      name: product.name,
      price: product.price,
      image: product.image || null,
      emoji: product.emoji,
    })
    setAdded((prev) => ({ ...prev, [product.id]: true }))
    toast.success(`${product.emoji || '✓'} Added to cart!`, {
      style: { background: '#2A2828', color: '#FAF8F6', border: '1px solid rgba(176,141,60,0.3)' },
    })
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 2000)
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="label-gold mb-4">✦ Support Our Athletes ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-white font-light">Fundraising</h1>
        <p className="mt-6 text-brand-white/70 max-w-2xl mx-auto leading-relaxed text-lg font-light">
          Help take some pressure off our vaulters and support our team by donating.
          We promise you a fancy shout out on our socials ❤️
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SectionHeading
              label="Donation Shop"
              title="Choose Your Contribution"
              subtitle="Every donation makes a difference"
              className="mb-10"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAdd(product)}
                  justAdded={!!added[product.id]}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setIsOpen(true)}
                className="btn-outline-gold"
              >
                <ShoppingCart size={16} /> View Cart
              </button>
            </div>
          </>
        )}

        {/* Social promise */}
        <div className="mt-16 pink-panel p-8 text-center">
          <div className="text-4xl mb-4">❤️</div>
          <h2 className="font-serif text-2xl text-brand-white mb-3">Our Promise to You</h2>
          <p className="text-brand-white/70 max-w-xl mx-auto leading-relaxed">
            Every single donor will receive a heartfelt shout out on our social media pages.
            Your generosity deserves recognition — and we love celebrating our community!
          </p>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <SectionHeading label="Simple Steps" title="How It Works" center className="mb-10" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Choose a Donation', desc: 'Browse our donation products and add your favourites to the cart.' },
              { step: '02', title: 'Checkout Securely', desc: 'Pay safely via Stripe. Add your name and an optional message for your social shout-out.' },
              { step: '03', title: 'Get Celebrated!', desc: 'We\'ll give you a fancy shout-out on our Instagram and Facebook. You\'re amazing!' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card-premium p-6">
                <div className="text-5xl font-serif text-brand-gold/20 mb-3">{step}</div>
                <h3 className="font-serif text-lg text-brand-white mb-2">{title}</h3>
                <p className="text-sm text-brand-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAdd, justAdded }) {
  return (
    <div className="card-premium group hover:border-brand-gold/40 transition-all duration-300 flex flex-col">
      {product.image ? (
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-square bg-brand-gold/5 flex items-center justify-center border-b border-brand-gold/10">
          <span className="text-6xl">{product.emoji || '🎁'}</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-brand-white leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-brand-white/60 mt-2 leading-relaxed flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-gold/10">
          <span className="font-serif text-2xl text-brand-gold">${product.price.toFixed(0)}</span>
          <button
            onClick={onAdd}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded transition-all duration-200 ${
              justAdded
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-black'
            }`}
          >
            {justAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}
