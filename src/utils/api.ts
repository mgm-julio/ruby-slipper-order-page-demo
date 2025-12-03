import { useCookie } from '@/@core/composable/useCookie'
import { useAbility } from '@casl/vue'
import { ofetch, type $Fetch } from 'ofetch'

export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Helper function to handle logout
function handleUnauthorized() {
  if (typeof window === 'undefined') return

  const publicPaths = [
    '/login',
    '/login-password',
    '/verify',
    '/register',
    '/forgot-password',
  ]

  const isPublicPath = publicPaths.some(path =>
    window.location.pathname.startsWith(path)
  )

  if (isPublicPath) return false

  // Clear all auth data
  useCookie('userInfo').value = null
  useCookie('accessToken').value = null
  useCookie('userPermissions').value = null
  useCookie('_session').value = null

  // Clear abilities
  try {
    const ability = useAbility()
    if (ability && typeof ability.update === 'function') {
      ability.update([])
    }
  } catch (e) {
    // Ability might not be available in all contexts
    console.warn('Could not clear abilities:', e)
  }

  // Force navigation to login
  window.location.href = '/login'

  return true
}

const baseApi = ofetch.create({
  // Let the base URL default to local
  baseURL: import.meta.env.VITE_API_BASE_URL,

  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = new Headers(options.headers)
      options.headers.append('Authorization', `Bearer ${accessToken}`)
    } else {
      options.credentials = 'include'
    }
  },

  async onResponseError({ response }) {
    // Handle 401 - Unauthorized
    if (response.status === 401) {
      const didLogout = handleUnauthorized()

      if (didLogout) {
        // Don't throw error after logout redirect
        // The page is navigating away anyway
        return
      }
    }

    // For all other errors, use ApiError
    const errorMessage =
      response._data?.message ||
      response.statusText ||
      'An unexpected error occurred'

    throw new ApiError(errorMessage, response.status, response._data)
  },
})

export const $api = Object.assign(baseApi, {
  get: (endpoint: string) => baseApi(endpoint, { method: 'GET' }),
  post: (endpoint: string, body?: object) =>
    baseApi(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body?: object) =>
    baseApi(endpoint, { method: 'PUT', body }),
  patch: (endpoint: string, body?: object) =>
    baseApi(endpoint, { method: 'PATCH', body }),
  delete: (endpoint: string, body?: object) =>
    baseApi(endpoint, { method: 'DELETE' }),
})

export type ApiRequest = $Fetch & {
  get: (endpoint: string) => Promise<any>
  post: (endpoint: string, body?: object) => Promise<any>
  put: (endpoint: string, body?: object) => Promise<any>
  patch: (endpoint: string, body?: object) => Promise<any>
  delete: (endpoint: string) => Promise<any>
}

export const typedApi = $api as ApiRequest
