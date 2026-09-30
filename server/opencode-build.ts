// ---------------------------------------------------------------------------
// OpenCode build activity (read-only). OpenCode stores its own sessions in a
// private SQLite database. We open it in read-only immutable-ish mode (mode=ro)
// and never follow WAL live commits beyond a plain read; every failure maps to
// `unavailable` so the UI shows "Not Available" instead of guessing.

import { execFile as execFileCallback } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)

export interface OpenCodeSession {
  id: string
  directory: string
  title: string
  model?: string
  provider?: string
  created: string
  updated: string
  tokensInput: number
  tokensOutput: number
}

export interface OpenCodeBuildSnapshot {
  availability: 'available' | 'unavailable'
  version: string
  sessions: OpenCodeSession[]
  totalSessions: number
  error?: { code: 'READ_FAILED'; message: string }
  fetchedAt: string
}

const RECENT_WINDOW_MS = 6 * 60 * 60 * 1000 // 6 hours of build sessions shown

export async function collectOpenCodeBuild(now = Date.now()): Promise<OpenCodeBuildSnapshot> {
  const fetchedAt = new Date().toISOString()
  const dbPath = join(homedir(), '.local/share/opencode/opencode.db')
  const script = `
import sqlite3, json
conn = sqlite3.connect('file:${dbPath}?mode=ro', uri=True)
conn.row_factory = sqlite3.Row
rows = conn.execute(
    "SELECT s.id, s.directory, s.title, s.model, s.time_created, s.time_updated, "
    "s.tokens_input, s.tokens_output FROM session s "
    "ORDER BY s.time_updated DESC LIMIT 50"
).fetchall()
print(json.dumps([
    {"id": r["id"], "directory": r["directory"], "title": r["title"], "model": r["model"],
     "created": r["time_created"], "updated": r["time_updated"],
     "tokens_input": r["tokens_input"] or 0, "tokens_output": r["tokens_output"] or 0}
    for r in rows
]))
conn.close()
`.trim()

  try {
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3'
    const { stdout } = await execFile(pythonBin, ['-c', script], { timeout: 5_000, maxBuffer: 1024 * 1024 })
    const raw = JSON.parse(stdout) as { id: string; directory: string; title: string; model?: string; created: number; updated: number; tokens_input: number; tokens_output: number }[]
    const sessions: OpenCodeSession[] = raw.map((item) => {
      let model: string | undefined
      let provider: string | undefined
      if (item.model) {
        try {
          const parsed = JSON.parse(item.model)
          model = typeof parsed.id === 'string' ? parsed.id : undefined
          provider = typeof parsed.providerID === 'string' ? parsed.providerID : undefined
        } catch { model = item.model }
      }
      return {
        id: item.id,
        directory: item.directory,
        title: item.title,
        ...(model ? { model } : {}),
        ...(provider ? { provider } : {}),
        created: new Date(item.created).toISOString(),
        updated: new Date(item.updated).toISOString(),
        tokensInput: item.tokens_input,
        tokensOutput: item.tokens_output,
      }
    })
    const cutoff = now - RECENT_WINDOW_MS
    const recent = sessions.filter((session) => Date.parse(session.updated) >= cutoff)
    return { availability: 'available', version: 'read', sessions: recent, totalSessions: sessions.length, fetchedAt }
  } catch (error) {
    return {
      availability: 'unavailable',
      version: 'read',
      sessions: [],
      totalSessions: 0,
      error: { code: 'READ_FAILED', message: error instanceof Error ? 'OpenCode build data could not be read.' : 'OpenCode build data could not be read.' },
      fetchedAt,
    }
  }
}
