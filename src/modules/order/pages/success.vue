<script setup lang="ts">
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
  <div class="d-flex align-center justify-center min-vh-100 pa-4">
    <VCard class="pa-8 pa-md-12" max-width="600">
      <VCardText class="text-center">
        <div class="mb-6">
          <VIcon
            icon="tabler-circle-check"
            size="80"
            color="success"
            class="mb-4"
          />
          <h2 class="text-h3 text-md-h2 mb-2">Pago Aceptado</h2>
          <p class="text-body-1 text-medium-emphasis">
            Tu pago ha sido procesado exitosamente
          </p>
        </div>

        <VDivider class="my-6" />

        <div class="text-start mb-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-body-1 font-weight-medium">Order ID:</span>
            <span class="text-body-1">{{ orderId || 'N/A' }}</span>
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-body-1 font-weight-medium">Estado:</span>
            <VChip color="success" size="small">{{
              status || 'success'
            }}</VChip>
          </div>
          <div class="d-flex align-center justify-space-between">
            <span class="text-body-1 font-weight-medium">Monto:</span>
            <span class="text-h6 font-weight-bold">${{ paymentAmount }}</span>
          </div>
        </div>

        <div v-if="notes" class="mt-6">
          <VDivider class="mb-4" />
          <div class="d-flex align-center gap-2 mb-2">
            <VIcon icon="tabler-note" size="20" />
            <span class="text-body-1 font-weight-medium"
              >Notas de la orden:</span
            >
          </div>
          <p class="text-body-2 text-start">{{ notes }}</p>
        </div>

        <VDivider class="my-6" />

        <p class="text-body-2 text-medium-emphasis">
          Recibirás un SMS de confirmación con los detalles de tu orden.
        </p>
      </VCardText>
    </VCard>
  </div>
</template>
