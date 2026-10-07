import { describe, expect, it } from 'vitest'
import { agentRoster, buildOfficeSnapshot, ROLE_ALIASES } from './mission-control.js'
import type { ActivitySnapshot, RuntimeSnapshot, Task, TaskBoardSnapshot } from './mission-control.js'

const runtime = (profiles: string[]): RuntimeSnapshot => ({
  profiles: { availability: 'available', data: profiles.map((name) => ({ name, model: 'm', gateway: 'Running' })) },
  openCode: { availability: 'available', data: '1.18.33' },
}) as RuntimeSnapshot

describe('agentRoster role aliases', () => {
  it('keeps one station per profile and never invents a station for a declared role', () => {
    const agents = agentRoster(runtime(['default', 'leadengineer', 'security']))

    expect(agents.map((agent) => agent.id)).toEqual(['default', 'leadengineer', 'security', 'opencode'])
    // `frontend` is a declared role, not a profile: it must not become its own station.
    expect(agents.some((agent) => agent.id === 'frontend')).toBe(false)
  })

  it('attributes specialist assignees to the station that owns them', () => {
    const agents = agentRoster(runtime(['leadengineer', 'security']))
    const aliases = (id: string) => agents.find((agent) => agent.id === id)?.aliases ?? []

    expect(aliases('leadengineer')).toContain('engineer')
    expect(aliases('leadengineer')).toContain('pm')
    expect(aliases('security')).toContain('auditor')
    expect(aliases('opencode')).toContain('frontend')
    expect(aliases('opencode')).toContain('qa')
  })

  it('always keeps the profile name itself as an alias', () => {
    for (const agent of agentRoster(runtime(['LeadEngineer', 'security']))) {
      if (agent.profile) expect(agent.aliases).toContain(agent.profile.toLowerCase())
    }
  })

  it('only maps aliases onto ids that exist in the roster', () => {
    const ids = new Set(agentRoster(runtime(['default', 'leadengineer', 'security'])).map((agent) => agent.id))
    for (const target of Object.keys(ROLE_ALIASES)) expect(ids.has(target)).toBe(true)
  })
})

describe('specialist assignees reach a real station', () => {
  const NOW = '2026-10-07T11:00:00.000Z'
  const fresh = { availability: 'available' as const, data: [] as Task[] }
  const board = (tasks: Task[]): TaskBoardSnapshot => ({ tasks: { ...fresh, data: tasks }, fetchedAt: NOW })
  const activity: ActivitySnapshot = { sessions: { availability: 'available', data: [] }, fetchedAt: NOW }
  const snapshot = (tasks: Task[]) => buildOfficeSnapshot(runtime(['default', 'leadengineer', 'security']), board(tasks), activity, { now: NOW })
  const task = (assignee: string, status = 'running'): Task => ({ title: `${assignee} work`, status, assignee })

  it('attributes a `frontend` task to the OpenCode station', () => {
    const stations = snapshot([task('frontend')]).stations
    const opencode = stations.find((station) => station.id === 'opencode')

    expect(opencode?.state).toBe('Working')
    expect(opencode?.activity).toBe('Kanban: frontend work')
    expect(stations.filter((station) => station.currentTask === 'frontend work')).toHaveLength(1)
  })

  it('attributes `pm` to the Lead Engineer and `auditor` to Cyber Security', () => {
    const stations = snapshot([task('pm'), task('auditor', 'review')]).stations
    const byId = new Map(stations.map((station) => [station.id, station]))

    expect(byId.get('leadengineer')?.currentTask).toBe('pm work')
    expect(byId.get('security')?.state).toBe('Reviewing')
    expect(byId.get('security')?.activity).toBe('Reviewing: auditor work')
  })

  it('still ignores a done task, however it is assigned', () => {
    const stations = snapshot([task('frontend', 'done')]).stations

    expect(stations.every((station) => station.currentTask === 'No attributed task')).toBe(true)
    expect(stations.every((station) => station.state !== 'Working')).toBe(true)
  })

  it('never matches an assignee case-insensitively across the wrong station', () => {
    const stations = snapshot([task('FRONTEND')]).stations
    const owning = stations.filter((station) => station.currentTask === 'FRONTEND work')

    expect(owning.map((station) => station.id)).toEqual(['opencode'])
  })
})
