import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, removeItem, updateQuantity } = useCart()

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-black-soft border-l border-brand-gold/20 z-50 flex flex-col shadow-premium">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold/20">
          <div>
            <h2 className="font-serif text-xl text-brand-white">Your Cart</h2>
            <p className="text-xs text-brand-white/40 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded border border-brand-gold/20 text-brand-white/60 hover:text-brand-white hover:border-brand-gold transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-brand-gold/30" />
              <p className="text-brand-white/50 text-sm">Your cart is empty</p>
              <Link
                to="/fundraising"
                onClick={() => setIsOpen(false)}
                className="btn-outline-gold text-xs"
              >
                Browse Fundraising Items
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.type}`}
                  className="flex gap-4 p-4 card-premium"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-white truncate">{item.name}</p>
                    {item.type === 'community_photo' && (
                      <p className="text-xs text-brand-pink mt-0.5">Photo download</p>
                    )}
                    {item.type === 'donation' && (
                      <p className="text-xs text-brand-gold mt-0.5">Donation</p>
                    )}
                    <p className="text-brand-gold font-semibold mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-brand-gold/30 rounded text-brand-white/60 hover:text-brand-white hover:border-brand-gold transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm text-brand-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-brand-gold/30 rounded text-brand-white/60 hover:text-brand-white hover:border-brand-gold transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.type)}
                    className="text-brand-white/30 hover:text-brand-pink transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-gold/20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-brand-white/60 text-sm">Subtotal</span>
              <span className="font-serif text-2xl text-brand-gold">${total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-gold w-full justify-center"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-2 text-center text-xs text-brand-white/40 hover:text-brand-white/60 transition-colors py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
