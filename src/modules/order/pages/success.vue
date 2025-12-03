<script setup lang="ts">
import { useOrderStore } from '@/modules/order/stores/order'
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
  <div class="d-flex align-center justify-center min-vh-100 pa-4">
    <VCard class="pa-8 pa-md-12" max-width="600">
      <VCardText class="text-center">
        <div class="mb-6">
          <VIcon
            icon="tabler-circle-check"
            size="100"
            color="success"
            class="mb-4"
          />
          <h2 class="text-h2 text-md-h1 mb-2">Pago Aceptado</h2>
          <p class="text-h6 text-md-h5 text-medium-emphasis">
            Tu pago ha sido procesado exitosamente
          </p>
        </div>

        <VDivider class="my-6" />

        <div class="text-start mb-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-h6 text-md-h5 font-weight-medium">Order ID:</span>
            <span class="text-h6 text-md-h5">{{ orderId || 'N/A' }}</span>
          </div>
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-h6 text-md-h5 font-weight-medium">Estado:</span>
            <VChip color="success" size="default">{{
              status || 'success'
            }}</VChip>
          </div>
          <div class="d-flex align-center justify-space-between">
            <span class="text-h6 text-md-h5 font-weight-medium">Monto:</span>
            <span class="text-h5 text-md-h4 font-weight-bold"
              >${{ paymentAmount }}</span
            >
          </div>
        </div>

        <div v-if="items.length > 0" class="mt-6">
          <VDivider class="mb-4" />
          <div class="d-flex align-center gap-2 mb-4">
            <VIcon icon="tabler-chef-hat" size="28" />
            <span class="text-h6 text-md-h5 font-weight-bold"
              >Items del pedido:</span
            >
          </div>
          <div
            class="text-start"
            style="max-height: 300px; overflow-y: auto; overflow-x: hidden"
          >
            <div
              v-for="(item, index) in items"
              :key="index"
              class="d-flex align-start justify-space-between mb-4"
            >
              <div class="flex-grow-1 pe-2">
                <div
                  class="d-flex align-center gap-2 text-body-1 text-md-h6 font-weight-medium mb-2"
                >
                  <VIcon icon="tabler-tools-kitchen-2" size="20" />
                  <span class="text-wrap">{{ item.name }}</span>
                </div>
                <div class="text-body-1 text-md-body-1 text-medium-emphasis">
                  {{ item.quantity }} × ${{
                    (item.itemTotal / item.quantity).toFixed(2)
                  }}
                  <span v-if="item.modifiers.length > 0" class="d-block mt-1">
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
        </div>

        <div v-if="notes" class="mt-6">
          <VDivider class="mb-4" />
          <div class="d-flex align-center gap-2 mb-2">
            <VIcon icon="tabler-note" size="24" />
            <span class="text-h6 text-md-h5 font-weight-bold"
              >Notas de la orden:</span
            >
          </div>
          <p class="text-body-1 text-md-h6 text-start">{{ notes }}</p>
        </div>

        <VDivider class="my-6" />

        <p class="text-body-1 text-md-h6 text-medium-emphasis">
          Recibirás un SMS de confirmación con los detalles de tu orden.
        </p>
      </VCardText>
    </VCard>
  </div>
</template>
