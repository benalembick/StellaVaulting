export default function SectionHeading({ label, title, subtitle, center = false, className = '' }) {
  return (
    <div className={`${center ? 'text-center' : ''} ${className}`}>
      {label && <p className="label-gold mb-3">✦ {label} ✦</p>}
      <h2 className="section-heading">{title}</h2>
      {subtitle && (
        <p className="section-subheading mt-2">{subtitle}</p>
      )}
      <div className={`gold-divider mt-6 ${center ? 'w-24 mx-auto' : 'w-24'}`} style={{ height: '1px' }} />
    </div>
  )
}
