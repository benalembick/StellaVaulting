import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Trophy, Award, Globe, Sparkles, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import SectionHeading from '../components/SectionHeading'
import EditableSection from '../components/EditableSection'
import FacebookPhotoGallery from '../components/FacebookPhotoGallery'
import PageRenderer from '../components/PageRenderer'

export default function HomePage() {
  const [pinnedPosts, setPinnedPosts] = useState([])
  const [nextEvent, setNextEvent] = useState(null)
  const [fbGallery, setFbGallery] = useState(null) // null = loading, false = hidden, object = show
  const [homeSections, setHomeSections] = useState([])

  useEffect(() => {
    async function load() {
      const [postsRes, eventsRes, settingsRes, homePageRes] = await Promise.all([
        supabase.from('posts').select('*').eq('published', true).eq('pinned', true).order('pin_order'),
        supabase.from('events').select('*').eq('published', true).eq('show_countdown', true).gte('event_date', new Date().toISOString()).order('event_date').limit(1),
        // site_settings is publicly readable — the access token never lives here
        supabase.from('site_settings').select('key, value').in('key', [
          'facebook_gallery_enabled',
          'facebook_gallery_title',
          'facebook_gallery_intro',
          'facebook_gallery_source_id',
        ]),
        supabase.from('pages').select('id').eq('slug', 'home').single(),
      ])
      setPinnedPosts(postsRes.data || [])
      setNextEvent(eventsRes.data?.[0] || null)

      if (homePageRes.data) {
        const { data: sectionsData } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', homePageRes.data.id)
          .eq('published', true)
          .order('order_index')
        setHomeSections(sectionsData || [])
      }

      const settings = Object.fromEntries((settingsRes.data || []).map((r) => [r.key, r.value]))
      const enabled = settings.facebook_gallery_enabled
      const sourceId = settings.facebook_gallery_source_id
      if (!enabled || !sourceId) { setFbGallery(false); return }

      // Only show if there are enabled photos in this source
      const { count } = await supabase
        .from('gallery_photos')
        .select('id', { count: 'exact', head: true })
        .eq('source_id', sourceId)
        .eq('enabled', true)
      setFbGallery(
        count > 0
          ? {
              id: sourceId,
              default_title: settings.facebook_gallery_title || 'Latest From Facebook',
              default_intro: settings.facebook_gallery_intro || null,
            }
          : false
      )
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero — full-bleed image with text overlay */}
      {/* mt-[160px]: main has pt-[56px] but header is 216px tall, so push down the 160px gap */}
      <section className="relative w-full overflow-hidden bg-brand-black mt-[60px] lg:mt-[160px] hero-section">
        {/* Image — hero-bg class handles responsive background-position */}
        <div aria-hidden="true" className="absolute inset-0 hero-bg" />

        {/* Dark gradient fade — responsive positions via hero-fade class in index.css */}
        <div className="hero-fade absolute inset-0" />

        {/* Mobile: top-to-bottom scrim behind the heading block, fades out just past the star line */}
        <div
          className="lg:hidden absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '50%', background: 'linear-gradient(to bottom, rgba(20,18,18,0.92) 0%, rgba(20,18,18,0.85) 40%, rgba(20,18,18,0.5) 72%, transparent 100%)' }}
        />

        {/* Text content — justify-between on mobile spreads to top/middle/bottom */}
        <div className="relative z-10 flex flex-col justify-between lg:justify-center h-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-28 pt-6 pb-[14vh] lg:py-0">

          {/* TOP: location tag + heading + star rule grouped together */}
          <div className="lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-brand-gold" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-medium">Western Australia</span>
            </div>
            <h1 className="font-serif font-light leading-tight tracking-tight">
              <span className="block text-white text-5xl md:text-6xl xl:text-[5.5rem]">Stella Vaulting</span>
              <span className="block italic text-brand-gold text-5xl md:text-6xl xl:text-[5.5rem]">Academy</span>
            </h1>
            <div className="flex items-center gap-4 mt-5">
              <span className="text-brand-gold text-base leading-none">★</span>
              <div className="w-36 h-px bg-brand-gold/50" />
            </div>
          </div>

          {/* MIDDLE: body text with subtle dark scrim on mobile for readability */}
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-sm md:max-w-md
                        bg-black/40 rounded-lg px-3 py-2
                        lg:bg-transparent lg:px-0 lg:py-0">
            Elite equestrian vaulting for athletes who dare to dream of the world stage.
            Training champions for the FEI World Championships.
          </p>

          {/* BOTTOM: both buttons filled on mobile; second reverts to outline on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 lg:mt-10">
            <Link to="/about" className="btn-gold">
              Discover Our Story <ArrowRight size={16} />
            </Link>
            <Link to="/fundraising" className="btn-gold lg:hidden">
              Support the Team <Heart size={16} />
            </Link>
            <Link to="/fundraising" className="btn-outline-gold hidden lg:inline-flex">
              Support the Team <Heart size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-brand-gold/[0.15]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 divide-y divide-brand-gold/[0.15] lg:divide-y-0 lg:divide-x">
            {[
              { Icon: Trophy,   label: 'World Class\nTraining' },
              { Icon: Award,    label: 'Athlete Focused\nDevelopment' },
              { Icon: Globe,    label: 'Competing on the\nWorld Stage' },
              { Icon: Sparkles, label: 'Discipline. Strength.\nExcellence.' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-4 px-6 lg:px-10 py-5 lg:py-7">
                <Icon size={26} className="text-brand-gold flex-shrink-0" strokeWidth={1.4} />
                <span className="flex-1 text-[10px] tracking-[0.15em] uppercase font-semibold text-brand-ink leading-tight whitespace-pre-line">
                  {label}
                </span>
                <ChevronRight size={16} className="text-brand-gold/50 lg:hidden flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countdown + Fundraising CTA */}
      <EditableSection adminPath="/admin/events" label="Events">
        <section className="py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {nextEvent ? (
                <CountdownTimer
                  eventDate={nextEvent.event_date}
                  eventName={nextEvent.name}
                  fundraisingTarget={nextEvent.fundraising_target}
                />
              ) : (
                <div className="card-premium p-8 text-center">
                  <p className="font-serif text-2xl text-brand-ink">Upcoming Events</p>
                  <p className="text-brand-ink-soft mt-2 text-sm">Check back soon for our next event</p>
                  <Link to="/events" className="btn-outline-gold mt-6 inline-flex">View Events</Link>
                </div>
              )}

              <div className="pink-panel p-10 text-center lg:text-left">
                <p className="label-gold mb-4">✦ Support Us ✦</p>
                <h2 className="font-serif text-3xl text-brand-ink leading-tight">
                  Help us fundraise for our next event
                </h2>
                <p className="text-brand-ink-soft mt-4 leading-relaxed">
                  Every contribution — big or small — brings our athletes one step closer to representing Australia on the world stage.
                  Join our community of supporters and make a real difference.
                </p>
                <Link to="/fundraising" className="btn-gold mt-8 inline-flex">
                  Donate Now <Heart size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </EditableSection>

      {/* Gold divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gold-divider" />
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <EditableSection adminPath="/admin/posts" label="Pinned Posts">
          <section className="py-28 bg-brand-surface-alt">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading
                label="Latest News"
                title="From the Academy"
                subtitle="Updates & announcements"
                center
                className="mb-16"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {pinnedPosts.map((post) => (
                  <PinnedPostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        </EditableSection>
      )}

      {/* Three pillars */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Who We Are"
            title="Excellence in Vaulting"
            center
            className="mb-16"
          />
          <div className="grid md:grid-cols-3 gap-10">
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
              <div key={title} className="card-premium p-10 text-center group">
                <div className="text-4xl mb-5">{icon}</div>
                <h3 className="font-serif text-xl text-brand-ink mb-3">{title}</h3>
                <p className="text-sm text-brand-ink-soft leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin-added sections */}
      {homeSections.length > 0 && (
        <PageRenderer sections={homeSections} pageSlug="home" />
      )}

      {/* Latest From Facebook */}
      {fbGallery && (
        <EditableSection adminPath="/admin/facebook-photos" label="Facebook Photos">
          <section className="py-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading
                label="Follow Us"
                title={fbGallery.default_title || 'Latest From Facebook'}
                subtitle={fbGallery.default_intro || undefined}
                center
                className="mb-12"
              />
              <FacebookPhotoGallery
                sourceId={fbGallery.id}
                displayMode="slideshow"
                maxImages={16}
                sortMode="featured_first"
              />
            </div>
          </section>
        </EditableSection>
      )}

      {/* CTA Strip */}
      <EditableSection adminPath="/admin/sponsorship" label="Sponsorship">
        <section className="py-24 bg-brand-surface-warm border-y border-brand-gold/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="label-gold mb-4">✦ Sponsor the Academy ✦</p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-ink">
              Partner with Stella Vaulting Academy
            </h2>
            <p className="text-brand-ink-soft mt-4 max-w-2xl mx-auto">
              We are looking for sponsors to help build an indoor arena and support our IVC Rising Star athlete Imelda Alembick on her international journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link to="/sponsorship" className="btn-gold">Explore Sponsorship</Link>
              <Link to="/team" className="btn-outline-gold">Meet Our Team</Link>
            </div>
          </div>
        </section>
      </EditableSection>
    </div>
  )
}

function PinnedPostCard({ post }) {
  return (
    <div className="card-premium group flex flex-col">
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
        <div className="aspect-video bg-brand-surface-warm flex items-center justify-center border-b border-brand-gold/[0.1]">
          <span className="text-4xl text-brand-gold/25">✦</span>
        </div>
      )}
      <div className="p-7 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-brand-ink group-hover:text-brand-gold transition-colors leading-snug">
          {post.title}
        </h3>
        {post.short_description && (
          <p className="text-sm text-brand-ink-soft mt-3 leading-relaxed flex-1">
            {post.short_description}
          </p>
        )}
        <Link
          to={`/posts/${post.slug}`}
          className="mt-6 flex items-center gap-2 text-xs tracking-wider uppercase text-brand-gold hover:text-brand-gold-light transition-colors"
        >
          Read More <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
