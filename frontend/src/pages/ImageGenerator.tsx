import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Image,
  Loader2,
  Check,
  X,
  Eye,
  Download,
  Sparkles,
  Palette,
  Zap,
  Monitor,
  Smartphone,
  BarChart3,
} from 'lucide-react'
import { imagesApi, postsApi, Post } from '../api'
import { clsx } from 'clsx'

const styleConfig: Record<string, { gradient: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  technical: {
    gradient: 'from-cyan-500 to-blue-500',
    icon: Monitor,
    color: 'cyan',
  },
  apple: {
    gradient: 'from-slate-400 to-slate-600',
    icon: Smartphone,
    color: 'slate',
  },
  business_results: {
    gradient: 'from-emerald-500 to-teal-500',
    icon: BarChart3,
    color: 'emerald',
  },
}

export default function ImageGenerator() {
  const queryClient = useQueryClient()
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    'technical',
    'apple',
    'business_results',
  ])

  const { data: postsData } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postsApi.list({ page_size: 100 }),
  })

  const { data: stylesData } = useQuery({
    queryKey: ['image-styles'],
    queryFn: imagesApi.getStyles,
  })

  const { data: selectedPost } = useQuery({
    queryKey: ['post', selectedPostId],
    queryFn: () => postsApi.get(selectedPostId!),
    enabled: !!selectedPostId,
  })

  const { data: postImages, refetch: refetchImages } = useQuery({
    queryKey: ['post-images', selectedPostId],
    queryFn: () => imagesApi.getPostImages(selectedPostId!),
    enabled: !!selectedPostId,
  })

  const { data: validation } = useQuery({
    queryKey: ['validate-prompts', selectedPostId],
    queryFn: () => imagesApi.validatePrompts(selectedPostId!),
    enabled: !!selectedPostId && !!selectedPost?.image_prompts,
  })

  const generatePromptsMutation = useMutation({
    mutationFn: (postId: number) => imagesApi.generatePrompts(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', selectedPostId] })
      toast.success('Prompts generated')
    },
  })

  const generateImagesMutation = useMutation({
    mutationFn: () => imagesApi.generate(selectedPostId!, selectedStyles),
    onSuccess: (data) => {
      refetchImages()
      if (data.success) {
        toast.success(`Generated ${data.images?.length || 0} images`)
      } else {
        toast.error(data.message || 'Generation failed')
      }
    },
    onError: () => {
      toast.error('Image generation failed')
    },
  })

  const dryRunMutation = useMutation({
    mutationFn: () => imagesApi.generate(selectedPostId!, selectedStyles, true),
    onSuccess: (data) => {
      console.log('Dry run prompts:', data.prompts_only)
      toast.success('Check console for prompts')
    },
  })

  const posts = postsData?.posts || []
  const styles = stylesData?.styles || []

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((s) => s !== styleId)
        : [...prev, styleId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Image Generator</h1>
        <p className="text-slate-500 mt-1">
          Create stunning visuals for your LinkedIn posts in 3 unique styles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Select Post</h3>
              <p className="text-sm text-slate-500">{posts.length} posts available</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {posts.map((post: Post, index: number) => {
              const hasPrompts = !!post.image_prompts
              const imageCount = post.images?.length || 0
              const isSelected = selectedPostId === post.id

              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={clsx(
                    'w-full text-left p-4 rounded-xl transition-all duration-300 border',
                    isSelected
                      ? 'bg-gradient-to-br from-brand-500/10 to-purple-500/10 border-brand-500/30'
                      : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/10'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                      isSelected
                        ? 'bg-gradient-to-br from-brand-500 to-purple-500 text-white'
                        : 'bg-white/5 text-slate-400'
                    )}>
                      #{post.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate mb-1">{post.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'badge text-xs',
                          hasPrompts ? 'badge-success' : 'bg-white/5 text-slate-500'
                        )}>
                          {hasPrompts ? 'Has prompts' : 'No prompts'}
                        </span>
                        {imageCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Image className="w-3 h-3" />
                            {imageCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Style Selection & Generation */}
        <div className="lg:col-span-2 space-y-5">
          {selectedPost ? (
            <>
              {/* Selected Post Info */}
              <div className="card">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                    #{selectedPost.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {selectedPost.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {selectedPost.hook}
                    </p>
                  </div>
                </div>

                {/* Validation Status */}
                {selectedPost.image_prompts ? (
                  <div
                    className={clsx(
                      'flex items-center gap-3 p-4 rounded-xl',
                      validation?.is_valid
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    )}
                  >
                    {validation?.is_valid ? (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-400">Prompts Ready</p>
                          <p className="text-sm text-emerald-400/70">Validated successfully</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-red-400">Validation Errors</p>
                          <ul className="text-sm text-red-400/70 mt-1">
                            {validation?.errors?.map((err: string, i: number) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => generatePromptsMutation.mutate(selectedPost.id)}
                    disabled={generatePromptsMutation.isPending}
                    className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
                  >
                    {generatePromptsMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Prompts...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Image Prompts
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Style Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-5">
                  Select Image Styles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {styles.map((style: { id: string; name: string; description: string; colors: string[]; best_for: string[] }) => {
                    const config = styleConfig[style.id] || styleConfig.technical
                    const Icon = config.icon
                    const isSelected = selectedStyles.includes(style.id)

                    return (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={clsx(
                          'group relative p-5 rounded-2xl text-left transition-all duration-300 border overflow-hidden',
                          isSelected
                            ? `bg-gradient-to-br ${config.gradient}/10 border-${config.color}-500/30`
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                        )}
                      >
                        {/* Gradient accent */}
                        {isSelected && (
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className={clsx(
                            'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105',
                            isSelected
                              ? `bg-gradient-to-br ${config.gradient}`
                              : 'bg-white/5'
                          )}>
                            <Icon className={clsx(
                              'w-5 h-5',
                              isSelected ? 'text-white' : 'text-slate-400'
                            )} />
                          </div>
                          {isSelected && (
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        <h4 className="font-semibold text-white mb-1">{style.name}</h4>
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                          {style.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {style.best_for?.slice(0, 2).map((item: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => dryRunMutation.mutate()}
                    disabled={
                      dryRunMutation.isPending ||
                      !selectedPost.image_prompts ||
                      selectedStyles.length === 0
                    }
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Prompts
                  </button>
                  <button
                    onClick={() => generateImagesMutation.mutate()}
                    disabled={
                      generateImagesMutation.isPending ||
                      !selectedPost.image_prompts ||
                      !validation?.is_valid ||
                      selectedStyles.length === 0
                    }
                    className={clsx(
                      'flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
                      selectedPost.image_prompts && validation?.is_valid && selectedStyles.length > 0
                        ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white hover:shadow-lg hover:shadow-brand-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    )}
                  >
                    {generateImagesMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Images...
                      </>
                    ) : !selectedPost.image_prompts ? (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Prompts First ↑
                      </>
                    ) : !validation?.is_valid ? (
                      <>
                        <X className="h-5 w-5" />
                        Fix Validation Errors
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate {selectedStyles.length} Image{selectedStyles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Images */}
              {postImages?.images?.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Generated Images</h3>
                      <p className="text-sm text-slate-500">{postImages.images.length} images ready</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {postImages.images.map((img: { id: number; style: string; file_path: string; image_url?: string; created_at: string }) => {
                      const config = styleConfig[img.style] || styleConfig.technical

                      return (
                        <div
                          key={img.id}
                          className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5"
                        >
                          {/* Image */}
                          <div className="aspect-square bg-slate-800 flex items-center justify-center overflow-hidden">
                            {img.image_url ? (
                              <img
                                src={img.image_url}
                                alt={`${img.style} style`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Image className="w-8 h-8 text-slate-600" />
                              </div>
                            )}
                          </div>

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <button className="btn-secondary p-2">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                {(() => {
                                  const Icon = config.icon
                                  return <Icon className="w-3 h-3 text-white" />
                                })()}
                              </div>
                              <p className="text-white font-medium capitalize">
                                {img.style.replace('_', ' ')}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500">
                              {new Date(img.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Image className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a Post</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Choose a post from the list to generate stunning visuals for your LinkedIn content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Style Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.entries(styleConfig).map(([id, config]) => {
          const Icon = config.icon
          const style = styles.find((s: { id: string }) => s.id === id)

          return (
            <div key={id} className="card-glow p-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2 capitalize">
                {id.replace('_', ' ')} Style
              </h4>
              <p className="text-sm text-slate-400">
                {style?.description || 'Professional visual style for LinkedIn'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
