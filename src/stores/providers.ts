import { ApiError } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ProviderConfigValueType = 'string' | 'number' | 'boolean' | 'json'

export type ProviderConfigValue = {
  description: string
  type: ProviderConfigValueType
  required: boolean
  secret: boolean
}

export type Provider = {
  id: string
  name: string
  description: string
  avatarUrl: string
  category: string[]
  defaultSettings: Record<string, ProviderConfigValue>
  isActive: boolean
}

// Providers State Type
interface ProvidersState {
  errors: {
    providers?: string
  }
  list: Provider[]
  providers: Provider[]
  providerAvatars: Record<string, string>
  providerIconAvatars: Record<string, string>
  loading: boolean
  selected: Provider | null
}

export const defaultProvider = {
  id: '',
  name: '',
  description: '',
  avatarUrl: 'default.png',
  category: [],
  defaultSettings: {},
  isActive: true,
}

const unexpectedErrorMessage = 'Ooops...! We hit a snag. Please contact support'

// Setup store
export const useProvidersStore = defineStore('providers', () => {
  // State
  const errors = ref<ProvidersState['errors']>({})
  const list = ref<ProvidersState['list']>([])
  const providers = ref<ProvidersState['providers']>([])
  const providerAvatars = ref<ProvidersState['providerAvatars']>({})
  const providerIconAvatars = ref<ProvidersState['providerIconAvatars']>({})
  const loading = ref(false)
  const selected = ref<ProvidersState['selected']>(defaultProvider)

  // Actions
  async function fetchProvidersData() {
    const providersList = await handleApiRequest(
      () => $api.get('/providers'),
      'providers'
    )

    if (!providersList.success) {
      return null
    }
    list.value = providersList.result

    providers.value = providersList.result

    const avatarModules = import.meta.glob('@images/providers/*.png', {
      eager: true,
      import: 'default',
    })

    Object.entries(avatarModules).forEach(([path, url]) => {
      const filename = path.split('/').pop()!
      providerAvatars.value[filename] = url as string
    })

    // Collect icons
    const iconModules = import.meta.glob('@images/providers/icons/*.png', {
      eager: true,
      import: 'default',
    })

    Object.entries(iconModules).forEach(([path, url]) => {
      const filename = path.split('/').pop()!
      providerIconAvatars.value[filename] = url as string
    })
  }

  async function fetchProviderById(providerId: string) {
    const res = await handleApiRequest(
      () => $api.get(`/providers/${providerId}`),
      'providers'
    )
    if (!res) return
    selected.value = res.result
  }

  async function upsertProvider(dto: Provider) {
    let response = null
    if (!dto.id) {
      const { name, description, category, avatarUrl, defaultSettings } = dto
      response = await handleApiRequest(
        () =>
          $api.post('/providers', {
            name,
            description,
            category,
            avatarUrl,
            defaultSettings,
          }),
        'providers'
      )
    } else {
      response = await handleApiRequest(
        () => $api.patch(`/providers/${dto.id}`, dto),
        'providers'
      )
    }

    if (!response.success) {
      return
    }

    const index = list.value.findIndex(i => i.id === response.result.id)

    if (index !== -1) {
      list.value = [
        ...list.value.slice(0, index),
        response.result,
        ...list.value.slice(index + 1),
      ]
    } else {
      list.value = [...list.value, response.result]
    }
  }

  async function deleteProvider(id: string) {
    let response = null
    response = await handleApiRequest(
      () => $api.delete(`/providers/${id}`),
      'providers'
    )

    if (!response.success) {
      return
    }

    const index = list.value.findIndex(i => i.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
    }
  }

  // Helpers
  async function handleApiRequest(
    apiCall: () => Promise<any>,
    errorField: keyof ProvidersState['errors']
  ) {
    try {
      resetErrors()
      loading.value = true

      const res = await apiCall()
      loading.value = false

      return res
    } catch (err) {
      loading.value = false
      if (err instanceof ApiError) {
        errors.value[errorField] = err.message
      } else {
        errors.value[errorField] = unexpectedErrorMessage
      }
    }
  }

  function resetErrors() {
    errors.value = {}
  }

  return {
    errors,
    list,
    providers,
    providerAvatars,
    providerIconAvatars,
    loading,
    selected,
    fetchProvidersData,
    upsertProvider,
    deleteProvider,
    fetchProviderById,
  }
})
