<template>
  <VDialog
    v-model="dialog"
    max-width="800"
    @update:model-value="value => !value && handleClose"
  >
    <VCard>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardText>
        <AppStepper
          v-model:current-step="currentStep"
          :items="steps"
          class="stepper-icon-step-bg"
        />
      </VCardText>

      <VDivider />

      <VCardText>
        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
        >
          <VWindowItem
            v-for="(step, index) in steps"
            :key="index"
          >
            <VForm :ref="el => setFormRef(index, el)">
              <component
                :is="step.component"
                v-model:form-data="stepData[index]"
                :options="step.options"
              />
            </VForm>
          </VWindowItem>
        </VWindow>

        <div class="d-flex flex-wrap gap-4 justify-space-between mt-8">
          <div class="d-flex gap-2">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="handleClose"
            >
              Cancel
            </VBtn>

            <VBtn
              v-if="currentStep > 0"
              color="secondary"
              variant="tonal"
              @click="currentStep--"
            >
              <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" />
              Previous
            </VBtn>
          </div>

          <div>
            <VBtn
              v-if="steps.length - 1 === currentStep"
              color="success"
              @click="handleSubmit"
            >
              Submit
            </VBtn>

            <VBtn
              v-else
              @click="handleNext"
            >
              Next
              <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface WizardStep {
  title: string
  subtitle: string
  component: any
  options?: any
}

interface Props {
  modelValue: boolean
  title: string
  steps: WizardStep[]
  initialData: any[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentStep = ref(0)
const stepData = ref([...props.initialData])
const formRefs = ref<any[]>([])

const setFormRef = (index: number, el: any) => {
  if (el) {
    formRefs.value[index] = el
  }
}

const handleClose = () => {
  dialog.value = false
  currentStep.value = 0
  stepData.value = [...props.initialData]
}

const handleNext = async () => {
  const form = formRefs.value[currentStep.value]
  if (!form) return

  const validation = await form.validate()
  if (!validation.valid) return

  currentStep.value++
}

const handleSubmit = async () => {
  const form = formRefs.value[currentStep.value]
  if (!form) return

  const validation = await form.validate()
  if (!validation.valid) return

  emit('submit', stepData.value)
  handleClose()
}
</script>
