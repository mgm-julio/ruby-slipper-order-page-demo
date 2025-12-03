<script setup lang="ts">
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/modules/root/stores/auth'
import { UserRoles } from '@/modules/users/types/user-roles'
import { useWorkspacesStore } from '@/stores/workspaces'
import { computed, onMounted, ref, watch } from 'vue'

const workspaceStore = useWorkspacesStore()
const authStore = useAuthStore()
const { notify } = useNotify()

const isSwitching = ref(false)
const isLoadingWorkspaces = ref(false)

const isRootUser = computed(
  () => workspaceStore.userInfo?.role === UserRoles.Root
)
const isOwnerUser = computed(
  () => workspaceStore.userInfo?.role === UserRoles.Owner
)
const requiresWorkspaceSelection = computed(() => {
  return isRootUser.value && !workspaceStore.activeWorkspace
})

const currentWorkspaceName = computed(() => {
  return workspaceStore.activeWorkspace?.name || 'Select Workspace'
})

const switchWorkspace = async (workspaceId: string) => {
  if (workspaceId === workspaceStore.activeWorkspaceId) {
    return
  }

  isSwitching.value = true
  try {
    await authStore.switchToWorkspace(workspaceId)
    notify({
      message: `Switched to ${
        workspaceStore.list.find(w => w.id === workspaceId)?.name
      }`,
      color: 'success',
    })
  } catch (error) {
    notify({
      message: 'Failed to switch workspace',
      color: 'error',
    })
  } finally {
    isSwitching.value = false
  }
}

const handleMenuOpen = async (isOpen: boolean) => {
  if (isOpen && workspaceStore.list.length === 0) {
    isLoadingWorkspaces.value = true
    try {
      await workspaceStore.fetchWorkspacesData()
    } finally {
      isLoadingWorkspaces.value = false
    }
  }
}

onMounted(() => {
  if (workspaceStore.list.length === 0) {
    workspaceStore.fetchWorkspacesData()
  }
})

watch(
  () => workspaceStore.userInfo,
  val => {
    if (val && isRootUser.value && !val.activeWorkspace) {
      if (workspaceStore.list.length === 0) {
        workspaceStore.fetchWorkspacesData()
      }
    }
  },
  { immediate: true }
)

watch(
  () => workspaceStore.activeWorkspace,
  () => {
    if (
      workspaceStore.list.length === 0 &&
      (isRootUser.value || isOwnerUser.value)
    ) {
      workspaceStore.fetchWorkspacesData()
    }
  },
  { immediate: true }
)
</script>

<template>
  <!-- Workspace Switcher for ROOT and OWNER -->
  <div v-if="isRootUser || isOwnerUser">
    <VMenu @update:model-value="handleMenuOpen">
      <template #activator="{ props }">
        <VBtn
          variant="text"
          color="default"
          class="d-flex align-center gap-2"
          v-bind="props"
          :loading="isSwitching || isLoadingWorkspaces"
          :disabled="isSwitching || isLoadingWorkspaces"
        >
          <VIcon icon="tabler-building" size="20" />
          <span class="text-truncate" style="max-width: 150px">
            {{ currentWorkspaceName }}
          </span>
          <VIcon icon="tabler-chevron-down" size="16" />
        </VBtn>
      </template>

      <VCard min-width="300" max-width="400">
        <VCardTitle class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6">Select Workspace</span>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-0">
          <VList>
            <VListItem
              v-for="workspace in workspaceStore.list"
              :key="workspace.id"
              :active="workspace.id === workspaceStore.activeWorkspaceId"
              @click="switchWorkspace(workspace.id)"
              class="cursor-pointer"
            >
              <template #prepend>
                <VIcon
                  :icon="
                    workspace.id === workspaceStore.activeWorkspaceId
                      ? 'tabler-check'
                      : 'tabler-building'
                  "
                  :color="
                    workspace.id === workspaceStore.activeWorkspaceId
                      ? 'primary'
                      : 'default'
                  "
                />
              </template>

              <VListItemTitle>{{ workspace.name }}</VListItemTitle>
              <VListItemSubtitle v-if="workspace.description">
                {{ workspace.description }}
              </VListItemSubtitle>
            </VListItem>

            <VListItem v-if="workspaceStore.list.length === 0" disabled>
              <VListItemTitle>No workspaces available</VListItemTitle>
              <VListItemSubtitle>
                Contact your administrator for access
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VMenu>
  </div>
</template>
