import logoImg from '../assets/logo.png'

export default function Logo({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoImg}
        alt="Stella Vaulting Academy"
        style={{ height: 200 }}
        className="object-contain"
      />
    </div>
  )
}
