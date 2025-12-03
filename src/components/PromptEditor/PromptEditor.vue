<template>
  <VCard>
    <VToolbar v-if="!readonly" flat density="comfortable">
      <VBtn @click="toggleHeading(2)" icon><VIcon>tabler-h-1</VIcon></VBtn>
      <VBtn @click="toggleHeading(3)" icon><VIcon>tabler-h-2</VIcon></VBtn>
      <VBtn @click="toggleHeading(4)" icon><VIcon>tabler-h-3</VIcon></VBtn>
      <VBtn @click="toggleBold" icon><VIcon>tabler-bold</VIcon></VBtn>
      <VBtn @click="toggleBulletList" icon><VIcon>tabler-list</VIcon></VBtn>
      <VBtn @click="toggleOrderedList" icon
        ><VIcon>tabler-list-numbers</VIcon></VBtn
      >
      <VBtn @click="toggleCodeBlock" icon><VIcon>tabler-braces</VIcon></VBtn>
      <VSpacer />
      <VBtn @click="toggleRaw" icon>
        <VIcon>{{ showRaw ? 'tabler-html' : 'tabler-code' }}</VIcon>
      </VBtn>
    </VToolbar>

    <!-- Shared visual shell -->
    <div class="editor-surface">
      <!-- TipTap view -->
      <div v-show="!showRaw" ref="editorContent" class="editor-host" />

      <!-- Code view -->
      <div v-show="showRaw" class="editor-host">
        <VTextarea
          v-model="model"
          variant="plain"
          auto-grow
          class="editor-raw"
          :readonly="!!readonly"
        />
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AutoBoldWords } from './extensions/AutoBoldWords'
import { VariableHighlighter } from './extensions/VariableHighlighter'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const props = defineProps<{ modelValue?: string; readonly?: boolean }>()
const emit = defineEmits(['update:modelValue'])

const showRaw = ref(false)
const model = computed({
  get: () => props.modelValue || '',
  set: val => emit('update:modelValue', val),
})

const editorContent = ref<HTMLElement | null>(null)
let editor: any

// Lazy converter instances
let md: any
let turndown: any
const ensureConverters = async () => {
  if (!md) {
    const { default: MarkdownIt } = await import('markdown-it')
    md = new MarkdownIt()
  }
  if (!turndown) {
    const { default: TurndownService } = await import('turndown')
    turndown = new TurndownService()
  }
}

const toggleRaw = async () => {
  if (showRaw.value && editor) {
    await ensureConverters()
    editor.commands.setContent(md.render(model.value || ''))
    editor.commands.focus()
  }
  showRaw.value = !showRaw.value
}

watch(
  () => props.modelValue,
  async val => {
    if (!editor) return
    await ensureConverters()
    const safeVal = val || ''
    if (safeVal !== turndown.turndown(editor.getHTML())) {
      editor.commands.setContent(md.render(safeVal))
    }
  }
)

onMounted(async () => {
  await ensureConverters()

  // 💡 Lazy-load tiptap core + only the extensions you actually use
  const [
    { Editor },
    { default: Document },
    { default: Paragraph },
    { default: Text },
    { default: Heading },
    { default: Bold },
    { default: BulletList },
    { default: OrderedList },
    { default: ListItem },
    { default: CodeBlock },
    { default: History },
    { default: Dropcursor },
    { default: Gapcursor },
  ] = await Promise.all([
    import('@tiptap/core'),
    import('@tiptap/extension-document'),
    import('@tiptap/extension-paragraph'),
    import('@tiptap/extension-text'),
    import('@tiptap/extension-heading'),
    import('@tiptap/extension-bold'),
    import('@tiptap/extension-bullet-list'),
    import('@tiptap/extension-ordered-list'),
    import('@tiptap/extension-list-item'),
    import('@tiptap/extension-code-block'),
    import('@tiptap/extension-history'),
    import('@tiptap/extension-dropcursor'),
    import('@tiptap/extension-gapcursor'),
  ])

  editor = new Editor({
    element: editorContent.value!,
    editable: !props.readonly,
    content: md.render(props.modelValue || ''),
    extensions: [
      // minimal schema for your toolbar
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Bold,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      History,
      Dropcursor,
      Gapcursor,

      // your custom PM plugins
      VariableHighlighter,
      AutoBoldWords.configure({ words: ['important', 'dangerous'] }),
    ],
    onUpdate: () => {
      if (!props.readonly) {
        const mdValue = turndown.turndown(editor.getHTML())
        emit('update:modelValue', mdValue)
      }
    },
  })
})

onBeforeUnmount(() => editor?.destroy())

// Toolbar actions (unchanged)
const toggleHeading = (level: HeadingLevel) =>
  editor.chain().focus().toggleHeading({ level }).run()
const toggleBold = () => editor.chain().focus().toggleBold().run()
const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
const toggleCodeBlock = () =>
  editor.chain().focus().toggleCodeBlock({ language: 'json' }).run()
</script>

<style scoped>
/* One surface look for both modes */
.editor-surface {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px;
  background: rgb(var(--v-theme-surface));
  transition: border-color 0.2s ease;
}

.editor-surface:focus-within {
  border-color: rgb(var(--v-theme-primary));
}

/* Host ensures consistent padding for both TipTap and raw textarea */
.editor-host {
  min-block-size: 300px;
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgb(var(--v-theme-outline));
}

.editor-raw :deep(.v-field) {
  padding: 0 !important;
  box-shadow: none !important;
  border: 0 !important;
  background: transparent !important;
}

.editor-raw :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  block-size: 100% !important;
  padding: 1rem;
  resize: vertical;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

/* Your custom marks */
:deep(.highlight-variable) {
  border-radius: 4px;
  color: rgb(var(--v-theme-info));
  font-weight: 500;
  padding: 0 4px;
  font-family: monospace;
}

:deep(.auto-bold) {
  font-weight: bold;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface));
}

/* TipTap core node */
:deep(.ProseMirror) {
  block-size: 100%;
  min-block-size: 300px;
  padding: 1rem 1.5rem;
  outline: none;
  white-space: pre-wrap;
  cursor: text;
}

:deep(.ProseMirror) ul,
:deep(.ProseMirror) ol {
  list-style-position: inside;
  padding-left: 0;
  margin: 0.5rem 0;
}

:deep(.ProseMirror) li {
  margin: 0.25rem 0;
}

:deep(.ProseMirror) li > p {
  display: inline;
  margin: 0;
}

:deep(.ProseMirror) ul ul,
:deep(.ProseMirror) ol ol {
  padding-left: 1rem;
}

/* Setup tip-tap content styling */
:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3),
:deep(.ProseMirror h4),
:deep(.ProseMirror h5),
:deep(.ProseMirror h6) {
  margin-top: 1rem; /* space above */
  margin-bottom: 0.5rem; /* space below */
  line-height: 1.25;
  font-weight: 600;
}

/* If a heading is the first thing in the editor, remove the extra top space */
:deep(.ProseMirror h1:first-child),
:deep(.ProseMirror h2:first-child),
:deep(.ProseMirror h3:first-child),
:deep(.ProseMirror h4:first-child),
:deep(.ProseMirror h5:first-child),
:deep(.ProseMirror h6:first-child) {
  margin-top: 0;
}
</style>
