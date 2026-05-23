import { Link } from 'react-router-dom'
import Logo from './Logo'
import { Instagram, Facebook, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-surface-warm border-t border-brand-gold/20 mt-20">
      <div className="gold-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-brand-ink-soft leading-relaxed max-w-sm">
              Elite equestrian vaulting in Western Australia. Training champions for the FEI World Championships.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-brand-gold/25 rounded-lg text-brand-ink-soft hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-brand-gold/25 rounded-lg text-brand-ink-soft hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="mailto:info@stellavaulting.com.au"
                className="w-9 h-9 flex items-center justify-center border border-brand-gold/25 rounded-lg text-brand-ink-soft hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="label-gold mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/team', label: 'Meet Our Team' },
                { to: '/events', label: 'Upcoming Events' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-brand-ink-soft hover:text-brand-ink transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label-gold mb-4">Support Us</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/fundraising', label: 'Fundraising' },
                { to: '/sponsorship', label: 'Sponsorship' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/community-gallery', label: 'Community Gallery' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-brand-ink-soft hover:text-brand-ink transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gold-divider mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-ink/40">
          <span>© {new Date().getFullYear()} Stella Vaulting Academy. All rights reserved.</span>
          <span className="text-brand-gold/60">✦ Western Australia ✦</span>
        </div>
      </div>
    </footer>
  )
}
