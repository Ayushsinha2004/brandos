import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Archive,
  FileDown,
  Grid3X3,
  List,
  Sparkles,
  Image,
  Calendar,
} from 'lucide-react'
import { postsApi, Post } from '../api'
import { clsx } from 'clsx'

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Drafting: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
  Review: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  Published: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Archived: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
}

const typeGradients: Record<string, string> = {
  'Story-Based': 'from-cyan-500 to-blue-500',
  'Framework': 'from-purple-500 to-pink-500',
  'Contrarian Opinion': 'from-orange-500 to-red-500',
  'Case Study': 'from-emerald-500 to-teal-500',
}

export default function PostsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data, isLoading } = useQuery({
    queryKey: ['posts', statusFilter],
    queryFn: () => postsApi.list({ status: statusFilter || undefined, page_size: 50 }),
  })

  const deleteMutation = useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted')
    },
    onError: () => {
      toast.error('Failed to delete post')
    },
  })

  const publishMutation = useMutation({
    mutationFn: postsApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post published')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: postsApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post archived')
    },
  })

  const exportMutation = useMutation({
    mutationFn: postsApi.exportToFile,
    onSuccess: (data) => {
      toast.success(`Exported to ${data.path}`)
    },
  })

  const posts = data?.posts || []
  const filteredPosts = posts.filter((post: Post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.hook.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusCounts = {
    all: posts.length,
    Drafting: posts.filter((p: Post) => p.status === 'Drafting').length,
    Review: posts.filter((p: Post) => p.status === 'Review').length,
    Published: posts.filter((p: Post) => p.status === 'Published').length,
    Archived: posts.filter((p: Post) => p.status === 'Archived').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Posts Library</h1>
          <p className="text-slate-500 mt-1">
            {data?.total || 0} posts in your content library
          </p>
        </div>
        <Link to="/generate" className="btn-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Create New Post
        </Link>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'Drafting', 'Review', 'Published', 'Archived'].map((status) => {
          const count = status === '' ? statusCounts.all : statusCounts[status as keyof typeof statusCounts]
          const config = status ? statusConfig[status] : { bg: 'bg-brand-500/10 border-brand-500/20', text: 'text-brand-400', dot: 'bg-brand-400' }
          const isActive = statusFilter === status

          return (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border',
                isActive
                  ? `${config.bg} ${config.text} border-current`
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:border-white/10'
              )}
            >
              {status && <div className={clsx('w-2 h-2 rounded-full', config.dot)} />}
              {status || 'All Posts'}
              <span className={clsx(
                'px-2 py-0.5 rounded-md text-xs',
                isActive ? 'bg-white/10' : 'bg-white/5'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search posts by title or hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-12 h-12"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2.5 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2.5 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-4" />
              <div className="h-4 bg-white/5 rounded w-full mb-2" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No posts found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search terms' : 'Start creating content with AI-powered generation'}
          </p>
          <Link to="/generate" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Post
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post: Post, index: number) => {
            const config = statusConfig[post.status] || statusConfig.Drafting
            const gradient = typeGradients[post.content_type || ''] || 'from-slate-500 to-slate-600'

            return (
              <div
                key={post.id}
                className="group card-glow relative overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Gradient accent */}
                <div className={clsx(
                  'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                  gradient
                )} />

                {/* Menu button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setOpenMenu(openMenu === post.id ? null : post.id)
                    }}
                    className="p-2 rounded-lg bg-dark-900/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark-800"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>

                  {openMenu === post.id && (
                    <div className="absolute right-0 top-10 z-20 w-48 py-2 rounded-xl bg-dark-800/95 backdrop-blur-xl border border-white/10 shadow-xl">
                      <Link
                        to={`/posts/${post.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Post
                      </Link>
                      {post.status !== 'Published' && (
                        <button
                          onClick={() => {
                            publishMutation.mutate(post.id)
                            setOpenMenu(null)
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => {
                          archiveMutation.mutate(post.id)
                          setOpenMenu(null)
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button
                        onClick={() => {
                          exportMutation.mutate(post.id)
                          setOpenMenu(null)
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full"
                      >
                        <FileDown className="w-4 h-4" />
                        Export
                      </button>
                      <hr className="my-2 border-white/5" />
                      <button
                        onClick={() => {
                          if (confirm('Delete this post?')) {
                            deleteMutation.mutate(post.id)
                            setOpenMenu(null)
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <Link to={`/posts/${post.id}`} className="block">
                  {/* Number badge */}
                  <div className={clsx(
                    'inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold mb-4 bg-gradient-to-br',
                    gradient
                  )}>
                    #{post.number}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Hook preview */}
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {post.hook}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      {/* Status badge */}
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                        config.bg, config.text
                      )}>
                        <div className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                        {post.status}
                      </span>

                      {/* Images indicator */}
                      {post.images && post.images.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Image className="w-3.5 h-3.5" />
                          {post.images.length}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post: Post) => {
                  const config = statusConfig[post.status] || statusConfig.Drafting
                  const gradient = typeGradients[post.content_type || ''] || 'from-slate-500 to-slate-600'

                  return (
                    <tr key={post.id} className="table-row group">
                      <td className="py-4 px-5">
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-br',
                          gradient
                        )}>
                          {post.number}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Link to={`/posts/${post.id}`} className="group/link">
                          <p className="text-white font-medium group-hover/link:text-brand-400 transition-colors">
                            {post.title}
                          </p>
                          <p className="text-sm text-slate-500 truncate max-w-md">{post.hook}</p>
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm text-slate-400">{post.content_type || '-'}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                          config.bg, config.text
                        )}>
                          <div className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/posts/${post.id}`}
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteMutation.mutate(post.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredPosts.length} of {data?.total || 0} posts</span>
        {filteredPosts.length > 0 && (
          <span>{statusCounts.Published} published • {statusCounts.Drafting} drafts</span>
        )}
      </div>
    </div>
  )
}
