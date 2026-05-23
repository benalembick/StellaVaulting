import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionHeading from '../components/SectionHeading'
import EditableSection from '../components/EditableSection'

export default function TeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .eq('published', true)
      .order('display_order')
      .then(({ data }) => {
        setMembers(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
        <p className="label-gold mb-4">✦ The Academy ✦</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink font-light">Meet Our Team</h1>
        <p className="mt-4 text-brand-ink-soft max-w-2xl mx-auto">
          The dedicated athletes and coaches who make Stella Vaulting Academy extraordinary.
        </p>
        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      <EditableSection adminPath="/admin/team" label="Team">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 text-brand-ink/40">
            <p>Team profiles coming soon.</p>
          </div>
        ) : (
          <>
            {/* Featured/first member */}
            {members[0] && (
              <div className="mb-16">
                <MemberCardFeatured member={members[0]} />
              </div>
            )}

            {/* Grid of remaining members */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {members.slice(1).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}
      </div>
      </EditableSection>
    </div>
  )
}

function MemberCardFeatured({ member }) {
  return (
    <div className="card-premium overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="aspect-square lg:aspect-auto lg:min-h-80 bg-brand-surface-warm flex items-center justify-center">
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="text-brand-gold/40 text-8xl font-serif">{member.name[0]}</div>
          )}
        </div>
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <p className="label-gold mb-2">✦ Academy Leadership ✦</p>
          <h2 className="font-serif text-4xl text-brand-ink">{member.name}</h2>
          {member.role && (
            <p className="text-brand-gold mt-2 text-sm tracking-wide">{member.role}</p>
          )}
          {member.bio && (
            <p className="text-brand-ink-soft mt-6 leading-relaxed">{member.bio}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member }) {
  return (
    <div className="card-premium group">
      <div className="aspect-square bg-brand-surface-warm flex items-center justify-center overflow-hidden">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-brand-gold/35 text-6xl font-serif group-hover:text-brand-gold/50 transition-colors">
            {member.name[0]}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl text-brand-ink">{member.name}</h3>
        {member.role && (
          <p className="text-brand-gold text-xs mt-1 tracking-wide">{member.role}</p>
        )}
        {member.bio && (
          <p className="text-brand-ink-soft text-sm mt-3 leading-relaxed line-clamp-4">{member.bio}</p>
        )}
      </div>
    </div>
  )
}
