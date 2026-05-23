export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { height: 36, textSize: 'text-sm' },
    md: { height: 48, textSize: 'text-base' },
    lg: { height: 72, textSize: 'text-xl' },
  }
  const { height, textSize } = sizes[size] || sizes.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={height} height={height} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="39" stroke="#B08D3C" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="35" stroke="#B08D3C" strokeWidth="0.5" strokeDasharray="2 3"/>
        {/* Stylised horse/vaulter silhouette */}
        <path d="M25 52 Q28 44 32 42 Q34 38 38 36 Q40 30 44 28 Q48 26 50 30 Q52 34 48 38 Q52 36 54 32 Q56 40 52 46 Q48 52 40 56 Q32 58 25 52Z"
              fill="none" stroke="#B08D3C" strokeWidth="1.2" strokeLinejoin="round"/>
        <circle cx="47" cy="28" r="3" stroke="#B08D3C" strokeWidth="1"/>
        {/* Stars */}
        <text x="20" y="28" fontSize="6" fill="#B08D3C" fontFamily="serif">✦</text>
        <text x="54" y="58" fontSize="5" fill="#B08D3C" fontFamily="serif">✦</text>
        <text x="20" y="60" fontSize="4" fill="#C2ADB8" fontFamily="serif">✦</text>
      </svg>
      <div>
        <div className={`font-serif font-light tracking-[0.15em] uppercase text-brand-white ${textSize}`}>
          Stella Vaulting
        </div>
        <div className="text-[0.55rem] tracking-[0.3em] uppercase text-brand-gold font-medium">
          Academy
        </div>
      </div>
    </div>
  )
}
