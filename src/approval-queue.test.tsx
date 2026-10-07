import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_LABELS_ID, statusLabelId } from './format.ts'
import { Stats } from './pages/Stats.tsx'
import type { DashboardSnapshot } from './types.ts'

describe('Indonesian status labels', () => {
  it('translates every known board status', () => {
    expect(statusLabelId('review')).toBe('Menunggu Review')
    expect(statusLabelId('running')).toBe('Sedang Berjalan')
    expect(statusLabelId('done')).toBe('Selesai')
  })

  it('is case-insensitive and falls back to the raw status for unknown columns', () => {
    expect(statusLabelId('REVIEW')).toBe('Menunggu Review')
    expect(statusLabelId('quarantined')).toBe('quarantined')
  })

  it('covers every core board status so no column renders untranslated', () => {
    for (const status of ['triage', 'todo', 'scheduled', 'ready', 'running', 'blocked', 'review', 'done', 'archived']) {
      expect(STATUS_LABELS_ID[status]).toBeTruthy()
    }
  })
})

const dashboard = (review: number): DashboardSnapshot => ({
  fetchedAt: '2026-10-07T12:00:00.000Z',
  runtime: { profiles: { availability: 'available', data: [] }, openCode: { availability: 'available', data: '1.18.33' } },
  tasks: { availability: 'available', total: 3 + review, assigned: 3, byStatus: { running: 3, ...(review ? { review } : {}) } },
  calendar: { availability: 'available', total: 0, active: 0, paused: 0 },
  activity: { availability: 'available', total: 0 },
  knowledge: { availability: 'available', total: 0, byCategory: {} },
  channels: { availability: 'available', total: 0, connected: 0 },
  office: { declared: 4, active: 1, idle: 3, offline: 0, unknown: 0, gatewaysReachable: 1, gatewaysDeclared: 1 },
  usage: { availability: 'unavailable' },
  commands: { total: 0, failed: 0, averageMs: 0 },
} as unknown as DashboardSnapshot)

describe('Approval queue banner', () => {
  it('renders the banner with the count when tasks await review', () => {
    const markup = renderToStaticMarkup(<Stats dashboard={dashboard(4)} onNavigate={vi.fn()}/>)
    expect(markup).toContain('approval-banner')
    expect(markup).toContain('ANTREAN PERSETUJUAN')
    expect(markup).toContain('4 tugas teknis menunggu review')
    expect(markup).toContain('Buka Antrean Review (4)')
  })

  it('stays hidden when nothing is awaiting review', () => {
    const markup = renderToStaticMarkup(<Stats dashboard={dashboard(0)} onNavigate={vi.fn()}/>)
    expect(markup).not.toContain('approval-banner')
    expect(markup).not.toContain('ANTREAN PERSETUJUAN')
  })

  it('renders the operations overview in Indonesian', () => {
    const markup = renderToStaticMarkup(<Stats dashboard={dashboard(0)} onNavigate={vi.fn()}/>)
    expect(markup).toContain('Gateway Berjalan')
    expect(markup).toContain('Tim AI Aktif')
    expect(markup).toContain('Tugas Terbuka')
    expect(markup).toContain('STATUS PAPAN TUGAS (KANBAN)')
    expect(markup).toContain('Sedang Berjalan')
    // The English wording this page used before the translation must be gone.
    expect(markup).not.toContain('Gateways running')
    expect(markup).not.toContain('KANBAN BY STATUS')
    expect(markup).not.toContain('Crew active')
  })
})
