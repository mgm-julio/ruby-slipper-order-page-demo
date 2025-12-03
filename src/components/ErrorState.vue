<template>
  <VCard>
    <VCardItem class="text-center">
      <VAvatar size="120" color="error" variant="tonal" class="mx-auto mb-6">
        <VIcon size="60" icon="tabler-alert-circle" />
      </VAvatar>
      <VCardTitle class="mb-2">
        {{ title || 'Something went wrong' }}
      </VCardTitle>
      <VCardSubtitle>
        {{ subtitle || 'An error occurred while loading this content' }}
      </VCardSubtitle>
    </VCardItem>
    <VCardText class="text-center">
      <VBtn
        v-if="showRetry"
        color="primary"
        variant="elevated"
        @click="$emit('retry')"
      >
        <VIcon start icon="tabler-refresh" />
        Try Again
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  showRetry?: boolean
}

defineProps<Props>()

defineEmits<{
  retry: []
}>()
</script>
