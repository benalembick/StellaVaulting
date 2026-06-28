import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await updatePassword(password)
      toast.success('Password updated. Please sign in.')
      navigate('/admin/login')
    } catch (err) {
      toast.error(err.message || 'Could not update password. The reset link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-hero-light">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center" />
          <p className="text-brand-ink/40 text-sm mt-3 tracking-wider uppercase">Admin Portal</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound size={16} className="text-brand-gold" />
            <h2 className="font-serif text-xl text-brand-ink">Set New Password</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="admin-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
