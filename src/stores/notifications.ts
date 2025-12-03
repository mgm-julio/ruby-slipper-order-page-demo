import {
  businessNotificationToGeneric,
  type GenericNotification,
} from '@/utils/notification-adapter'
import { useBusinessNotificationsStore } from './business-notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const businessNotificationsStore = useBusinessNotificationsStore()

  const notifications = computed(() => {
    return businessNotificationsStore.getLatestNotifications.map(
      businessNotificationToGeneric
    )
  })

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  const isLoading = computed(() => {
    return businessNotificationsStore.isLoading
  })

  const handleMenuOpen = async (isOpen: boolean) => {
    if (isOpen) {
      await businessNotificationsStore.handleMenuOpen()
    }
  }

  const handleNotificationClick = async (
    notification: GenericNotification,
    event: Event
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const router = useRouter()

    if (!notification.isRead) {
      await businessNotificationsStore.markAsViewed(notification.id)
    }

    setTimeout(() => {
      router.push(`/notifications/${notification.id}`)
    }, 100)
  }

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

  const fetchNotifications = async () => {
    await businessNotificationsStore.fetchNotifications()
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    handleMenuOpen,
    handleNotificationClick,
    formatRelativeTime,
    fetchNotifications,
  }
})
