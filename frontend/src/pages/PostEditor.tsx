import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Image,
  Copy,
  CheckCircle,
  Archive,
  Loader2,
  FileText,
  Zap,
  Clock,
  Calendar,
  Send,
  Sparkles,
  Palette,
  Settings,
  Hash,
  Type,
  AlignLeft,
} from 'lucide-react'
import { postsApi, imagesApi, Post } from '../api'
import { clsx } from 'clsx'

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Drafting: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Review: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Published: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Archived: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
}

const contentTypeConfig: Record<string, { gradient: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Story-Based': { gradient: 'from-pink-500 to-rose-500', icon: FileText },
  'Framework': { gradient: 'from-blue-500 to-cyan-500', icon: AlignLeft },
  'Contrarian Opinion': { gradient: 'from-orange-500 to-amber-500', icon: Zap },
  'Case Study': { gradient: 'from-emerald-500 to-teal-500', icon: CheckCircle },
}

export default function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const postId = Number(id)

  const [title, setTitle] = useState('')
  const [hook, setHook] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')
  const [contentType, setContentType] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.get(postId),
    enabled: !!postId,
  })

  const { data: postImages } = useQuery({
    queryKey: ['post-images', postId],
    queryFn: () => imagesApi.getPostImages(postId),
    enabled: !!postId,
  })

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setHook(post.hook)
      setContent(post.content)
      setStatus(post.status)
      setContentType(post.content_type || '')
    }
  }, [post])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Post>) => postsApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Post updated')
    },
    onError: () => {
      toast.error('Failed to update post')
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => postsApi.publish(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Post published!')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => postsApi.archive(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Post archived')
    },
  })

  const generateImagesMutation = useMutation({
    mutationFn: () => imagesApi.generate(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post-images', postId] })
      if (data.success) {
        toast.success(`Generated ${data.images?.length || 0} images`)
      } else {
        toast.error(data.message || 'Image generation failed')
      }
    },
    onError: () => {
      toast.error('Failed to generate images')
    },
  })

  const generatePromptsMutation = useMutation({
    mutationFn: () => imagesApi.generatePrompts(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Image prompts generated')
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      title,
      hook,
      content,
      status: status as Post['status'],
      content_type: contentType || null,
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const charCount = content.length
  const statusStyle = statusConfig[status] || statusConfig.Drafting
  const typeConfig = contentTypeConfig[contentType]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-slate-400">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Post Not Found</h3>
        <p className="text-slate-500 mb-4">The post you're looking for doesn't exist</p>
        <button onClick={() => navigate('/posts')} className="btn-primary">
          Back to Posts
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/posts')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-white">Edit Post</h1>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 font-mono">
                #{post.number}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{post.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx(
              'btn-secondary flex items-center gap-2 transition-all',
              showPreview && 'bg-brand-500/20 border-brand-500/30 text-brand-400'
            )}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Content Editor</h3>
                <p className="text-sm text-slate-500">Edit your post content</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="label flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input w-full"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Hook */}
              <div>
                <label className="label flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Hook
                </label>
                <div className="relative">
                  <textarea
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    rows={2}
                    className="textarea w-full pr-20"
                    placeholder="Your attention-grabbing opening line..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-slate-600">
                    {hook.length} chars
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0 flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                    Content
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">{wordCount} words</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{charCount} chars</span>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="textarea w-full font-mono text-sm"
                  placeholder="Write your post content..."
                />
                {/* Word count progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      wordCount < 100 ? 'bg-amber-500' : wordCount < 300 ? 'bg-emerald-500' : 'bg-brand-500'
                    )}
                    style={{ width: `${Math.min((wordCount / 400) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {wordCount < 100 ? 'Short post' : wordCount < 300 ? 'Good length' : 'Long form content'}
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="card animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">LinkedIn Preview</h3>
                    <p className="text-sm text-slate-500">How your post will appear</p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className={clsx(
                    'btn-secondary flex items-center gap-2 transition-all',
                    copied && 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* LinkedIn-style preview */}
              <div className="bg-white rounded-xl overflow-hidden shadow-xl">
                {/* LinkedIn header */}
                <div className="p-4 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Your Name</p>
                    <p className="text-sm text-slate-500">Your Title • 1h</p>
                  </div>
                </div>
                {/* Content */}
                <div className="px-4 pb-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
                    {content}
                  </pre>
                </div>
                {/* Engagement bar */}
                <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-6 text-sm text-slate-500">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔄 Repost</span>
                  <span>📤 Send</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status & Metadata */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Post Settings</h3>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="label flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input w-full"
                >
                  <option value="Drafting">Drafting</option>
                  <option value="Review">Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                <div className={clsx(
                  'mt-2 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-sm border',
                  statusStyle.bg,
                  statusStyle.border,
                  statusStyle.color
                )}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {status}
                </div>
              </div>

              {/* Content Type */}
              <div>
                <label className="label flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Not set</option>
                  <option value="Story-Based">Story-Based</option>
                  <option value="Framework">Framework</option>
                  <option value="Contrarian Opinion">Contrarian Opinion</option>
                  <option value="Case Study">Case Study</option>
                </select>
                {typeConfig && (
                  <div className={clsx(
                    'mt-2 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-sm bg-gradient-to-r text-white',
                    typeConfig.gradient
                  )}>
                    <typeConfig.icon className="w-3.5 h-3.5" />
                    {contentType}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-500">Updated:</span>
                  <span className="text-slate-400">{new Date(post.updated_at).toLocaleDateString()}</span>
                </div>
                {post.published_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-500">Published:</span>
                    <span className="text-emerald-400">{new Date(post.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              {status !== 'Published' && (
                <button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Publish Post
                </button>
              )}
              <button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                {archiveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                Archive Post
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Images</h3>
                <p className="text-xs text-slate-500">
                  {postImages?.images?.length || 0} generated
                </p>
              </div>
            </div>

            {postImages?.images?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {postImages.images.map((img: { id: number; style: string; file_path: string; image_url?: string }) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden bg-slate-800/50 aspect-square"
                  >
                    {img.image_url ? (
                      <img
                        src={img.image_url}
                        alt={`${img.style} style`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-xs text-white font-medium capitalize">
                        {img.style.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
                  <Image className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">No images generated yet</p>
              </div>
            )}

            <div className="space-y-2">
              {!post.image_prompts && (
                <button
                  onClick={() => generatePromptsMutation.mutate()}
                  disabled={generatePromptsMutation.isPending}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  {generatePromptsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate Prompts
                </button>
              )}
              <button
                onClick={() => generateImagesMutation.mutate()}
                disabled={generateImagesMutation.isPending || !post.image_prompts}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:hover:shadow-none"
              >
                {generateImagesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                Generate Images
              </button>
              {!post.image_prompts && (
                <p className="text-xs text-slate-600 text-center">
                  Generate prompts first to enable image generation
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
