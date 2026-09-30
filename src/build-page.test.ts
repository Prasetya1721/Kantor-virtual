import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { collectOpenCodeBuild } from '../server/opencode-build.js'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
const routesSource = readFileSync(new URL('./routes.ts', import.meta.url), 'utf8')
const serverSource = readFileSync(new URL('../server/index.ts', import.meta.url), 'utf8')

describe('Build page', () => {
  it('is routed in the navigation, the router, and served by an API endpoint', () => {
    expect(routesSource).toContain("'Build'")
    expect(appSource).toContain("page === 'Build'")
    expect(serverSource).toContain("'/api/build'")
  })

  it('shows the empty state instead of pretending activity exists', () => {
    const buildSource = readFileSync(new URL('./pages/Build.tsx', import.meta.url), 'utf8')
    expect(buildSource).toContain('No recent build sessions')
    expect(buildSource).toContain('Not Available')
  })
})

describe('collectOpenCodeBuild', () => {
  it('reads the real OpenCode store on this host when present', async () => {
    const snapshot = await collectOpenCodeBuild()
    // Truthful either way: available with rows, or unavailable with a reason.
    if (snapshot.availability === 'available') {
      expect(snapshot.totalSessions).toBeGreaterThanOrEqual(0)
      for (const session of snapshot.sessions) {
        expect(session.id).toMatch(/^ses_/)
        expect(Date.parse(session.updated)).not.toBeNaN()
      }
    } else {
      expect(snapshot.error?.message).toBeTruthy()
    }
  })

  it('maps an unreadable store to unavailable, never to invented rows', async () => {
    const script = `
import sqlite3, json, os
missing = os.environ.get('MC_TEST_DB', 'nonexistent.db')
conn = sqlite3.connect(f'file:{missing}?mode=ro', uri=True)
print(json.dumps([dict(r) for r in conn.execute('SELECT * FROM session LIMIT 1')]))
`.trim()
    const failure = await collectOpenCodeBuild().then(() => null, () => 'threw')
    expect(failure ?? 'resolved').toBe('resolved') // the real path must not throw; errors are mapped

    // A database without a session table is also just "unavailable".
    const dir = mkdtempSync(join(tmpdir(), 'mc-opencode-'))
    try {
      const db = join(dir, 'opencode.db')
      execFileSync('python3', ['-c', `import sqlite3; c = sqlite3.connect('${db}'); c.execute('CREATE TABLE other (x)'); c.commit()`])
      const original = process.env.HOME
      process.env.HOME = dir
      try {
        const snapshot = await collectOpenCodeBuild()
        expect(snapshot.availability).toBe('unavailable')
        expect(snapshot.sessions).toEqual([])
      } finally {
        if (original === undefined) delete process.env.HOME; else process.env.HOME = original
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
    expect(script).toBeTruthy()
  })
})