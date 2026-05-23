import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useEditMode } from '../context/EditModeContext'

export default function EditableSection({ children, adminPath, label }) {
  const { editMode } = useEditMode()
  const navigate = useNavigate()

  if (!editMode) return children

  return (
    <div
      className="relative cursor-pointer"
      style={{ boxShadow: 'inset 0 0 0 3px #fbbf24' }}
      onClick={() => navigate(adminPath)}
    >
      {children}
      {/* Amber tint overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-colors"
        style={{ backgroundColor: 'rgba(251, 191, 36, 0.12)' }}
      />
      {/* Edit badge */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded shadow-xl pointer-events-none"
        style={{ backgroundColor: '#fbbf24', color: '#000' }}
      >
        <Pencil size={11} />
        Edit: {label}
      </div>
    </div>
  )
}
