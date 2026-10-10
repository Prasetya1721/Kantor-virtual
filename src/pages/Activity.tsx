import { useState } from 'react'
import { usePolling } from '../polling.ts'
import type { ActivitySnapshot } from '../types.ts'
import { EmptyState, PageTitle, SearchInput, SourceStatus, Unavailable } from '../ui.tsx'

export function Activity() {
  const snapshot = usePolling<ActivitySnapshot>('/api/activity', 15_000)
  const [query, setQuery] = useState('')
  const data = snapshot.status === 'ready' ? snapshot.data : undefined
  const sessions = data?.sessions
  const needle = query.trim().toLowerCase()
  const visible = (sessions?.data ?? []).filter((session) => !needle || `${session.title} ${session.preview} ${session.workspace ?? ''} ${session.source ?? ''}`.toLowerCase().includes(needle))
  return <><PageTitle eyebrow="SESI HERMES" title="Aktivitas">20 sesi Hermes terbaru. Peristiwa dan riwayat pekerjaan tidak dikarang dari data sesi.</PageTitle>
    <SourceStatus source={sessions} fetchedAt={data?.fetchedAt} request={snapshot}/><Unavailable source={sessions} request={snapshot}/>
    {sessions?.availability === 'available' && (sessions.data.length === 0 ? <EmptyState title="Belum ada sesi">Hermes belum punya sesi. Mulai satu dengan <code>hermes</code>.</EmptyState> : <>
      <div className="toolbar"><SearchInput value={query} onChange={setQuery} label="Cari sesi"/><span className="toolbar-count">{visible.length} dari {sessions.data.length}</span></div>
      <section className="data-list">{visible.map((session) => <article key={session.id ?? `${session.title}-${session.lastActive}`}><div><h2>{session.title}</h2>{session.preview && session.preview !== session.title && <p>{session.preview}</p>}</div><dl><div><dt>Aktif terakhir</dt><dd>{session.lastActive}</dd></div>{session.workspace && <div><dt>Ruang Kerja</dt><dd>{session.workspace}</dd></div>}{session.source && <div><dt>Sumber</dt><dd>{session.source}</dd></div>}{session.id && <div><dt>ID Sesi</dt><dd>{session.id}</dd></div>}</dl></article>)}</section>
    </>)}
  </>
}
