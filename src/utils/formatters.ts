import type { FileNode } from '@/modules/files/types/file-node'

export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mmss}`
  }

  return mmss
}

export function formatPhoneNumber(phoneNumber: string): string {
  return !phoneNumber
    ? '-'
    : phoneNumber
        .replace(/[^\d]+/g, '')
        .replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
}

export function cleanPhoneNumber(
  phoneNumber: string | null | undefined
): string | null {
  if (!phoneNumber) {
    return null
  }
  let clean: string | null = phoneNumber.replace(/[^\d+]/g, '')
  if (!clean || clean === '+') {
    clean = null
  }

  return clean
}

export function shortenFileName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name
  const extIndex = name.lastIndexOf('.')
  const base = name.slice(0, extIndex)
  const ext = name.slice(extIndex)

  const truncated = base.slice(0, maxLength - ext.length - 3)

  return `${truncated}..${ext}`
}

export function createVirtualFileFromNode(node: FileNode): File {
  const blob = new Blob(['']) // placeholder content
  const file = new File([blob], node.name, {
    type: node.mime || 'application/octet-stream',
  })

  if (node.size != null) {
    Object.defineProperty(file, 'size', {
      value: node.size,
      writable: false,
    })
  }

  return file
}

// Case styles
export enum CaseStyles {
  Camel = 'camel',
  Pascal = 'pascal',
  Snake = 'snake',
  Kebab = 'kebab',
  Title = 'title',
  Sentence = 'sentence',
}

/**
 * Capitalize the first letter of a string
 *
 * @param word
 * @returns
 */
function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
/**
 * Convert text between common case styles.
 *
 * @param input
 * @param style
 * @returns
 */
export function convertCase(input: string, style: CaseStyles): string {
  if (!input) return ''

  // Normalize to words
  let words = input
    // camelCase: add space before capitals
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // kebab / snake / dot: replace with space
    .replace(/[-_.]/g, ' ')
    // collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

  // Lowercase all words for consistency
  words = words.map(w => w.toLowerCase())

  switch (style) {
    case CaseStyles.Camel:
      return words.map((w, i) => (i === 0 ? w : capitalize(w))).join('')

    case CaseStyles.Pascal:
      return words.map(capitalize).join('')

    case CaseStyles.Snake:
      return words.join('_')

    case CaseStyles.Kebab:
      return words.join('-')

    case CaseStyles.Title:
      return words.map(capitalize).join(' ')

    case CaseStyles.Sentence:
      return capitalize(words.join(' '))

    default:
      return input
  }
}
