<template>
  <VRow>
    <VCol cols="12">
      <AppTextarea
        label="Prepend-icon"
        rows="1"
        placeholder="Placeholder Text"
        prepend-icon="tabler-message-detail"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-icon="tabler-message-detail"
        placeholder="Placeholder Text"
        label="Append-icon"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        prepend-inner-icon="tabler-message-detail"
        label="Prepend-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-inner-icon="tabler-message-detail"
        label="Append-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>
  </VRow>
</template>
