const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('en')

export function formatCompact(value: number): string { return compact.format(value) }
export function formatNumber(value: number): string { return whole.format(value) }

export function formatTime(iso: string | undefined): string {
  if (!iso) return '—'
  const time = Date.parse(iso)
  return Number.isFinite(time) ? new Date(time).toLocaleTimeString() : iso
}

export function formatDateTime(value: string | undefined): string {
  if (!value) return '—'
  const time = Date.parse(value)
  return Number.isFinite(time) ? new Date(time).toLocaleString() : value
}

/** Hermes Kanban board order (plugins/kanban dashboard), followed by less common states. */
export const TASK_STATUS_ORDER = ['triage', 'todo', 'scheduled', 'ready', 'running', 'blocked', 'review', 'done', 'archived']
export const CORE_TASK_STATUSES = ['todo', 'ready', 'running', 'review', 'done']

export function orderedStatuses(statuses: Iterable<string>, includeCore = false): string[] {
  const set = new Set([...statuses].map((status) => status.toLowerCase()))
  if (includeCore) CORE_TASK_STATUSES.forEach((status) => set.add(status))
  const known = TASK_STATUS_ORDER.filter((status) => set.has(status))
  const extra = [...set].filter((status) => !TASK_STATUS_ORDER.includes(status)).sort()
  return [...known, ...extra]
}

export function statusTone(status: string): 'good' | 'unknown' | 'muted' | 'bad' | 'info' {
  switch (status.toLowerCase()) {
    case 'running': case 'active': case 'ok': return 'good'
    case 'review': case 'ready': case 'scheduled': return 'info'
    case 'blocked': case 'failed': case 'error': return 'bad'
    case 'done': case 'archived': case 'completed': case 'disabled': return 'muted'
    default: return 'unknown'
  }
}

/** Indonesian labels for the task statuses used on the Kanban board. */
export const STATUS_LABELS_ID: Record<string, string> = {
  triage: 'Penyaringan',
  todo: 'Rencana',
  scheduled: 'Terjadwal',
  ready: 'Siap Kerja',
  running: 'Sedang Berjalan',
  blocked: 'Terkendala',
  review: 'Menunggu Review',
  done: 'Selesai',
  archived: 'Diarsipkan',
}

/** Falls back to the raw status so unknown board columns still render. */
export function statusLabelId(status: string): string {
  return STATUS_LABELS_ID[status.toLowerCase()] ?? status
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Display name for an agent: its Hermes profile name as-is. */
export function agentLabel(profile: string | undefined): string {
  return profile ?? 'Hermes'
}

/** The server's agent role ids (`Hermes profile`, `OpenCode`) in Indonesian. */
export const ROLE_LABELS_ID: Record<string, string> = {
  'Hermes profile': 'Profil Hermes',
  OpenCode: 'OpenCode',
}

/** Falls back to the raw role so an unlisted one still renders. */
export function roleLabel(role: string | undefined): string {
  return role ? ROLE_LABELS_ID[role] ?? role : 'Hermes'
}

/**
 * Indonesian labels for the Office work states. The server keeps the English
 * ids (`OfficeState` in types.ts); only the presentation changes, so tests and
 * API payloads stay stable.
 */
export const OFFICE_STATE_LABELS_ID: Record<string, string> = {
  Idle: 'Santai',
  Working: 'Bekerja',
  Reviewing: 'Meninjau',
  Collaborating: 'Kolaborasi',
  Offline: 'Luring',
  Unknown: 'Tidak Diketahui',
}

/** Falls back to the raw state so an unlisted state still renders. */
export function officeStateLabel(state: string): string {
  return OFFICE_STATE_LABELS_ID[state] ?? state
}

/** The office adds a note when it placed an idle agent itself. */
export function officeStateText(state: string): string {
  return state === 'Idle' ? 'Santai · penempatan terkelola' : officeStateLabel(state)
}

/** The two office rooms; the server's room ids stay English. */
export const ROOM_LABELS_ID: Record<string, string> = { Workspace: 'Ruang Kerja', Lounge: 'Ruang Santai' }

export function roomLabel(room: string): string {
  return ROOM_LABELS_ID[room] ?? room
}

/** A station's state plus, when there is one, the activity that explains it. */
export function stationActivityText(state: string, activity?: string): string {
  return activity ? `${officeStateText(state)} · ${activity}` : officeStateText(state)
}
