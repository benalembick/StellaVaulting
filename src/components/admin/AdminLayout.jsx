import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Calendar, Heart, Image,
  Camera, ShoppingBag, Award, LogOut, Menu, X, ChevronRight, Share2, UserCog
} from 'lucide-react'
import Logo from '../Logo'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pages', label: 'Pages', icon: FileText },
  { to: '/admin/posts', label: 'Posts & Pinned', icon: FileText },
  { to: '/admin/team', label: 'Team Members', icon: Users },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/fundraising', label: 'Fundraising', icon: Heart },
  { to: '/admin/stella-gallery', label: 'Stella Gallery', icon: Image },
  { to: '/admin/community-gallery', label: 'Community Gallery', icon: Camera },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/sponsorship', label: 'Sponsorship', icon: Award },
  { to: '/admin/facebook-photos', label: 'Facebook Photos', icon: Share2 },
  { to: '/admin/users', label: 'Admin Users', icon: UserCog },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await signOut()
      navigate('/admin/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface-alt flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-brand-gold/20 z-40 flex flex-col transition-transform duration-300 shadow-nav ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-4 py-5 border-b border-brand-gold/20 flex items-center justify-between">
          <Link to="/admin" onClick={() => setSidebarOpen(false)}>
            <Logo size="sm" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-ink/40 hover:text-brand-ink"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-brand-ink/30 px-2 mb-2">Navigation</p>
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `admin-sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  {label}
                  <ChevronRight size={12} className="ml-auto opacity-30" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-brand-gold/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold text-sm font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-brand-ink truncate">{user?.email}</p>
              <p className="text-[10px] text-brand-gold">Administrator</p>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-brand-ink/50 hover:text-brand-ink transition-colors mb-2"
          >
            View Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-brand-ink/50 hover:text-red-500 transition-colors w-full"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-4 bg-white border-b border-brand-gold/20 sticky top-0 z-20 shadow-nav">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-brand-ink/60 hover:text-brand-ink"
          >
            <Menu size={22} />
          </button>
          <Logo size="sm" />
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
