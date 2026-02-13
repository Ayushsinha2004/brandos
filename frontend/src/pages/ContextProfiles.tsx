import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  User,
  Briefcase,
  Target,
  TrendingUp,
  BookOpen,
  Save,
  FileDown,
  FileUp,
  ChevronDown,
  ChevronRight,
  Check,
  Sparkles,
  Database,
  Zap,
} from 'lucide-react'
import { contextApi, ContextProfile } from '../api'
import { clsx } from 'clsx'

const profileConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; description: string; gradient: string }> = {
  brand_voice: {
    icon: User,
    label: 'Brand Voice',
    description: 'Tone, style, and language rules',
    gradient: 'from-cyan-500 to-blue-500',
  },
  business_context: {
    icon: Briefcase,
    label: 'Business Context',
    description: 'Company positioning and offers',
    gradient: 'from-purple-500 to-pink-500',
  },
  icp_context: {
    icon: Target,
    label: 'ICP Context',
    description: 'Target audience psychology',
    gradient: 'from-emerald-500 to-teal-500',
  },
  marketing_strategy: {
    icon: TrendingUp,
    label: 'Marketing Strategy',
    description: 'Funnels and messaging',
    gradient: 'from-orange-500 to-amber-500',
  },
  personal_story: {
    icon: BookOpen,
    label: 'Personal Story',
    description: 'Founder journey and narrative',
    gradient: 'from-pink-500 to-rose-500',
  },
}

export default function ContextProfiles() {
  const queryClient = useQueryClient()
  const [selectedProfile, setSelectedProfile] = useState<ContextProfile | null>(null)
  const [editedData, setEditedData] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => contextApi.list({ active_only: false }),
  })

  const importMutation = useMutation({
    mutationFn: contextApi.importFromFiles,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success(`Imported ${data.length} profiles`)
    },
    onError: () => {
      toast.error('Failed to import profiles')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      contextApi.update(id, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profile updated')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const exportMutation = useMutation({
    mutationFn: contextApi.exportToFile,
    onSuccess: (data) => {
      toast.success(`Exported to ${data.path}`)
    },
  })

  const profiles = data?.profiles || []

  const handleSelectProfile = (profile: ContextProfile) => {
    setSelectedProfile(profile)
    setEditedData(JSON.stringify(profile.data, null, 2))
  }

  const handleSave = () => {
    if (!selectedProfile) return
    try {
      const parsedData = JSON.parse(editedData)
      updateMutation.mutate({ id: selectedProfile.id, data: parsedData })
    } catch {
      toast.error('Invalid JSON')
    }
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const renderProfileData = (data: Record<string, unknown>, parentKey = '') => {
    return Object.entries(data).map(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key
      const isExpanded = expandedSections.has(fullKey)

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={fullKey} className="my-2">
            <button
              onClick={() => toggleSection(fullKey)}
              className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
            </button>
            {isExpanded && (
              <div className="ml-6 mt-2 pl-3 border-l border-white/10">
                {renderProfileData(value as Record<string, unknown>, fullKey)}
              </div>
            )}
          </div>
        )
      }

      if (Array.isArray(value)) {
        return (
          <div key={fullKey} className="my-2">
            <button
              onClick={() => toggleSection(fullKey)}
              className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-xs text-slate-500">({value.length})</span>
            </button>
            {isExpanded && (
              <ul className="ml-6 mt-2 space-y-1.5">
                {value.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-slate-600 text-xs mt-1">•</span>
                    <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }

      return (
        <div key={fullKey} className="my-1.5 flex items-start gap-2">
          <span className="text-slate-500 text-sm capitalize min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
          <span className="text-slate-200 text-sm flex-1">{String(value)}</span>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Context Profiles</h1>
          <p className="text-slate-500 mt-1">
            Your AI knowledge base for content generation
          </p>
        </div>
        <button
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
          className="btn-secondary flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          {importMutation.isPending ? 'Importing...' : 'Import from Files'}
        </button>
      </div>

      {/* Status Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{profiles.length} of 5 Profiles Loaded</h3>
              <p className="text-sm text-slate-500">
                {profiles.length >= 5 ? 'All profiles configured' : `${5 - profiles.length} more needed for optimal generation`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profiles.length >= 5 ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Ready for Generation</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Setup Required</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${(profiles.length / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            Profiles
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-4">No profiles found</p>
              <button
                onClick={() => importMutation.mutate()}
                className="btn-primary inline-flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Import from Files
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile: ContextProfile, index: number) => {
                const config = profileConfig[profile.profile_type] || {
                  icon: User,
                  label: profile.name,
                  description: '',
                  gradient: 'from-slate-500 to-slate-600',
                }
                const Icon = config.icon
                const isSelected = selectedProfile?.id === profile.id

                return (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className={clsx(
                      'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group',
                      isSelected
                        ? 'bg-white/[0.08] border border-brand-500/30'
                        : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/10'
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={clsx(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105',
                      `bg-gradient-to-br ${config.gradient}`
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{config.label}</p>
                      <p className="text-xs text-slate-500">
                        {profile.version} • {profile.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile Editor */}
        <div className="lg:col-span-2 card">
          {selectedProfile ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const config = profileConfig[selectedProfile.profile_type] || profileConfig.brand_voice
                    const Icon = config.icon
                    return (
                      <div className={clsx(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        `bg-gradient-to-br ${config.gradient}`
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {profileConfig[selectedProfile.profile_type]?.label || selectedProfile.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Version {selectedProfile.version} • Updated {new Date(selectedProfile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportMutation.mutate(selectedProfile.id)}
                    className="btn-secondary p-2.5"
                  >
                    <FileDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Visual View */}
              <div className="bg-white/[0.02] rounded-xl p-5 mb-5 max-h-[300px] overflow-y-auto border border-white/5">
                {renderProfileData(selectedProfile.data as Record<string, unknown>)}
              </div>

              {/* JSON Editor */}
              <div>
                <label className="label flex items-center gap-2">
                  <span>Edit JSON</span>
                  <span className="text-xs text-slate-600">(Advanced)</span>
                </label>
                <textarea
                  value={editedData}
                  onChange={(e) => setEditedData(e.target.value)}
                  rows={16}
                  className="textarea w-full font-mono text-xs"
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a Profile</h3>
              <p className="text-slate-500">Choose a profile from the list to view and edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Types Legend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          Profile Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(profileConfig).map(([type, config]) => {
            const Icon = config.icon
            const isLoaded = profiles.some((p: ContextProfile) => p.profile_type === type)

            return (
              <div
                key={type}
                className={clsx(
                  'p-4 rounded-xl border transition-all',
                  isLoaded
                    ? 'bg-white/[0.03] border-white/10'
                    : 'bg-white/[0.01] border-white/5 opacity-60'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={clsx(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    `bg-gradient-to-br ${config.gradient}`
                  )}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {isLoaded && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-white text-sm">{config.label}</p>
                <p className="text-xs text-slate-500 mt-1">{config.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
