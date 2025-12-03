<script lang="ts" setup>
const notificationsStore = useBusinessNotificationsStore()
const assistantsStore = useAssistantsStore()

onMounted(async () => {
  if (Object.keys(assistantsStore.assistantAvatars).length === 0) {
    await assistantsStore.fetchAssistantsData()
  }
  await notificationsStore.fetchNotifications()
})
</script>

<template>
  <VMenu @update:model-value="notificationsStore.handleMenuOpen">
    <template #activator="{ props }">
      <VBtn icon variant="text" color="default" class="me-2" v-bind="props">
        <VBadge
          :model-value="notificationsStore.totals.new > 0"
          color="error"
          dot
          offset-x="2"
          offset-y="3"
        >
          <VIcon size="22" icon="tabler-bell" />
        </VBadge>
      </VBtn>
    </template>

    <VCard min-width="420" max-width="450" class="elevation-8">
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Notifications</span>
        <div class="d-flex align-center gap-2">
          <VChip
            v-if="notificationsStore.totals.new > 0"
            color="primary"
            size="small"
            variant="tonal"
          >
            {{ notificationsStore.totals.new }} New
          </VChip>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VList class="py-0">
          <template v-if="notificationsStore.getLatestNotifications.length > 0">
            <VListItem
              v-for="notification in notificationsStore.getLatestNotifications"
              :key="notification.id"
              class="notification-item px-4"
              :class="{
                'notification-unread': !notification.viewedAt,
              }"
              @click="
                notificationsStore.handleNotificationClick(notification, $event)
              "
            >
              <template #prepend>
                <VAvatar
                  v-if="notification.assistant"
                  :image="
                    assistantsStore.getAssistantAvatar(
                      notification.assistant.avatarUrl
                    )
                  "
                  size="40"
                  class="me-3"
                />
                <VAvatar
                  v-else
                  :color="
                    notificationsStore.getProviderColor(notification.provider)
                  "
                  size="40"
                  variant="tonal"
                  class="me-3"
                >
                  <VIcon
                    :icon="
                      notificationsStore.getProviderIcon(notification.provider)
                    "
                    size="20"
                  />
                </VAvatar>
              </template>

              <VListItemTitle
                class="text-body-1 font-weight-medium mb-1"
                :class="{ 'text-primary': !notification.viewedAt }"
              >
                {{
                  notificationsStore.getNotificationDisplay(notification).title
                }}
              </VListItemTitle>

              <VListItemSubtitle class="text-body-2 text-medium-emphasis mb-2">
                {{
                  notificationsStore.getNotificationDisplay(notification)
                    .subtitle ||
                  `${notification.provider} reported a ${
                    notificationsStore.getNotificationDisplay(notification)
                      .title
                  } event`
                }}
              </VListItemSubtitle>

              <template #append>
                <div class="d-flex flex-row align-center gap-1">
                  <div class="d-flex align-center gap-2">
                    <span class="text-caption text-medium-emphasis">
                      {{
                        notificationsStore.formatTimestamp(
                          notification.createdAt
                        ).short
                      }}
                    </span>
                    <IconBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="
                        notificationsStore.handleDeleteNotification(
                          notification,
                          $event
                        )
                      "
                    >
                      <VIcon icon="tabler-trash" size="14" />
                    </IconBtn>
                  </div>
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
        <VBtn
          block
          color="primary"
          variant="elevated"
          @click="notificationsStore.handleViewAll"
        >
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
