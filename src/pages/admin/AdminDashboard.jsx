import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Heart, ShoppingBag, Image, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [teamRes, eventsRes, productsRes, ordersRes, imagesRes] = await Promise.all([
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('fundraising_products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        team: teamRes.count || 0,
        events: eventsRes.count || 0,
        products: productsRes.count || 0,
        images: imagesRes.count || 0,
      })
      setRecentOrders(ordersRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Team Members', value: stats.team, icon: Users, to: '/admin/team', color: 'text-brand-pink' },
    { label: 'Active Events', value: stats.events, icon: Calendar, to: '/admin/events', color: 'text-brand-gold' },
    { label: 'Donation Products', value: stats.products, icon: Heart, to: '/admin/fundraising', color: 'text-red-400' },
    { label: 'Gallery Photos', value: stats.images, icon: Image, to: '/admin/stella-gallery', color: 'text-blue-400' },
  ]

  const quickLinks = [
    { to: '/admin/posts', label: 'Manage Pinned Posts' },
    { to: '/admin/events', label: 'Add New Event' },
    { to: '/admin/team', label: 'Update Team Profiles' },
    { to: '/admin/stella-gallery', label: 'Upload Gallery Photos' },
    { to: '/admin/community-gallery', label: 'Manage Community Gallery' },
    { to: '/admin/sponsorship', label: 'Edit Sponsorship Offers' },
    { to: '/admin/orders', label: 'View All Orders' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-ink">Dashboard</h1>
        <p className="text-brand-ink/50 text-sm mt-1">Welcome back to the Stella Vaulting Academy admin panel.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to} className="admin-card hover:border-brand-gold/40 transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-brand-ink/50 tracking-wider uppercase">{label}</p>
                <p className={`font-serif text-4xl mt-2 ${color}`}>
                  {loading ? '—' : value}
                </p>
              </div>
              <Icon size={20} className={`${color} opacity-40 group-hover:opacity-70 transition-opacity`} />
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-brand-ink/30 group-hover:text-brand-gold transition-colors">
              Manage <ArrowRight size={10} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick links */}
        <div className="admin-card">
          <h2 className="font-serif text-lg text-brand-ink mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between px-4 py-2.5 rounded bg-brand-surface-alt border border-brand-gold/10 hover:border-brand-gold/30 text-sm text-brand-ink/70 hover:text-brand-ink transition-all group"
              >
                {label}
                <ArrowRight size={12} className="text-brand-gold/30 group-hover:text-brand-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-brand-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-brand-ink/30">
              <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-brand-surface-alt rounded border border-brand-gold/10">
                  <div>
                    <p className="text-sm text-brand-ink">{order.customer_name || order.customer_email || 'Anonymous'}</p>
                    <p className="text-xs text-brand-ink/40 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-gold font-semibold text-sm">${order.total_amount?.toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${
                      order.status === 'paid' ? 'bg-green-600/20 text-green-400' :
                      order.status === 'fulfilled' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-brand-gold/10 text-brand-gold'
                    }`}>
                      {order.status}
                    </span>
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
