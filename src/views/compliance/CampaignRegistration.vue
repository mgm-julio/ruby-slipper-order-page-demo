<template>
  <VRow>
    <VCol cols="12">
      <h6 class="text-h6 font-weight-medium">Campaign Registration</h6>
      <p class="mb-0">Configure your messaging campaign details</p>
    </VCol>

    <VCol cols="12">
      <AppSelect
        v-model="formData.usecase"
        label="Use Case"
        placeholder="Select Use Case"
        :items="usecases"
        :rules="[(v: string) => !!v || 'Use case is required']"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        v-model="formData.description"
        label="Campaign Description"
        placeholder="Describe your messaging campaign..."
        rows="3"
        :rules="[
          (v: string) => !!v || 'Description is required',
          (v: string) => (v && v.length >= 40) || 'Description must be at least 40 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextarea
        v-model="formData.sampleMessage1"
        label="Sample Message #1"
        placeholder="Enter your first sample message..."
        rows="2"
        :rules="[
          (v: string) => !!v || 'Sample message #1 is required',
          (v: string) => (v && v.length >= 20) || 'Sample message #1 must be at least 20 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextarea
        v-model="formData.sampleMessage2"
        label="Sample Message #2"
        placeholder="Enter your second sample message..."
        rows="2"
        :rules="[
          (v: string) => !!v || 'Sample message #2 is required',
          (v: string) => (v && v.length >= 20) || 'Sample message #2 must be at least 20 characters',
        ]"
      />
    </VCol>

    <VCol cols="12">
      <VCard variant="outlined" class="pa-4">
        <VCardTitle class="text-h6 pa-0 mb-4"> Message Contents </VCardTitle>
        <VRow>
          <VCol cols="12" md="6">
            <VCheckbox
              v-model="formData.hasEmbeddedLinks"
              label="Messages will include embedded links"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VCheckbox
              v-model="formData.hasEmbeddedPhone"
              label="Messages will include phone numbers"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VCheckbox
              v-model="formData.hasDirectLending"
              label="Messages include content related to direct lending or other loan arrangement"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VCheckbox
              v-model="formData.ageGated"
              label="Messages include age-gated content as defined by Carrier and CTIA guidelines"
            />
          </VCol>
        </VRow>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard variant="outlined" class="pa-4">
        <VCardTitle class="text-h6 pa-0 mb-4">
          Opt-in/Opt-out Configuration
        </VCardTitle>
        <VRow>
          <VCol cols="12">
            <AppTextarea
              v-model="formData.consentDescription"
              label="How do end-users consent to receive messages?"
              placeholder="Describe how users opt-in to receive messages..."
              rows="3"
              :rules="[
                (v: string) => !!v || 'Consent description is required',
                (v: string) => (v && v.length >= 40) || 'Consent description must be at least 40 characters',
                (v: string) => (v && v.length <= 2048) || 'Consent description must be maximum 2048 characters',
              ]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.optInKeywords"
              label="Opt-in Keywords"
              placeholder="START, YES, JOIN"
              :rules="[
                (v: string) => !v || v.length <= 255 || 'Opt-in keywords must be maximum 255 characters',
              ]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextarea
              v-model="formData.optInMessage"
              label="Opt-in Message"
              placeholder="Thank you for subscribing..."
              rows="2"
              :rules="[
                (v: string) => !v || (v.length >= 20 && v.length <= 320) || 'Opt-in message must be between 20-320 characters',
              ]"
            />
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
interface CampaignData {
  brandSid: string
  usecase: string
  description: string
  sampleMessage1: string
  sampleMessage2: string
  messagingService: string
  usAppToPerson: boolean
  hasEmbeddedLinks: boolean
  hasEmbeddedPhone: boolean
  hasDirectLending: boolean
  ageGated: boolean
  consentDescription: string
  optInKeywords: string
  optInMessage: string
  subscriberOptIn: boolean
  subscriberOptOut: boolean
  subscriberHelp: boolean
}

interface Props {
  formData: CampaignData
}

defineProps<Props>()

const usecases = [
  { title: '2FA (Two Factor Authentication)', value: '2FA' },
  { title: 'Account Notifications', value: 'ACCOUNT_NOTIFICATIONS' },
  { title: 'Customer Care', value: 'CUSTOMER_CARE' },
  { title: 'Delivery Notifications', value: 'DELIVERY_NOTIFICATIONS' },
  { title: 'Fraud Alert Messaging', value: 'FRAUD_ALERT_MESSAGING' },
  { title: 'Higher Education', value: 'HIGHER_EDUCATION' },
  { title: 'Marketing', value: 'MARKETING' },
  { title: 'Mixed', value: 'MIXED' },
  { title: 'Polling and Voting', value: 'POLLING_VOTING' },
  {
    title: 'Public Service Announcement',
    value: 'PUBLIC_SERVICE_ANNOUNCEMENT',
  },
  { title: 'Security Alert', value: 'SECURITY_ALERT' },
  { title: 'Low Volume Mixed', value: 'LOW_VOLUME_MIXED' },
]
</script>
