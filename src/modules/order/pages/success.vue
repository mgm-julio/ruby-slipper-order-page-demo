<script setup lang="ts">
import { useOrderStore } from '@/modules/order/stores/order'
import restaurantBg from '@images/pages/restaurant-bg.jpg'
import { storeToRefs } from 'pinia'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const orderStore = useOrderStore()
const { items } = storeToRefs(orderStore)

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
            icon="tabler-circle-check"
            :size="$vuetify.display.smAndDown ? 80 : 100"
            color="success"
            class="mb-3"
          />
          <h2 class="text-h3 text-md-h2 mb-2 font-weight-bold">
            Payment Accepted
          </h2>
          <p class="text-h6 text-md-h5 text-medium-emphasis">
            Your payment has been successfully processed
          </p>
        </div>

        <VDivider class="my-4" />

        <VCard class="text-start mb-3" elevation="2">
          <VCardText class="pa-3">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-h6 text-md-h5 font-weight-medium"
                >Order ID:</span
              >
              <span class="text-h6 text-md-h5 font-weight-bold">{{
                orderId || 'N/A'
              }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex align-center justify-space-between mb-3 mt-3">
              <span class="text-h6 text-md-h5 font-weight-medium">Status:</span>
              <VChip color="success" size="default">{{
                status || 'success'
              }}</VChip>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex align-center justify-space-between mt-3">
              <span class="text-h6 text-md-h5 font-weight-medium">Amount:</span>
              <span class="text-h5 text-md-h4 font-weight-bold text-warning"
                >${{ paymentAmount }}</span
              >
            </div>
          </VCardText>
        </VCard>

        <div v-if="items.length > 0" class="mt-3">
          <VDivider class="mb-3" />
          <div class="d-flex align-center gap-2 mb-3">
            <VIcon
              icon="tabler-chef-hat"
              :size="$vuetify.display.smAndDown ? 24 : 28"
              color="warning"
            />
            <span class="text-h6 text-md-h5 font-weight-bold"
              >Order Items:</span
            >
          </div>
          <div
            class="text-start"
            style="max-height: 200px; overflow-y: auto; overflow-x: hidden"
          >
            <VCard
              v-for="(item, index) in items"
              :key="index"
              class="mb-2"
              elevation="2"
            >
              <VCardText class="pa-2 pa-md-3">
                <div class="d-flex align-start justify-space-between">
                  <div class="flex-grow-1 pe-3">
                    <div
                      class="d-flex align-center gap-2 text-body-1 text-md-h6 font-weight-bold mb-1"
                    >
                      <VIcon
                        icon="tabler-tools-kitchen-2"
                        :size="$vuetify.display.smAndDown ? 18 : 20"
                        color="warning"
                      />
                      <span class="text-wrap">{{ item.name }}</span>
                    </div>
                    <div class="text-body-1 text-md-h6 text-medium-emphasis">
                      {{ item.quantity }} × ${{
                        (item.itemTotal / item.quantity).toFixed(2)
                      }}
                      <span
                        v-if="item.modifiers.length > 0"
                        class="d-block mt-1"
                      >
                        ({{ item.modifiers.map(m => m.name).join(', ') }})
                      </span>
                    </div>
                  </div>
                  <div
                    class="text-h6 text-md-h5 font-weight-bold flex-shrink-0 text-warning"
                  >
                    ${{ item.itemTotal.toFixed(2) }}
                  </div>
                </div>
              </VCardText>
            </VCard>
          </div>
        </div>

        <VCard v-if="notes" class="mt-3" elevation="2">
          <VCardText class="pa-3">
            <div class="d-flex align-center gap-2 mb-2">
              <VIcon
                icon="tabler-note"
                :size="$vuetify.display.smAndDown ? 20 : 24"
                color="warning"
              />
              <span class="text-h6 text-md-h5 font-weight-bold"
                >Order Notes:</span
              >
            </div>
            <p class="text-body-1 text-md-h6 text-start">{{ notes }}</p>
          </VCardText>
        </VCard>

        <VDivider class="my-4" />

        <p class="text-body-1 text-md-h6 text-medium-emphasis">
          You will receive an SMS confirmation with your order details.
        </p>
      </VCardText>
    </VCard>
  </div>
</template>
