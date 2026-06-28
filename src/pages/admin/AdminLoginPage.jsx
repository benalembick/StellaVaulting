import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('signin') // 'signin' | 'forgot'
  const { signIn, resetPasswordForEmail } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPasswordForEmail(email)
      toast.success('If an account exists for that email, a reset link has been sent.')
      setMode('signin')
    } catch (err) {
      toast.error(err.message || 'Could not send reset email.')
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
            <Lock size={16} className="text-brand-gold" />
            <h2 className="font-serif text-xl text-brand-ink">
              {mode === 'signin' ? 'Sign In' : 'Reset Password'}
            </h2>
          </div>
          {mode === 'signin' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  placeholder="admin@stellavaulting.com.au"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="admin-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full justify-center mt-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-brand-ink/50 hover:text-brand-gold w-full text-center"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-brand-ink/60">
                Enter your admin email and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  placeholder="admin@stellavaulting.com.au"
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full justify-center mt-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-brand-ink/50 hover:text-brand-gold w-full text-center"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-brand-ink/30 mt-6">
          Admin access only. Contact the academy administrator if you need access.
        </p>
      </div>
    </div>
  )
}
