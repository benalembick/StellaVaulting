import { Link, useLocation } from 'react-router-dom'
import { Settings, Pencil, MousePointer2, LayoutGrid, LogOut, User, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEditMode } from '../context/EditModeContext'

const ROUTE_MAP = {
  '/': { label: 'Home', editPath: '/admin', sections: [
    { label: 'Posts', path: '/admin/posts' },
    { label: 'Events', path: '/admin/events' },
  ]},
  '/about': { label: 'About', editPath: '/admin/pages?slug=about', sections: [
    { label: 'Page Sections', path: '/admin/pages?slug=about' },
  ]},
  '/team': { label: 'Team', editPath: '/admin/team', sections: [] },
  '/events': { label: 'Events', editPath: '/admin/events', sections: [] },
  '/sponsorship': { label: 'Sponsorship', editPath: '/admin/sponsorship', sections: [] },
  '/fundraising': { label: 'Fundraising', editPath: '/admin/fundraising', sections: [] },
  '/gallery': { label: 'Stella Gallery', editPath: '/admin/stella-gallery', sections: [] },
  '/community-gallery': { label: 'Community Gallery', editPath: '/admin/community-gallery', sections: [] },
}

export default function AdminBar() {
  const { isAdmin, user, signOut } = useAuth()
  const { pathname } = useLocation()
  const { editMode, setEditMode } = useEditMode()

  if (!isAdmin) return null
  if (pathname.startsWith('/admin')) return null

  const isPost = pathname.startsWith('/posts/')
  const pageInfo = isPost
    ? { label: 'Post', editPath: '/admin/posts', sections: [] }
    : (ROUTE_MAP[pathname] ?? { label: 'Page', editPath: '/admin', sections: [] })

  const editUrl = window.location.origin + pageInfo.editPath

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-black border-b-2 border-amber-400 flex items-center gap-3 px-4 text-xs">
      {/* Brand */}
      <span className="flex items-center gap-1.5 shrink-0">
        <LayoutGrid size={12} className="text-amber-400" />
        <span className="text-amber-400 font-bold tracking-widest uppercase text-[10px]">Admin Mode</span>
      </span>

      <div className="w-px h-4 bg-white/20 shrink-0" />

      {/* Current page label */}
      <span className="text-white/60 hidden sm:block shrink-0">
        Viewing: <span className="text-white font-semibold">{pageInfo.label}</span>
      </span>

      {/* Section quick-links */}
      {pageInfo.sections.length > 0 && (
        <>
          <div className="w-px h-4 bg-white/20 shrink-0 hidden md:block" />
          <div className="hidden md:flex items-center gap-1">
            {pageInfo.sections.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="px-2 py-0.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors text-[10px] tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Logged-in user */}
      {user?.email && (
        <>
          <span className="hidden md:flex items-center gap-1.5 text-white/60 shrink-0 text-[10px]">
            <User size={10} className="text-white/40" />
            {user.email}
          </span>
          <div className="w-px h-4 bg-white/20 shrink-0 hidden md:block" />
        </>
      )}

      {/* Highlight toggle */}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-bold transition-all shrink-0 ${
          editMode
            ? 'bg-amber-400 text-black'
            : 'text-white border border-white/30 hover:border-white/60 hover:text-white'
        }`}
        title={editMode ? 'Turn off editable highlights' : 'Highlight editable content'}
      >
        <MousePointer2 size={10} />
        <span className="hidden sm:block">{editMode ? 'Editing On' : 'Highlight'}</span>
      </button>

      {/* Edit this page — opens in new tab */}
      <a
        href={editUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-bold bg-amber-400 hover:bg-amber-300 text-black transition-colors shrink-0"
      >
        <ExternalLink size={10} />
        <span className="hidden sm:block">Edit Page</span>
      </a>

      {/* Admin dashboard */}
      <Link
        to="/admin"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-bold text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-colors shrink-0"
        title="Admin Dashboard"
      >
        <Settings size={11} />
        <span className="hidden lg:block">Dashboard</span>
      </Link>

      {/* Logout */}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-bold text-white/60 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-colors shrink-0"
        title="Sign out"
      >
        <LogOut size={11} />
        <span className="hidden lg:block">Logout</span>
      </button>
    </div>
  )
}
