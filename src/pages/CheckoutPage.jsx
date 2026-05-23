import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center text-center px-4 min-h-screen">
        <ShoppingBag size={64} className="text-brand-gold/30 mb-6" />
        <h2 className="font-serif text-3xl text-brand-white mb-3">Your cart is empty</h2>
        <p className="text-brand-white/50 mb-6">Add some items before checking out.</p>
        <button onClick={() => navigate('/fundraising')} className="btn-gold">
          Browse Donations
        </button>
      </div>
    )
  }

  async function handleCheckout(e) {
    e.preventDefault()
    if (!form.email) {
      toast.error('Please enter your email address.')
      return
    }
    setLoading(true)

    try {
      // Create order record in Supabase
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_email: form.email,
          customer_name: form.name,
          message: form.message,
          total_amount: total,
          status: 'pending',
          order_type: items.every((i) => i.type === 'donation')
            ? 'donation'
            : items.every((i) => i.type === 'community_photo')
            ? 'photo'
            : 'mixed',
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        item_type: item.type,
        item_id: item.id,
        item_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      }))

      await supabase.from('order_items').insert(orderItems)

      // Attempt Stripe redirect if configured
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      if (stripeKey && stripeKey !== 'your_stripe_publishable_key') {
        const { getStripe } = await import('../lib/stripe')
        const stripe = await getStripe()
        if (stripe) {
          const lineItems = items.map((item) => ({
            price_data: {
              currency: 'aud',
              product_data: {
                name: item.name,
                description: item.type === 'donation' ? 'Donation — Stella Vaulting Academy' : 'Photo purchase',
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          }))

          await stripe.redirectToCheckout({
            lineItems,
            mode: 'payment',
            successUrl: `${window.location.origin}/checkout/success?order=${order.id}`,
            cancelUrl: `${window.location.origin}/checkout`,
            customerEmail: form.email,
            clientReferenceId: order.id,
          })
          return
        }
      }

      // If no Stripe, mark order as paid directly (demo mode)
      await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id)
      clearCart()
      navigate(`/checkout/success?order=${order.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <h1 className="font-serif text-4xl text-brand-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Order form */}
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="admin-card">
              <h2 className="font-serif text-xl text-brand-white mb-5">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="admin-input"
                    placeholder="Your name (for social shout-out)"
                  />
                </div>
                <div>
                  <label className="admin-label">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="admin-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Message (optional)</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="admin-textarea"
                    rows={3}
                    placeholder="A personal message for your social shout-out ❤️"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Complete Donation — ${total.toFixed(2)}</>}
            </button>
            <p className="text-[10px] text-brand-white/30 text-center">
              Secure payment via Stripe. Your details are protected.
            </p>
          </form>

          {/* Order summary */}
          <div className="admin-card">
            <h2 className="font-serif text-xl text-brand-white mb-5">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.type}`} className="flex items-center justify-between gap-3 py-2 border-b border-brand-gold/10">
                  <div className="flex items-center gap-2">
                    {item.emoji && <span className="text-xl">{item.emoji}</span>}
                    <div>
                      <p className="text-sm text-brand-white">{item.name}</p>
                      {item.quantity > 1 && <p className="text-xs text-brand-white/40">× {item.quantity}</p>}
                    </div>
                  </div>
                  <p className="text-brand-gold font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-gold/20">
              <span className="text-brand-white/60">Total</span>
              <span className="font-serif text-3xl text-brand-gold">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
