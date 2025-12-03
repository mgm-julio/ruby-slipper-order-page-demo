<script setup lang="ts">
interface Props {
  data: Record<string, any>
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Event Details',
})

const formatValue = (key: string, value: any) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (
    key.toLowerCase().includes('date') ||
    key.toLowerCase().includes('time')
  ) {
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return value
}

const getFieldIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    provider: 'tabler-bell',
    id: 'tabler-file-text',
    date: 'tabler-calendar',
    time: 'tabler-clock',
    staff: 'tabler-user',
    client: 'tabler-user-check',
    clientName: 'tabler-user-check',
    location: 'tabler-map-pin',
    session: 'tabler-clipboard',
    sessionType: 'tabler-clipboard',
    appointment: 'tabler-star',
    firstAppointment: 'tabler-star',
    status: 'tabler-info-circle',
    price: 'tabler-currency-dollar',
    amount: 'tabler-currency-dollar',
    duration: 'tabler-clock',
    phone: 'tabler-phone',
    email: 'tabler-mail',
    name: 'tabler-user',
    address: 'tabler-map-pin',
    service: 'tabler-settings',
    type: 'tabler-tag',
  }

  const lowerKey = key.toLowerCase()
  for (const [pattern, icon] of Object.entries(iconMap)) {
    if (lowerKey.includes(pattern.toLowerCase())) {
      return icon
    }
  }

  return 'tabler-file-text'
}
</script>

<template>
  <VCard :title="title" class="h-100">
    <VCardText>
      <div
        v-for="(value, key) in data"
        :key="key"
        class="mb-4 d-flex align-center"
      >
        <VIcon
          :icon="getFieldIcon(key)"
          color="primary"
          class="mr-3"
          size="20"
        />
        <div class="flex-grow-1">
          <div class="text-body-2 text-medium-emphasis mb-1 font-weight-medium">
            {{ key }}
          </div>
          <div class="text-body-1 text-high-emphasis">
            {{ formatValue(key, value) }}
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
