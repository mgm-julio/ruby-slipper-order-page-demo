<template>
  <div class="chat-log pa-6">
    <div
      v-for="(msg, index) in filteredMessages"
      :key="index"
      class="chat-group d-flex align-start"
      :class="[
        {
          'flex-row-reverse': msg.role === 'user',
          'mb-6': filteredMessages.length - 1 !== index,
        },
      ]"
    >
      <div class="chat-avatar" :class="msg.role === 'user' ? 'ms-4' : 'me-4'">
        <VAvatar size="32" color="primary">
          <VImg
            v-if="msg.role === 'assistant'"
            :src="assistantStore.getAssistantAvatar(assistant?.avatarUrl)"
          />
          <span
            v-else-if="msg.role === 'assistant'"
            class="text-white text-subtitle-2 font-weight-medium"
          >
            {{ assistant?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </span>
          <VIcon v-else class="tabler-user" />
        </VAvatar>
      </div>

      <div
        class="chat-body d-inline-flex flex-column"
        :class="msg.role === 'user' ? 'align-end' : 'align-start'"
      >
        <div
          class="chat-content py-2 px-4 elevation-2"
          :class="[
            msg.role === 'assistant'
              ? 'chat-left'
              : 'bg-primary text-white chat-right',
          ]"
        >
          <p class="mb-0 text-base">
            {{ msg.content }}
          </p>
        </div>

        <div
          v-if="msg.timestamp"
          :class="{ 'text-right': msg.role === 'user' }"
        >
          <span class="text-sm ms-2 text-disabled">
            {{ formatTime(msg.timestamp) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Typing indicator -->
    <div v-if="isTyping" class="chat-group d-flex align-start mb-6">
      <div class="chat-avatar me-4">
        <VAvatar size="32" color="primary">
          <span class="text-white text-subtitle-2 font-weight-medium">
            {{ assistant?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </span>
        </VAvatar>
      </div>

      <div class="chat-body d-inline-flex flex-column align-start">
        <div class="chat-content py-2 px-4 elevation-2 chat-left">
          <div class="typing-indicator">
            <span class="dot">•</span><span class="dot">•</span
            ><span class="dot">•</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssistantsStore } from '@/modules/assistants/stores/assistants'
import { AssistantBasic } from '@/modules/assistants/types/assistant.type'
import { computed } from 'vue'

const props = defineProps<{
  messages: ThreadMessage[]
  assistant?: AssistantBasic | null
  isTyping?: boolean
}>()

const assistantStore = useAssistantsStore()

const filteredMessages = computed(() => {
  return props.messages.filter(
    msg => msg.role !== 'tool' && msg.content && msg.content.trim() !== ''
  )
})

const formatTime = (timestamp: string) => {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString([], {
    hour: 'numeric',
    minute: 'numeric',
  })
}
</script>

<style lang="scss" scoped>
.chat-log {
  .chat-body {
    max-inline-size: calc(100% - 6.75rem);

    .chat-content {
      border-end-end-radius: 6px;
      border-end-start-radius: 6px;

      p {
        overflow-wrap: anywhere;
      }

      &.chat-left {
        border-start-end-radius: 6px;
        background-color: rgb(var(--v-theme-grey-100));
        color: rgb(var(--v-theme-on-surface));
      }

      &.chat-right {
        border-start-start-radius: 6px;
      }
    }
  }
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.dot {
  animation: blink 1.4s infinite;
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface));
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  20% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}
</style>
