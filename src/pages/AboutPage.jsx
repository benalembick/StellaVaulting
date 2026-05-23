import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PageRenderer from '../components/PageRenderer'
import EditableSection from '../components/EditableSection'
import SectionHeading from '../components/SectionHeading'

// Flat content that will be seeded into the DB on first admin visit
const DEFAULT_SECTIONS = [
  {
    section_type: 'text_block',
    order_index: 0,
    published: true,
    content: {
      body: 'Stella Vaulting Academy is an equestrian vaulting club in Western Australia for elite-level vaulters who wish to progress further internationally, with the aim of attending FEI World Championships.',
    },
  },
  {
    section_type: 'image_text',
    order_index: 1,
    published: true,
    content: {
      label: 'Our Mission',
      heading: 'Who We Are',
      body: 'We believe that vaulting is one of the most demanding and beautiful equestrian disciplines — a perfect blend of gymnastics, dance, and horsemanship. Our academy was founded with a singular vision: to develop Western Australian vaulters who can compete and win on the world stage.\n\nOur athletes train rigorously under the guidance of experienced coaches, forging an extraordinary bond with our horses. We are driven by ambition, grounded in community, and united by our love of the sport.\n\nThe FEI World Vaulting Championships represent the pinnacle of our sport, and it is our goal to have Stella Vaulting Academy athletes standing on that international stage, representing Australia with pride.',
    },
  },
  {
    section_type: 'features',
    order_index: 2,
    published: true,
    content: {
      label: 'What Drives Us',
      heading: 'Our Values',
      item_1_icon: '🏆',
      item_1_title: 'Excellence',
      item_1_desc: 'We pursue the highest standards in training, performance, and conduct.',
      item_2_icon: '🤝',
      item_2_title: 'Integrity',
      item_2_desc: 'We act with honesty, respect, and fairness in all that we do.',
      item_3_icon: '🌟',
      item_3_title: 'Ambition',
      item_3_desc: 'We dare to dream big and pursue international recognition.',
      item_4_icon: '❤️',
      item_4_title: 'Community',
      item_4_desc: 'We lift each other up and celebrate every achievement together.',
    },
  },
]

export default function AboutPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [sections, setSections] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const loaded = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (loaded.current) return
    loaded.current = true

    async function load() {
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'about')
        .single()

      if (!page) { setPageLoading(false); return }

      const { data: existing } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .order('order_index')

      let final = existing || []

      // First-time admin visit: seed the default content into the DB
      if (isAdmin && final.length === 0) {
        const toInsert = DEFAULT_SECTIONS.map((s) => ({ ...s, page_id: page.id }))
        const { data: seeded } = await supabase.from('page_sections').insert(toInsert).select()
        final = seeded || []
      }

      setSections(final.filter((s) => s.published))
      setPageLoading(false)
    }

    load()
  }, [authLoading, isAdmin])

  return (
    <div className="pt-20">
      {/* Page header — always fixed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 text-center">
        <p className="label-gold mb-4">✦ Our Story ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink font-light">About Us</h1>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      {pageLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sections.length > 0 ? (
        <PageRenderer sections={sections} pageSlug="about" />
      ) : (
        /* Fallback shown only to non-admin visitors before seeding */
        <EditableSection adminPath="/admin/pages?slug=about" label="About Page">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <p className="font-serif text-2xl md:text-3xl text-brand-gold font-light italic leading-relaxed">
                Stella Vaulting Academy is an equestrian vaulting club in Western Australia for
                elite-level vaulters who wish to progress further internationally, with the aim of
                attending FEI World Championships.
              </p>
            </div>
            <div className="gold-divider max-w-xs mx-auto mb-20" />
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <SectionHeading label="Our Mission" title="Who We Are" />
                <div className="mt-6 space-y-4 text-brand-ink-soft leading-relaxed">
                  <p>We believe that vaulting is one of the most demanding and beautiful equestrian disciplines — a perfect blend of gymnastics, dance, and horsemanship.</p>
                  <p>Our athletes train rigorously under the guidance of experienced coaches, forging an extraordinary bond with our horses.</p>
                </div>
              </div>
              <div className="aspect-square bg-brand-surface-warm rounded-[18px] border border-brand-gold/20 flex items-center justify-center">
                <div className="text-center text-brand-gold/40">
                  <div className="text-8xl font-serif">✦</div>
                  <p className="text-sm mt-4 text-brand-ink-soft tracking-wider uppercase">Stella Vaulting</p>
                </div>
              </div>
            </div>
            <div className="py-16 border-t border-brand-gold/20">
              <SectionHeading label="What Drives Us" title="Our Values" center className="mb-14" />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: '🏆', label: 'Excellence', desc: 'We pursue the highest standards in training, performance, and conduct.' },
                  { icon: '🤝', label: 'Integrity', desc: 'We act with honesty, respect, and fairness in all that we do.' },
                  { icon: '🌟', label: 'Ambition', desc: 'We dare to dream big and pursue international recognition.' },
                  { icon: '❤️', label: 'Community', desc: 'We lift each other up and celebrate every achievement together.' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="pink-panel p-7 text-center">
                    <div className="text-3xl mb-3">{icon}</div>
                    <h3 className="font-serif text-lg text-brand-ink mb-2">{label}</h3>
                    <p className="text-xs text-brand-ink-soft leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EditableSection>
      )}
    </div>
  )
}
