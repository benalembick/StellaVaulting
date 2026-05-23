import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-brand-gold/10 text-brand-gold',
  paid: 'bg-green-600/20 text-green-400',
  fulfilled: 'bg-blue-600/20 text-blue-400',
  refunded: 'bg-red-600/20 text-red-400',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [orderItems, setOrderItems] = useState({})

  async function load() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function loadItems(orderId) {
    if (orderItems[orderId]) {
      setExpanded(expanded === orderId ? null : orderId)
      return
    }
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId)
    setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }))
    setExpanded(orderId)
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    await load()
    toast.success(`Status updated to ${status}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-white">Orders</h1>
        <p className="text-brand-white/50 text-sm mt-1">Donation and photo purchase orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-brand-white/30">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="admin-card">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => loadItems(order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-brand-white font-medium">{order.customer_name || 'Anonymous'}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${STATUS_COLORS[order.status] || 'text-brand-white/40'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-white/40 mt-0.5">{order.customer_email}</p>
                  {order.message && (
                    <p className="text-xs text-brand-pink mt-1 italic">"{order.message}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-brand-gold font-semibold">${order.total_amount?.toFixed(2)}</p>
                  <p className="text-xs text-brand-white/40 mt-0.5">
                    {format(new Date(order.created_at), 'd MMM yyyy')}
                  </p>
                </div>
              </div>

              {expanded === order.id && orderItems[order.id] && (
                <div className="mt-4 pt-4 border-t border-brand-gold/10">
                  <div className="space-y-2">
                    {orderItems[order.id].map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-brand-white/70">{item.item_name} × {item.quantity}</span>
                        <span className="text-brand-gold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="text-xs text-brand-white/40">Update status:</span>
                    {['pending', 'paid', 'fulfilled', 'refunded'].map((s) => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s) }}
                        className={`px-2 py-1 text-[10px] uppercase tracking-wide rounded border transition-colors ${
                          order.status === s
                            ? 'border-brand-gold text-brand-gold bg-brand-gold/10'
                            : 'border-brand-white/10 text-brand-white/40 hover:border-brand-white/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-brand-white/20 mt-2 font-mono">ID: {order.id}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
