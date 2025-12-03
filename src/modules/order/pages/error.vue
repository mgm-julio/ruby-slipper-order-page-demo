<script setup lang="ts">
import restaurantBg from '@images/pages/restaurant-bg.jpg'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()

const orderId = computed(() => (route.query.orderId as string) || '')
const status = computed(() => (route.query.status as string) || '')
const paymentAmount = computed(() => {
  const amount = route.query.paymentAmount as string
  return amount ? parseFloat(amount).toFixed(2) : '0.00'
})
const notes = computed(() => {
  const notesParam = route.query.notes as string
  if (notesParam) {
    try {
      return decodeURIComponent(notesParam)
    } catch {
      return notesParam
    }
  }
  return ''
})
</script>

<template>
  <div
    class="d-flex align-center justify-center min-vh-100 pa-4 position-relative"
    style="min-height: 100vh;"
  >
    <VImg
      :src="restaurantBg"
      cover
      class="position-absolute"
      :style="{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', minHeight: '100vh', zIndex: 0, opacity: 0.25 }"
    />

    <div
      class="position-absolute"
      :style="{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        zIndex: 1,
        background:
          'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
      }"
    />

    <VCard
      class="pa-4 pa-md-6 position-relative"
      max-width="450"
      elevation="8"
      :style="{ zIndex: 2 }"
    >
      <VCardText class="text-center">
        <div class="mb-4">
          <VIcon
            icon="tabler-circle-x"
            :size="$vuetify.display.smAndDown ? 80 : 100"
            color="error"
            class="mb-3"
          />
          <h2 class="text-h4 text-md-h3 mb-2 font-weight-bold">
            Payment Denied
          </h2>
          <p class="text-body-1 text-md-h6 text-medium-emphasis">
            Your payment could not be processed
          </p>
        </div>

        <VDivider class="my-4" />

        <VCard class="text-start mb-3" elevation="2">
          <VCardText class="pa-3">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-1 text-md-h6 font-weight-medium"
                >Order ID:</span
              >
              <span class="text-body-1 text-md-h6 font-weight-bold">{{
                orderId || 'N/A'
              }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex align-center justify-space-between mb-3 mt-3">
              <span class="text-body-1 text-md-h6 font-weight-medium">Status:</span>
              <VChip color="error" size="small">{{ status || 'error' }}</VChip>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex align-center justify-space-between mt-3">
              <span class="text-body-1 text-md-h6 font-weight-medium">Amount:</span>
              <span class="text-h6 text-md-h5 font-weight-bold text-warning"
                >${{ paymentAmount }}</span
              >
            </div>
          </VCardText>
        </VCard>

        <VCard v-if="notes" class="mt-3" elevation="2">
          <VCardText class="pa-3">
            <div class="d-flex align-center gap-2 mb-2">
              <VIcon icon="tabler-note" :size="$vuetify.display.smAndDown ? 20 : 24" color="warning" />
              <span class="text-body-1 text-md-h6 font-weight-bold"
                >Order Notes:</span
              >
            </div>
            <p class="text-body-2 text-md-body-1 text-start">{{ notes }}</p>
          </VCardText>
        </VCard>

        <VDivider class="my-4" />

        <div class="mb-0">
          <p class="text-body-2 text-md-body-1 text-medium-emphasis mb-3">
            Please verify your card details and try again.
          </p>
          <VBtn
            color="warning"
            variant="elevated"
            block
            :size="$vuetify.display.smAndDown ? 'default' : 'large'"
            class="font-weight-bold"
            style="color: rgba(0, 0, 0, 0.87) !important; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;"
            @click="$router.push(`/order/?orderId=${orderId}`)"
            @mouseenter="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }"
            @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }"
          >
            Try Again
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

