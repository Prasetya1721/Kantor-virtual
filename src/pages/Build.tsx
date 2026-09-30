import { useState } from 'react'
import { usePolling } from '../polling.ts'
import type { OpenCodeBuildSnapshot } from '../types.ts'
import { EmptyState, PageTitle, SearchInput, SourceStatus, Unavailable } from '../ui.tsx'

/**
 * OpenCode build activity, read from OpenCode's own private session store.
 * Every row on this page is a real session OpenCode recorded itself - nothing
 * here is synthesized, and failures show as Not Available.
 */
export function Build() {
  const snapshot = usePolling<OpenCodeBuildSnapshot>('/api/build', 15_000)
  const [query, setQuery] = useState('')
  const data = snapshot.status === 'ready' ? snapshot.data : undefined
  const sessions = data?.availability === 'available' ? { availability: 'available' as const, data: data.sessions } : { availability: 'unavailable' as const, data: [], ...(data?.error ? { error: data.error } : {}) }
  const needle = query.trim().toLowerCase()
  const visible = sessions.data.filter((session) => !needle || `${session.title} ${session.directory} ${session.model ?? ''} ${session.provider ?? ''}`.toLowerCase().includes(needle))
  const totalTokens = sessions.data.reduce((sum, session) => sum + session.tokensInput + session.tokensOutput, 0)
  const active = sessions.data.filter((session) => Date.now() - Date.parse(session.updated) < 5 * 60_000).length
  return <><PageTitle eyebrow="OPENCODE BUILDS" title="Build">OpenCode sessions as OpenCode itself recorded them: one row per real run, with the repository directory it worked in.</PageTitle>
    <SourceStatus source={{ ...sessions, ...(data && { fetchedAt: data.fetchedAt }) }} fetchedAt={data?.fetchedAt} request={snapshot}/><Unavailable source={sessions} request={snapshot}/>
    {data?.availability === 'available' && (data.sessions.length === 0 ? <EmptyState title="No recent build sessions">OpenCode has not run in the last 6 hours. Run <code>opencode run</code> in a repository to see activity here.</EmptyState> : <>
      <div className="toolbar"><SearchInput value={query} onChange={setQuery} label="Search build sessions"/><span className="toolbar-count">{visible.length} of {data.sessions.length} · {data.totalSessions} total · {totalTokens.toLocaleString('id-ID')} tokens · {active} active (5m)</span></div>
      <section className="data-list">{visible.map((session) => <article key={session.id}>
        <div><h2>{session.title}</h2><p>{session.directory}{session.model && ` · ${session.provider ? `${session.provider}/` : ''}${session.model}`}</p></div>
        <dl>
          <div><dt>Updated</dt><dd>{new Date(session.updated).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}</dd></div>
          <div><dt>Tokens</dt><dd>{(session.tokensInput + session.tokensOutput).toLocaleString('id-ID')} ({session.tokensInput.toLocaleString('id-ID')} in / {session.tokensOutput.toLocaleString('id-ID')} out)</dd></div>
          <div><dt>Session ID</dt><dd>{session.id}</dd></div>
        </dl>
      </article>)}</section>
    </>)}
  </>
}
