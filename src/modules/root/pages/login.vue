<script setup lang="ts">
import authV2LoginIllustration from '@images/pages/auth-v2-login-illustration.png'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const authStore = useAuthStore()
const refVForm = ref<VForm>()

const onSubmit = () => {
  refVForm.value?.validate().then((result: { valid: boolean }) => {
    if (result.valid) {
      authStore.signin()
    }
  })
}
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
          <h4 class="text-h4 mb-1">
            Welcome to
            <span class="text-capitalize"> {{ themeConfig.app.title }} </span>!
            👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText v-if="authStore.errors.login">
          <VAlert
            color="error"
            variant="tonal"
            :text="authStore.errors.login"
          />
        </VCardText>
        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="authStore.login.email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="authStore.errors.email"
                />
              </VCol>

              <VCol cols="12">
                <div
                  class="d-flex align-center flex-wrap justify-space-between mb-6"
                >
                  <VCheckbox
                    v-model="authStore.login.rememberMe"
                    label="Remember me"
                  />
                </div>

                <VBtn block type="submit" :loading="authStore.submitting">
                  Login
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
