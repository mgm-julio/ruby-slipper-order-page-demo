// extensions/AutoBoldWords.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const AutoBoldWords = Extension.create({
  name: 'autoBoldWords',

  // List of words to auto-bold
  addOptions() {
    return {
      words: ['ASAP', 'important'],
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoBoldWords'),
        props: {
          decorations: ({ doc }) => {
            const decorations: Decoration[] = []
            const regex = new RegExp(`\\b(${this.options.words.join('|')})\\b`, 'gi')

            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              let match

              while ((match = regex.exec(text)) !== null) {
                const start = pos + match.index
                const end = start + match[0].length

                decorations.push(
                  Decoration.inline(start, end, {
                    class: 'auto-bold',
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
