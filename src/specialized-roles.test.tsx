import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Agents } from './pages/Agents.tsx'
import { SPECIALIZED_ROLES } from './specialized-roles.ts'
import type { RuntimeSnapshot } from './types.ts'

const runtime: RuntimeSnapshot = {
  profiles: {
    availability: 'available',
    data: [{ name: 'default', model: 'gpt-4o', gateway: 'Running' }],
  },
  openCode: { availability: 'available', data: '1.18.33' },
} as RuntimeSnapshot

describe('declared engineering roles', () => {
  it('declares the six specialist roles across both categories', () => {
    const titles = SPECIALIZED_ROLES.map((role) => role.title)
    expect(titles).toEqual([
      'Front-End Developer',
      'Back-End Developer',
      'Full-Stack Developer',
      'UI/UX Designer',
      'Project Manager',
      'QA (Quality Assurance) Tester',
    ])
    expect(SPECIALIZED_ROLES.filter((role) => role.category === 'Peran Utama')).toHaveLength(3)
    expect(SPECIALIZED_ROLES.filter((role) => role.category === 'Peran Pendukung & Tim')).toHaveLength(3)
  })

  it('gives every role at least one responsibility and one skill', () => {
    for (const role of SPECIALIZED_ROLES) {
      expect(role.responsibilities.length).toBeGreaterThan(0)
      expect(role.skills.length).toBeGreaterThan(0)
    }
  })

  it('renders the engineering division alongside the live agent cards', () => {
    const markup = renderToStaticMarkup(<Agents runtime={runtime}/>)

    expect(markup).toContain('Sub-Agent Spesialis &amp; Peran Tim')
    expect(markup).toContain('Front-End Developer')
    expect(markup).toContain('QA (Quality Assurance) Tester')
    // The live profile list is still the source of truth for agents.
    expect(markup).toContain('Hermes profile')
    expect(markup).toContain('OpenCode (CLI tool)')
    // The 2-CPU rationale must survive: these are on-demand, not daemons.
    expect(markup).toContain('on-demand')
  })

  it('keeps declared roles out of the pending and unavailable states', () => {
    const pending = renderToStaticMarkup(<Agents runtime={null} pending/>)
    expect(pending).toContain('Loading')
    expect(pending).not.toContain('Sub-Agent Spesialis')

    const unavailable = renderToStaticMarkup(<Agents runtime={{ profiles: { availability: 'unavailable', data: [] } } as unknown as RuntimeSnapshot}/>)
    expect(unavailable).toContain('Not Available')
    expect(unavailable).not.toContain('Sub-Agent Spesialis')
  })
})
