<script setup lang="ts">
import { useOrderStore } from '@/modules/order/stores/order'
import americanExDark from '@images/icons/payments/img/ae-dark.png'
import americanExLight from '@images/icons/payments/img/american-express.png'
import masterCardDark from '@images/icons/payments/img/master-dark.png'
import masterCardLight from '@images/icons/payments/img/mastercard.png'
import visaDark from '@images/icons/payments/img/visa-dark.png'
import visaLight from '@images/icons/payments/img/visa-light.png'
import { VForm } from 'vuetify/components/VForm'
import type { CheckoutData } from './types'

const prop = defineProps<{
  currentStep?: number
  checkoutData: CheckoutData
}>()

const emit = defineEmits<{
  (e: 'update:currentStep', value: number): void
}>()

const orderStore = useOrderStore()

const selectedPaymentMethod = ref('card')
const isProcessing = ref(false)
const formRef = ref<VForm>()

const isFormValid = computed(() => {
  if (!formRef.value) {
    return false
  }
  return formRef.value.isValid
})

const cardFormData = ref({
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvv: '',
  isCardSave: true,
})

const orderNotes = computed({
  get: () => orderStore.orderNotes || '',
  set: (value: string) => {
    orderStore.orderNotes = value
  },
})

const visa = useGenerateImageVariant(visaLight, visaDark)
const masterCard = useGenerateImageVariant(masterCardLight, masterCardDark)
const americanEx = useGenerateImageVariant(americanExLight, americanExDark)

const detectCardType = (cardNumber: string): string | null => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (!cleaned) {
    return null
  }

  if (/^4/.test(cleaned)) {
    return 'visa'
  }
  if (/^5[1-5]/.test(cleaned)) {
    return 'mastercard'
  }
  if (/^3[47]/.test(cleaned)) {
    return 'amex'
  }
  if (/^6(?:011|5)/.test(cleaned)) {
    return 'discover'
  }

  return null
}

const cardTypeIcon = computed(() => {
  const type = detectCardType(cardFormData.value.cardNumber)
  if (type === 'visa') {
    return visa.value
  }
  if (type === 'mastercard') {
    return masterCard.value
  }
  if (type === 'amex') {
    return americanEx.value
  }
  return null
})

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '').replace(/\D/g, '')
  if (cleaned.length === 0) {
    return ''
  }
  const maxLength = 16
  const limited = cleaned.slice(0, maxLength)
  const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited
  return formatted
}

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) {
    return ''
  }
  if (cleaned.length >= 2) {
    const month = cleaned.slice(0, 2)
    const year = cleaned.slice(2, 4)
    if (cleaned.length > 2) {
      return `${month}/${year}`
    }
    return `${month}`
  }
  return cleaned
}

const formatCvv = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 4)
}

const cardNumberValidator = (value: string) => {
  if (!value || !value.trim()) {
    return 'Card number is required'
  }
  const cleaned = value.replace(/\s/g, '')
  if (!/^\d+$/.test(cleaned)) {
    return 'Card number must contain only digits'
  }
  if (cleaned.length < 13) {
    return 'Card number must have at least 13 digits'
  }
  if (cleaned.length < 15) {
    return 'Card number must have at least 15 digits'
  }
  if (cleaned.length > 16) {
    return 'Card number must have at most 16 digits'
  }
  if (cleaned.length === 14) {
    return 'Card number must have 15 or 16 digits'
  }
  return true
}

const expiryValidator = (value: string) => {
  if (!value || !value.trim()) {
    return 'Expiry date is required'
  }
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) {
    return 'Invalid format. Use MM/YY'
  }
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10)
  if (isNaN(month) || isNaN(year)) {
    return 'Invalid date format'
  }
  if (month < 1 || month > 12) {
    return 'Month must be between 01 and 12'
  }
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  const fullYear = 2000 + year
  const currentFullYear = currentDate.getFullYear()

  if (
    fullYear < currentFullYear ||
    (fullYear === currentFullYear && month < currentMonth)
  ) {
    return 'Card has expired'
  }
  return true
}

const cvvValidator = (value: string) => {
  if (!value || !value.trim()) {
    return 'CVC is required'
  }
  if (!/^\d+$/.test(value)) {
    return 'CVC must contain only digits'
  }
  if (value.length < 3) {
    return 'CVC must have at least 3 digits'
  }
  if (value.length > 4) {
    return 'CVC must have at most 4 digits'
  }
  return true
}

const cardNameValidator = (value: string) => {
  if (!value || !value.trim()) {
    return 'Cardholder name is required'
  }
  const trimmed = value.trim()
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters'
  }
  if (trimmed.length > 50) {
    return 'Name must be at most 50 characters'
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens and apostrophes'
  }
  return true
}

const nextStep = async () => {
  if (isProcessing.value) {
    return
  }

  if (formRef.value) {
    const validation = await formRef.value.validate()
    if (!validation.valid) {
      return
    }
  }

  isProcessing.value = true

  await orderStore.processPayment()

  isProcessing.value = false
}
</script>

<template>
  <div>
    <VWindow v-model="selectedPaymentMethod" :touch="false">
      <VWindowItem value="card">
        <VForm ref="formRef" @submit.prevent="() => {}">
          <div class="mb-3">
            <VRow>
              <VCol cols="12">
                <div class="app-text-field flex-grow-1">
                  <VLabel
                    for="card-number"
                    class="mb-1 text-body-2 text-md-body-2 text-wrap font-weight-medium"
                    style="line-height: 15px"
                  >
                    Card Information
                    <span class="text-error ms-1">*</span>
                  </VLabel>
                  <VTextField
                    id="card-number"
                    :model-value="cardFormData.cardNumber"
                    @update:model-value="(value: string) => { cardFormData.cardNumber = formatCardNumber(value) }"
                    placeholder="1234 5678 9012 3456"
                    density="compact"
                    variant="outlined"
                    color="warning"
                    :rules="[cardNumberValidator]"
                    maxlength="19"
                    :size="$vuetify.display.smAndDown ? 'default' : 'default'"
                  >
                    <template v-if="cardTypeIcon" #append-inner>
                      <VImg
                        :src="cardTypeIcon"
                        width="40"
                        height="24"
                        contain
                      />
                    </template>
                  </VTextField>
                </div>
              </VCol>

              <VCol cols="12" sm="6">
                <div class="app-text-field flex-grow-1">
                  <VLabel
                    for="card-expiry"
                    class="mb-1 text-body-2 text-md-body-2 text-wrap font-weight-medium"
                    style="line-height: 15px"
                  >
                    Expiry Date
                    <span class="text-error ms-1">*</span>
                  </VLabel>
                  <VTextField
                    id="card-expiry"
                    :model-value="cardFormData.cardExpiry"
                    @update:model-value="(value: string) => { cardFormData.cardExpiry = formatExpiry(value) }"
                    placeholder="MM/YY"
                    density="compact"
                    variant="outlined"
                    color="warning"
                    :rules="[expiryValidator]"
                    maxlength="5"
                    :size="$vuetify.display.smAndDown ? 'default' : 'default'"
                  />
                </div>
              </VCol>

              <VCol cols="12" sm="6">
                <div class="app-text-field flex-grow-1">
                  <VLabel
                    for="card-cvv"
                    class="mb-1 text-body-2 text-md-body-2 text-wrap font-weight-medium"
                    style="line-height: 15px"
                  >
                    CVC <span class="text-error ms-1">*</span>
                  </VLabel>
                  <VTextField
                    id="card-cvv"
                    :model-value="cardFormData.cardCvv"
                    @update:model-value="(value: string) => { cardFormData.cardCvv = formatCvv(value) }"
                    placeholder="123"
                    density="compact"
                    variant="outlined"
                    color="warning"
                    :rules="[cvvValidator]"
                    maxlength="4"
                    :size="$vuetify.display.smAndDown ? 'default' : 'default'"
                  >
                    <template #append-inner>
                      <VTooltip
                        text="Card Verification Value"
                        location="bottom"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <VIcon
                            v-bind="tooltipProps"
                            size="20"
                            icon="tabler-help-circle"
                            class="text-disabled"
                          />
                        </template>
                      </VTooltip>
                    </template>
                  </VTextField>
                </div>
              </VCol>

              <VCol cols="12">
                <div class="app-text-field flex-grow-1">
                  <VLabel
                    for="card-name"
                    class="mb-1 text-body-2 text-md-body-2 text-wrap font-weight-medium"
                    style="line-height: 15px"
                  >
                    Cardholder Name <span class="text-error ms-1">*</span>
                  </VLabel>
                  <VTextField
                    id="card-name"
                    v-model="cardFormData.cardName"
                    placeholder="Full name"
                    density="compact"
                    variant="outlined"
                    color="warning"
                    :rules="[cardNameValidator]"
                    :size="$vuetify.display.smAndDown ? 'default' : 'default'"
                  />
                </div>
              </VCol>
            </VRow>
          </div>

          <div class="mb-3">
            <div class="d-flex align-center gap-2 mb-2">
              <VIcon
                icon="tabler-note"
                :size="$vuetify.display.smAndDown ? 20 : 24"
                color="warning"
              />
              <span class="text-body-2 text-md-body-2 font-weight-medium"
                >Order Notes (Optional)</span
              >
            </div>
            <AppTextarea
              v-model="orderNotes"
              placeholder="Add any special instructions or notes for your order"
              density="compact"
              :rows="$vuetify.display.smAndDown ? 2 : 2"
              variant="outlined"
              color="warning"
            />
          </div>

          <div class="mb-3">
            <VCheckbox
              v-model="cardFormData.isCardSave"
              density="compact"
              hide-details
              color="warning"
            >
              <template #label>
                <span class="text-body-2 text-md-body-2">
                  Save my data for a faster checkout process
                </span>
              </template>
            </VCheckbox>
            <p
              class="text-body-2 text-md-body-2 mt-1 ms-8 text-medium-emphasis"
            >
              Pay securely on this website and in all stores that accept this
              payment method.
            </p>
          </div>

          <VCard class="mb-0" color="warning" variant="tonal">
            <VCardText class="pa-2 pa-md-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <div
                    class="text-body-2 text-md-body-2 mb-1 text-high-emphasis"
                  >
                    Total to Pay
                  </div>
                  <div
                    class="text-h6 text-md-h5 font-weight-bold text-high-emphasis"
                  >
                    ${{ prop.checkoutData.orderAmount.toFixed(2) }}
                  </div>
                </div>
                <VIcon
                  icon="tabler-currency-dollar"
                  :size="$vuetify.display.smAndDown ? 28 : 32"
                  color="warning"
                />
              </div>
              <VBtn
                block
                :size="$vuetify.display.smAndDown ? 'default' : 'large'"
                color="warning"
                variant="elevated"
                :loading="isProcessing || orderStore.isLoading"
                :disabled="!isFormValid || isProcessing || orderStore.isLoading"
                @click="nextStep"
                class="font-weight-bold text-high-emphasis"
                style="
                  cursor: pointer;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                "
                @mouseenter="(e: MouseEvent) => { if (!isProcessing && !orderStore.isLoading && isFormValid) { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; } }"
                @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }"
              >
                <span class="text-high-emphasis"
                  >Pay ${{ prop.checkoutData.orderAmount.toFixed(2) }}</span
                >
              </VBtn>
            </VCardText>
          </VCard>
        </VForm>
      </VWindowItem>
    </VWindow>
  </div>
</template>
