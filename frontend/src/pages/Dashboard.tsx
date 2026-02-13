import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  FileText,
  PenTool,
  Image,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Zap,
  BarChart3,
  Target,
  Rocket,
} from 'lucide-react'
import { postsApi, contextApi, generateApi } from '../api'
import { clsx } from 'clsx'

export default function Dashboard() {
  const { data: postsData } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postsApi.list({ page_size: 100 }),
  })

  const { data: contextSummary } = useQuery({
    queryKey: ['context-summary'],
    queryFn: generateApi.getContextSummary,
  })

  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => contextApi.list(),
  })

  const posts = postsData?.posts || []
  const totalPosts = postsData?.total || 0

  const stats = {
    total: totalPosts,
    drafting: posts.filter((p: { status: string }) => p.status === 'Drafting').length,
    review: posts.filter((p: { status: string }) => p.status === 'Review').length,
    published: posts.filter((p: { status: string }) => p.status === 'Published').length,
  }

  const recentPosts = posts.slice(0, 5)

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.total,
      icon: FileText,
      gradient: 'from-cyan-500 to-blue-500',
      bgGlow: 'bg-cyan-500/20',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      label: 'Drafting',
      value: stats.drafting,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/20',
      change: `${stats.drafting} pending`,
      changeType: 'neutral' as const,
    },
    {
      label: 'In Review',
      value: stats.review,
      icon: AlertCircle,
      gradient: 'from-purple-500 to-pink-500',
      bgGlow: 'bg-purple-500/20',
      change: 'Needs attention',
      changeType: 'warning' as const,
    },
    {
      label: 'Published',
      value: stats.published,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bgGlow: 'bg-emerald-500/20',
      change: 'Live content',
      changeType: 'positive' as const,
    },
  ]

  const quickActions = [
    {
      title: 'Generate from Transcript',
      description: 'Transform any video or audio transcript into engaging content',
      icon: PenTool,
      href: '/generate',
      gradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/20',
    },
    {
      title: 'Generate from Q&A',
      description: 'Answer discovery questions to create personalized posts',
      icon: TrendingUp,
      href: '/generate?method=questions',
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
    },
    {
      title: 'Generate Images',
      description: 'Create stunning visuals for your LinkedIn posts',
      icon: Image,
      href: '/images',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" />

        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl border border-white/10" />

        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-4 left-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">All systems operational</span>
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Welcome back, <span className="gradient-text">Govind</span>
            </h1>
            <p className="text-slate-400 max-w-lg">
              Your AI-powered content engine is ready. You have {stats.drafting} drafts waiting and {stats.review} posts ready for review.
            </p>
          </div>

          <Link
            to="/generate"
            className="btn-primary flex items-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Create New Post
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="card-glow group cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110',
                `bg-gradient-to-br ${stat.gradient}`
              )}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={clsx(
                'text-xs font-medium px-2 py-1 rounded-full',
                stat.changeType === 'positive' && 'bg-emerald-500/10 text-emerald-400',
                stat.changeType === 'warning' && 'bg-amber-500/10 text-amber-400',
                stat.changeType === 'neutral' && 'bg-slate-500/10 text-slate-400'
              )}>
                {stat.change}
              </span>
            </div>

            <p className="text-4xl font-display font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>

            {/* Progress bar */}
            <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-1000',
                  `bg-gradient-to-r ${stat.gradient}`
                )}
                style={{ width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Recent Posts</h3>
                <p className="text-sm text-slate-500">Your latest content</p>
              </div>
            </div>
            <Link
              to="/posts"
              className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-2">No posts yet</p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post: { id: number; number: number; title: string; status: string; created_at: string; content_type: string | null }, index: number) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
                    #{post.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {post.content_type || 'Post'} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={clsx(
                    'badge',
                    post.status === 'Published' && 'badge-success',
                    post.status === 'Review' && 'badge-warning',
                    post.status === 'Drafting' && 'badge-primary'
                  )}>
                    {post.status}
                  </span>

                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Context Status */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Brand Context</h3>
              <p className="text-sm text-slate-500">AI knowledge base</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className={clsx(
            'flex items-center gap-3 p-4 rounded-xl mb-4',
            contextSummary?.ready_for_generation
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-amber-500/10 border border-amber-500/20'
          )}>
            {contextSummary?.ready_for_generation ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-400">Ready for Generation</p>
                  <p className="text-xs text-emerald-400/70">All profiles loaded</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-400">Setup Required</p>
                  <p className="text-xs text-amber-400/70">Configure context profiles</p>
                </div>
              </>
            )}
          </div>

          {/* Profile count */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Profiles Loaded</span>
              <span className="text-lg font-bold text-white">{profilesData?.total || 0}/5</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${((profilesData?.total || 0) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Context summary */}
          {contextSummary?.summary?.business && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Business</p>
              <p className="text-sm text-white font-medium">{contextSummary.summary.business.company}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {contextSummary.summary.business.industry}
              </p>
            </div>
          )}

          <Link
            to="/context"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Manage Profiles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Quick Actions</h3>
            <p className="text-sm text-slate-500">Start creating content</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              to={action.href}
              className="group card-glow p-6 hover:translate-y-[-4px] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={clsx(
                'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110',
                `bg-gradient-to-br ${action.gradient}`
              )}>
                <action.icon className="w-7 h-7 text-white" />
              </div>

              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
                {action.title}
              </h4>
              <p className="text-sm text-slate-400">
                {action.description}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Get started
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
