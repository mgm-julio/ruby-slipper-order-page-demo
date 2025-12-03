<script setup lang="ts">
import type { ThemeSwitcherTheme } from '@layouts/types';

const themes: ThemeSwitcherTheme[] = [
  {
    name: 'light',
    icon: 'tabler-sun',
  },
  {
    name: 'dark',
    icon: 'tabler-moon',
  },
  {
    name: 'system',
    icon: 'tabler-device-desktop',
  },
]
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
