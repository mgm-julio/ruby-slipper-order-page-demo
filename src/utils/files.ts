import { FileSource, FileStatus } from '@/modules/files/types/file-node'

const ALLOWED_FILE_EXTENSIONS: Record<string, string> = {
  pdf: 'pdf',
  txt: 'txt',
  csv: 'csv',
  doc: 'doc',
  docx: 'doc',
  xls: 'xls',
  xlsx: 'xls',
  md: 'txt',
}

const VIRTUAL_EXTENSIONS_MAP: Record<string, string> = {
  ...ALLOWED_FILE_EXTENSIONS,
  html: 'html',
  com: 'www',
  io: 'www',
  net: 'www',
  org: 'www',
  edu: 'www',
}

const VIRTUAL_EXTENSIONS_DETAILS: Record<
  string,
  { icon: string; color: string }
> = {
  pdf: { icon: 'tabler-file-type-pdf', color: 'error' },
  doc: { icon: 'tabler-file-type-doc', color: 'info' },
  xls: { icon: 'tabler-file-type-xls', color: 'success' },
  csv: { icon: 'tabler-file-type-csv', color: 'primary' },
  txt: { icon: 'tabler-file-type-txt', color: 'secondary' },
  xml: { icon: 'tabler-file-type-xml', color: 'primary' },
  html: { icon: 'tabler-file-type-html', color: 'primary' },
  www: { icon: 'tabler-world-www', color: 'primary' },
  unknown: { icon: 'tabler-file-unknown', color: 'grey' },
}

export function getVirtualFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''

  return VIRTUAL_EXTENSIONS_MAP[ext] ?? 'unknown'
}

export function getAllowedFileExtensions(): string[] {
  return Object.keys(ALLOWED_FILE_EXTENSIONS)
}

export function hasAllowedFileExtension(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''

  return Object.keys(ALLOWED_FILE_EXTENSIONS).includes(ext)
}

export function getVirtualFileExtensionDetails(name: string): {
  icon: string
  color: string
} {
  const type = getVirtualFileType(name)

  return VIRTUAL_EXTENSIONS_DETAILS[type]
}

export async function calculateSHA256(file: File | Blob): Promise<string> {
  const buffer = await file.slice(0, file.size).arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getStatusColor(status: FileStatus) {
  switch (status) {
    case FileStatus.Pending:
      return 'grey'
    case FileStatus.Uploaded:
      return 'primary'
    case FileStatus.Processed:
      return 'success'
    case FileStatus.Error:
      return 'error'
    default:
      return 'grey'
  }
}

export function getSourceColor(source: FileSource) {
  switch (source) {
    case FileSource.Upload:
      return 'primary'
    case FileSource.Scrape:
      return 'info'
    case FileSource.Notes:
      return 'success'
    case FileSource.FAQ:
      return 'warning'
    case FileSource.Integration:
      return 'secondary'
    default:
      return 'grey'
  }
}

export function getStatusIcon(status: FileStatus): string {
  switch (status) {
    case FileStatus.Pending:
      return 'tabler-cloud-up'
    case FileStatus.Uploaded:
      return 'tabler-check'
    case FileStatus.Processed:
      return 'tabler-checks'
    case FileStatus.Error:
      return 'tabler-exclamation-circle'
    default:
      return 'tabler-question-mark'
  }
}
