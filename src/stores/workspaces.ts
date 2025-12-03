import { useCookie } from '@/@core/composable/useCookie'
import { $api, ApiError } from '@/utils/api'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export interface WorkspaceProfile {
  friendlyName?: string
  companyName?: string
  businessName?: string
  mainEmail?: string
  phone?: string
  address?: string
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  website?: string
  vertical?: string
  ein?: string
}

export interface WorkspaceMetadata {
  profile?: WorkspaceProfile
  [key: string]: unknown
}

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId?: string
  metadata?: WorkspaceMetadata
}

export interface WorkspaceOption {
  title: string
  value: string
  description?: string
}

const unexpectedErrorMessage = 'Ooops...! We hit a snag. Please contact support'

export const useWorkspacesStore = defineStore('workspaces', () => {
  const errors = reactive<{
    workspaces?: string
    workspace?: string
  }>({})
  const list = ref<Workspace[]>([])
  const loading = ref(false)
  const selected = ref<Workspace | null>(null)
  const workspaceName = ref('')
  const selectedWorkspaceId = ref<string>('')
  const brandForm = reactive({
    friendlyName: '',
    companyName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    email: '',
    phone: '',
    website: '',
    vertical: 'PROFESSIONAL_SERVICES',
    ein: '',
  })

  const userInfo = computed(() => useCookie<any>('userInfo').value)

  const activeWorkspace = computed(() => userInfo.value?.activeWorkspace)

  const activeWorkspaceId = computed(() => userInfo.value?.activeWorkspace?.id)

  const workspaceOptions = computed<WorkspaceOption[]>(() => {
    return list.value.map(ws => ({
      title: ws.name,
      value: ws.id,
      description: ws.description,
    }))
  })

  // Actions
  async function fetchWorkspacesData() {
    const res = await handleApiRequest(
      () => $api.get('/workspace'),
      'workspaces'
    )
    if (res) {
      list.value = res.result
    }
  }

  async function fetchWorkspaceById(workspaceId: string) {
    try {
      const res = await handleApiRequest(
        () => $api.get(`/workspace/${workspaceId}`),
        'workspace'
      )
      if (res?.result) {
        selected.value = res.result
        hydrateFormsFromSelected()
        return res.result
      }
      return null
    } catch (error) {
      errors.workspace =
        error instanceof ApiError ? error.message : unexpectedErrorMessage
      return null
    }
  }

  async function updateWorkspace(payload: Partial<Workspace>) {
    if (!activeWorkspaceId.value) {
      errors.workspace = 'No active workspace found'
      return
    }

    const res = await handleApiRequest(
      () => $api.patch(`/workspace/${activeWorkspaceId.value}`, payload),
      'workspace'
    )
    if (res) {
      selected.value = res.result
      return res.result
    }
  }

  function hydrateFormsFromSelected() {
    if (!selected.value) {
      return
    }
    const meta = selected.value.metadata?.profile || {}
    workspaceName.value = selected.value.name
    Object.assign(brandForm, {
      friendlyName: String(meta.friendlyName || meta.businessName || ''),
      companyName: String(meta.companyName || meta.businessName || ''),
      street: String(meta.street || ''),
      city: String(meta.city || ''),
      state: String(meta.state || ''),
      postalCode: String(meta.postalCode || ''),
      country: String(meta.country || 'US'),
      email: String(meta.mainEmail || ''),
      phone: String(meta.phone || ''),
      website: String(meta.website || ''),
      vertical: String(meta.vertical || 'PROFESSIONAL_SERVICES'),
      ein: String(meta.ein || ''),
    })
  }

  async function initializeWorkspace() {
    if (activeWorkspaceId.value) {
      await fetchWorkspaceById(activeWorkspaceId.value)
    }
  }

  async function saveWorkspace() {
    const payload: Partial<Workspace> = {
      name: workspaceName.value || selected.value?.name,
      metadata: {
        profile: {
          businessName: brandForm.companyName || brandForm.friendlyName,
          mainEmail: brandForm.email,
          phone: brandForm.phone,
          address: formatAddress(brandForm),
          street: brandForm.street,
          city: brandForm.city,
          state: brandForm.state,
          postalCode: brandForm.postalCode,
          website: brandForm.website,
          vertical: brandForm.vertical,
          ein: brandForm.ein,
          friendlyName: brandForm.friendlyName,
          companyName: brandForm.companyName,
          country: brandForm.country,
        },
      } as WorkspaceMetadata,
    }
    await updateWorkspace(payload)
  }

  function formatAddress(formData: typeof brandForm): string {
    const parts = [formData.street]

    if (formData.city) {
      parts.push(formData.city)
    }

    if (formData.state) {
      parts.push(formData.state)
    }

    if (formData.postalCode) {
      parts.push(formData.postalCode)
    }

    return parts.join(', ').trim()
  }

  async function handleApiRequest(
    apiCall: () => Promise<any>,
    errorField: keyof typeof errors
  ) {
    try {
      resetErrors()
      loading.value = true

      const res = await apiCall()

      loading.value = false

      return res
    } catch (err) {
      loading.value = false
      if (err instanceof ApiError) errors[errorField] = err.message
      else errors[errorField] = unexpectedErrorMessage
    }
  }

  function resetErrors() {
    Object.keys(errors).forEach(
      key => delete errors[key as keyof typeof errors]
    )
  }

  function setSelectedWorkspaceId(id: string) {
    selectedWorkspaceId.value = id
  }

  function resetSelectedWorkspaceId() {
    selectedWorkspaceId.value = ''
  }

  return {
    errors,
    list,
    loading,
    selected,
    workspaceName,
    brandForm,
    selectedWorkspaceId,
    userInfo,
    activeWorkspace,
    activeWorkspaceId,
    workspaceOptions,
    fetchWorkspacesData,
    fetchWorkspaceById,
    updateWorkspace,
    initializeWorkspace,
    saveWorkspace,
    setSelectedWorkspaceId,
    resetSelectedWorkspaceId,
  }
})
