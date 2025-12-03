import { $api } from '@/utils/api'
import { CaseStyles, convertCase } from '@/utils/convertCase'
import { defineStore } from 'pinia'

export interface NotificationPayload {
  date?: string
  staff?: string
  clientName?: string
  location?: string
  sessionType?: string
  firstAppointment?: boolean | string
}

export interface BusinessNotification {
  id: string
  namespace: string
  provider: string
  viewedAt: string | null
  createdAt: string
  status: string
  retryCount: number
  workspaceId?: string
  assistantId?: string
  workspace?: {
    id: string
    name: string
  }
  assistant?: {
    id: string
    name: string
    avatarUrl: string
  }
  payload?: NotificationPayload
}

interface PaginationOptions {
  page?: number
  itemsPerPage?: number
  sortBy?: Array<{ key: string; order: string }>
}

interface PaginationState {
  page: number
  limit: number
  sortBy: string
  sorting: 'asc' | 'desc'
}

interface TotalsState {
  total: number
  unread: number
}

export const useBusinessNotificationsStore = defineStore(
  'business-notifications',
  () => {
    const notifications = ref<BusinessNotification[]>([])
    const isLoading = ref(false)
    const processingNotifications = ref<Set<string>>(new Set())
    const router = useRouter()

    // Pagination state following SMS/Chats pattern
    const pagination = ref<PaginationState>({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sorting: 'desc',
    })

    const totals = ref<TotalsState>({
      total: 0,
      unread: 0,
    })

    const headers = [
      { title: 'Assistant', key: 'assistant' },
      { title: 'Title', key: 'namespace' },
      { title: 'Provider', key: 'provider' },
      { title: 'Timestamp', key: 'createdAt', sortable: true },
      { title: 'Status', key: 'viewedAt' },
      { title: 'Actions', key: 'actions', sortable: false },
    ]

    const fetchNotifications = async () => {
      isLoading.value = true
      try {
        const response = await $api.post(
          '/notifications/list',
          pagination.value
        )
        if (
          response &&
          response.success &&
          response.result &&
          response.result.list
        ) {
          notifications.value = Array.isArray(response.result.list)
            ? response.result.list
            : []

          // Update totals if provided by API
          if (response.result.totals) {
            totals.value = response.result.totals
          }

          // Update pagination if provided by API
          if (response.result.pagination) {
            pagination.value = {
              ...pagination.value,
              ...response.result.pagination,
            }
          }
        } else {
          notifications.value = []
        }
      } catch (error) {
        notifications.value = []
      } finally {
        isLoading.value = false
      }
    }

    const fetchNotificationById = async (notificationId: string) => {
      isLoading.value = true
      try {
        const response = await $api.get(`/notifications/${notificationId}`)
        if (response && response.success && response.result) {
          return response.result
        }
        return null
      } catch (error) {
        return null
      } finally {
        isLoading.value = false
      }
    }

    const markAsViewed = async (notificationId: string) => {
      if (processingNotifications.value.has(notificationId)) {
        return
      }

      try {
        processingNotifications.value.add(notificationId)
        await $api.get(`/notifications/${notificationId}`)
        const notification = notifications.value.find(
          n => n.id === notificationId
        )
        if (notification) {
          notification.viewedAt = new Date().toISOString()
        }
      } finally {
        processingNotifications.value.delete(notificationId)
      }
    }

    const deleteNotification = async (notificationId: string) => {
      try {
        await $api(`/notifications/${notificationId}`, {
          method: 'DELETE',
        })
        const index = notifications.value.findIndex(
          n => n.id === notificationId
        )
        if (index !== -1) {
          notifications.value.splice(index, 1)
        }
      } catch (error) {}
    }

    const fetchLatestNotifications = async () => {
      pagination.value.limit = 7
      await fetchNotifications()
    }

    const updateOptions = async (options: PaginationOptions) => {
      pagination.value.page = options.page || 1
      pagination.value.limit = options.itemsPerPage || 10

      if (options.sortBy && options.sortBy.length > 0) {
        const sort = options.sortBy[0]
        pagination.value.sortBy = sort.key
        pagination.value.sorting = sort.order as 'asc' | 'desc'
      }

      await fetchNotifications()
    }

    const handleMenuOpen = async () => {
      await fetchLatestNotifications()
    }

    const isProcessing = (notificationId: string) => {
      return processingNotifications.value.has(notificationId)
    }

    const getLatestNotifications = computed(() => {
      const notificationsArray = notifications.value || []
      const sortedNotifications = [...notificationsArray].sort((a, b) => {
        if (!!a.viewedAt === !!b.viewedAt) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }
        return a.viewedAt ? 1 : -1
      })
      return sortedNotifications.slice(0, 7)
    })

    const formatRelativeTime = (timestamp: string) => {
      const now = new Date()
      const date = new Date(timestamp)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return 'Just now'
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      }

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        return `${diffInHours}h ago`
      }

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays}d ago`
      }

      return date.toLocaleDateString()
    }

    const getProviderIcon = (provider: string) => {
      const icons: Record<string, string> = {
        vapi: 'tabler-phone',
        twilio: 'tabler-message',
        openai: 'tabler-robot',
        system: 'tabler-settings',
      }
      return icons[provider.toLowerCase()] || 'tabler-bell'
    }

    const getProviderColor = (provider: string) => {
      const colors: Record<string, string> = {
        vapi: 'primary',
        twilio: 'success',
        openai: 'info',
        system: 'warning',
      }
      return colors[provider.toLowerCase()] || 'secondary'
    }

    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp)
      return {
        short: date
          .toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
          .replace(',', ' at'),
        full: date.toLocaleString(),
      }
    }

    const getViewedStatus = (viewedAt: string | null) => {
      return {
        text: viewedAt ? 'Viewed' : 'Unviewed',
        color: viewedAt ? 'success' : 'warning',
      }
    }

    const getAssistantDisplay = (notification: BusinessNotification) => {
      if (notification.assistant) {
        return {
          hasAssistant: true,
          name: notification.assistant.name,
          avatarUrl: notification.assistant.avatarUrl,
        }
      }
      return {
        hasAssistant: false,
        name: 'System',
        avatarUrl: null,
      }
    }

    const getNotificationDisplay = (notification: BusinessNotification) => {
      return {
        title: convertCase(notification.namespace, CaseStyles.Title),
        subtitle: notification.payload?.clientName
          ? `Client: ${notification.payload.clientName}`
          : null,
        hasPayload: !!notification.payload,
      }
    }

    const handleNotificationClick = async (
      notification: BusinessNotification,
      event: Event
    ) => {
      event.preventDefault()
      event.stopPropagation()

      if (!notification.viewedAt) {
        await markAsViewed(notification.id)
      }

      router.push(`/notifications/${notification.id}`)
    }

    const handleDeleteNotification = async (
      notification: BusinessNotification,
      event: Event
    ) => {
      event.preventDefault()
      event.stopPropagation()

      await deleteNotification(notification.id)
    }

    const handleViewAll = () => {
      router.push('/notifications')
    }

    const handleRowClick = (
      _event: Event,
      { item }: { item: BusinessNotification }
    ) => {
      router.push(`/notifications/${item.id}`)
    }

    return {
      notifications,
      isLoading,
      getLatestNotifications,
      headers,
      pagination,
      totals,
      fetchNotifications,
      fetchLatestNotifications,
      fetchNotificationById,
      markAsViewed,
      deleteNotification,
      handleNotificationClick,
      handleDeleteNotification,
      handleViewAll,
      handleRowClick,
      handleMenuOpen,
      updateOptions,
      isProcessing,
      formatRelativeTime,
      getProviderIcon,
      getProviderColor,
      formatTimestamp,
      getViewedStatus,
      getAssistantDisplay,
      getNotificationDisplay,
    }
  }
)
