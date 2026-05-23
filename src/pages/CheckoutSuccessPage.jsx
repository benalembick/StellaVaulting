import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="card-premium p-12">
          <CheckCircle size={64} className="text-brand-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-brand-white mb-3">Thank You!</h1>
          <p className="text-brand-pink text-lg mb-6">Your donation means the world to us ❤️</p>
          <p className="text-brand-white/60 leading-relaxed mb-2">
            Your order has been received and we are so grateful for your support.
          </p>
          <p className="text-brand-white/60 leading-relaxed mb-8">
            Keep an eye on our social media — we will give you that fancy shout-out we promised!
          </p>
          {params.get('order') && (
            <p className="text-xs text-brand-white/30 mb-8">
              Order reference: {params.get('order')}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-gold">Back to Home</Link>
            <Link to="/fundraising" className="btn-outline-gold">
              <Heart size={14} /> Donate Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
