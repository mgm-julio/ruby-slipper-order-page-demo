<script setup lang="ts">
import { AssistantFeatures } from '@/stores/assistant-templates'

const props = defineProps<{
  features: AssistantFeatures
  color?: string
  variant?: 'elevated' | 'flat' | 'outlined' | 'tonal'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
}>()
</script>

<template>
  <div class="d-flex align-center justify-center flex-wrap gap-4">
    <VChip
      v-for="cap in features?.capabilities"
      :key="cap"
      :variant="variant ?? 'tonal'"
      :color="color"
      :size="size ?? 'small'"
      class="text-no-wrap"
    >
      {{ convertCase(cap, CaseStyles.Sentence) }}
    </VChip>
  </div>
</template>
