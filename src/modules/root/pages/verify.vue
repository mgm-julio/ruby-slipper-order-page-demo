<script setup lang="ts">
import authV2LoginIllustration from '@images/pages/auth-v2-login-illustration.png'
import { onMounted, onUnmounted } from 'vue'
import { VForm } from 'vuetify/components/VForm'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authStore = useAuthStore()
const refVForm = ref<VForm>()
const isSubmitting = ref(false)
const isResending = computed(() => authStore.resending)

const clearCodeInput = () => {
  authStore.verify.code = ''
}

const onFinish = async () => {
  if (isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true
    await authStore.verify2FA()
    clearCodeInput()
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  const pastedText = event.clipboardData?.getData('text')
  if (!pastedText) {
    return
  }

  const cleanedCode = pastedText.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)
  if (cleanedCode.length > 0) {
    authStore.verify.code = cleanedCode

    if (cleanedCode.length === 6) {
      nextTick(() => {
        onFinish()
      })
    }
  }
}

onMounted(() => {
  window.addEventListener('paste', handlePaste, true)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste, true)
})
</script>

<template>
  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg :src="authV2LoginIllustration" class="auth-illustration" />
        </div>
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-6">
        <VCardText>
          <h4 class="text-h4 mb-1">Two Step Verification 💬</h4>
          <p class="mb-0">
            We sent a verification code to your mobile. Enter the code from the
            mobile in the field below.
          </p>
        </VCardText>

        <VCardText>
          <VAlert
            v-if="authStore.errors.verify || authStore.errors.verifyUnavailable"
            color="error"
            variant="tonal"
            :text="
              authStore.errors.verify ?? authStore.errors.verifyUnavailable
            "
            class="mb-4"
          />
          <VForm ref="refVForm" @submit.prevent="onFinish">
            <VRow>
              <VCol class="pb-0" cols="12">
                <VLabel class="text-body-2 text-secondary mb-1">
                  Type your 6 digit security code
                </VLabel>
                <VOtpInput
                  v-model="authStore.verify.code"
                  :disabled="authStore.submitting || !authStore.verify.sub"
                  @finish="onFinish"
                  type="text"
                  :length="6"
                />
              </VCol>

              <VCol cols="6">
                <VBtn block variant="outlined" color="primary" href="/login">
                  Back to Login
                </VBtn>
              </VCol>

              <VCol cols="6">
                <VBtn
                  block
                  type="submit"
                  :loading="authStore.submitting"
                  :disabled="
                    !authStore.verify.sub ||
                    (authStore.verify.code?.length ?? 0) < 6
                  "
                >
                  Verify my Account
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style>
