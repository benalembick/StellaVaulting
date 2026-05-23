import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const EMPTY_MEMBER = { name: '', role: '', bio: '', photo: '', display_order: 0, published: true }

export default function AdminTeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_MEMBER)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('team_members').select('*').order('display_order')
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing('new')
    setForm({ ...EMPTY_MEMBER, display_order: members.length + 1 })
  }

  function openEdit(m) {
    setEditing(m.id)
    setForm({ name: m.name, role: m.role || '', bio: m.bio || '', photo: m.photo || '', display_order: m.display_order, published: m.published })
  }

  function cancel() { setEditing(null); setForm(EMPTY_MEMBER) }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await supabase.from('team_members').insert(form)
        toast.success('Team member added!')
      } else {
        await supabase.from('team_members').update(form).eq('id', editing)
        toast.success('Team member updated!')
      }
      await load()
      cancel()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(m) {
    await supabase.from('team_members').update({ published: !m.published }).eq('id', m.id)
    await load()
  }

  async function del(id) {
    if (!confirm('Delete this team member?')) return
    await supabase.from('team_members').delete().eq('id', id)
    await load()
    toast.success('Deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Team Members</h1>
          <p className="text-brand-ink/50 text-sm mt-1">Manage athlete and coach profiles</p>
        </div>
        <button onClick={openNew} className="btn-gold">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-xl text-brand-ink mb-5">
            {editing === 'new' ? 'Add New Team Member' : 'Edit Team Member'}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="admin-label">Name *</label>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label className="admin-label">Role / Title</label>
              <input className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Head Coach, Senior Vaulter" />
            </div>
            <div>
              <label className="admin-label">Display Order</label>
              <input type="number" className="admin-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="admin-label">Published</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, published: !form.published })}
                className={`w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Bio</label>
              <textarea className="admin-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Short bio or description" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Photo</label>
              <ImageUpload
                bucket="images"
                value={form.photo}
                onChange={(url) => setForm({ ...form, photo: url || '' })}
                path={`team/${Date.now()}`}
                label="Upload team member photo"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving} className="btn-gold">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
            <button onClick={cancel} className="btn-outline-gold">Cancel</button>
          </div>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="admin-card flex items-center gap-4">
              <GripVertical size={16} className="text-brand-ink/20 flex-shrink-0" />
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-brand-gold font-serif">{m.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <button onClick={() => openEdit(m)} className="text-brand-ink font-medium truncate hover:text-brand-gold transition-colors text-left w-full block">{m.name}</button>
                {m.role && <p className="text-brand-pink text-xs mt-0.5">{m.role}</p>}
                <p className="text-brand-ink/40 text-xs mt-0.5 truncate">{m.bio}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(m)} className={`text-xs flex items-center gap-1 ${m.published ? 'text-green-400' : 'text-brand-ink/30'}`}>
                  {m.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(m)} className="text-brand-ink/50 hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(m.id)} className="text-brand-ink/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-12 text-brand-ink/30">
              <Users size={32} className="mx-auto mb-3 opacity-50" />
              <p>No team members yet. Add the first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
