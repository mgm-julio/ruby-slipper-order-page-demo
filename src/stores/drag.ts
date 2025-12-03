import type { FileNode } from '@/modules/files/types/file-node'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNodeDragStore = defineStore('drag', () => {
  const draggingFile = ref<FileNode | null>(null)
  const dragSource = ref<'tree' | 'grid' | null>(null)
  const dragTarget = ref<FileNode | null>(null)
  const isDragging = ref(false)
  const cursorX = ref(0)
  const cursorY = ref(0)

  function start(file: FileNode, source: 'tree' | 'grid') {
    draggingFile.value = file
    dragSource.value = source
    isDragging.value = true
  }

  function setTarget(folder: FileNode | null) {
    dragTarget.value = folder
  }

  function leaveTarget(folder: FileNode) {
    if (dragTarget.value?.fileId === folder.fileId) {
      dragTarget.value = null
    }
  }

  function completeDrop(): { file: FileNode; target: FileNode } | null {
    const file = draggingFile.value
    const target = dragTarget.value
    clear()
    if (file && target) return { file, target }

    return null
  }

  function clear() {
    draggingFile.value = null
    dragTarget.value = null
    dragSource.value = null
    isDragging.value = false
  }

  return {
    draggingFile,
    dragSource,
    dragTarget,
    isDragging,
    cursorX,
    cursorY,
    start,
    setTarget,
    leaveTarget,
    completeDrop,
    clear,
  }
})
