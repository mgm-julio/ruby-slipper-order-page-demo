<script setup lang="ts">
import restaurantBg from '@images/pages/restaurant-bg.jpg'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

const orderId = computed(() => (route.query.orderId as string) || '')
</script>

<template>
  <div
    class="d-flex align-center justify-center min-vh-100 pa-4 position-relative"
    style="min-height: 100vh"
  >
    <VImg
      :src="restaurantBg"
      cover
      class="position-absolute"
      :style="{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        zIndex: 0,
        opacity: 0.25,
      }"
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
            icon="tabler-alert-circle"
            :size="$vuetify.display.smAndDown ? 80 : 100"
            color="warning"
            class="mb-3"
          />
          <h2 class="text-h3 text-md-h2 mb-2 font-weight-bold">
            Invalid Order
          </h2>
          <p class="text-h6 text-md-h5 text-medium-emphasis">
            The order you are looking for does not exist or is invalid
          </p>
        </div>

        <VDivider class="my-4" />

        <VCard class="text-start mb-3" elevation="2">
          <VCardText class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <span class="text-h6 text-md-h5 font-weight-medium"
                >Order ID:</span
              >
              <span class="text-h6 text-md-h5 font-weight-bold">{{
                orderId || 'N/A'
              }}</span>
            </div>
          </VCardText>
        </VCard>

        <VDivider class="my-4" />

        <div class="mb-0">
          <p class="text-body-1 text-md-h6 text-medium-emphasis mb-3">
            Please check the order ID and try again, or contact support if you
            believe this is an error.
          </p>
          <VBtn
            color="warning"
            variant="elevated"
            block
            :size="$vuetify.display.smAndDown ? 'default' : 'large'"
            class="font-weight-bold"
            style="
              color: rgba(0, 0, 0, 0.87) !important;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="
              router.push(
                orderId
                  ? `/order/?orderId=${orderId}`
                  : '/order/'
              )
            "
            @mouseover="
              (event) => {
                event.currentTarget.style.transform = 'scale(1.02)';
                event.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.15)';
              }
            "
            @mouseleave="
              (event) => {
                event.currentTarget.style.transform = 'scale(1)';
                event.currentTarget.style.boxShadow = 'none';
              }
            "
          >
            Try Again
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

