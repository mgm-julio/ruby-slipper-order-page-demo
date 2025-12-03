<script setup lang="ts">
import { useOrderStore } from '@/modules/order/stores/order'
import ConfirmationContent from '@/views/wizard-examples/checkout/Confirmation.vue'
import PaymentContent from '@/views/wizard-examples/checkout/Payment.vue'
import { useConfigStore } from '@core/stores/config'
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
    class="d-flex"
    :class="$vuetify.display.smAndDown ? 'h-100 overflow-hidden' : 'min-vh-100'"
  >
    <VContainer
      class="pa-4 pa-md-8 max-width-1400"
      :class="$vuetify.display.smAndDown ? 'h-100 d-flex flex-column' : ''"
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
            class="pa-4 pa-sm-6 pa-md-8 pa-lg-12 w-100 d-flex flex-column"
            :class="$vuetify.display.smAndDown ? 'h-100' : 'h-100'"
            style="min-height: 0; max-height: 100%"
          >
            <div class="mb-6 mb-md-8 flex-shrink-0">
              <div class="d-flex align-center gap-2 mb-2">
                <VIcon
                  icon="tabler-chef-hat"
                  :size="$vuetify.display.smAndDown ? 28 : 32"
                />
                <h4 class="text-h4 text-md-h3 mb-0">Resumen del Pedido</h4>
              </div>
              <div class="text-body-1 text-md-h6">Pedido #{{ orderId }}</div>
            </div>

            <div
              class="flex-grow-1 mb-4 mb-md-6"
              :style="{
                minHeight: 0,
                maxHeight: $vuetify.display.smAndDown ? '250px' : '400px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }"
            >
              <div
                v-for="(item, index) in items"
                :key="index"
                class="d-flex align-start justify-space-between mb-3 mb-md-4"
              >
                <div class="flex-grow-1 pe-2">
                  <div
                    class="d-flex align-center gap-2 text-body-1 text-md-h6 font-weight-medium mb-2"
                  >
                    <VIcon
                      icon="tabler-tools-kitchen-2"
                      :size="$vuetify.display.smAndDown ? 20 : 24"
                    />
                    <span class="text-wrap">{{ item.name }}</span>
                  </div>
                  <div class="text-body-1 text-md-body-1 mb-1">
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
                  class="text-body-1 text-md-h6 font-weight-bold flex-shrink-0"
                >
                  ${{ item.itemTotal.toFixed(2) }}
                </div>
              </div>
            </div>

            <VDivider class="mb-4 flex-shrink-0" />

            <div class="mb-4 mb-md-6 flex-shrink-0">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-1 text-md-h6">Subtotal</span>
                <span class="text-body-1 text-md-h6"
                  >${{ subtotal.toFixed(2) }}</span
                >
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-h6 text-md-h5 font-weight-bold">Total</span>
                <span class="text-h4 text-md-h3 font-weight-bold">
                  ${{ paymentAmount.toFixed(2) }}
                </span>
              </div>
            </div>

            <VDivider class="my-4 flex-shrink-0" />

            <div
              class="d-flex align-center gap-2 text-body-1 text-md-h6 flex-shrink-0"
            >
              <VIcon
                icon="tabler-phone"
                :size="$vuetify.display.smAndDown ? 20 : 24"
              />
              <div class="text-break font-weight-medium">{{ phoneNumber }}</div>
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
            class="pa-4 pa-sm-6 pa-md-8 pa-lg-12 w-100 d-flex flex-column"
            :class="$vuetify.display.smAndDown ? 'h-100' : 'h-100'"
          >
            <div class="mb-6 mb-md-8">
              <div class="d-flex align-center gap-2 mb-2">
                <VIcon
                  :icon="
                    currentStep === 0
                      ? 'tabler-credit-card'
                      : 'tabler-circle-check'
                  "
                  :size="$vuetify.display.smAndDown ? 28 : 32"
                />
                <h4 class="text-h4 text-md-h3 mb-0">
                  {{
                    currentStep === 0
                      ? 'Completa tu Pago'
                      : 'Confirmación del Pedido'
                  }}
                </h4>
              </div>
              <p class="text-body-1 text-md-h6">
                {{
                  currentStep === 0
                    ? 'Ingresa los detalles de pago para completar tu pedido'
                    : 'Tu pedido ha sido procesado exitosamente'
                }}
              </p>
            </div>

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
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
