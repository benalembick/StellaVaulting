import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingCart, Lock } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Our Team' },
  { to: '/events', label: 'Events' },
  { to: '/sponsorship', label: 'Sponsorship' },
  { to: '/fundraising', label: 'Fundraising' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/community-gallery', label: 'Community' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count, setIsOpen } = useCart()
  const { isAdmin } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const adminBarVisible = isAdmin && !location.pathname.startsWith('/admin')

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        adminBarVisible ? 'top-10' : 'top-0'
      } ${
        scrolled
          ? 'bg-white/[0.82] backdrop-blur-md backdrop-brightness-110 border-b border-brand-gold/[0.2] shadow-nav'
          : 'bg-white/[0.35] backdrop-blur-lg backdrop-brightness-125'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] lg:flex lg:items-center lg:justify-between min-h-[216px] py-2">
          {/* Mobile spacer — centres logo by balancing the right-side icons */}
          <div className="lg:hidden" />

          <Link to="/" className="flex-shrink-0 flex justify-center lg:justify-start">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 text-xs tracking-[0.1em] uppercase font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-gold'
                      : 'text-brand-ink/60 hover:text-brand-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs tracking-wider uppercase text-brand-gold/70 hover:text-brand-gold transition-colors"
              >
                <Lock size={12} />
                Admin
              </Link>
            )}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 text-brand-ink/60 hover:text-brand-gold transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-brand-ink/60 hover:text-brand-ink transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-brand-gold/[0.15] shadow-nav">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm tracking-wider uppercase font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-gold bg-brand-gold/10'
                      : 'text-brand-ink/70 hover:text-brand-ink hover:bg-brand-surface-alt'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-3 text-sm tracking-wider uppercase font-medium text-brand-gold/70 hover:text-brand-gold rounded-lg"
              >
                ⚙ Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
