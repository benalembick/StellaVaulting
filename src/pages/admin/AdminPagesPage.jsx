import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, GripVertical, Loader2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import toast from 'react-hot-toast'

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'text_block', label: 'Text Block' },
  { value: 'image_text', label: 'Image + Text' },
  { value: 'call_to_action', label: 'Call to Action' },
  { value: 'features', label: 'Features / Values Grid' },
  { value: 'event_countdown', label: 'Event Countdown' },
]

const EMPTY_PAGE = { slug: '', title: '', meta_description: '', published: false }
const EMPTY_SECTION = { section_type: 'text_block', order_index: 0, content: {}, published: true }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getPageUrl(slug) {
  return window.location.origin + (slug === 'home' ? '/' : `/${slug}`)
}

export default function AdminPagesPage() {
  const [searchParams] = useSearchParams()
  const [pages, setPages] = useState([])
  const [activePage, setActivePage] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState(null)
  const [pageForm, setPageForm] = useState(EMPTY_PAGE)
  const [addingSection, setAddingSection] = useState(false)
  const [sectionType, setSectionType] = useState('text_block')
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionContent, setSectionContent] = useState({})

  async function loadPages() {
    const { data } = await supabase.from('pages').select('*').order('title')
    const pageList = data || []
    setPages(pageList)
    setLoading(false)
    return pageList
  }

  async function loadSections(pageId) {
    const { data } = await supabase.from('page_sections').select('*').eq('page_id', pageId).order('order_index')
    const result = data || []
    setSections(result)
    return result
  }

  useEffect(() => {
    loadPages().then((pageList) => {
      const slugParam = searchParams.get('slug')
      if (slugParam) {
        const match = pageList.find((p) => p.slug === slugParam)
        if (match) setActivePage(match)
      }
    })
  }, [])
  useEffect(() => {
    if (!activePage) return
    const sectionParam = searchParams.get('section')
    loadSections(activePage.id).then((loaded) => {
      if (sectionParam) {
        const match = loaded.find((s) => s.id === sectionParam)
        if (match) {
          setEditingSection(match.id)
          setSectionContent(match.content || {})
        }
      }
    })
  }, [activePage])

  async function savePage() {
    if (!pageForm.title) { toast.error('Title required'); return }
    const slug = pageForm.slug || slugify(pageForm.title)
    setSaving(true)
    try {
      if (editingPage === 'new') {
        const { data } = await supabase.from('pages').insert({ ...pageForm, slug }).select().single()
        setActivePage(data)
        toast.success('Page created!')
      } else {
        await supabase.from('pages').update({ ...pageForm, slug }).eq('id', editingPage)
        if (activePage?.id === editingPage) setActivePage((p) => ({ ...p, ...pageForm, slug }))
        toast.success('Page updated!')
      }
      await loadPages()
      setEditingPage(null)
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function addSection() {
    if (!activePage) return
    setSaving(true)
    try {
      const order = sections.length
      await supabase.from('page_sections').insert({ page_id: activePage.id, section_type: sectionType, order_index: order, content: {}, published: true })
      await loadSections(activePage.id)
      setAddingSection(false)
      toast.success('Section added!')
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function saveSectionContent(sectionId) {
    setSaving(true)
    try {
      await supabase.from('page_sections').update({ content: sectionContent }).eq('id', sectionId)
      await loadSections(activePage.id)
      setEditingSection(null)
      toast.success('Section saved!')
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function toggleSection(s) {
    await supabase.from('page_sections').update({ published: !s.published }).eq('id', s.id)
    await loadSections(activePage.id)
  }

  async function deleteSection(id) {
    if (!confirm('Delete this section?')) return
    await supabase.from('page_sections').delete().eq('id', id)
    await loadSections(activePage.id)
    toast.success('Section deleted')
  }

  async function moveSection(id, dir) {
    const idx = sections.findIndex((s) => s.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= sections.length) return
    const [a, b] = [sections[idx], sections[newIdx]]
    await Promise.all([
      supabase.from('page_sections').update({ order_index: newIdx }).eq('id', a.id),
      supabase.from('page_sections').update({ order_index: idx }).eq('id', b.id),
    ])
    await loadSections(activePage.id)
  }

  async function togglePage(p) {
    await supabase.from('pages').update({ published: !p.published }).eq('id', p.id)
    await loadPages()
    if (activePage?.id === p.id) setActivePage((prev) => ({ ...prev, published: !p.published }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-ink">Pages</h1>
          <p className="text-brand-ink/50 text-sm mt-1">Manage page content and sections</p>
        </div>
        <button onClick={() => { setEditingPage('new'); setPageForm(EMPTY_PAGE) }} className="btn-gold"><Plus size={16} /> New Page</button>
      </div>

      {editingPage && (
        <div className="admin-card mb-6">
          <h2 className="font-serif text-lg text-brand-ink mb-4">{editingPage === 'new' ? 'New Page' : 'Edit Page'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Page Title *</label>
              <input className="admin-input" value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value, slug: pageForm.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Slug (URL path)</label>
              <input className="admin-input" value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: slugify(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Meta Description (SEO)</label>
              <textarea className="admin-textarea" value={pageForm.meta_description} onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <label className="admin-label mb-0">Published</label>
              <button type="button" onClick={() => setPageForm({ ...pageForm, published: !pageForm.published })} className={`w-10 h-5 rounded-full transition-colors ${pageForm.published ? 'bg-brand-gold' : 'bg-brand-ink/15'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${pageForm.published ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={savePage} disabled={saving} className="btn-gold text-xs py-2">
              {saving ? 'Saving...' : 'Save Page'}
            </button>
            <button onClick={() => setEditingPage(null)} className="btn-outline-gold text-xs py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pages list */}
        <div>
          <h3 className="text-xs tracking-widest uppercase text-brand-ink/40 mb-3">Pages</h3>
          <div className="space-y-2">
            {pages.map((p) => (
              <div key={p.id} className={`flex items-center gap-2 rounded border transition-colors cursor-pointer ${activePage?.id === p.id ? 'border-brand-gold/30 bg-brand-gold/5' : 'border-transparent hover:border-brand-gold/10'}`}>
                <button onClick={() => { setActivePage(p); setEditingSection(null) }} className={`flex-1 text-left px-3 py-2.5 text-sm ${activePage?.id === p.id ? 'text-brand-gold' : 'text-brand-ink/70 hover:text-brand-ink'}`}>
                  {p.title}
                  {!p.published && <span className="ml-2 text-[9px] text-brand-ink/30 uppercase">Draft</span>}
                </button>
                <button onClick={() => togglePage(p)} className={`p-1 ${p.published ? 'text-green-400' : 'text-brand-ink/20'}`}>{p.published ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                <button onClick={() => { setEditingPage(p.id); setPageForm({ slug: p.slug, title: p.title, meta_description: p.meta_description || '', published: p.published }) }} className="p-1 text-brand-ink/20 hover:text-brand-gold"><Edit2 size={12} /></button>
                <a href={getPageUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="p-1 text-brand-ink/20 hover:text-brand-gold" title="View on site"><ExternalLink size={12} /></a>
              </div>
            ))}
            {loading && <div className="py-4 text-center"><div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" /></div>}
          </div>
        </div>

        {/* Sections editor */}
        <div className="lg:col-span-2">
          {activePage ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-widest uppercase text-brand-ink/40">
                  Sections — {activePage.title}
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href={getPageUrl(activePage.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-ink/40 hover:text-brand-gold flex items-center gap-1 transition-colors"
                    title="View this page on the site"
                  >
                    <ExternalLink size={11} /> View Page
                  </a>
                  <button onClick={() => setAddingSection(true)} className="text-xs text-brand-gold hover:text-brand-gold-light flex items-center gap-1">
                    <Plus size={12} /> Add Section
                  </button>
                </div>
              </div>

              {addingSection && (
                <div className="admin-card mb-4 p-4">
                  <div className="flex items-center gap-3">
                    <select className="admin-select flex-1" value={sectionType} onChange={(e) => setSectionType(e.target.value)}>
                      {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <button onClick={addSection} disabled={saving} className="btn-gold text-xs py-2 px-4 whitespace-nowrap">Add</button>
                    <button onClick={() => setAddingSection(false)} className="btn-outline-gold text-xs py-2 px-3">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sections.map((s, idx) => (
                  <div key={s.id} className="admin-card">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(s.id, -1)} disabled={idx === 0} className="text-brand-ink/20 hover:text-brand-gold disabled:opacity-10"><ChevronUp size={14} /></button>
                        <button onClick={() => moveSection(s.id, 1)} disabled={idx === sections.length - 1} className="text-brand-ink/20 hover:text-brand-gold disabled:opacity-10"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => {
                            if (editingSection === s.id) {
                              setEditingSection(null)
                            } else {
                              setEditingSection(s.id)
                              setSectionContent(s.content || {})
                            }
                          }}
                          className="text-xs bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded capitalize transition-colors cursor-pointer"
                        >
                          {SECTION_TYPES.find((t) => t.value === s.section_type)?.label || s.section_type}
                        </button>
                        {(s.content?.title || s.content?.heading) && (
                          <span className="text-xs text-brand-ink/50 ml-2 truncate">
                            — {s.content.title || s.content.heading}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleSection(s)} className={s.published ? 'text-green-400' : 'text-brand-ink/30'}>{s.published ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                        <button onClick={() => { setEditingSection(s.id); setSectionContent(s.content || {}) }} className="text-brand-ink/50 hover:text-brand-gold"><Edit2 size={13} /></button>
                        <button onClick={() => deleteSection(s.id)} className="text-brand-ink/20 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    {editingSection === s.id && (
                      <SectionContentEditor
                        type={s.section_type}
                        content={sectionContent}
                        onChange={setSectionContent}
                        onSave={() => saveSectionContent(s.id)}
                        onCancel={() => setEditingSection(null)}
                        saving={saving}
                      />
                    )}
                  </div>
                ))}
                {sections.length === 0 && (
                  <div className="py-10 px-6 border-2 border-dashed border-brand-gold/20 rounded-lg text-center space-y-3">
                    <p className="text-sm font-medium text-brand-ink/60">No sections yet for <span className="text-brand-gold">{activePage.title}</span></p>
                    <p className="text-xs text-brand-ink/40 max-w-sm mx-auto leading-relaxed">
                      This page currently shows its built-in default content. Add sections here to replace it with your own custom content — sections are displayed in order on the public page.
                    </p>
                    <button
                      onClick={() => setAddingSection(true)}
                      className="btn-gold text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-2"
                    >
                      <Plus size={12} /> Add First Section
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-brand-ink/30 border-2 border-dashed border-brand-gold/10 rounded-lg">
              <p>Select a page to edit its sections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionContentEditor({ type, content, onChange, onSave, onCancel, saving }) {
  const fields = getSectionFields(type)

  return (
    <div className="mt-4 pt-4 border-t border-brand-gold/10">
      <div className="grid md:grid-cols-2 gap-3">
        {fields.map(({ key, label, multiline, type: fType }) => (
          <div key={key} className={multiline ? 'md:col-span-2' : ''}>
            <label className="admin-label">{label}</label>
            {multiline ? (
              <textarea className="admin-textarea" value={content[key] || ''} onChange={(e) => onChange({ ...content, [key]: e.target.value })} rows={3} />
            ) : fType === 'image' ? (
              <ImageUpload
                bucket="images"
                value={content[key] || null}
                onChange={(url) => onChange({ ...content, [key]: url || '' })}
                label={`Upload ${label}`}
                className="mt-1"
              />
            ) : fType === 'checkbox' ? (
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={!!content[key]} onChange={(e) => onChange({ ...content, [key]: e.target.checked })} className="w-4 h-4 accent-brand-gold" />
                <span className="text-xs text-brand-ink/50">Enable</span>
              </div>
            ) : (
              <input className="admin-input" type={fType || 'text'} value={content[key] || ''} onChange={(e) => onChange({ ...content, [key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onSave} disabled={saving} className="btn-gold text-xs py-2 px-4">{saving ? 'Saving...' : 'Save Section'}</button>
        <button onClick={onCancel} className="btn-outline-gold text-xs py-2 px-3">Cancel</button>
      </div>
    </div>
  )
}

function getSectionFields(type) {
  switch (type) {
    case 'hero':
      return [
        { key: 'label', label: 'Label (above title)' },
        { key: 'title', label: 'Main Title' },
        { key: 'subtitle', label: 'Subtitle' },
        { key: 'image', label: 'Background Image', type: 'image' },
        { key: 'button_text', label: 'Button Text' },
        { key: 'button_url', label: 'Button URL' },
      ]
    case 'text_block':
      return [
        { key: 'heading', label: 'Heading' },
        { key: 'body', label: 'Body Text', multiline: true },
      ]
    case 'image_text':
      return [
        { key: 'label', label: 'Label' },
        { key: 'heading', label: 'Heading' },
        { key: 'body', label: 'Body', multiline: true },
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'image_right', label: 'Image on Right?', type: 'checkbox' },
        { key: 'button_text', label: 'Button Text' },
        { key: 'button_url', label: 'Button URL' },
      ]
    case 'call_to_action':
      return [
        { key: 'label', label: 'Label' },
        { key: 'title', label: 'Title' },
        { key: 'body', label: 'Body', multiline: true },
        { key: 'button_text', label: 'Button Text' },
        { key: 'button_url', label: 'Button URL' },
      ]
    case 'features':
      return [
        { key: 'label', label: 'Label (above heading)' },
        { key: 'heading', label: 'Section Heading' },
        { key: 'item_1_icon', label: 'Item 1 — Icon (emoji)' },
        { key: 'item_1_title', label: 'Item 1 — Title' },
        { key: 'item_1_desc', label: 'Item 1 — Description', multiline: true },
        { key: 'item_2_icon', label: 'Item 2 — Icon (emoji)' },
        { key: 'item_2_title', label: 'Item 2 — Title' },
        { key: 'item_2_desc', label: 'Item 2 — Description', multiline: true },
        { key: 'item_3_icon', label: 'Item 3 — Icon (emoji)' },
        { key: 'item_3_title', label: 'Item 3 — Title' },
        { key: 'item_3_desc', label: 'Item 3 — Description', multiline: true },
        { key: 'item_4_icon', label: 'Item 4 — Icon (emoji)' },
        { key: 'item_4_title', label: 'Item 4 — Title' },
        { key: 'item_4_desc', label: 'Item 4 — Description', multiline: true },
      ]
    case 'event_countdown':
      return [
        { key: 'event_name', label: 'Event Name' },
        { key: 'event_date', label: 'Event Date', type: 'datetime-local' },
        { key: 'fundraising_target', label: 'Fundraising Target ($)', type: 'number' },
      ]
    default:
      return []
  }
}
