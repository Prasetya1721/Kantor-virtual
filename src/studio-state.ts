/**
 * Studio Shopee: state for the affiliate content pipeline.
 *
 * Pure functions kept apart from the page so they can be tested. State lives in
 * localStorage per browser (this dashboard is read-only towards the server) and
 * every count is derived from the content list — never stored separately.
 */

export type StudioStage = 'riset' | 'naskah' | 'video' | 'upload'

export const STUDIO_STAGES: StudioStage[] = ['riset', 'naskah', 'video', 'upload']

export const STAGE_LABELS_ID: Record<StudioStage, string> = {
  riset: 'Riset',
  naskah: 'Naskah',
  video: 'Video',
  upload: 'Upload',
}

/** The weekly quota Oppa asked for: at least five finished contents per period. */
export const QUOTA_PER_PERIOD = 5

export interface StudioContent {
  id: string
  title: string
  product: string
  stage: StudioStage
  createdAt: string
  updatedAt: string
}

export interface StudioPeriod {
  /** ISO date (yyyy-mm-dd) the period started, Monday of that week. */
  startedAt: string
  archivedAt?: string
  contents: StudioContent[]
}

export const periodKey = (date: Date): string => {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // Monday of the week (ISO weeks start on Monday).
  const weekday = (day.getUTCDay() + 6) % 7
  day.setUTCDate(day.getUTCDate() - weekday)
  return day.toISOString().slice(0, 10)
}

export const STORAGE_KEY = 'mc.shopeeStudio'

export interface StudioState {
  period: StudioPeriod
  archive: StudioPeriod[]
}

export const emptyState = (now: Date = new Date()): StudioState => ({ period: { startedAt: periodKey(now), contents: [] }, archive: [] })

export function loadState(): StudioState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StudioState
      if (parsed?.period?.startedAt) return rollPeriod(parsed, new Date())
    }
  } catch { /* corrupted storage falls through to a fresh state */ }
  return emptyState()
}

export function saveState(state: StudioState): void {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage may be blocked */ }
}

/** A new week starts a fresh period; the finished one goes to the archive. */
export function rollPeriod(state: StudioState, now: Date): StudioState {
  const key = periodKey(now)
  if (state.period.startedAt === key) return state
  const archived = { ...state.period, archivedAt: new Date().toISOString() }
  return { period: { startedAt: key, contents: [] }, archive: [archived, ...state.archive].slice(0, 12) }
}

/** Reset the current period: its contents are archived and the quota starts over. */
export function resetPeriod(state: StudioState): StudioState {
  const archived = { ...state.period, archivedAt: new Date().toISOString() }
  return { period: { startedAt: periodKey(new Date()), contents: [] }, archive: [archived, ...state.archive].slice(0, 12) }
}

export const countDone = (period: StudioPeriod): number => period.contents.filter((content) => content.stage === 'upload').length

export const quotaStatus = (period: StudioPeriod): { done: number; quota: number; met: boolean } => {
  const done = countDone(period)
  return { done, quota: QUOTA_PER_PERIOD, met: done >= QUOTA_PER_PERIOD }
}

export const nextStage = (stage: StudioStage): StudioStage => STUDIO_STAGES[Math.min(STUDIO_STAGES.indexOf(stage) + 1, STUDIO_STAGES.length - 1)]

export const addContent = (state: StudioState, title: string, product: string, now: Date = new Date()): StudioState => {
  // Same-millisecond adds must not collide: suffix a counter over the timestamp.
  const stamp = now.getTime().toString(36)
  const taken = new Set(state.period.contents.map((content) => content.id))
  let suffix = 0
  let id = `sc-${stamp}`
  while (taken.has(id)) { suffix += 1; id = `sc-${stamp}-${suffix}` }
  const content: StudioContent = {
    id,
    title: title.trim() || 'Konten tanpa judul',
    product: product.trim() || 'Belum dipilih',
    stage: 'riset',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return { ...state, period: { ...state.period, contents: [content, ...state.period.contents] } }
}

export const advanceContent = (state: StudioState, id: string, now: Date = new Date()): StudioState => ({
  ...state,
  period: {
    ...state.period,
    contents: state.period.contents.map((content) => content.id === id ? { ...content, stage: nextStage(content.stage), updatedAt: now.toISOString() } : content),
  },
})

export const removeContent = (state: StudioState, id: string): StudioState => ({
  ...state,
  period: { ...state.period, contents: state.period.contents.filter((content) => content.id !== id) },
})
