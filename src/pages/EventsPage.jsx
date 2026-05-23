import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import SectionHeading from '../components/SectionHeading'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .order('event_date')
      .then(({ data }) => {
        setEvents(data || [])
        setLoading(false)
      })
  }, [])

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date())
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date())
  const nextCountdown = upcomingEvents.find((e) => e.show_countdown)

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
        <p className="label-gold mb-4">✦ What's Ahead ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink font-light">Upcoming Events</h1>
        <p className="mt-4 text-brand-ink-soft max-w-2xl mx-auto">
          Follow our journey as we train and compete at the highest levels of the sport.
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Countdown for next event */}
            {nextCountdown && (
              <div className="grid lg:grid-cols-2 gap-10 items-center mb-20">
                <CountdownTimer
                  eventDate={nextCountdown.event_date}
                  eventName={nextCountdown.name}
                  fundraisingTarget={nextCountdown.fundraising_target}
                />
                <div>
                  <p className="label-gold mb-3">✦ Our Goal ✦</p>
                  <h2 className="font-serif text-3xl text-brand-ink mb-4">Training for Excellence</h2>
                  <p className="text-brand-ink-soft leading-relaxed">
                    Every event is a milestone on our journey to international glory. Our athletes train with dedication
                    and passion, supported by our incredible community.
                  </p>
                  <Link to="/fundraising" className="btn-pink mt-8 inline-flex">
                    Support Our Journey <Heart size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* Upcoming events list */}
            {upcomingEvents.length > 0 && (
              <>
                <SectionHeading label="On the Horizon" title="Upcoming Events" className="mb-10" />
                <div className="space-y-6 mb-20">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </>
            )}

            {/* Past events */}
            {pastEvents.length > 0 && (
              <>
                <SectionHeading label="Our History" title="Past Events" className="mb-10" />
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} past />
                  ))}
                </div>
              </>
            )}

            {events.length === 0 && (
              <div className="text-center py-20">
                <div className="text-brand-gold/30 text-8xl mb-4">🏆</div>
                <p className="text-brand-ink-soft">Events coming soon. Check back for updates!</p>
              </div>
            )}

            {/* Fundraising callout */}
            <div className="mt-20 pink-panel p-12 text-center">
              <p className="label-gold mb-3">✦ Help Us Get There ✦</p>
              <h2 className="font-serif text-3xl text-brand-ink mb-4">Help us fundraise for our next event</h2>
              <p className="text-brand-ink-soft max-w-xl mx-auto">
                Competition is expensive. Your support helps cover travel, accommodation, entry fees, and equipment costs for our athletes.
              </p>
              <Link to="/fundraising" className="btn-gold mt-8 inline-flex">
                Donate Now <Heart size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, past = false }) {
  return (
    <div className={`card-premium overflow-hidden ${past ? 'opacity-60' : ''}`}>
      <div className="flex flex-col lg:flex-row">
        {event.image && (
          <div className="lg:w-64 flex-shrink-0">
            <img src={event.image} alt={event.name} className="w-full h-48 lg:h-full object-cover" />
          </div>
        )}
        <div className="p-7 flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-serif text-2xl text-brand-ink">{event.name}</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {event.event_date && (
                  <span className="flex items-center gap-1.5 text-sm text-brand-gold">
                    <Calendar size={14} />
                    {format(new Date(event.event_date), 'EEEE, d MMMM yyyy')}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1.5 text-sm text-brand-ink-soft">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            {past && (
              <span className="px-3 py-1 text-[10px] tracking-wider uppercase border border-brand-ink/20 rounded-full text-brand-ink/40">
                Past Event
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-brand-ink-soft mt-4 text-sm leading-relaxed">{event.description}</p>
          )}
          {event.fundraising_target && !past && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-brand-ink/40">Fundraising target:</span>
              <span className="text-brand-gold font-semibold">${event.fundraising_target.toLocaleString()}</span>
              <Link to="/fundraising" className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors">
                Help us reach it →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
