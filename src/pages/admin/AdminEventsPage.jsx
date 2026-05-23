import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const EMPTY = { name: '', event_date: '', location: '', description: '', image: '', fundraising_target: '', show_countdown: true, published: true }

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('events').select('*').order('event_date')
    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setEditing('new'); setForm(EMPTY) }
  function openEdit(e) { setEditing(e.id); setForm({ ...EMPTY, ...e, event_date: e.event_date ? e.event_date.slice(0, 16) : '', fundraising_target: e.fundraising_target || '' }) }
  function cancel() { setEditing(null); setForm(EMPTY) }

  async function save() {
    if (!form.name.trim()) { toast.error('Event name required'); return }
    setSaving(true)
    try {
      const payload = { ...form, fundraising_target: form.fundraising_target ? parseFloat(form.fundraising_target) : null }
      if (editing === 'new') {
        await supabase.from('events').insert(payload)
        toast.success('Event created!')
      } else {
        await supabase.from('events').update(payload).eq('id', editing)
        toast.success('Event updated!')
      }
      await load(); cancel()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    await load(); toast.success('Deleted')
  }

  async function toggle(e) {
    await supabase.from('events').update({ published: !e.published }).eq('id', e.id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Events</h1>
          <p className="text-brand-ink/50 text-sm mt-1">Manage upcoming and past events</p>
        </div>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> Add Event</button>
      </div>

      {editing && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-xl text-brand-ink mb-5">{editing === 'new' ? 'Add Event' : 'Edit Event'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-label">Event Name *</label>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. FEI World Vaulting Championships" />
            </div>
            <div>
              <label className="admin-label">Date & Time</label>
              <input type="datetime-local" className="admin-input" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Location</label>
              <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
            </div>
            <div>
              <label className="admin-label">Fundraising Target ($)</label>
              <input type="number" className="admin-input" value={form.fundraising_target} onChange={(e) => setForm({ ...form, fundraising_target: e.target.value })} placeholder="e.g. 15000" />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">Show Countdown</label>
                <button type="button" onClick={() => setForm({ ...form, show_countdown: !form.show_countdown })} className={`w-10 h-5 rounded-full transition-colors ${form.show_countdown ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.show_countdown ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="admin-label mb-0">Published</label>
                <button type="button" onClick={() => setForm({ ...form, published: !form.published })} className={`w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.published ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Event Image</label>
              <ImageUpload bucket="images" value={form.image} onChange={(url) => setForm({ ...form, image: url || '' })} path={`events/${Date.now()}`} label="Upload event image" />
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

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="admin-card flex items-center gap-4">
              {e.image && <img src={e.image} alt={e.name} className="w-16 h-16 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <button onClick={() => openEdit(e)} className="text-brand-ink font-medium truncate hover:text-brand-gold transition-colors text-left w-full block">{e.name}</button>
                <div className="flex gap-3 text-xs text-brand-ink/40 mt-0.5">
                  {e.event_date && <span>{format(new Date(e.event_date), 'd MMM yyyy')}</span>}
                  {e.location && <span>· {e.location}</span>}
                  {e.fundraising_target && <span className="text-brand-gold">· ${e.fundraising_target.toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggle(e)} className={e.published ? 'text-green-400' : 'text-brand-ink/30'}>{e.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => openEdit(e)} className="text-brand-ink/50 hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(e.id)} className="text-brand-ink/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="text-center py-12 text-brand-ink/30"><p>No events yet.</p></div>}
        </div>
      )}
    </div>
  )
}
