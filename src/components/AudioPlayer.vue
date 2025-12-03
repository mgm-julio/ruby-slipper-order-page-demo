<template>
  <div class="waveform-container">
    <VBtn
      :icon="isPlaying ? 'tabler-player-pause' : 'tabler-player-play'"
      variant="tonal"
      color="primary"
      rounded
      @click="togglePlay"
    />
    <div ref="waveform" class="waveform" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import WaveSurfer from 'wavesurfer.js'

const props = defineProps<{
  audioUrl: string | null
}>()

const waveform = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
let wave: WaveSurfer | null = null

const initWaveform = () => {
  if (wave) {
    wave.destroy()
  }

  wave = WaveSurfer.create({
    container: waveform.value!,
    waveColor: '#aaa',
    progressColor: '#5a5aff',
    barWidth: 2,
    height: 80,
    cursorWidth: 1,
    url: props.audioUrl as string,
  })

  wave.on('finish', () => {
    isPlaying.value = false
  })
}

const togglePlay = () => {
  if (wave) {
    wave.playPause()
    isPlaying.value = wave.isPlaying()
  }
}

onMounted(() => {
  initWaveform()
})

onBeforeUnmount(() => {
  wave?.destroy()
})

watch(
  () => props.audioUrl,
  () => {
    initWaveform()
  }
)
</script>

<style scoped>
.waveform-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.waveform {
  flex-grow: 1;
  height: 100px;
  padding-top: 0.5rem;
}

.waveform canvas {
  display: block;
  height: 100% !important; /* Force it to fill the container vertically */
}
</style>
