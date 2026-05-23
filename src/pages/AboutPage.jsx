import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionHeading from '../components/SectionHeading'
import PageRenderer from '../components/PageRenderer'

const DEFAULT_CONTENT = {
  intro: `Stella Vaulting Academy is an equestrian vaulting club in Western Australia for elite-level vaulters who wish to progress further internationally, with the aim of attending FEI World Championships.`,
  body: `We believe that vaulting is one of the most demanding and beautiful equestrian disciplines — a perfect blend of gymnastics, dance, and horsemanship. Our academy was founded with a singular vision: to develop Western Australian vaulters who can compete and win on the world stage.

Our athletes train rigorously under the guidance of experienced coaches, forging an extraordinary bond with our horses. We are driven by ambition, grounded in community, and united by our love of the sport.

The FEI World Vaulting Championships represent the pinnacle of our sport, and it is our goal to have Stella Vaulting Academy athletes standing on that international stage, representing Australia with pride.`,
}

export default function AboutPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'about')
        .single()

      if (page) {
        const { data } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', page.id)
          .eq('published', true)
          .order('order_index')
        setSections(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
        <p className="label-gold mb-4">✦ Our Story ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink font-light">About Us</h1>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      {/* Dynamic sections or default content */}
      {!loading && sections.length > 0 ? (
        <PageRenderer sections={sections} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Intro */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="font-serif text-2xl md:text-3xl text-brand-gold font-light italic leading-relaxed">
              {DEFAULT_CONTENT.intro}
            </p>
          </div>

          <div className="gold-divider max-w-xs mx-auto mb-20" />

          {/* Story */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <SectionHeading label="Our Mission" title="Who We Are" />
              <div className="mt-6 space-y-4 text-brand-ink-soft leading-relaxed">
                {DEFAULT_CONTENT.body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-brand-surface-warm rounded-[18px] border border-brand-gold/20 flex items-center justify-center">
                <div className="text-center text-brand-gold/40">
                  <div className="text-8xl font-serif">✦</div>
                  <p className="text-sm mt-4 text-brand-ink-soft tracking-wider uppercase">Stella Vaulting</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-brand-gold/20 rounded-[18px]" />
            </div>
          </div>

          {/* Values */}
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
      )}
    </div>
  )
}
