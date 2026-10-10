export const navigation = ['Office', 'Agents', 'Usage', 'Task Board', 'Build', 'Calendar', 'Activity', 'Memory', 'Folders', 'Logs', 'Settings'] as const
export type Page = typeof navigation[number]

/** The page shown when the address names no page (or an unknown one). */
export const HOME: Page = 'Office'

export function pageSlug(page: Page): string {
  return page.toLowerCase().replace(/\s+/g, '-')
}

/** Indonesian menu labels; the slugs stay English so existing links keep working. */
export const PAGE_LABELS_ID: Record<string, string> = {
  Office: 'Kantor',
  Agents: 'Agen',
  Usage: 'Pemakaian',
  'Task Board': 'Papan Tugas',
  Build: 'Build',
  Calendar: 'Kalender',
  Activity: 'Aktivitas',
  Memory: 'Memori',
  Folders: 'Folder',
  Logs: 'Log',
  Settings: 'Pengaturan',
}

export function pageLabel(page: string): string {
  return PAGE_LABELS_ID[page] ?? page
}

export function pageFromHash(hash: string): Page {
  const slug = hash.replace(/^#\/?/, '').split('/')[0].toLowerCase()
  if (slug === 'knowledge') return 'Memory'
  // The Dashboard's statistics now live in the Office HUD and panel.
  if (slug === 'dashboard') return 'Office'
  return navigation.find((page) => pageSlug(page) === slug) ?? HOME
}
