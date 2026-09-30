import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildOfficeSnapshot, OBSERVATION_ROOMS } from '../server/mission-control.js'

const officeSource = readFileSync(new URL('./pages/Office.tsx', import.meta.url), 'utf8')
const stylesheet = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

const runtime = {
  profiles: { availability: 'available' as const, data: [] },
  gateways: {
    default: { availability: 'available' as const, data: 'Running' as const },
    leadEngineer: { availability: 'available' as const, data: 'Running' as const },
  },
  openCode: { availability: 'available' as const, data: '1.0.0' },
  fetchedAt: '2026-09-27T12:00:00.000Z',
}
const emptyBoard = { tasks: { availability: 'available' as const, data: [] }, fetchedAt: runtime.fetchedAt }
const emptyActivity = { sessions: { availability: 'available' as const, data: [] }, fetchedAt: runtime.fetchedAt }

describe('Observation rooms', () => {
  it('never receives an agent, whatever state the crew is in', () => {
    const board = {
      tasks: { availability: 'available' as const, data: [{ title: 'Fix the pump', status: 'running', assignee: 'Lead Agent' }] },
      fetchedAt: runtime.fetchedAt,
    }
    // No-work, explicit work, and a stopped gateway cover Working/Reviewing/Collaborating/Idle/Offline;
    // Unknown falls out when no source is fresh.
    const runs: Parameters<typeof buildOfficeSnapshot>[3][] = [
      { now: runtime.fetchedAt, explicitStates: [{ station: 'Lead Agent', state: 'Working', expiresAt: '2026-09-27T13:00:00.000Z' }] },
      { now: runtime.fetchedAt, explicitStates: [{ station: 'Lead Agent', state: 'Reviewing', expiresAt: '2026-09-27T13:00:00.000Z' }] },
      { now: runtime.fetchedAt, explicitStates: [{ station: 'Lead Agent', state: 'Collaborating', expiresAt: '2026-09-27T13:00:00.000Z' }] },
      { now: runtime.fetchedAt },
      { now: runtime.fetchedAt, explicitStates: [{ station: 'Lead Agent', state: 'Working', expiresAt: '2020-01-01T00:00:00.000Z' }] },
    ]
    const stopped = { ...runtime, gateways: { ...runtime.gateways, default: { availability: 'available' as const, data: 'Stopped' as const } } }

    const seen = new Set<string>()
    for (const options of runs) {
      for (const office of [
        buildOfficeSnapshot(runtime, board, emptyActivity, options),
        buildOfficeSnapshot(runtime, emptyBoard, emptyActivity, options),
        buildOfficeSnapshot(stopped, board, emptyActivity, options),
        buildOfficeSnapshot(runtime, board, emptyActivity, { now: Date.parse(runtime.fetchedAt) - 600_000 }),
      ]) {
        expect(office.stations).toHaveLength(3)
        for (const station of office.stations) {
          expect(OBSERVATION_ROOMS).not.toContain(station.room)
          seen.add(station.state)
        }
      }
    }
    expect(seen).toEqual(new Set(['Working', 'Reviewing', 'Collaborating', 'Idle', 'Offline', 'Unknown']))
  })

  it('is offered in the room tabs alongside the crew rooms', () => {
    const rooms = officeSource.match(/const ROOMS: OfficeRoom\[\] = \[([^\]]+)\]/)?.[1] ?? ''
    expect(rooms).toContain("'Workspace'")
    expect(rooms).toContain("'Lounge'")
    for (const room of OBSERVATION_ROOMS) expect(rooms).toContain(`'${room}'`)
  })

  it('tells the viewer on screen that it hosts no crew', () => {
    expect(officeSource).toContain('Observation room')
    expect(officeSource).toContain('isCrewRoom')
  })

  it('is styled distinctly and reuses no crew station placement', () => {
    for (const room of OBSERVATION_ROOMS) {
      expect(stylesheet).toContain(`.pixel-room.${room.toLowerCase()}`)
      for (const seat of ['lounge-seat-1', 'lounge-seat-2', 'lounge-seat-3', 'assigned-desk', 'meeting-area', 'review-desk', 'neutral-presence', 'offline-station']) {
        expect(stylesheet).not.toMatch(new RegExp(`\\.${room.toLowerCase()} \\.${seat}`))
      }
    }
    expect(stylesheet).toContain('.obs-')
  })
})