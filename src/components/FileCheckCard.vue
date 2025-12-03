<script lang="ts" setup>
import type { GridColumn } from '@core/types'

export interface FileCard {
  title: string
  desc?: string
  value: string
  subtitle?: string
  icon?: string | object
  iconColor?: string
  size?: string
  wordCount?: number
  tokenCount?: number
  createdDate?: string
}

interface Props {
  selectedCheckbox: string[]
  checkboxContent: FileCard[]
  gridColumn?: GridColumn
}

interface Emit {
  (e: 'update:selectedCheckbox', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const updateSelectedOption = (value: string[] | null) => {
  if (typeof value !== 'boolean' && value !== null)
    emit('update:selectedCheckbox', value)
}
</script>

<template>
  <VRow
    v-if="props.checkboxContent && props.selectedCheckbox"
    class="custom-input-wrapper"
  >
    <VCol
      v-for="item in props.checkboxContent"
      :key="item.title"
      v-bind="gridColumn"
    >
      <VLabel
        class="custom-input custom-checkbox rounded cursor-pointer"
        :class="props.selectedCheckbox.includes(item.value) ? 'active' : ''"
      >
        <div>
          <VCheckbox
            :model-value="props.selectedCheckbox"
            :value="item.value"
            @update:model-value="updateSelectedOption"
          />
        </div>
        <slot :item="item">
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-2">
              <h6 class="cr-title text-base">
                {{ item.title }}
              </h6>
              <VSpacer />
              <VIcon
                v-if="item.icon && typeof item.icon === 'string'"
                :icon="item.icon"
                :color="item.iconColor"
                size="32"
                class="text-disabled"
              />
              <span v-else-if="item.subtitle" class="text-disabled text-body-2">
                {{ item.subtitle }}
              </span>
            </div>
            <p class="text-sm mb-0">
              {{ item.desc }}
            </p>

            <!-- File Details Rows -->
            <div
              v-if="item.wordCount || item.size"
              class="file-details flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-disabled"
            >
              <span v-if="item.wordCount" class="detail-item">
                {{ item.wordCount.toLocaleString() }} words
              </span>

              <span v-if="item.size" class="detail-item">
                {{ item.size }}
              </span>
            </div>
            <div
              v-if="item.tokenCount || item.createdDate"
              class="file-details flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-disabled"
            >
              <span v-if="item.tokenCount" class="detail-item">
                {{ item.tokenCount.toLocaleString() }} tokens
              </span>

              <span v-if="item.createdDate" class="detail-item">
                {{ item.createdDate }}
              </span>
            </div>
          </div>
        </slot>
      </VLabel>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.custom-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  .v-checkbox {
    margin-block-start: -0.375rem;
  }

  .cr-title {
    font-weight: 500;
    line-height: 1.375rem;
  }
}

.file-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
  text-align: center;
}

.detail-item:first-child {
  text-align: left;
}

.detail-item:last-child {
  text-align: right;
}
</style>
