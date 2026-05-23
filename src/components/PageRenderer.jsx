import { Link } from 'react-router-dom'
import CountdownTimer from './CountdownTimer'
import EditableSection from './EditableSection'

export default function PageRenderer({ sections = [], pageSlug = '' }) {
  const baseAdminPath = pageSlug ? `/admin/pages?slug=${pageSlug}` : '/admin/pages'
  return (
    <div>
      {sections
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map((section) => (
          <EditableSection key={section.id} adminPath={`${baseAdminPath}&section=${section.id}`} label="Edit Section">
            <SectionBlock section={section} />
          </EditableSection>
        ))}
    </div>
  )
}

function SectionBlock({ section }) {
  const { section_type, content } = section
  const data = content || {}

  switch (section_type) {
    case 'hero':
      return (
        <section
          className="relative min-h-[70vh] flex items-center justify-center text-center"
          style={data.image ? { backgroundImage: `url(${data.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {data.image && <div className="absolute inset-0 bg-hero-overlay" />}
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
            {data.label && <p className="label-gold mb-4">✦ {data.label} ✦</p>}
            <h1 className={`font-serif text-5xl md:text-7xl font-light leading-tight ${data.image ? 'text-white' : 'text-brand-ink'}`}>
              {data.title}
            </h1>
            {data.subtitle && (
              <p className={`mt-6 text-lg font-light ${data.image ? 'text-white/70' : 'text-brand-ink-soft'}`}>{data.subtitle}</p>
            )}
            {data.button_text && data.button_url && (
              <div className="mt-8">
                <Link to={data.button_url} className="btn-gold">
                  {data.button_text}
                </Link>
              </div>
            )}
          </div>
        </section>
      )

    case 'text_block':
      return (
        <section className="max-w-3xl mx-auto px-6 py-16">
          {data.heading && (
            <h2 className="font-serif text-3xl text-brand-ink mb-6">{data.heading}</h2>
          )}
          {data.body && (
            <div
              className="text-brand-ink-soft leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: data.body.replace(/\n/g, '<br/>') }}
            />
          )}
        </section>
      )

    case 'image_text':
      return (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className={`flex flex-col lg:flex-row gap-12 items-center ${data.image_right ? 'lg:flex-row-reverse' : ''}`}>
            {data.image && (
              <div className="lg:w-1/2">
                <img src={data.image} alt={data.heading || ''} className="w-full rounded-lg border border-brand-gold/20 shadow-premium" />
              </div>
            )}
            <div className="lg:w-1/2">
              {data.label && <p className="label-gold mb-3">✦ {data.label} ✦</p>}
              {data.heading && <h2 className="font-serif text-3xl text-brand-ink mb-4">{data.heading}</h2>}
              {data.body && (
                <p className="text-brand-ink-soft leading-relaxed">{data.body}</p>
              )}
              {data.button_text && data.button_url && (
                <div className="mt-6">
                  <Link to={data.button_url} className="btn-outline-gold">
                    {data.button_text}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'call_to_action':
      return (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="pink-panel p-10 text-center">
              {data.label && <p className="label-gold mb-3">✦ {data.label} ✦</p>}
              <h2 className="font-serif text-3xl text-brand-ink mb-4">{data.title}</h2>
              {data.body && <p className="text-brand-ink-soft mb-6">{data.body}</p>}
              {data.button_text && data.button_url && (
                <Link to={data.button_url} className="btn-gold">
                  {data.button_text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )

    case 'event_countdown':
      return (
        <section className="max-w-md mx-auto px-6 py-8">
          {data.event_date && (
            <CountdownTimer
              eventDate={data.event_date}
              eventName={data.event_name || 'Next Event'}
              fundraisingTarget={data.fundraising_target}
            />
          )}
        </section>
      )

    case 'features': {
      const items = [1, 2, 3, 4]
        .map((n) => ({ icon: data[`item_${n}_icon`], title: data[`item_${n}_title`], desc: data[`item_${n}_desc`] }))
        .filter((item) => item.title)
      return (
        <section className="py-16 max-w-6xl mx-auto px-6">
          {(data.label || data.heading) && (
            <div className={`mb-14 ${items.length === 4 ? 'text-center' : ''}`}>
              {data.label && <p className="label-gold mb-3">✦ {data.label} ✦</p>}
              {data.heading && <h2 className="font-serif text-3xl text-brand-ink">{data.heading}</h2>}
            </div>
          )}
          <div className={`grid gap-8 ${items.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {items.map(({ icon, title, desc }) => (
              <div key={title} className="pink-panel p-7 text-center">
                {icon && <div className="text-3xl mb-3">{icon}</div>}
                <h3 className="font-serif text-lg text-brand-ink mb-2">{title}</h3>
                {desc && <p className="text-xs text-brand-ink-soft leading-relaxed">{desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )
    }

    default:
      return null
  }
}
