import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const VariableHighlighter = Extension.create({
  name: 'variableHighlighter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variableHighlighter'),
        props: {
          decorations: ({ doc }) => {
            const decorations: Decoration[] = []

            const regex = /{{\s*[\w.]+\s*}}/g

            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              let match

              while ((match = regex.exec(text)) !== null) {
                const start = pos + match.index
                const end = start + match[0].length

                decorations.push(
                  Decoration.inline(start, end, {
                    class: 'highlight-variable',
                  })
                )
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
