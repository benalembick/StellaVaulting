import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => {
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="pt-40 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="pt-40 text-center px-4">
        <h2 className="font-serif text-3xl text-brand-ink mb-4">Post not found</h2>
        <Link to="/" className="btn-outline-gold">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="pt-20">
      {post.image && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <Link to="/" className="flex items-center gap-2 text-xs text-brand-ink/40 hover:text-brand-ink transition-colors mb-8 tracking-wider uppercase">
          <ArrowLeft size={12} /> Back to Home
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl text-brand-ink font-light leading-tight">{post.title}</h1>
        <div className="gold-divider w-24 mt-6 mb-8" />
        {post.body && (
          <div className="text-brand-ink-soft leading-relaxed whitespace-pre-wrap">{post.body}</div>
        )}
      </div>
    </div>
  )
}
