<script setup lang="ts">
import { useOrderStore } from '@/modules/order/stores/order'
import ConfirmationContent from '@/views/wizard-examples/checkout/Confirmation.vue'
import PaymentContent from '@/views/wizard-examples/checkout/Payment.vue'
import { useConfigStore } from '@core/stores/config'
import restaurantBg from '@images/pages/restaurant-bg.jpg'
import { storeToRefs } from 'pinia'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

const configStore = useConfigStore()
configStore.skin = 'default'

const orderStore = useOrderStore()
const {
  currentStep,
  checkoutSteps,
  checkoutData,
  orderId,
  phoneNumber,
  paymentAmount,
  items,
  hasValidOrderId,
} = storeToRefs(orderStore)

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + item.itemTotal, 0)
})

onMounted(async () => {
  const queryParams = await orderStore.parseQueryParams(route.query)
  orderStore.initializeFromQueryParams(queryParams)
})

watch(
  () => currentStep.value,
  newStep => {
    if (newStep === 1) {
      if (!hasValidOrderId.value) {
        router.push('/')
        return
      }

      setTimeout(() => {
        orderStore.redirectToCallback(true)
      }, 3000)
    }
  }
)
</script>

<template>
  <div
    class="d-flex position-relative min-vh-100"
    :class="$vuetify.display.smAndDown ? 'overflow-hidden' : ''"
    :style="
      $vuetify.display.mdAndUp
        ? { minHeight: '100vh', overflow: 'hidden' }
        : { minHeight: '100vh' }
    "
  >
    <VImg
      :src="restaurantBg"
      cover
      class="position-absolute w-100"
      :style="{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 0,
        opacity: 0.25,
        minHeight: '100vh',
      }"
    />

    <div
      class="position-absolute w-100"
      :style="{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
      }"
    />

    <VContainer
      class="pa-2 pa-sm-4 pa-md-3 max-width-1400 position-relative"
      :class="
        $vuetify.display.smAndDown
          ? 'h-100 d-flex flex-column'
          : 'h-100 d-flex flex-column'
      "
      :style="{ zIndex: 2 }"
    >
      <VRow
        class="align-stretch"
        :class="$vuetify.display.smAndDown ? 'flex-grow-1 ma-0' : ''"
        style="min-height: 0"
      >
        <VCol
          v-if="currentStep === 0"
          cols="12"
          md="5"
          :order="$vuetify.display.mdAndUp ? 1 : 2"
          class="d-flex mb-4 mb-md-0"
          :class="$vuetify.display.mdAndUp ? 'pe-md-2' : ''"
          style="min-height: 0"
        >
          <VCard
            class="pa-3 pa-sm-4 pa-md-4 w-100 d-flex flex-column"
            :class="$vuetify.display.smAndDown ? 'h-100' : 'h-100'"
            style="min-height: 0; max-height: 100%"
            elevation="8"
          >
            <div class="mb-3 mb-md-2 flex-shrink-0">
              <div class="d-flex align-center gap-2 mb-1">
                <VIcon
                  icon="tabler-chef-hat"
                  :size="$vuetify.display.smAndDown ? 28 : 32"
                  color="warning"
                />
                <h4 class="text-h4 text-md-h5 mb-0 font-weight-bold">
                  Order Summary
                </h4>
              </div>
              <div class="text-body-1 text-md-h6 text-medium-emphasis">
                Order #{{ orderId }}
              </div>
            </div>

            <div
              class="flex-grow-1 mb-2 mb-md-2"
              :style="{
                minHeight: 0,
                maxHeight: $vuetify.display.smAndDown
                  ? '250px'
                  : 'calc(100vh - 400px)',
                overflowY: 'auto',
                overflowX: 'hidden',
              }"
            >
              <VCard
                v-for="(item, index) in items"
                :key="index"
                class="mb-2 mb-md-2"
                elevation="2"
              >
                <VCardText class="pa-2 pa-md-2">
                  <div class="d-flex align-start justify-space-between">
                    <div class="flex-grow-1 pe-3">
                      <div
                        class="d-flex align-center gap-2 text-h6 text-md-h5 font-weight-bold mb-2"
                      >
                        <VIcon
                          icon="tabler-tools-kitchen-2"
                          :size="$vuetify.display.smAndDown ? 22 : 26"
                          color="warning"
                        />
                        <span class="text-wrap">{{ item.name }}</span>
                      </div>
                      <div
                        class="text-body-1 text-md-h6 text-medium-emphasis mb-1"
                      >
                        {{ item.quantity }} × ${{
                          (item.itemTotal / item.quantity).toFixed(2)
                        }}
                        <span
                          v-if="item.modifiers.length > 0"
                          class="d-block d-md-inline ms-1"
                        >
                          ({{ item.modifiers.map(m => m.name).join(', ') }})
                        </span>
                      </div>
                    </div>
                    <div
                      class="text-h5 text-md-h4 font-weight-bold flex-shrink-0 text-warning"
                    >
                      ${{ item.itemTotal.toFixed(2) }}
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>

            <div class="flex-shrink-0 mt-auto">
              <VCard class="mb-2 mb-md-2" color="warning" variant="tonal">
                <VCardText class="pa-2 pa-md-2">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span
                      class="text-body-1 text-md-h6 font-weight-medium text-high-emphasis"
                      >Subtotal</span
                    >
                    <span
                      class="text-body-1 text-md-h6 font-weight-medium text-high-emphasis"
                      >${{ subtotal.toFixed(2) }}</span
                    >
                  </div>
                  <VDivider class="my-1" />
                  <div class="d-flex align-center justify-space-between mt-1">
                    <span
                      class="text-h6 text-md-h5 font-weight-bold text-high-emphasis"
                      >Total</span
                    >
                    <span
                      class="text-h5 text-md-h4 font-weight-bold text-high-emphasis"
                    >
                      ${{ paymentAmount.toFixed(2) }}
                    </span>
                  </div>
                </VCardText>
              </VCard>

              <VCard elevation="2">
                <VCardText class="pa-2 pa-md-2">
                  <div class="d-flex align-center gap-3 text-h6 text-md-h5">
                    <VIcon
                      icon="tabler-phone"
                      :size="$vuetify.display.smAndDown ? 22 : 26"
                      color="warning"
                    />
                    <div class="text-break font-weight-medium">
                      {{ phoneNumber }}
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          :order="$vuetify.display.mdAndUp ? 2 : 1"
          :md="currentStep === 0 ? 7 : 12"
          class="d-flex"
          :class="$vuetify.display.mdAndUp ? 'ps-md-2' : ''"
        >
          <VCard
            class="pa-3 pa-sm-4 pa-md-4 w-100 d-flex flex-column"
            :class="$vuetify.display.smAndDown ? 'h-100' : 'h-100'"
            elevation="8"
            style="min-height: 0"
          >
            <div class="mb-3 mb-md-2 flex-shrink-0">
              <div class="d-flex align-center gap-2 mb-1">
                <VIcon
                  :icon="
                    currentStep === 0
                      ? 'tabler-credit-card'
                      : 'tabler-circle-check'
                  "
                  :size="$vuetify.display.smAndDown ? 28 : 32"
                  :color="currentStep === 0 ? 'warning' : 'success'"
                />
                <h4 class="text-h4 text-md-h5 mb-0 font-weight-bold">
                  {{
                    currentStep === 0
                      ? 'Complete Your Payment'
                      : 'Order Confirmation'
                  }}
                </h4>
              </div>
              <p class="text-body-1 text-md-h6 text-medium-emphasis">
                {{
                  currentStep === 0
                    ? 'Enter your payment details to complete your order'
                    : 'Your order has been successfully processed'
                }}
              </p>
            </div>

            <div class="flex-grow-1" style="min-height: 0; overflow-y: auto">
              <VWindow v-model="currentStep" :touch="false">
                <VWindowItem>
                  <PaymentContent
                    v-model:current-step="currentStep"
                    :checkout-data="checkoutData"
                  />
                </VWindowItem>
                <VWindowItem>
                  <ConfirmationContent :checkout-data="checkoutData" />
                </VWindowItem>
              </VWindow>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
