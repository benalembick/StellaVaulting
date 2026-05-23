import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SectionHeading from '../components/SectionHeading'

const TIER_COLORS = {
  platinum: 'border-brand-white/40 bg-brand-white/5',
  gold: 'border-brand-gold/40 bg-brand-gold/5',
  silver: 'border-brand-pink/30 bg-brand-pink/5',
  bronze: 'border-brand-white/20 bg-brand-white/3',
}

const TIER_BADGE = {
  platinum: 'text-brand-white bg-brand-white/10',
  gold: 'text-brand-gold bg-brand-gold/10',
  silver: 'text-brand-pink bg-brand-pink/10',
  bronze: 'text-brand-white/60 bg-brand-white/5',
}

export default function SponsorshipPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('sponsorship_items')
      .select('*')
      .eq('published', true)
      .order('display_order')
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="label-gold mb-4">✦ Partner With Us ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-white font-light">Sponsorship</h1>
        <p className="mt-4 text-brand-white/50 max-w-2xl mx-auto leading-relaxed">
          We are seeking passionate sponsors to join us on our journey to the FEI World Championships.
          Your support makes the impossible, possible.
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Featured callout */}
        <div className="card-premium p-8 md:p-12 mb-16 border-brand-gold/30">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="label-gold mb-3">✦ Priority Opportunity ✦</p>
              <h2 className="font-serif text-3xl md:text-4xl text-brand-white leading-tight">
                We are looking for a sponsor to help build an indoor arena and to sponsor IVC Rising Star athlete Imelda Alembick.
              </h2>
              <p className="text-brand-white/60 mt-6 leading-relaxed">
                These two opportunities represent transformational investments in the future of vaulting in Western Australia.
                We would love to hear from businesses and individuals who share our passion for equestrian sport.
              </p>
              <a
                href="mailto:sponsors@stellavaulting.com.au"
                className="btn-gold mt-8 inline-flex"
              >
                Enquire Now <ExternalLink size={16} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏟️', label: 'Indoor Arena', value: 'Priority Sponsor' },
                { icon: '⭐', label: 'IVC Rising Star', value: 'Imelda Alembick' },
                { icon: '🌏', label: 'FEI Worlds', value: '2025 Goal' },
                { icon: '🐴', label: 'Moose', value: 'Our Star Horse' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="pink-panel p-4 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs text-brand-white/50 tracking-wide">{label}</p>
                  <p className="text-sm text-brand-gold mt-1 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsorship tiers */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SectionHeading
              label="Opportunities"
              title="Sponsorship Packages"
              className="mb-10"
            />
            <div className="space-y-8">
              {items.map((item) => (
                <SponsorshipCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Benefits */}
        <div className="mt-20 border-t border-brand-gold/20 pt-16">
          <SectionHeading
            label="Why Sponsor Us"
            title="Sponsor Benefits"
            center
            className="mb-12"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📱',
                title: 'Social Media Recognition',
                desc: 'Regular shout-outs across our Instagram and Facebook to our engaged community of equestrian enthusiasts.',
              },
              {
                icon: '🌐',
                title: 'Website Feature',
                desc: 'Prominent placement on our website with logo, profile, and link — visible to a global audience of vaulting fans.',
              },
              {
                icon: '🏆',
                title: 'Event Presence',
                desc: 'Acknowledgement at all competitions, VIP invitations to events, and brand visibility in competition arenas.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-premium p-6 text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-serif text-lg text-brand-white mb-2">{title}</h3>
                <p className="text-xs text-brand-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-brand-white/60 mb-6 max-w-xl mx-auto">
            Ready to make a difference? We would love to discuss a sponsorship arrangement that works for you.
          </p>
          <a href="mailto:sponsors@stellavaulting.com.au" className="btn-gold">
            Contact Us About Sponsorship
          </a>
        </div>
      </div>
    </div>
  )
}

function SponsorshipCard({ item }) {
  return (
    <div className={`card-premium p-8 ${TIER_COLORS[item.tier] || ''}`}>
      <div className="flex flex-col lg:flex-row gap-8">
        {item.image && (
          <div className="lg:w-64 flex-shrink-0">
            <img src={item.image} alt={item.title} className="w-full h-48 lg:h-full object-cover rounded" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {item.tier && (
                <span className={`inline-block text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded mb-3 ${TIER_BADGE[item.tier] || ''}`}>
                  {item.tier} Sponsor
                </span>
              )}
              <h3 className="font-serif text-2xl text-brand-white">{item.title}</h3>
              {item.description && (
                <p className="text-brand-pink text-sm mt-1">{item.description}</p>
              )}
            </div>
            {item.amount && (
              <div className="text-right">
                <p className="text-xs text-brand-white/40 tracking-wide">Investment</p>
                <p className="font-serif text-2xl text-brand-gold">${item.amount.toLocaleString()}</p>
              </div>
            )}
          </div>
          {item.body && (
            <p className="text-brand-white/70 mt-4 leading-relaxed text-sm">{item.body}</p>
          )}
          {item.cta_text && (
            <div className="mt-6">
              {item.cta_url?.startsWith('mailto') ? (
                <a href={item.cta_url} className="btn-outline-gold">
                  {item.cta_text} <ExternalLink size={14} />
                </a>
              ) : (
                <Link to={item.cta_url || '#'} className="btn-outline-gold">
                  {item.cta_text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
