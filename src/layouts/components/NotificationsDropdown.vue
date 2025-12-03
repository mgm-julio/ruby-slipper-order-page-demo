<script lang="ts" setup>
import type { GenericNotification } from '@/utils/notification-adapter'

interface Props {
  notifications: GenericNotification[]
  unreadCount: number
  isLoading?: boolean
  viewAllRoute?: string
}

interface Emits {
  (e: 'menu-open'): void
  (
    e: 'notification-click',
    notification: GenericNotification,
    event: Event
  ): void
  (e: 'mark-all-read'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  viewAllRoute: '/notifications',
})

const emit = defineEmits<Emits>()

const router = useRouter()

const handleViewAll = () => {
  router.push(props.viewAllRoute)
}

const handleMenuOpen = (isOpen: boolean) => {
  if (isOpen) {
    emit('menu-open')
  }
}

const handleNotificationClick = (
  notification: GenericNotification,
  event: Event
) => {
  emit('notification-click', notification, event)
}

const handleMarkAllRead = () => {
  emit('mark-all-read')
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
</script>

<template>
  <VMenu @update:model-value="handleMenuOpen">
    <template #activator="{ props: menuProps }">
      <VBtn icon variant="text" color="default" class="me-2" v-bind="menuProps">
        <VIcon icon="tabler-bell" size="24" />
        <VBadge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="error"
          floating
        />
      </VBtn>
    </template>

    <VCard min-width="380" max-width="400">
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Notifications</span>
        <div class="d-flex align-center gap-2">
          <VChip
            v-if="unreadCount > 0"
            color="primary"
            size="small"
            variant="tonal"
          >
            {{ unreadCount }} New
          </VChip>
          <VBtn
            v-if="unreadCount > 0"
            icon
            size="small"
            variant="text"
            @click="handleMarkAllRead"
          >
            <VIcon icon="tabler-check" />
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VList class="py-0">
          <template v-if="notifications.length > 0">
            <VListItem
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item px-4"
              :class="{
                'notification-unread': !notification.isRead,
              }"
              @click="handleNotificationClick(notification, $event)"
            >
              <template #prepend>
                <VAvatar
                  v-if="notification.avatarUrl"
                  :image="notification.avatarUrl"
                  size="40"
                  class="me-3"
                />
                <VAvatar
                  v-else
                  :color="notification.color"
                  size="40"
                  variant="tonal"
                  class="me-3"
                >
                  <VIcon :icon="notification.icon" size="20" />
                </VAvatar>
              </template>

              <VListItemTitle
                class="text-body-1 font-weight-medium mb-1"
                :class="{ 'text-primary': !notification.isRead }"
              >
                {{ notification.title }}
              </VListItemTitle>

              <VListItemSubtitle class="text-body-2 text-medium-emphasis mb-2">
                {{ notification.message }}
              </VListItemSubtitle>

              <template #append>
                <div class="d-flex flex-column align-end gap-1">
                  <span class="text-caption text-medium-emphasis">
                    {{ formatRelativeTime(notification.timestamp) }}
                  </span>
                  <VAvatar
                    v-if="!notification.isRead"
                    size="6"
                    color="primary"
                  />
                  <VAvatar v-else size="6" color="disabled" />
                </div>
              </template>
            </VListItem>
          </template>

          <VListItem v-else>
            <VListItemTitle
              class="text-center text-body-2 text-medium-emphasis py-4"
            >
              No notifications available
            </VListItemTitle>
          </VListItem>
        </VList>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VBtn block color="primary" variant="elevated" @click="handleViewAll">
          View All Notifications
        </VBtn>
      </VCardActions>
    </VCard>
  </VMenu>
</template>

<style scoped>
.notification-item {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.notification-unread {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.notification-unread:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
