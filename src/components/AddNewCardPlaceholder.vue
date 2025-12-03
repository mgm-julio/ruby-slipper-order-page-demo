<!-- components/AddNewCard.vue -->
<template>
  <VCol
    :cols="cols"
    :sm="sm"
    :lg="lg"
    class="add-new-card"
    :class="{ 'is-clickable': hoverable }"
    @click="hoverable && $emit('click')"
  >
    <VIcon :icon="icon" size="40" class="mb-3 text-primary" />
    <div class="text-h6 mb-1">{{ title }}</div>
    <div class="text-body-2 text-disabled">{{ subtitle }}</div>
  </VCol>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: 'tabler-plus' },
  title: { type: String, default: 'Add New Item' },
  subtitle: { type: String, default: 'Create a new entry' },
  cols: { type: [String, Number], default: 12 },
  sm: { type: [String, Number], default: 6 },
  lg: { type: [String, Number], default: 3 },
  hoverable: { type: Boolean, default: true },
})
defineEmits(['click'])
</script>

<style scoped lang="scss">
.add-new-card {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  border-radius: 8px;
  padding: 24px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &.is-clickable {
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.05);
      border-color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
