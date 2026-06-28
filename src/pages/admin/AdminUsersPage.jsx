import { useEffect, useState } from 'react'
import { Loader2, Trash2, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

async function describeFunctionError(err) {
  if (err?.context?.json) {
    try {
      const body = await err.context.json()
      if (body?.error) return body.error
    } catch {
      // response body wasn't JSON; fall through to the generic message
    }
  }
  return err?.message || 'Something went wrong.'
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const { user } = useAuth()

  async function loadAdmins() {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { method: 'GET' })
      if (error) throw error
      setAdmins(data.admins || [])
    } catch (err) {
      toast.error(await describeFunctionError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { email: inviteEmail },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      loadAdmins()
    } catch (err) {
      toast.error(await describeFunctionError(err))
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(admin) {
    if (!window.confirm(`Remove admin access for ${admin.email}?`)) return
    setRemovingId(admin.id)
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'DELETE',
        body: { id: admin.id },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      toast.success('Admin removed.')
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id))
    } catch (err) {
      toast.error(await describeFunctionError(err))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-brand-ink">Admin Users</h1>

      <div className="admin-card">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-brand-gold" />
          <h2 className="font-serif text-lg text-brand-ink">Invite Admin</h2>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="admin-input flex-1"
            placeholder="newadmin@stellavaulting.com.au"
            required
          />
          <button type="submit" disabled={inviting} className="btn-gold justify-center">
            {inviting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Invite'}
          </button>
        </form>
        <p className="text-xs text-brand-ink/40 mt-3">
          They'll receive an email to set their password and access the admin portal.
        </p>
      </div>

      <div className="admin-card">
        <h2 className="font-serif text-lg text-brand-ink mb-4">Current Admins</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-brand-gold" />
          </div>
        ) : (
          <ul className="divide-y divide-brand-gold/10">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-brand-ink">{admin.email}</p>
                  <p className="text-xs text-brand-ink/40">
                    Added {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(admin)}
                  disabled={removingId === admin.id || admin.user_id === user?.id}
                  title={admin.user_id === user?.id ? "You can't remove yourself" : 'Remove admin'}
                  className="text-brand-ink/40 hover:text-red-500 disabled:opacity-30 disabled:hover:text-brand-ink/40"
                >
                  {removingId === admin.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
