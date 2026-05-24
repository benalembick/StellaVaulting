import logoImg from '../assets/logo.png'

export default function Logo({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoImg}
        alt="Stella Vaulting Academy"
        className="object-contain h-[100px] lg:h-[200px]"
      />
    </div>
  )
}
