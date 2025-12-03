<script setup lang="ts">
import type { CheckoutData } from './types';

const props = defineProps<{
  currentStep?: number
  checkoutData: CheckoutData
}>()

defineEmits<{
  (e: 'update:currentStep', value: number): void
}>()

const route = useRoute()

const orderId = computed(() => route.query.orderId as string || '#1536548131')
const phoneNumber = computed(() => route.query.phoneNumber as string || 'john.doe@example.com')

const selectedDeliveryAddress = computed(() => {
  return props.checkoutData.addresses.filter(address => {
    return address.value === props.checkoutData.deliveryAddress
  })
})

const resolveDeliveryMethod = computed(() => {
  if (props.checkoutData.deliverySpeed === 'overnight')
    return { method: 'Overnight Delivery', desc: 'In 1 business day.' }
  else if (props.checkoutData.deliverySpeed === 'express')
    return { method: 'Express Delivery', desc: 'Normally in 3-4 business days' }
  else
    return { method: 'Standard Delivery', desc: 'Normally in 1 Week' }
})

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }) + ' ' + now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
})
</script>

<template>
  <section class="text-base">
    <div class="text-center">
      <h4 class="text-h4 mb-4">
        Thank You!
      </h4>
      <p>
        Your order <span class="text-body-1 font-weight-medium text-high-emphasis">{{ orderId }}</span> has been placed!
      </p>
      <p class="mb-0">
        We sent an SMS to <span class="text-body-1 font-weight-medium text-high-emphasis">{{ phoneNumber }}</span> with your order confirmation and receipt.
      </p>
      <p>Your payment has been processed successfully.</p>
      <div class="d-flex align-center gap-2 justify-center mb-4">
        <VIcon
          size="20"
          icon="tabler-clock-hour-5"
          class="text-high-emphasis"
        />
        <span>Time placed: {{ currentDate }}</span>
      </div>
      <div class="d-flex align-center gap-2 justify-center">
        <VIcon
          size="18"
          icon="tabler-arrow-right"
          class="text-disabled"
        />
        <span class="text-body-2 text-disabled">Redirecting you back...</span>
      </div>
    </div>

    <VRow class="border rounded ma-0 mt-6">
      <VCol
        cols="12"
        md="4"
        class="pa-6"
        :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'"
      >
        <div class="d-flex align-center gap-2 text-high-emphasis mb-4">
          <VIcon
            icon="tabler-map-pin"
            size="20"
          />
          <span class="text-base font-weight-medium">
            Shipping
          </span>
        </div>

        <template
          v-for="item in selectedDeliveryAddress"
          :key="item.value"
        >
          <p class="mb-0">
            {{ item.title }}
          </p>
          <p class="mb-4">
            {{ item.desc }}
          </p>

          <div class="text-base">
            +{{ item.subtitle }}
          </div>
        </template>
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="pa-6"
        :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'"
      >
        <div class="d-flex align-center gap-2 text-high-emphasis mb-4">
          <VIcon
            icon="tabler-credit-card"
            size="20"
          />
          <span class="text-base font-weight-medium">
            Billing Address
          </span>
        </div>

        <template
          v-for="item in selectedDeliveryAddress"
          :key="item.value"
        >
          <p class="mb-0">
            {{ item.title }}
          </p>
          <p class="mb-4">
            {{ item.desc }}
          </p>

          <div class="text-base">
            +{{ item.subtitle }}
          </div>
        </template>
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="pa-6"
      >
        <div class="d-flex align-center gap-2 text-high-emphasis mb-4">
          <VIcon
            icon="tabler-truck"
            size="20"
          />
          <span class="text-base font-weight-medium">
            Shipping Method
          </span>
        </div>

        <p class="font-weight-medium">
          Preferred Method:
        </p>
        <p class="mb-0">
          {{ resolveDeliveryMethod.method }}
        </p>
        <p class="mb-0">
          ( {{ resolveDeliveryMethod.desc }} )
        </p>
      </VCol>
    </VRow>

    <VRow v-if="props.checkoutData.orderNotes" class="mt-6">
      <VCol cols="12">
        <div class="border rounded pa-6">
          <div class="d-flex align-center gap-2 text-high-emphasis mb-4">
            <VIcon
              icon="tabler-note"
              size="20"
            />
            <span class="text-base font-weight-medium">
              Order Notes
            </span>
          </div>
          <p class="text-body-1 mb-0">
            {{ props.checkoutData.orderNotes }}
          </p>
        </div>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        cols="12"
        md="9"
      >
        <!-- 👉 cart items -->
        <div class="border rounded">
          <template
            v-for="(item, index) in props.checkoutData.cartItems"
            :key="item.name"
          >
            <div
              class="d-flex align-start gap-4 pa-6 position-relative flex-column flex-sm-row"
              :class="index ? 'border-t' : ''"
            >
              <div>
                <VImg
                  width="80"
                  :src="item.image"
                />
              </div>

              <div
                class="d-flex w-100 justify-space-between gap-4"
                :class="$vuetify.display.width <= 700 ? 'flex-column' : 'flex-row'"
              >
                <div>
                  <h6 class="text-h6 mb-2">
                    {{ item.name }}
                  </h6>
                  <div class="text-body-1 mb-2">
                    Sold by:
                    <span class="d-inline-block text-primary">  {{ item.seller }}</span>
                  </div>
                  <VChip
                    :color="item.inStock ? 'success' : 'error'"
                    label
                    size="small"
                  >
                    {{ item.inStock ? 'In Stock' : 'Out of Stock' }}
                  </VChip>
                </div>

                <!-- <VSpacer /> -->

                <div
                  class="d-flex text-base"
                  :class="$vuetify.display.width <= 700 ? 'align-self-start' : 'align-self-center'"
                >
                  <div class="text-primary">
                    ${{ item.price }}
                  </div>
                  <div>/</div>
                  <div class="text-decoration-line-through text-disabled">
                    ${{ item.discountPrice }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <div class="border rounded">
          <div class="border-b pa-6">
            <h6 class="text-h6 mb-4">
              Price Details
            </h6>

            <div class="d-flex align-center justify-space-between text-base mb-4">
              <span class="text-high-emphasis">Order Total</span>
              <span class="text-high-emphasis">${{ props.checkoutData.orderAmount }}.00</span>
            </div>

            <div class="d-flex justify-space-between text-base">
              <div class="text-high-emphasis">
                Charges
              </div>
              <div
                v-if="props.checkoutData.deliverySpeed === 'free'"
                class="d-flex align-center"
              >
                <div class="text-decoration-line-through text-disabled me-2">
                  $5.00
                </div>
                <VChip
                  size="small"
                  color="success"
                >
                  FREE
                </VChip>
              </div>
              <div v-else>
                <span class="text-high-emphasis">${{ props.checkoutData.deliveryCharges }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex align-center justify-space-between text-high-emphasis font-weight-medium pa-6">
            <span>Total</span>
            <span>${{ props.checkoutData.orderAmount + props.checkoutData.deliveryCharges }}.00</span>
          </div>
        </div>
      </VCol>
    </VRow>
  </section>
</template>
