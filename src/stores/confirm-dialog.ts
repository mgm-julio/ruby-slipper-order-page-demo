import { defineStore } from 'pinia'
import { ref } from 'vue'

type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

export const useConfirmDialogStore = defineStore('confirmDialog', () => {
  const visible = ref(false)
  const options = ref<ConfirmOptions | null>(null)

  function open(opts: ConfirmOptions) {
    options.value = {
      title: 'Are you sure?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      ...opts,
    }
    visible.value = true
  }

  function confirm() {
    options.value?.onConfirm()
    close()
  }

  function close() {
    visible.value = false
    options.value = null
  }

  return { visible, options, open, confirm, close }
})
