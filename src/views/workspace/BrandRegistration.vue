<template>
  <VRow>
    <VCol cols="12">
      <h6 class="text-h6 font-weight-medium">Brand Registration</h6>
      <p class="mb-0">Enter your brand information for A2P 10DLC compliance</p>
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.friendlyName"
        label="Brand Name"
        placeholder="Your Brand Name"
        :rules="[
          (v: string) => !!v || 'Brand name is required',
          (v: string) => (v && v.length >= 2) || 'Brand name must be at least 2 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.companyName"
        label="Company Name"
        placeholder="Your Company Name"
        :rules="[
          (v: string) => !!v || 'Company name is required',
          (v: string) => (v && v.length >= 2) || 'Company name must be at least 2 characters',
        ]"
      />
    </VCol>

    <VCol cols="12">
      <AppTextField
        v-model="store.brandForm.street"
        label="Street Address"
        placeholder="123 Main Street"
        :rules="[
          (v: string) => !!v || 'Street address is required',
          (v: string) => (v && v.length >= 5) || 'Street address must be at least 5 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="4">
      <AppTextField
        v-model="store.brandForm.city"
        label="City"
        placeholder="New York"
        :rules="[
          (v: string) => !!v || 'City is required',
          (v: string) => (v && v.length >= 2) || 'City must be at least 2 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="4">
      <AppTextField
        v-model="store.brandForm.state"
        label="State"
        placeholder="NY"
        :rules="[
          (v: string) => !!v || 'State is required',
          (v: string) => (v && v.length >= 2) || 'State must be at least 2 characters',
        ]"
      />
    </VCol>

    <VCol cols="12" md="4">
      <AppTextField
        v-model="store.brandForm.postalCode"
        label="Postal Code"
        placeholder="12345"
        :rules="[
          (v: string) => !!v || 'Postal code is required',
          (v: string) => /^\d{5}(-\d{4})?$/.test(v) || 'Postal code must be in format 12345 or 12345-6789',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.email"
        label="Email"
        type="email"
        placeholder="contact@company.com"
        :rules="[
          (v: string) => !!v || 'Email is required',
          (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.phone"
        label="Phone"
        placeholder="+1234567890"
        :rules="[
          (v: string) => !!v || 'Phone is required',
          (v: string) => /^\+1\d{10}$/.test(v) || 'Phone must be in format +1XXXXXXXXXX',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.website"
        label="Website"
        placeholder="https://www.company.com"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppSelect
        v-model="store.brandForm.vertical"
        label="Industry Vertical"
        placeholder="Select Industry"
        :items="verticals"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppTextField
        v-model="store.brandForm.ein"
        label="EIN (XX-XXXXXXX)"
        placeholder="12-3456789"
        :rules="[
          (v: string) => !!v || 'EIN is required',
          (v: string) => /^\d{2}-\d{7}$/.test(v) || 'EIN must be in format XX-XXXXXXX',
        ]"
      />
    </VCol>

    <VCol cols="12" md="6">
      <AppSelect
        v-model="store.brandForm.country"
        label="Country"
        placeholder="Select Country"
        :items="countries"
      />
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { useWorkspacesStore } from '@/stores/workspaces'

const store = useWorkspacesStore()

const verticals = [
  { title: 'Professional Services', value: 'PROFESSIONAL_SERVICES' },
  { title: 'Retail', value: 'RETAIL' },
  { title: 'Healthcare', value: 'HEALTHCARE' },
  { title: 'Technology', value: 'TECHNOLOGY' },
]

const countries = [
  { title: 'United States', value: 'US' },
  { title: 'Canada', value: 'CA' },
]
</script>
