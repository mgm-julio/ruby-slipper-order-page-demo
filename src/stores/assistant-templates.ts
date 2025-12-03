import { ApiError } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PhoneNumber = {
  id: string
  phoneNumber: string
}

export type AssistantPhoneNumber = {
  id: string
  number?: string
  externalId?: string
}

export type StructuredDataField = {
  required?: boolean
  description: string
  type: string
  enum?: string[]
}

type AssistantChannels = {
  call?: { phoneNumber: AssistantPhoneNumber }
  sms?: { phoneNumber: AssistantPhoneNumber }
  webchat?: { domains: string[] }
}

enum AssistantIntegrations {
  Mindbody = 'mindbody',
  AcuityScheduling = 'acuity-scheduling',
  Booksy = 'booksy',
  Calendly = 'calendly',
  Default = 'default',
  Dialpad = 'dialpad',
  Justcall = 'justcall',
  Meevo = 'meevo',
  SquareAppointments = 'square-appointments',
}

export enum AssistantIndustries {
  Beauty = 'beauty',
  Wellness = 'wellness',
  Fitness = 'fitness',
  MedicalAesthetics = 'medical-aesthetics',
}

export type AssistantFeatures = {
  capabilities: string[]
  industries: AssistantIndustries[]
  integrations: AssistantIntegrations[]
}

export interface AssistantTemplate {
  id: string
  name: string
  avatarUrl: string
  description: string
  isActive: boolean
  isExternal: boolean
  createdAt: string
  userConfiguration: {
    voice?: string
    firstMessage?: string
    voicemailMessage?: string
    endOfCallMessage?: string
    prompt: string
    summaryPrompt: string
    successEvaluationPrompt: string
    structuredDataPrompt: string
    structuredDataSchema: Record<string, StructuredDataField>
    summarySchema?: string
    channels?: AssistantChannels
  }
  systemConfiguration: Record<string, unknown>
  features: AssistantFeatures
  provider: string
  totals: {
    integrations: number
    calls: number
    completed: number
  }
}

export const defaultAssistantTemplate: AssistantTemplate = {
  id: '',
  name: '',
  avatarUrl: '',
  description: '',
  isActive: true,
  isExternal: false,
  createdAt: '',
  userConfiguration: {
    prompt: '',
    summaryPrompt: '',
    successEvaluationPrompt: '',
    structuredDataPrompt: '',
    structuredDataSchema: {},
    firstMessage: '',
    voice: 'female',
    voicemailMessage: '',
    endOfCallMessage: '',
    channels: {},
  },
  systemConfiguration: {},
  features: {
    capabilities: [],
    industries: [],
    integrations: [],
  },
  provider: '',
  totals: {
    integrations: 0,
    calls: 0,
    completed: 0,
  },
}

interface AssistantTemplatesState {
  errors: {
    templates?: string
  }
  list: AssistantTemplate[]
  assistantAvatars: Record<string, string>
  loading: boolean
  selected: AssistantTemplate | null
}

const unexpectedErrorMessage = 'Ooops...! We hit a snag. Please contact support'

export const useAssistantTemplatesStore = defineStore(
  'assistant-templates',
  () => {
    // State
    const errors = ref<AssistantTemplatesState['errors']>({})
    const list = ref<AssistantTemplatesState['list']>([])
    const assistantAvatars = ref<AssistantTemplatesState['assistantAvatars']>(
      {}
    )
    const loading = ref(false)
    const selected = ref<AssistantTemplatesState['selected']>(
      defaultAssistantTemplate
    )

    // Actions
    async function fetchTemplatesData() {
      const res = await handleApiRequest(
        () => $api.get('/assistant-templates'),
        'templates'
      )
      if (!res.success) {
        return
      }
      list.value = res.result

      const avatarModules = import.meta.glob(
        '@images/avatars/assistants/*.png',
        {
          eager: true,
          import: 'default',
        }
      )

      Object.entries(avatarModules).forEach(([path, url]) => {
        const filename = path.split('/').pop()!
        assistantAvatars.value[filename] = url as string
      })
    }

    async function fetchTemplateById(templateId: string) {
      const res = await handleApiRequest(
        () => $api.get(`/assistant-templates/${templateId}`),
        'templates'
      )
      if (!res) return
      selected.value = res.result || res
    }

    async function upsertTemplate(dto: AssistantTemplate) {
      let response = null
      if (!dto.id) {
        response = await handleApiRequest(
          () => $api.post('/assistant-templates', dto),
          'templates'
        )
      } else {
        response = await handleApiRequest(
          () => $api.patch(`/assistant-templates/${dto.id}`, dto),
          'templates'
        )
      }

      if (!response?.success && !response?.id) return

      const result = response.result || response
      const index = list.value.findIndex(i => i.id === result.id)

      if (index !== -1) {
        list.value = [
          ...list.value.slice(0, index),
          result,
          ...list.value.slice(index + 1),
        ]
      } else {
        list.value = [...list.value, result]
      }
    }

    async function deleteTemplate(id: string) {
      const response = await handleApiRequest(
        () => $api.delete(`/assistant-templates/${id}`),
        'templates'
      )

      if (!response) return

      const index = list.value.findIndex(i => i.id === id)
      if (index !== -1) list.value.splice(index, 1)
    }

    // Helpers
    async function handleApiRequest(
      apiCall: () => Promise<any>,
      errorField: keyof AssistantTemplatesState['errors']
    ) {
      try {
        resetErrors()
        loading.value = true

        const res = await apiCall()

        loading.value = false

        return res
      } catch (err) {
        loading.value = false
        if (err instanceof ApiError) errors.value[errorField] = err.message
        else errors.value[errorField] = unexpectedErrorMessage
      }
    }

    function resetErrors() {
      errors.value = {}
    }

    return {
      errors,
      list,
      selected,
      loading,
      assistantAvatars,
      fetchTemplatesData,
      fetchTemplateById,
      upsertTemplate,
      deleteTemplate,
    }
  }
)
