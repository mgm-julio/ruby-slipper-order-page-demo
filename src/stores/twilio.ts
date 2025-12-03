import { ApiError } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

type TwilioPhoneNumber = {
  id: string
  phoneNumber: string
  friendlyName: string
  status: string
  sid: string
  createdAt: string
  assignedWorkspace?: { name: string; id: string }
}

// TwilioPhoneNumbers State Type
interface TwilioPhoneNumbersState {
  errors: {
    twilio?: string
  }
  pagination: {
    search: string
    page: number
    limit: number
    sortBy: string
    sorting: 'asc' | 'desc'
    total: number
  }
  list: TwilioPhoneNumber[]
  detailTarget: TwilioPhoneNumber
  loading: boolean
}

const unexpectedErrorMessage = 'Ooops...! We hit a snag. Please contact support'

// Setup store
export const useTwilioPhoneNumbersStore = defineStore('twilio', () => {
  // State
  const errors = ref<TwilioPhoneNumbersState['errors']>({})
  const pagination = ref<TwilioPhoneNumbersState['pagination']>({
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sorting: 'desc',
    total: 0,
  })
  const list = ref<TwilioPhoneNumbersState['list']>([])
  const detailTarget = ref<TwilioPhoneNumbersState['detailTarget']>({
    id: '',
    phoneNumber: '',
    createdAt: '',
    friendlyName: '',
    sid: '',
    status: '',
  })
  const loading = ref(false)

  // Actions
  async function fetchTwilioPhoneNumberData() {
    const res = await handleApiRequest(() => $api.post('/twilio/list', pagination.value), 'twilio')
    if (!res?.result) return

    const data = res?.result

    pagination.value = data.pagination
    list.value = data.list
  }

  // Helpers
  async function handleApiRequest(
    apiTwilioPhoneNumber: () => Promise<any>,
    errorField: keyof TwilioPhoneNumbersState['errors']
  ) {
    try {
      resetErrors()
      loading.value = true

      const res = await apiTwilioPhoneNumber()
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

  async function updateOptions(options: any) {
    pagination.value.page = options.page || 1
    pagination.value.limit = options.itemsPerPage || 10

    if (Array.isArray(options.sortBy) && options.sortBy.length > 0) {
      const sort = options.sortBy[0]
      pagination.value.sortBy = sort.key
      pagination.value.sorting = sort.order
    }

    if (typeof options.search === 'string') {
      pagination.value.search = options.search
    }
    await fetchTwilioPhoneNumberData()
  }

  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  async function navigateTo(
    path: string,
    preserveQueryParams = false,
    awaitNextTick: boolean = false
  ) {
    const router = useRouter()
    const route = useRoute()
    const payload = {
      path,
      query: preserveQueryParams ? { ...route.query } : undefined,
    }
    if (awaitNextTick) {
      await nextTick()
    }
    router.replace(payload)
  }

  function resetErrors() {
    errors.value = {}
  }

  return {
    errors,
    pagination,
    list,
    loading,
    detailTarget,
    fetchTwilioPhoneNumberData,
    updateOptions,
  }
})
