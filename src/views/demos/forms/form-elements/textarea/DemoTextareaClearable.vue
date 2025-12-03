<script setup lang="ts">
const textareaValue = ref('This is clearable text.')
</script>

<template>
  <AppTextarea
    v-model="textareaValue"
    clearable
    clear-icon="tabler-x-circle"
    label="Text"
    placeholder="Placeholder Text"
  />
</template>
