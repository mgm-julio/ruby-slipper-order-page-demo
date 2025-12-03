<script setup lang="ts">
import { ref } from 'vue'

export type StructuredDataField = {
  required?: boolean
  description: string
  type: string
  enum?: string[]
}

const props = defineProps<{
  modelValue: Record<string, StructuredDataField>
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, StructuredDataField>): void
}>()

const newEnumValue = ref('')
const fieldIds = ref<Record<string, string>>({})

const getFieldId = (fieldName: string) => {
  if (!fieldIds.value[fieldName]) {
    fieldIds.value[fieldName] = `field_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`
  }
  return fieldIds.value[fieldName]
}

const fieldTypes = [
  { title: 'String', value: 'string' },
  { title: 'Number', value: 'number' },
  { title: 'Boolean', value: 'boolean' },
  { title: 'Enum', value: 'enum' },
]

const addField = () => {
  if (props.readonly) return
  const newFields = { ...props.modelValue }
  const fieldName = `field_${Object.keys(newFields).length + 1}`
  newFields[fieldName] = {
    required: false,
    description: '',
    type: 'string',
    enum: [],
  }
  emit('update:modelValue', newFields)
}

const removeField = (fieldName: string) => {
  if (props.readonly) return
  const newFields = { ...props.modelValue }
  delete newFields[fieldName]
  emit('update:modelValue', newFields)
}

const updateField = (
  fieldName: string,
  key: keyof StructuredDataField,
  value: any
) => {
  if (props.readonly) return
  const newFields = { ...props.modelValue }
  newFields[fieldName] = {
    ...newFields[fieldName],
    [key]: value,
  }
  emit('update:modelValue', newFields)
}

const updateEnumValues = (fieldName: string, value: string) => {
  if (props.readonly) return
  if (!value) {
    updateField(fieldName, 'enum', [])
    return
  }
  const enumValues = value
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0)
  updateField(fieldName, 'enum', enumValues)
}

const removeEnumValue = (fieldName: string, valueToRemove: string) => {
  if (props.readonly) return
  const field = props.modelValue[fieldName]
  const newValues = field.enum?.filter(v => v !== valueToRemove) || []
  updateField(fieldName, 'enum', newValues)
}

const addEnumValue = (fieldName: string, value: string) => {
  if (props.readonly || !value) return
  const field = props.modelValue[fieldName]
  const currentValues = field.enum || []
  if (!currentValues.includes(value)) {
    updateField(fieldName, 'enum', [...currentValues, value])
  }
}

const handleAddEnumValue = (fieldName: string) => {
  addEnumValue(fieldName, newEnumValue.value)
  newEnumValue.value = ''
}

const getEnumString = (field: StructuredDataField) => {
  return field.enum?.join(', ') || ''
}

const renameField = (oldName: string, newName: string) => {
  if (props.readonly || oldName === newName) return

  const newFields = { ...props.modelValue }
  newFields[newName] = newFields[oldName]
  delete newFields[oldName]

  // Update the ID mapping
  fieldIds.value[newName] = fieldIds.value[oldName]
  delete fieldIds.value[oldName]

  emit('update:modelValue', newFields)
}
</script>

<template>
  <div class="structured-data-fields">
    <div
      v-for="(field, fieldName) in modelValue"
      :key="getFieldId(fieldName)"
      class="field-container mb-4"
    >
      <VCard variant="outlined" class="pa-4">
        <VRow>
          <VCol cols="12" md="4">
            <AppTextField
              :model-value="fieldName"
              label="Field Name"
              :readonly="readonly"
              @update:model-value="(val: string) => renameField(fieldName, val)"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect
              :model-value="field.type"
              label="Type"
              :items="fieldTypes"
              item-title="title"
              item-value="value"
              :readonly="readonly"
              @update:model-value="(val: string) => updateField(fieldName, 'type', val)"
            />
          </VCol>

          <VCol cols="12" md="3" class="d-flex align-center">
            <VCheckbox
              :model-value="field.required"
              label="Required"
              class="mt-4"
              :disabled="!!readonly"
              @update:model-value="(val: boolean | null) => updateField(fieldName, 'required', val)"
            />
          </VCol>

          <VCol cols="12" md="1" class="d-flex align-center">
            <VBtn
              v-if="!readonly"
              icon
              variant="text"
              color="error"
              @click="removeField(fieldName)"
            >
              <VIcon icon="tabler-trash" />
            </VBtn>
          </VCol>

          <VCol cols="12">
            <AppTextField
              :model-value="field.description"
              label="Description"
              :readonly="readonly"
              @update:model-value="(val: string) => updateField(fieldName, 'description', val)"
            />
          </VCol>

          <VCol v-if="field.type === 'enum'" cols="12">
            <label class="text-body-1 font-weight-medium mb-2 d-block"
              >Enum Values</label
            >
            <div class="d-flex flex-column gap-2">
              <form
                v-if="!readonly"
                @submit.prevent="handleAddEnumValue(fieldName)"
                class="d-flex gap-2"
              >
                <AppTextField
                  v-model="newEnumValue"
                  placeholder="Add new value"
                />
                <VBtn icon variant="tonal" type="submit">
                  <VIcon icon="tabler-plus" />
                </VBtn>
              </form>

              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="value in field.enum"
                  :key="value"
                  :closable="!readonly"
                  @click:close="removeEnumValue(fieldName, value)"
                >
                  {{ value }}
                </VChip>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCard>
    </div>

    <VBtn
      v-if="!readonly"
      prepend-icon="tabler-plus"
      variant="tonal"
      @click="addField"
    >
      Add Field
    </VBtn>
  </div>
</template>

<style lang="scss" scoped>
.structured-data-fields {
  .field-container {
    position: relative;
  }
}
</style>
