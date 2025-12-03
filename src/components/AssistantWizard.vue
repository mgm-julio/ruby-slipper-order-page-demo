<template>
  <VDialog v-model="dialog" max-width="1200" persistent>
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handleCancel" />

    <VCard>
      <VCardText>
        <!-- Stepper -->
        <AppStepper
          v-model:current-step="currentStep"
          :items="iconsSteps"
          align="center"
        />
      </VCardText>

      <VDivider />

      <VCardText class="flex-grow-1 overflow-y-auto">
        <!-- stepper content -->
        <VForm>
          <VWindow v-model="currentStep" class="disable-tab-transition">
            <!-- STEP 1: Provider -->
            <VWindowItem>
              <VRow>
                <VCol cols="12">
                  <h6 class="text-h5 mb-4">
                    Select Integration Provider (Optional)
                  </h6>
                  <p class="text-body-1 mb-6">
                    Choose a platform to integrate with your assistant, or skip
                    to see all available templates.
                    <br />You can always integrate any provider later.
                  </p>
                </VCol>

                <VCol cols="12" v-if="providers.length === 0">
                  <AddNewCardPlaceholder
                    sm="12"
                    lg="12"
                    cols="12"
                    icon="tabler-mood-confuzed"
                    title="Sorry... No Providers Available"
                    subtitle="Something is off. No providers were found. Please try again later"
                    :hoverable="false"
                  />
                </VCol>

                <VCol
                  v-else
                  v-for="provider in providers"
                  :key="provider.id"
                  cols="12"
                  md="4"
                >
                  <VCard
                    class="provider-card"
                    :class="{
                      'provider-card--selected':
                        selectedProvider?.id === provider.id,
                    }"
                    @click="selectProvider(provider)"
                  >
                    <VCardItem>
                      <VCardTitle class="d-flex align-center gap-3">
                        <VAvatar size="60" class="provider-logo" color="white">
                          <img
                            v-if="provider.avatarUrl"
                            :src="
                              providersStore.providerIconAvatars[
                                provider.avatarUrl
                              ]
                            "
                            :alt="provider.name"
                            style="
                              width: 100%;
                              height: 100%;
                              object-fit: contain;
                              display: block;
                            "
                          />
                          <VIcon v-else icon="tabler-plug" color="primary" />
                        </VAvatar>
                        <div>
                          <h6 class="text-h6">
                            {{
                              convertCase(provider.name, CaseStyles.Sentence)
                            }}
                          </h6>
                          <div class="d-flex gap-1 flex-wrap mt-2">
                            <VChip
                              v-for="category in Array.isArray(
                                provider.category
                              )
                                ? provider.category
                                : [provider.category]"
                              :key="category"
                              size="x-small"
                              color="primary"
                              variant="tonal"
                            >
                              {{ category }}
                            </VChip>
                          </div>
                        </div>
                      </VCardTitle>
                    </VCardItem>

                    <VCardText>
                      <p class="text-body-2" v-if="provider.description">
                        {{ provider.description }}
                      </p>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- STEP 2: Channels -->
            <VWindowItem>
              <VRow>
                <VCol cols="12">
                  <h6 class="text-h5 mb-4">Select Communication Channels</h6>
                  <p class="text-body-1 mb-6">
                    Choose how customers will interact with your assistant. You
                    can select multiple channels<span class="text-error">*</span
                    >. <br /><span class="text-error">*</span> Some templates
                    are optimized for specific channel types.
                  </p>
                </VCol>

                <VCol
                  v-for="channel in visibleChannels"
                  :key="channel.value"
                  cols="12"
                  md="4"
                >
                  <VCard
                    class="channel-card"
                    :class="{
                      'channel-card--selected': selectedChannels[channel.value],
                      'channel-card--disabled': channelDisabled(channel.value),
                    }"
                    @click="toggleChannel(channel.value)"
                    :aria-disabled="channelDisabled(channel.value)"
                  >
                    <VCardItem class="text-center pa-6">
                      <VAvatar :color="channel.color" size="60" class="mb-3">
                        <VIcon :icon="channel.icon" size="30" />
                      </VAvatar>
                      <VCardTitle>{{ channel.title }}</VCardTitle>
                      <VCardSubtitle>
                        {{ channel.description }}
                        <span
                          v-if="channelDisabled(channel.value)"
                          class="ml-1 text-disabled"
                          >(unavailable)</span
                        >
                      </VCardSubtitle>
                      <div class="d-flex justify-center">
                        <VCheckbox
                          v-model="selectedChannels[channel.value]"
                          class="mt-2"
                          @click.stop
                          :disabled="channelDisabled(channel.value)"
                        />
                      </div>
                    </VCardItem>
                  </VCard>
                </VCol>

                <VCol v-if="visibleChannels.length === 0" cols="12">
                  <AddNewCardPlaceholder
                    sm="12"
                    lg="12"
                    cols="12"
                    icon="tabler-mood-confuzed"
                    title="No Channels Available"
                    subtitle="This provider has no channels supported by current templates."
                    :hoverable="false"
                  />
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- STEP 3: Templates -->
            <VWindowItem>
              <VRow>
                <VCol cols="12">
                  <h6 class="text-h5 mb-4">Choose Assistant Template</h6>
                  <p class="text-body-1 mb-6">
                    These templates match your selection criteria. They will
                    contain all the prompt details and configurations to get you
                    started.
                  </p>
                </VCol>

                <VCol
                  v-for="template in filteredTemplates"
                  :key="template.id"
                  cols="12"
                  md="6"
                >
                  <VCard
                    class="template-card"
                    :class="{
                      'template-card--selected':
                        selectedTemplate?.id === template.id,
                    }"
                    @click="selectedTemplate = template"
                  >
                    <VCardItem>
                      <VCardTitle class="d-flex align-center gap-3">
                        <VAvatar
                          :color="
                            template.userConfiguration?.channels?.call
                              ? 'success'
                              : template.userConfiguration?.channels?.sms
                              ? 'info'
                              : 'warning'
                          "
                          size="40"
                        >
                          <VIcon
                            :icon="
                              template.userConfiguration?.channels?.call
                                ? 'tabler-phone'
                                : template.userConfiguration?.channels?.sms
                                ? 'tabler-message'
                                : 'tabler-message-chatbot'
                            "
                          />
                        </VAvatar>
                        <div>
                          <h6 class="text-h6">{{ template.name }}</h6>
                          <p class="text-caption mb-0">
                            {{
                              (template.features?.capabilities || []).join(', ')
                            }}
                          </p>
                        </div>
                      </VCardTitle>
                    </VCardItem>

                    <VCardText>
                      <p class="text-body-2 mb-3" v-if="template.description">
                        {{ template.description }}
                      </p>

                      <div class="d-flex gap-2 flex-wrap">
                        <VChip
                          v-for="industry in template.features?.industries ||
                          []"
                          :key="industry"
                          size="small"
                          color="primary"
                        >
                          {{ industry }}
                        </VChip>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <VCol cols="12" v-if="filteredTemplates.length === 0">
                  <AddNewCardPlaceholder
                    sm="12"
                    lg="12"
                    cols="12"
                    icon="tabler-mood-confuzed"
                    title="Sorry... No Templates Available"
                    subtitle="No templates found for your selected criteria"
                    :hoverable="false"
                  />
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
        </VForm>
      </VCardText>

      <!-- Footer -->
      <div class="d-flex justify-space-between mt-8 px-6 py-4">
        <div>
          <VBtn color="error" variant="tonal" @click="handleCancel">
            <VIcon icon="tabler-x" start class="flip-in-rtl" />
            Close
          </VBtn>
        </div>

        <div class="d-flex gap-4">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" />
            Previous
          </VBtn>

          <VBtn
            v-if="iconsSteps.length - 1 === currentStep"
            color="success"
            @click="handleCreate"
          >
            Create
            <VIcon icon="tabler-check" end class="flip-in-rtl" />
          </VBtn>

          <VBtn v-else @click="currentStep++">
            Next
            <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
          </VBtn>
        </div>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useAssistantTemplatesStore } from '@/stores/assistant-templates'
import { useProvidersStore } from '@/stores/providers'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// Stores / router
const router = useRouter()
const providersStore = useProvidersStore()
const templatesStore = useAssistantTemplatesStore()

// Props / emits
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const dialog = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Data
const providers = computed(() => providersStore.list)
const selectedProvider = ref<any>(null)
const selectedChannels = ref<Record<string, boolean>>({}) // boolean flags per channel
const selectedTemplate = ref<any>(null)
const currentStep = ref(0)

// Steps (icons)
const iconsSteps = [
  { title: 'Provider', icon: 'tabler-affiliate' },
  { title: 'Channel', icon: 'tabler-broadcast' },
  { title: 'Assistant', icon: 'tabler-headset' },
]

// Master channel catalog (static)
const channelCatalog = [
  {
    value: 'call',
    title: 'Voice Call',
    description: 'Phone conversations',
    icon: 'tabler-phone',
    color: 'success',
  },
  {
    value: 'sms',
    title: 'SMS',
    description: 'Text messaging',
    icon: 'tabler-message',
    color: 'info',
  },
  {
    value: 'webchat',
    title: 'Web Chat',
    description: 'Website chat widget',
    icon: 'tabler-message-chatbot',
    color: 'warning',
  },
]

// Helpers
const getTemplateChannels = (tpl: any): string[] => {
  const ch = tpl?.userConfiguration?.channels ?? {}
  return Object.keys(ch)
}

const providerKeyOf = (provider: any): string | null => {
  if (!provider) return null
  return (
    provider.integrationKey ||
    provider.slug ||
    String(provider.name || provider.id || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
  )
}

const templateSupportsProvider = (
  tpl: any,
  providerKey: string | null
): boolean => {
  if (!providerKey) return true
  const integrations: string[] = tpl?.features?.integrations ?? []
  return integrations.map(s => String(s).toLowerCase()).includes(providerKey)
}

const templateSupportsChannels = (
  tpl: any,
  selected: Record<string, boolean>
): boolean => {
  const wanted = Object.keys(selected).filter(k => selected[k])
  if (!wanted.length) return true
  const tplChannels = new Set(getTemplateChannels(tpl))
  return wanted.every(ch => tplChannels.has(ch))
}

// Provider selection
const selectProvider = (provider: any) => {
  selectedProvider.value = provider
}

// Fetch
onMounted(async () => {
  await Promise.all([
    providersStore.fetchProvidersData(),
    templatesStore.fetchTemplatesData(),
  ])
})

// Dynamic availability
const providerFilteredTemplates = computed(() => {
  const pKey = providerKeyOf(selectedProvider.value)
  return templatesStore.list.filter((tpl: any) =>
    templateSupportsProvider(tpl, pKey)
  )
})

const availableChannelKeys = computed<Set<string>>(() => {
  const set = new Set<string>()
  providerFilteredTemplates.value.forEach((tpl: any) => {
    getTemplateChannels(tpl).forEach(ch => set.add(ch))
  })
  return set
})

const visibleChannels = computed(() => channelCatalog)

// Keep state consistent if provider changes
watch([selectedProvider, availableChannelKeys], () => {
  const keys = availableChannelKeys.value
  let changed = false
  Object.keys(selectedChannels.value).forEach(k => {
    if (selectedChannels.value[k] && !keys.has(k)) {
      selectedChannels.value[k] = false
      changed = true
    }
  })
  if (
    changed &&
    selectedTemplate.value &&
    !filteredTemplates.value.some(t => t.id === selectedTemplate.value.id)
  ) {
    selectedTemplate.value = null
  }
})

// Inspect if channel is disabled
const channelDisabled = (value: string) =>
  !availableChannelKeys.value.has(value)

// Guard toggling when disabled
const toggleChannel = (channel: string) => {
  if (channelDisabled(channel)) return
  selectedChannels.value[channel] = !selectedChannels.value[channel]
}

// Final filtered templates (provider + channels)
const filteredTemplates = computed(() => {
  const pKey = providerKeyOf(selectedProvider.value)
  return templatesStore.list
    .filter((tpl: any) => templateSupportsProvider(tpl, pKey))
    .filter((tpl: any) => templateSupportsChannels(tpl, selectedChannels.value))
})

// Actions
const resetWizard = () => {
  selectedProvider.value = null
  selectedChannels.value = {}
  selectedTemplate.value = null
  currentStep.value = 0
}

const handleCreate = () => {
  if (selectedTemplate.value) {
    router.push({
      name: 'assistants-id',
      params: { id: 'new' },
      query: { templateId: selectedTemplate.value.id },
    })
    dialog.value = false
    resetWizard()
  }
}

const handleCancel = () => {
  dialog.value = false
  resetWizard()
}
</script>

<style scoped>
.provider-card,
.channel-card,
.template-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background: linear-gradient(145deg, #ffffff, #f8f9fa) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.provider-card--selected,
.channel-card--selected,
.template-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: linear-gradient(
    145deg,
    rgba(var(--v-theme-primary), 0.05),
    rgba(var(--v-theme-primary), 0.1)
  ) !important;
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.25);
}

.channel-card--disabled {
  opacity: 0.5;
  filter: grayscale(1);
  cursor: not-allowed;
}
</style>
