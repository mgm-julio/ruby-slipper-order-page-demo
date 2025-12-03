import { BusinessNotification } from '@/modules/notifications/types/business-notifications.type'
import { CaseStyles, convertCase } from './formatters'

export interface GenericNotification {
  id: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  icon?: string
  color?: string
  avatarUrl?: string
}

export function businessNotificationToGeneric(
  notification: BusinessNotification
): GenericNotification {
  const getMessage = () => {
    const title = convertCase(notification.namespace, CaseStyles.Title)
    return `${notification.provider} reported a ${title} event`
  }

  const getIcon = () => {
    const icons: Record<string, string> = {
      vapi: 'tabler-phone',
      twilio: 'tabler-message',
      openai: 'tabler-robot',
      system: 'tabler-settings',
    }
    return icons[notification.provider.toLowerCase()] || 'tabler-bell'
  }

  const getColor = () => {
    const colors: Record<string, string> = {
      vapi: 'primary',
      twilio: 'success',
      openai: 'info',
      system: 'warning',
    }
    return colors[notification.provider.toLowerCase()] || 'secondary'
  }

  return {
    id: notification.id,
    title: convertCase(notification.namespace, CaseStyles.Title),
    message: getMessage(),
    timestamp: notification.createdAt,
    isRead: !!notification.viewedAt,
    icon: getIcon(),
    color: getColor(),
    avatarUrl: notification.assistant?.avatarUrl,
  }
}
