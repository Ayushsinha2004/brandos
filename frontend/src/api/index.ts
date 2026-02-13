import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Post {
  id: number
  number: number
  title: string
  slug: string
  hook: string
  content: string
  source: string | null
  status: string
  content_type: string | null
  cta_type: string | null
  target_audience: string | null
  key_topics: string[] | null
  image_prompts: Record<string, unknown> | null
  created_at: string
  updated_at: string
  published_at: string | null
  images: PostImage[]
}

export interface PostImage {
  id: number
  post_id: number
  style: string
  file_path: string
  prompt: string | null
  created_at: string
}

export interface ContextProfile {
  id: number
  name: string
  profile_type: string
  version: string
  description: string | null
  data: Record<string, unknown>
  is_active: number
  created_at: string
  updated_at: string
}

export interface DiscoveryQuestion {
  id: string
  category: string
  question: string
}

export interface ContentGenerationResponse {
  success: boolean
  post_id?: number
  title: string
  hook: string
  content: string
  post_type: string
  word_count: number
  key_insights: string[]
  suggested_hooks: string[]
  image_prompts?: Record<string, unknown>
  message?: string
}

// Posts API
export const postsApi = {
  list: async (params?: { status?: string; page?: number; page_size?: number }) => {
    const response = await api.get('/posts/', { params })
    return response.data
  },

  get: async (id: number) => {
    const response = await api.get<Post>(`/posts/${id}`)
    return response.data
  },

  create: async (data: Partial<Post>) => {
    const response = await api.post<Post>('/posts/', data)
    return response.data
  },

  update: async (id: number, data: Partial<Post>) => {
    const response = await api.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/posts/${id}`)
  },

  publish: async (id: number) => {
    const response = await api.post<Post>(`/posts/${id}/publish`)
    return response.data
  },

  archive: async (id: number) => {
    const response = await api.post<Post>(`/posts/${id}/archive`)
    return response.data
  },

  exportToFile: async (id: number) => {
    const response = await api.post(`/posts/${id}/export-to-file`)
    return response.data
  },
}

// Context Profiles API
export const contextApi = {
  list: async (params?: { profile_type?: string; active_only?: boolean }) => {
    const response = await api.get('/context/', { params })
    return response.data
  },

  get: async (id: number) => {
    const response = await api.get<ContextProfile>(`/context/${id}`)
    return response.data
  },

  getActive: async (profileType: string) => {
    const response = await api.get<ContextProfile>(`/context/active/${profileType}`)
    return response.data
  },

  create: async (data: Partial<ContextProfile>) => {
    const response = await api.post<ContextProfile>('/context/', data)
    return response.data
  },

  update: async (id: number, data: Partial<ContextProfile>) => {
    const response = await api.put<ContextProfile>(`/context/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/context/${id}`)
  },

  importFromFiles: async () => {
    const response = await api.post<ContextProfile[]>('/context/import-from-files')
    return response.data
  },

  exportToFile: async (id: number) => {
    const response = await api.post(`/context/${id}/export-to-file`)
    return response.data
  },

  getTypes: async () => {
    const response = await api.get<string[]>('/context/types')
    return response.data
  },
}

// Content Generation API
export const generateApi = {
  getDiscoveryQuestions: async () => {
    const response = await api.get<{
      questions: DiscoveryQuestion[]
      categories: string[]
      instructions: string
    }>('/generate/discovery-questions')
    return response.data
  },

  fromTranscript: async (data: {
    transcript: string
    source_type?: string
    preferred_post_type?: string
    target_word_count?: number
  }) => {
    const response = await api.post<ContentGenerationResponse>('/generate/from-transcript', data)
    return response.data
  },

  fromQuestions: async (data: {
    answers: Array<{
      question_id: string
      category: string
      question: string
      answer: string
    }>
    preferred_post_type?: string
    target_word_count?: number
  }) => {
    const response = await api.post<ContentGenerationResponse>('/generate/from-questions', data)
    return response.data
  },

  getPostTypes: async () => {
    const response = await api.get('/generate/post-types')
    return response.data
  },

  getContextSummary: async () => {
    const response = await api.get('/generate/context-summary')
    return response.data
  },
}

// Images API
export const imagesApi = {
  generate: async (postId: number, styles?: string[], dryRun?: boolean) => {
    const response = await api.post('/images/generate', {
      post_id: postId,
      styles,
      dry_run: dryRun,
    })
    return response.data
  },

  generatePrompts: async (postId: number) => {
    const response = await api.post(`/images/${postId}/generate-prompts`)
    return response.data
  },

  validatePrompts: async (postId: number) => {
    const response = await api.post(`/images/${postId}/validate-prompts`)
    return response.data
  },

  getPostImages: async (postId: number) => {
    const response = await api.get(`/images/${postId}/images`)
    return response.data
  },

  getStyles: async () => {
    const response = await api.get('/images/styles')
    return response.data
  },

  delete: async (imageId: number) => {
    await api.delete(`/images/${imageId}`)
  },
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
