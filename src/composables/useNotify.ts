import { ref } from 'vue'

const isOpen = ref(false)
const message = ref('')
const color = ref('success')
let timeoutHandle: ReturnType<typeof setTimeout> | null = null

interface NotifyOptions {
  message: string
  color?: string
  timeout?: number
}

export function useNotify() {
  function notify({ message: msg, color: clr = 'success', timeout = 3000 }: NotifyOptions) {
    message.value = msg
    color.value = clr
    isOpen.value = true
    if (timeoutHandle) clearTimeout(timeoutHandle)
    timeoutHandle = setTimeout(() => { isOpen.value = false }, timeout)
  }
  return { isOpen, message, color, notify }
} 
