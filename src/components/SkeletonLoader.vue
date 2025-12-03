<template>
  <VCard>
    <VCardItem>
      <div class="d-flex align-center">
        <VSkeletonLoader type="avatar" class="me-4" />
        <div class="flex-grow-1">
          <VSkeletonLoader type="heading" class="mb-2" />
          <VSkeletonLoader type="text" width="60%" />
        </div>
      </div>
    </VCardItem>
    <VCardText>
      <VSkeletonLoader type="paragraph" class="mb-4" />
      <VSkeletonLoader type="paragraph" width="80%" />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
</script>
