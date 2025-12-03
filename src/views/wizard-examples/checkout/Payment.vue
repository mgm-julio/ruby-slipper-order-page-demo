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
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
  return formatted.slice(0, 19)
}

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
  }
  return cleaned
}

const formatCvv = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 4)
}

const cardNumberValidator = (value: string) => {
  if (!value) {
    return 'Card number is required'
  }
  const cleaned = value.replace(/\s/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) {
    return 'Card number must be between 13 and 19 digits'
  }
  return true
}

const expiryValidator = (value: string) => {
  if (!value) {
    return 'Expiry date is required'
  }
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) {
    return 'Invalid format. Use MM/YY'
  }
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10)
  if (month < 1 || month > 12) {
    return 'Month must be between 01 and 12'
  }
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired'
  }
  return true
}

const cvvValidator = (value: string) => {
  if (!value) {
    return 'CVC is required'
  }
  if (value.length < 3 || value.length > 4) {
    return 'CVC must be 3 or 4 digits'
  }
  return true
}

const cardNameValidator = (value: string) => {
  if (!value) {
    return 'Cardholder name is required'
  }
  if (value.trim().length < 2) {
    return 'Name must be at least 2 characters'
  }
  if (!/^[a-zA-Z\s'-]+$/.test(value)) {
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

  const paymentSuccess = await orderStore.processPayment()

  if (paymentSuccess) {
    emit('update:currentStep', prop.currentStep ? prop.currentStep + 1 : 1)
  } else {
    orderStore.redirectToCallback(false)
    return
  }

  isProcessing.value = false
}

watch(
  () => cardFormData.value.cardNumber,
  newValue => {
    cardFormData.value.cardNumber = formatCardNumber(newValue)
  }
)

watch(
  () => cardFormData.value.cardExpiry,
  newValue => {
    cardFormData.value.cardExpiry = formatExpiry(newValue)
  }
)

watch(
  () => cardFormData.value.cardCvv,
  newValue => {
    cardFormData.value.cardCvv = formatCvv(newValue)
  }
)
</script>

<template>
  <div>
    <VWindow v-model="selectedPaymentMethod" :touch="false">
      <VWindowItem value="card">
        <VForm ref="formRef" @submit.prevent="() => {}">
          <div class="mb-4 mb-md-6">
            <div class="d-flex align-center gap-2 mb-1">
              <VIcon
                icon="tabler-wallet"
                :size="$vuetify.display.smAndDown ? 18 : 20"
              />
              <h6 class="text-subtitle-1 text-md-h6 mb-0">Payment method</h6>
            </div>
            <p class="text-body-2">
              Enter your card information to complete the payment
            </p>
          </div>

          <VRow>
            <VCol cols="12">
              <div class="app-text-field flex-grow-1">
                <VLabel
                  for="card-number"
                  class="mb-1 text-body-1 text-wrap"
                  style="line-height: 15px"
                >
                  Card information <span class="text-error ms-1">*</span>
                </VLabel>
                <VTextField
                  id="card-number"
                  v-model="cardFormData.cardNumber"
                  placeholder="1234 1234 1234 1234"
                  density="comfortable"
                  variant="outlined"
                  :rules="[cardNumberValidator]"
                  maxlength="19"
                >
                  <template v-if="cardTypeIcon" #append-inner>
                    <VImg :src="cardTypeIcon" width="40" height="24" contain />
                  </template>
                </VTextField>
              </div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="app-text-field flex-grow-1">
                <VLabel
                  for="card-expiry"
                  class="mb-1 text-body-1 text-wrap"
                  style="line-height: 15px"
                >
                  MM/YY <span class="text-error ms-1">*</span>
                </VLabel>
                <VTextField
                  id="card-expiry"
                  v-model="cardFormData.cardExpiry"
                  placeholder="MM/YY"
                  density="comfortable"
                  variant="outlined"
                  :rules="[expiryValidator]"
                  maxlength="5"
                />
              </div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="app-text-field flex-grow-1">
                <VLabel
                  for="card-cvv"
                  class="mb-1 text-body-1 text-wrap"
                  style="line-height: 15px"
                >
                  CVC <span class="text-error ms-1">*</span>
                </VLabel>
                <VTextField
                  id="card-cvv"
                  v-model="cardFormData.cardCvv"
                  placeholder="123"
                  density="comfortable"
                  variant="outlined"
                  :rules="[cvvValidator]"
                  maxlength="4"
                >
                  <template #append-inner>
                    <VTooltip text="Card Verification Value" location="bottom">
                      <template #activator="{ props: tooltipProps }">
                        <VIcon
                          v-bind="tooltipProps"
                          size="18"
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
                  class="mb-1 text-body-1 text-wrap"
                  style="line-height: 15px"
                >
                  Cardholder name <span class="text-error ms-1">*</span>
                </VLabel>
                <VTextField
                  id="card-name"
                  v-model="cardFormData.cardName"
                  placeholder="Full name"
                  density="comfortable"
                  variant="outlined"
                  :rules="[cardNameValidator]"
                />
              </div>
            </VCol>

            <VCol cols="12">
              <div class="d-flex align-center gap-2 mb-2">
                <VIcon
                  icon="tabler-note"
                  :size="$vuetify.display.smAndDown ? 16 : 18"
                />
                <span class="text-body-1">Order notes (optional)</span>
              </div>
              <AppTextarea
                v-model="orderNotes"
                placeholder="Add any special instructions or notes for your order"
                density="comfortable"
                :rows="$vuetify.display.smAndDown ? 2 : 3"
              />
            </VCol>

            <VCol cols="12">
              <VCheckbox
                v-model="cardFormData.isCardSave"
                density="comfortable"
                hide-details
              >
                <template #label>
                  <span class="text-body-2">
                    Save my data for a faster checkout process
                  </span>
                </template>
              </VCheckbox>
              <p class="text-body-2 mt-2 ms-8">
                Pay securely on this website and in all stores that accept this
                payment method.
              </p>
            </VCol>

            <VCol cols="12" class="mt-4">
              <VBtn
                block
                :size="$vuetify.display.smAndDown ? 'default' : 'large'"
                :loading="isProcessing || orderStore.isLoading"
                :disabled="!isFormValid || isProcessing || orderStore.isLoading"
                @click="nextStep"
              >
                Pay ${{ prop.checkoutData.orderAmount.toFixed(2) }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
    </VWindow>
  </div>
</template>
