import { useState, useEffect } from 'react'
import { format, differenceInSeconds } from 'date-fns'

function pad(n) {
  return String(n).padStart(2, '0')
}

function getTimeLeft(targetDate) {
  const total = differenceInSeconds(new Date(targetDate), new Date())
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: false,
  }
}

export default function CountdownTimer({ eventDate, eventName, fundraisingTarget, compact = false }) {
  const [time, setTime] = useState(() => getTimeLeft(eventDate))

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(eventDate)), 1000)
    return () => clearInterval(interval)
  }, [eventDate])

  if (time.expired) {
    return (
      <div className="card-premium p-6 text-center">
        <p className="text-brand-gold font-serif text-lg">Event has passed</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-brand-gold font-semibold">{time.days}d {pad(time.hours)}h {pad(time.minutes)}m</span>
        <span className="text-brand-ink-soft">until {eventName}</span>
      </div>
    )
  }

  return (
    <div className="card-premium overflow-hidden">
      <div className="bg-brand-blush border-b border-brand-gold/20 px-6 py-4 text-center">
        <p className="label-gold">Next Event</p>
        <h3 className="font-serif text-xl text-brand-ink mt-1">{eventName}</h3>
        {eventDate && (
          <p className="text-xs text-brand-ink-soft mt-1">
            {format(new Date(eventDate), 'EEEE, d MMMM yyyy')}
          </p>
        )}
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: 'Days', value: pad(time.days) },
            { label: 'Hours', value: pad(time.hours) },
            { label: 'Minutes', value: pad(time.minutes) },
            { label: 'Seconds', value: pad(time.seconds) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-brand-surface-alt rounded-xl p-3 border border-brand-gold/[0.12]">
              <div className="font-serif text-3xl text-brand-gold">{value}</div>
              <div className="text-[10px] tracking-widest uppercase text-brand-ink/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
        {fundraisingTarget && (
          <div className="mt-5 pt-4 border-t border-brand-gold/[0.12] text-center">
            <p className="text-xs text-brand-ink-soft">Fundraising target</p>
            <p className="font-serif text-2xl text-brand-gold mt-1">${fundraisingTarget.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
