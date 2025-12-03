<script setup lang="ts">
import { useWorkspacesStore } from '@/stores/workspaces'
import { computed } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const authStore = useAuthStore()
const workspaceStore = useWorkspacesStore()

const logout = async () => {
  await authStore.signout()
}

const userProfileList = computed(() => [
  {
    type: 'navItem',
    icon: 'tabler-user',
    title: 'Profile',
    to: { name: 'profile' },
  },
  {
    type: 'navItem',
    icon: 'tabler-briefcase',
    title: 'Workspace',
    to: workspaceStore.activeWorkspaceId
      ? { name: 'workspace', params: { id: workspaceStore.activeWorkspaceId } }
      : { name: 'workspace' },
  },
])
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="1"
    offset-y="2"
    color="success"
  >
    <VAvatar
      size="38"
      class="cursor-pointer"
      :color="!workspaceStore.userInfo?.avatarUrl ? 'primary' : undefined"
      :variant="!workspaceStore.userInfo?.avatarUrl ? 'tonal' : undefined"
    >
      <VImg
        v-if="workspaceStore.userInfo?.avatarUrl"
        :src="workspaceStore.userInfo?.avatarUrl"
      />
      <span v-else class="text-body-2 font-weight-medium">
        {{
          (
            workspaceStore.userInfo?.fullName ||
            workspaceStore.userInfo?.username ||
            'User'
          )
            ?.charAt(0)
            ?.toUpperCase() || 'U'
        }}
      </span>

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="240" location="bottom end" offset="20px">
        <VList>
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="
                      !workspaceStore.userInfo?.avatarUrl
                        ? 'primary'
                        : undefined
                    "
                    :variant="
                      !workspaceStore.userInfo?.avatarUrl ? 'tonal' : undefined
                    "
                  >
                    <VImg
                      v-if="workspaceStore.userInfo?.avatarUrl"
                      :src="workspaceStore.userInfo?.avatarUrl"
                    />
                    <span v-else class="text-subtitle-1 font-weight-medium">
                      {{
                        (
                          workspaceStore.userInfo?.fullName ||
                          workspaceStore.userInfo?.username ||
                          'User'
                        )
                          ?.charAt(0)
                          ?.toUpperCase() || 'U'
                      }}
                    </span>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
              <div>
                <VListItemTitle class="font-weight-medium">
                  {{
                    workspaceStore.userInfo?.fullName ||
                    workspaceStore.userInfo?.username ||
                    'User'
                  }}
                </VListItemTitle>
                <VListItemSubtitle class="text-disabled text-capitalize">
                  {{ workspaceStore.userInfo?.role || 'Admin' }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template v-for="item in userProfileList" :key="item.title">
              <VListItem v-if="item.type === 'navItem'" :to="item.to">
                <template #prepend>
                  <VIcon :icon="item.icon" size="22" />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>

              <VDivider v-else class="my-1" />
            </template>
            <VDivider class="my-1" />
            <VListItem prepend-icon="tabler-power" @click="logout">
              Logout
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
