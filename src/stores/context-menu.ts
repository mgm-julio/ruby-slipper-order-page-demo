import { confirmAndDelete } from '@/modules/files/composables/file-actions'
import type { FileNode } from '@/modules/files/types/file-node'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useContextMenuStore = defineStore('contextMenu', () => {
  const visible = ref(false)
  const x = ref(0)
  const y = ref(0)
  const item = ref<FileNode | null>(null)

  const fs = useFileSystemStore()

  function open(payload: { item: FileNode; x: number; y: number }) {
    const isRoot = payload.item.fileId === 'root'
    const isSelectedFolder = payload.item.fileId === fs.currentFolder?.fileId

    if (isRoot || isSelectedFolder) {
      return
    }

    item.value = payload.item
    x.value = payload.x
    y.value = payload.y
    visible.value = true
  }

  function close() {
    visible.value = false
    item.value = null
  }

  async function trigger(action: string) {
    if (!item.value) return

    switch (action) {
      case 'edit':
        fs.selectFile(item.value)
        break
      case 'download':
        fs.downloadFile(item.value)
        break
      case 'delete':
        visible.value = false
        await confirmAndDelete(item.value)
        break
    }

    close()
  }

  const availableActions = computed(() => {
    if (!item.value) return []

    const actions: string[] = []
    const isRoot = item.value.fileId === 'root'
    const isSelected = [fs.selected?.fileId, fs.currentFolder?.fileId].includes(
      item.value.fileId
    )

    if (!isSelected && !isRoot) {
      actions.push('delete')
    }

    if (item.value.mime !== 'directory') {
      actions.push('edit')
      actions.push('download')
    }

    return actions
  })

  return {
    visible,
    x,
    y,
    item,
    open,
    close,
    trigger,
    availableActions,
  }
})
