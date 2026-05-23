import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import SectionHeading from '../components/SectionHeading'

export default function HomePage() {
  const [pinnedPosts, setPinnedPosts] = useState([])
  const [nextEvent, setNextEvent] = useState(null)

  useEffect(() => {
    async function load() {
      const [postsRes, eventsRes] = await Promise.all([
        supabase.from('posts').select('*').eq('published', true).eq('pinned', true).order('pin_order'),
        supabase.from('events').select('*').eq('published', true).eq('show_countdown', true).gte('event_date', new Date().toISOString()).order('event_date').limit(1),
      ])
      setPinnedPosts(postsRes.data || [])
      setNextEvent(eventsRes.data?.[0] || null)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-9xl text-brand-gold font-serif">✦</div>
          <div className="absolute bottom-40 right-20 text-7xl text-brand-gold font-serif">✦</div>
          <div className="absolute top-1/2 left-1/4 text-5xl text-brand-pink font-serif">✦</div>
        </div>
        <div className="absolute inset-0 border border-brand-gold/5 m-8 rounded-sm pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 animate-fade-in">
          <p className="label-gold mb-6">✦ Western Australia ✦</p>
          <h1 className="font-serif font-light text-6xl md:text-8xl text-brand-white leading-tight tracking-tight">
            Stella Vaulting
            <span className="block text-gradient-gold italic">Academy</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-brand-white/60 font-light max-w-2xl mx-auto leading-relaxed">
            Elite equestrian vaulting for athletes who dare to dream of the world stage.
            Training champions for the FEI World Championships.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/about" className="btn-gold">
              Discover Our Story <ArrowRight size={16} />
            </Link>
            <Link to="/fundraising" className="btn-outline-gold">
              Support the Team <Heart size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-white/30">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-brand-gold/40" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        </div>
      </section>

      {/* Countdown + Fundraising CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {nextEvent ? (
              <CountdownTimer
                eventDate={nextEvent.event_date}
                eventName={nextEvent.name}
                fundraisingTarget={nextEvent.fundraising_target}
              />
            ) : (
              <div className="card-premium p-8 text-center">
                <p className="font-serif text-2xl text-brand-white">Upcoming Events</p>
                <p className="text-brand-white/50 mt-2 text-sm">Check back soon for our next event</p>
                <Link to="/events" className="btn-outline-gold mt-6 inline-flex">View Events</Link>
              </div>
            )}

            <div className="pink-panel p-8 text-center lg:text-left">
              <p className="label-gold mb-4">✦ Support Us ✦</p>
              <h2 className="font-serif text-3xl text-brand-white leading-tight">
                Help us fundraise for our next event
              </h2>
              <p className="text-brand-white/60 mt-4 leading-relaxed">
                Every contribution — big or small — brings our athletes one step closer to representing Australia on the world stage.
                Join our community of supporters and make a real difference.
              </p>
              <Link to="/fundraising" className="btn-gold mt-6 inline-flex">
                Donate Now <Heart size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gold-divider" />
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Latest News"
              title="From the Academy"
              subtitle="Updates & announcements"
              center
              className="mb-12"
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedPosts.map((post) => (
                <PinnedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Three pillars */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Who We Are"
            title="Excellence in Vaulting"
            center
            className="mb-12"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🏆',
                title: 'Elite Ambition',
                desc: 'We train athletes who aspire to compete at the highest international levels, including the FEI World Championships.',
              },
              {
                icon: '🐴',
                title: 'Horse & Athlete',
                desc: 'The partnership between horse and athlete is at the heart of everything we do. We nurture both with care and expertise.',
              },
              {
                icon: '✦',
                title: 'Community',
                desc: 'We are a tight-knit community of vaulters, coaches, and supporters united by a shared love of the sport.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-premium p-8 text-center group hover:border-brand-gold/40 transition-all">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-serif text-xl text-brand-white mb-3">{title}</h3>
                <p className="text-sm text-brand-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-brand-gold/5 border-y border-brand-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="label-gold mb-4">✦ Sponsor the Academy ✦</p>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-white">
            Partner with Stella Vaulting Academy
          </h2>
          <p className="text-brand-white/60 mt-4 max-w-2xl mx-auto">
            We are looking for sponsors to help build an indoor arena and support our IVC Rising Star athlete Imelda Alembick on her international journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/sponsorship" className="btn-gold">Explore Sponsorship</Link>
            <Link to="/team" className="btn-outline-gold">Meet Our Team</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PinnedPostCard({ post }) {
  return (
    <div className="card-premium group hover:border-brand-gold/40 transition-all duration-300 flex flex-col">
      {post.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      {!post.image && (
        <div className="aspect-video bg-brand-gold/5 flex items-center justify-center border-b border-brand-gold/10">
          <span className="text-4xl text-brand-gold/30">✦</span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-brand-white group-hover:text-brand-gold transition-colors">
          {post.title}
        </h3>
        {post.short_description && (
          <p className="text-sm text-brand-white/60 mt-2 leading-relaxed flex-1">
            {post.short_description}
          </p>
        )}
        <Link
          to={`/posts/${post.slug}`}
          className="mt-5 flex items-center gap-2 text-xs tracking-wider uppercase text-brand-gold hover:text-brand-gold-light transition-colors"
        >
          Read More <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
