import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FileText,
  MessageSquare,
  Loader2,
  Copy,
  Save,
  Sparkles,
  Wand2,
  ChevronRight,
  Zap,
  ArrowRight,
  Check,
  Eye,
  Code,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe,
  CheckCircle,
} from 'lucide-react'
import { generateApi, postsApi } from '../api'
import { clsx } from 'clsx'
import govindProfile from '../assets/govind-profile.jpg'

type GenerationMethod = 'transcript' | 'questions'
type ViewMode = 'raw' | 'preview'

export default function PostGenerator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialMethod = searchParams.get('method') as GenerationMethod || 'transcript'

  const [method, setMethod] = useState<GenerationMethod>(initialMethod)
  const [transcript, setTranscript] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [postType, setPostType] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('raw')
  const [copied, setCopied] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    hook: string
    content: string
    post_type: string
    word_count: number
    suggested_hooks: string[]
  } | null>(null)

  const { data: questionsData } = useQuery({
    queryKey: ['discovery-questions'],
    queryFn: generateApi.getDiscoveryQuestions,
    enabled: method === 'questions',
  })

  const { data: postTypes } = useQuery({
    queryKey: ['post-types'],
    queryFn: generateApi.getPostTypes,
  })

  const transcriptMutation = useMutation({
    mutationFn: generateApi.fromTranscript,
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedContent({
          title: data.title,
          hook: data.hook,
          content: data.content,
          post_type: data.post_type,
          word_count: data.word_count,
          suggested_hooks: data.suggested_hooks,
        })
        toast.success('Post generated successfully!')
      } else {
        toast.error(data.message || 'Generation failed')
      }
    },
    onError: (error: Error) => {
      toast.error(`Generation failed: ${error.message}`)
    },
  })

  const questionsMutation = useMutation({
    mutationFn: generateApi.fromQuestions,
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedContent({
          title: data.title,
          hook: data.hook,
          content: data.content,
          post_type: data.post_type,
          word_count: data.word_count,
          suggested_hooks: data.suggested_hooks,
        })
        toast.success('Post generated successfully!')
      } else {
        toast.error(data.message || 'Generation failed')
      }
    },
    onError: (error: Error) => {
      toast.error(`Generation failed: ${error.message}`)
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: { title: string; hook: string; content: string; content_type: string }) =>
      postsApi.create(data),
    onSuccess: (data) => {
      toast.success('Post saved!')
      navigate(`/posts/${data.id}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to save: ${error.message}`)
    },
  })

  const handleGenerate = () => {
    if (method === 'transcript') {
      if (!transcript.trim()) {
        toast.error('Please enter a transcript')
        return
      }
      transcriptMutation.mutate({
        transcript,
        source_type: sourceType || undefined,
        preferred_post_type: postType || undefined,
      })
    } else {
      const answeredQuestions = questionsData?.questions
        ?.filter((q: { id: string }) => answers[q.id]?.trim())
        .map((q: { id: string; category: string; question: string }) => ({
          question_id: q.id,
          category: q.category,
          question: q.question,
          answer: answers[q.id],
        }))

      if (!answeredQuestions?.length) {
        toast.error('Please answer at least one question')
        return
      }

      questionsMutation.mutate({
        answers: answeredQuestions,
        preferred_post_type: postType || undefined,
      })
    }
  }

  const handleSave = () => {
    if (!generatedContent) return
    saveMutation.mutate({
      title: generatedContent.title,
      hook: generatedContent.hook,
      content: generatedContent.content,
      content_type: generatedContent.post_type,
    })
  }

  const handleCopy = () => {
    if (!generatedContent) return
    navigator.clipboard.writeText(generatedContent.content)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const isGenerating = transcriptMutation.isPending || questionsMutation.isPending
  const wordCount = transcript.split(/\s+/).filter(Boolean).length
  const answeredCount = Object.values(answers).filter(a => a.trim()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Generate Post</h1>
        <p className="text-slate-500 mt-1">
          Transform your ideas into engaging LinkedIn content with AI
        </p>
      </div>

      {/* Method Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMethod('transcript')}
          className={clsx(
            'group relative p-5 rounded-2xl text-left transition-all duration-300 border',
            method === 'transcript'
              ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
          )}
        >
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105',
            method === 'transcript'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
              : 'bg-white/5'
          )}>
            <FileText className={clsx(
              'w-6 h-6',
              method === 'transcript' ? 'text-white' : 'text-slate-400'
            )} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">From Transcript</h3>
          <p className="text-sm text-slate-500">
            Transform YouTube, podcast, or meeting transcripts into posts
          </p>
          {method === 'transcript' && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <button
          onClick={() => setMethod('questions')}
          className={clsx(
            'group relative p-5 rounded-2xl text-left transition-all duration-300 border',
            method === 'questions'
              ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
          )}
        >
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105',
            method === 'questions'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-white/5'
          )}>
            <MessageSquare className={clsx(
              'w-6 h-6',
              method === 'questions' ? 'text-white' : 'text-slate-400'
            )} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">From Q&A</h3>
          <p className="text-sm text-slate-500">
            Answer discovery questions to generate personalized content
          </p>
          {method === 'questions' && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              method === 'transcript'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            )}>
              {method === 'transcript' ? (
                <FileText className="w-5 h-5 text-white" />
              ) : (
                <MessageSquare className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {method === 'transcript' ? 'Transcript Input' : 'Discovery Questions'}
              </h3>
              <p className="text-sm text-slate-500">
                {method === 'transcript' ? `${wordCount} words` : `${answeredCount} questions answered`}
              </p>
            </div>
          </div>

          {method === 'transcript' ? (
            <div className="space-y-5">
              <div>
                <label className="label">Paste your transcript</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your transcript here (from YouTube, podcast, meeting, etc.)"
                  rows={14}
                  className="textarea w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Auto-detect</option>
                    <option value="youtube">YouTube</option>
                    <option value="podcast">Podcast</option>
                    <option value="sales_call">Sales Call</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="label">Post Type</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Auto-detect</option>
                    {postTypes?.types?.map((type: { id: string; name: string }) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-h-[550px] overflow-y-auto pr-2">
              {questionsData?.questions?.map((q: { id: string; category: string; question: string }, index: number) => (
                <div key={q.id} className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary text-xs">{q.category}</span>
                    <span className="text-xs text-slate-600">Question {index + 1}</span>
                  </div>
                  <label className="label">{q.question}</label>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Your answer..."
                    rows={3}
                    className="textarea w-full"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Generate Post
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Generated Post</h3>
                <p className="text-sm text-slate-500">
                  {generatedContent ? 'Ready to save' : 'Waiting for input'}
                </p>
              </div>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  <button
                    onClick={() => setViewMode('raw')}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all',
                      viewMode === 'raw'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Raw
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all',
                      viewMode === 'preview'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className={clsx(
                    'btn-secondary p-2.5 transition-all',
                    copied && 'bg-emerald-500/20 border-emerald-500/30'
                  )}
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Post'}
                </button>
              </div>
            )}
          </div>

          {generatedContent ? (
            viewMode === 'preview' ? (
              /* LinkedIn Preview Mode */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  LinkedIn Preview
                </p>

                {/* LinkedIn Post Card */}
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                  {/* Post Header */}
                  <div className="p-4 flex items-start gap-3">
                    <img
                      src={govindProfile}
                      alt="Govind Bajwa"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-slate-900">Govind Bajwa</p>
                        <span className="text-blue-600">• 1st</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">AI & Automation Expert | Helping Businesses Scale</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <span>Just now</span>
                        <span>•</span>
                        <Globe className="w-3 h-3" />
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <div className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {generatedContent.content}
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="px-4 py-2 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <ThumbsUp className="w-3 h-3 text-white" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs">
                          ❤️
                        </div>
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs">
                          👏
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 ml-1">247</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>42 comments</span>
                      <span>•</span>
                      <span>12 reposts</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-2 py-1 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium text-sm">Like</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Repeat2 className="w-5 h-5" />
                      <span className="font-medium text-sm">Repost</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Send className="w-5 h-5" />
                      <span className="font-medium text-sm">Send</span>
                    </button>
                  </div>
                </div>

                {/* Post Stats */}
                <div className="flex gap-3 mt-4">
                  <div className="badge badge-purple">
                    {generatedContent.post_type}
                  </div>
                  <div className="badge">
                    {generatedContent.word_count} words
                  </div>
                </div>
              </div>
            ) : (
              /* Raw Content Mode */
              <div className="space-y-5">
                {/* Title */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Title</p>
                  <p className="text-white font-semibold text-lg">{generatedContent.title}</p>
                </div>

                {/* Meta */}
                <div className="flex gap-3">
                  <div className="badge badge-purple">
                    {generatedContent.post_type}
                  </div>
                  <div className="badge">
                    {generatedContent.word_count} words
                  </div>
                </div>

                {/* Hook */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/20">
                  <p className="text-xs text-brand-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Hook
                  </p>
                  <p className="text-white font-medium">{generatedContent.hook}</p>
                </div>

                {/* Content */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Full Post</p>
                  <div className="bg-white/[0.02] rounded-xl p-5 max-h-[300px] overflow-y-auto border border-white/5">
                    <pre className="whitespace-pre-wrap text-slate-200 text-sm font-sans leading-relaxed">
                      {generatedContent.content}
                    </pre>
                  </div>
                </div>

                {/* Alternative Hooks */}
                {generatedContent.suggested_hooks?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Alternative Hooks</p>
                    <div className="space-y-2">
                      {generatedContent.suggested_hooks.map((hook, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600 mt-0.5" />
                          <p className="text-sm text-slate-300">{hook}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {method === 'transcript'
                  ? 'Enter a transcript and click Generate to create your post'
                  : 'Answer discovery questions and click Generate to create your post'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
