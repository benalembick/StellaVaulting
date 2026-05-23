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
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-black/95 backdrop-blur-sm border-b border-brand-gold/20 shadow-premium'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
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
                  `px-3 py-2 text-xs tracking-[0.12em] uppercase font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-gold'
                      : 'text-brand-white/70 hover:text-brand-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs tracking-wider uppercase text-brand-pink hover:text-brand-pink-light transition-colors"
              >
                <Lock size={12} />
                Admin
              </Link>
            )}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 text-brand-white/80 hover:text-brand-gold transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-brand-white/80 hover:text-brand-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-brand-black/98 border-t border-brand-gold/20 backdrop-blur-sm">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm tracking-wider uppercase font-medium rounded transition-colors ${
                    isActive
                      ? 'text-brand-gold bg-brand-gold/10'
                      : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-black-light'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-3 text-sm tracking-wider uppercase font-medium text-brand-pink hover:text-brand-pink-light rounded"
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
