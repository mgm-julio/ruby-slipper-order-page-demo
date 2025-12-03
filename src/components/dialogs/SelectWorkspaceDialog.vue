<script setup lang="ts">
import type { Workspace } from '@/stores/workspaces'
import { useWorkspacesStore } from '@/stores/workspaces'
import { computed, watch } from 'vue'

interface Props {
  workspace?: Workspace
  isDialogVisible: boolean
  persistent?: boolean
}

interface Emit {
  (e: 'submit', value: Workspace): void
  (e: 'update:isDialogVisible', val: boolean): void
}

const { workspace, isDialogVisible, persistent = false } = defineProps<Props>()
const emit = defineEmits<Emit>()

const store = useWorkspacesStore()

watch(
  () => workspace,
  newVal => {
    if (newVal?.id) {
      store.setSelectedWorkspaceId(newVal.id)
    } else {
      store.resetSelectedWorkspaceId()
    }
  },
  { immediate: true }
)

const isSameWorkspace = computed(() => {
  return store.selectedWorkspaceId === store.activeWorkspaceId
})

const onFormSubmit = () => {
  const selectedWorkspace = store.list.find(
    ws => ws.id === store.selectedWorkspaceId
  )
  if (selectedWorkspace) {
    emit('submit', selectedWorkspace)
  }
}

const onFormCancel = () => {
  store.resetSelectedWorkspaceId()
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :model-value="isDialogVisible"
    max-width="600"
    :persistent="persistent"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn v-if="!persistent" @click="dialogModelValueUpdate(false)" />

    <VCard title="Select Workspace">
      <VCardText>
        <p v-if="store.activeWorkspace" class="text-body-1 mb-6">
          Current workspace:
          <span class="text-primary">{{
            store.activeWorkspace?.name ?? '(no name)'
          }}</span>
        </p>
        <p v-else class="text-body-1 mb-6">
          You must select a workspace to continue
        </p>

        <VForm @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12">
              <AppSelect
                v-if="store.workspaceOptions.length > 0"
                v-model="store.selectedWorkspaceId"
                label="Workspaces"
                placeholder="Choose a workspace"
                :items="store.workspaceOptions"
                item-title="title"
                item-value="value"
                :hide-selected="true"
              >
                <template #selection="{ item }">
                  <span>{{ item.title }}</span>
                </template>

                <template #item="{ item, props }">
                  <VListItem v-bind="props" class="py-4">
                    <VListItemSubtitle>{{
                      item.raw.description
                    }}</VListItemSubtitle>
                  </VListItem>
                </template>
              </AppSelect>

              <VAlert v-else type="info" variant="tonal" class="mb-4">
                <VAlertTitle>No workspaces available</VAlertTitle>
                <VAlertText>
                  You don't have access to any other workspaces. Contact your
                  administrator if you need access to additional workspaces.
                </VAlertText>
              </VAlert>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          v-if="!persistent"
          variant="tonal"
          color="secondary"
          @click="onFormCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          v-if="store.workspaceOptions.length > 0"
          :disabled="isSameWorkspace"
          @click="onFormSubmit"
        >
          {{ persistent ? 'Continue' : 'Go to Workspace' }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.text-editor :deep(.v-field__input) {
  color: var(--v-text-color);
}
</style>
