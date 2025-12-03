<template>
  <div class="d-inline-flex align-center">
    <VTooltip
      v-for="it in activeIcons"
      :key="it.key"
      location="top"
      :text="it.label"
    >
      <template #activator="{ props: tip }">
        <VIcon
          v-bind="tip"
          size="32"
          class="mx-2"
          :icon="it.icon"
        />
      </template>
    </VTooltip>

    <VTooltip v-if="activeIcons.length === 0" location="top" text="No channels">
      <template #activator="{ props: tip }">
        <VIcon v-bind="tip" size="32" class="tabler-wifi-off" />
      </template>
    </VTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Channels = {
  call?: unknown
  sms?: unknown
  webchat?: unknown
}

const props = defineProps<{
  channels?: Channels
}>()

const iconMap: Record<keyof Channels, string> = {
  call: 'tabler-phone',
  sms: 'tabler-messages',
  webchat: 'tabler-message-chatbot',
}

const labelMap: Record<keyof Channels, string> = {
  call: 'Call',
  sms: 'SMS',
  webchat: 'Webchat',
}

// Fixed rendering order
const order: (keyof Channels)[] = ['call', 'sms', 'webchat']

const activeIcons = computed(() => {
  const c = props.channels ?? {}
  return order
    .filter(key => Boolean(c[key]))
    .map(key => ({ key, icon: iconMap[key], label: labelMap[key] }))
})
</script>
