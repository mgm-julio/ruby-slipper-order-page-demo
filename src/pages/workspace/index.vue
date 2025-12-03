<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardItem>
          <VCardTitle>Workspace Details</VCardTitle>
          <VCardSubtitle>General business information</VCardSubtitle>
        </VCardItem>

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  :model-value="workspaceName"
                  label="Workspace Name"
                  readonly
                />
              </VCol>
            </VRow>

            <BrandRegistration />

            <VDivider class="my-4" />

            <VCardActions class="pt-2">
              <VSpacer />
              <VBtn
                color="success"
                variant="elevated"
                :loading="store.loading"
                type="submit"
                >Submit</VBtn
              >
            </VCardActions>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { useWorkspacesStore } from '@/stores/workspaces'
import BrandRegistration from '@/views/workspace/BrandRegistration.vue'
import { computed, onMounted } from 'vue'

definePage({
  meta: {
    action: 'read',
    subject: 'workspace',
  },
})

const store = useWorkspacesStore()

const workspaceName = computed(() => store.workspaceName)

onMounted(async () => {
  await store.initializeWorkspace()
})

async function handleSubmit() {
  await store.saveWorkspace()
}
</script>
