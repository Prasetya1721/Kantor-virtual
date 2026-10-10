import type { Source } from './types.ts'
import { officeStateLabel } from './format.ts'

export type OfficeBadgeTone = 'good' | 'muted' | 'unknown'
export type OfficeState = 'Idle' | 'Working' | 'Reviewing' | 'Collaborating' | 'Offline' | 'Unknown'

export function officeBadge(source: Source<string> | undefined, kind: 'gateway' | 'version' = 'gateway'): { label: string; tone: OfficeBadgeTone } {
  if (!source || source.availability === 'unavailable') return { label: 'Tidak Tersedia', tone: 'muted' }
  if (source.data === 'Unknown' || !source.data) return { label: 'Tidak Diketahui', tone: 'unknown' }
  if (kind === 'version') return { label: 'Versi Tersedia', tone: 'good' }
  return { label: source.data === 'Running' ? 'Berjalan' : source.data === 'Stopped' ? 'Berhenti' : source.data, tone: source.data === 'Running' ? 'good' : 'unknown' }
}

export function officeStateBadge(state: OfficeState): { label: string; tone: OfficeBadgeTone } {
  return { label: officeStateLabel(state), tone: state === 'Offline' ? 'muted' : state === 'Unknown' || state === 'Idle' ? 'unknown' : 'good' }
}
