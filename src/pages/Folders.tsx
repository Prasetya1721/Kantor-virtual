import { useEffect, useState } from 'react'
import { LOCKED_EVENT } from '../access.ts'
import { formatBytes, formatDateTime } from '../format.ts'
import { usePolling } from '../polling.ts'
import type { RequestState } from '../request-state.ts'
import type { FolderAgent, FolderAgentsSnapshot, FolderFile, FolderListing } from '../types.ts'
import { EmptyState, LoadingState, PageTitle, SearchInput, SourceStatus, Unavailable } from '../ui.tsx'
import { PixelCharacter } from './Office.tsx'
import { PrivateGate } from '../ProfileLock.tsx'
import { agentPrivacy, useProfileLock } from '../profile-lock.ts'

function folderUrl(agent: string, kind: 'list' | 'file', path: string): string {
  return `/api/folders/${encodeURIComponent(agent)}/${kind}?path=${encodeURIComponent(path)}`
}

type FolderRequest<T> = RequestState<T> & { error?: string; reload: () => void }

/** Like loadSnapshot, but keeps the server's explanation (permission denied, not found…). */
async function loadWithReason<T>(url: string): Promise<RequestState<T> & { error?: string }> {
  try {
    const response = await fetch(url)
    const body = await response.json().catch(() => undefined) as (T & { error?: unknown; locked?: unknown }) | undefined
    if (response.ok && body) return { status: 'ready', data: body }
    if (response.status === 401 && body?.locked === true) window.dispatchEvent(new Event(LOCKED_EVENT))
    return { status: 'failed', error: typeof body?.error === 'string' ? body.error : `Permintaan gagal (HTTP ${response.status}).` }
  } catch {
    return { status: 'failed', error: 'API Ruang tidak dapat dijangkau.' }
  }
}

function useRequest<T>(url: string | undefined): FolderRequest<T> {
  const [state, setState] = useState<RequestState<T> & { error?: string }>({ status: 'pending' })
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    if (!url) return
    let active = true
    setState({ status: 'pending' })
    void loadWithReason<T>(url).then((next) => { if (active) setState(next) })
    return () => { active = false }
  }, [url, nonce])
  return { ...state, reload: () => setNonce((value) => value + 1) } as FolderRequest<T>
}

function FileViewer({ agent, path }: { agent: string; path: string }) {
  const file = useRequest<FolderFile>(folderUrl(agent, 'file', path))
  if (file.status === 'pending') return <LoadingState message={`Membuka ${path}...`}/>
  if (file.status === 'failed') return <EmptyState title="Tidak dapat membuka berkas">{file.error ?? 'Berkas tidak dapat dibaca.'}</EmptyState>
  const data = file.data
  return <section className="file-viewer" aria-label={`Isi ${data.path}`}>
    <header className="file-head"><div><p className="eyebrow">BERKAS</p><h2>{data.path.split('/').pop()}</h2></div><dl><div><dt>Ukuran</dt><dd>{formatBytes(data.size)}</dd></div><div><dt>Diubah</dt><dd>{formatDateTime(data.modified)}</dd></div></dl></header>
    {data.kind === 'sensitive' ? <div className="file-notice locked">🔒 Berkas ini bisa berisi kredensial (kunci, token, auth, atau state database). Ruang menampilkannya tapi tidak pernah membaca isinya.</div>
      : data.kind === 'binary' ? <div className="file-notice">Berkas biner. Tidak ada pratinjau teks.</div>
        : <>
          {data.truncated && <div className="file-notice">Menampilkan 256 KB pertama berkas ini.</div>}
          {!!data.redactions && <div className="file-notice">{data.redactions} baris menyamarkan rahasia sebagai [redacted].</div>}
          <pre className="file-content" tabIndex={0}>{data.content || <span className="muted">(berkas kosong)</span>}</pre>
        </>}
  </section>
}

function Browser({ agent, onBack }: { agent: FolderAgent; onBack?: () => void }) {
  const [directory, setDirectory] = useState('')
  const [selected, setSelected] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const listing = useRequest<FolderListing>(folderUrl(agent.profile, 'list', directory))
  const parts = directory ? directory.split('/') : []
  const open = (next: string) => { setDirectory(next); setSelected(undefined); setQuery('') }
  const needle = query.trim().toLowerCase()
  const entries = listing.status === 'ready' ? listing.data.entries.filter((entry) => !needle || entry.name.toLowerCase().includes(needle)) : []
  return <>
    <nav className="breadcrumb" aria-label="Jalur folder">
      {onBack && <><button type="button" onClick={onBack}>Semua agen</button><span>/</span></>}
      <button type="button" onClick={() => open('')} aria-current={!directory ? 'page' : undefined} title={agent.path}>{agent.label} <small>{agent.path}</small></button>
      {parts.map((part, index) => <span key={index} className="crumb"><span>/</span><button type="button" onClick={() => open(parts.slice(0, index + 1).join('/'))} aria-current={index === parts.length - 1 ? 'page' : undefined}>{part}</button></span>)}
      <button type="button" className="refresh-button crumb-refresh" onClick={listing.reload}>↻ SEGARKAN</button>
    </nav>
    <section className="folder-browser">
      <div className="file-list-pane">
        <SearchInput value={query} onChange={setQuery} label="Saring folder ini"/>
        {listing.status === 'pending' ? <p className="muted">Memuat folder...</p> : listing.status === 'failed' ? <div className="file-notice locked" role="alert"><strong>Folder ini tidak dapat dibaca.</strong><br/>{listing.error}</div> : <>
          <ul className="file-list" aria-label="Isi folder">
            {directory && <li><button type="button" className="file-row" onClick={() => open(parts.slice(0, -1).join('/'))}><span className="file-icon">↰</span><span className="file-name">..</span></button></li>}
            {entries.map((entry) => <li key={entry.path}><button type="button" className={`file-row${selected === entry.path ? ' active' : ''}`} aria-current={selected === entry.path ? 'true' : undefined} onClick={() => entry.type === 'dir' ? open(entry.path) : setSelected(entry.path)}>
              <span className="file-icon" aria-hidden="true">{entry.unreadable ? '⛔' : entry.type === 'dir' ? '📁' : entry.sensitive ? '🔒' : '📄'}</span>
              <span className="file-name">{entry.name}</span>
              <span className="file-size">{entry.unreadable ? 'tanpa akses' : entry.type === 'dir' ? '' : formatBytes(entry.size)}</span>
            </button></li>)}
          </ul>
          {entries.length === 0 && <p className="muted">{needle ? 'Tidak ada berkas yang cocok.' : 'Folder ini kosong.'}</p>}
          {listing.data.truncated && <p className="muted">Menampilkan 500 entri pertama.</p>}
          {listing.data.hiddenCount > 0 && <p className="muted small-note">{listing.data.hiddenCount} folder sistem disembunyikan (profil lain, instalasi, cache).</p>}
        </>}
      </div>
      <div className="file-view-pane">{selected ? <FileViewer agent={agent.profile} path={selected}/> : <EmptyState title="Pilih berkas">Pilih berkas di kiri untuk melihatnya. Folder terbuka di tempat.</EmptyState>}</div>
    </section>
  </>
}

/** One agent's folder browser, for the Office agent dialog. */
export function AgentFolder({ profile }: { profile: string }) {
  const snapshot = usePolling<FolderAgentsSnapshot>('/api/folders', 60_000)
  const agent = snapshot.status === 'ready' ? snapshot.data.agents.find((item) => item.profile === profile) : undefined
  if (snapshot.status === 'pending') return <LoadingState message="Mencari folder agen..."/>
  if (snapshot.status === 'failed') return <EmptyState title="Tidak Tersedia">{snapshot.message ?? 'Daftar folder tidak dapat dibaca.'}</EmptyState>
  if (!agent || !agent.available) return <EmptyState title="Folder tidak tersedia">{agent?.reason ?? 'Agen ini tidak punya folder yang bisa dibaca.'}</EmptyState>
  return <div className="embedded-folder"><PrivateGate agent={agent.profile} compact>{agent.warning && <p className="file-notice">⚠ {agent.warning}</p>}<Browser key={agent.profile} agent={agent}/></PrivateGate></div>
}

export function Folders() {
  const snapshot = usePolling<FolderAgentsSnapshot>('/api/folders', 60_000)
  const [openAgent, setOpenAgent] = useState<string | undefined>()
  const lock = useProfileLock()
  const data = snapshot.status === 'ready' ? snapshot.data : undefined
  const agent = data?.agents.find((item) => item.profile === openAgent)
  const source = data ? { availability: 'available' as const, data: null } : undefined
  return <><PageTitle eyebrow="FOLDER AGEN" title="Folder">Folder milik tiap agen, hanya-baca: folder profil Hermes-nya (SOUL.md, memories, skills, cron, config…) atau, untuk OpenCode, folder home-nya. Setiap agen hanya menampilkan berkasnya sendiri. Berkas kredensial ditampilkan tapi tidak pernah dibuka.</PageTitle>
    {!agent && <SourceStatus source={source} fetchedAt={data?.fetchedAt} request={snapshot}/>}
    <Unavailable source={source} request={snapshot}/>
    {snapshot.status === 'pending' ? <LoadingState message="Mencari folder agen..."/> : agent ? <><PrivateGate agent={agent.profile}><Browser key={agent.profile} agent={agent} onBack={() => setOpenAgent(undefined)}/></PrivateGate>{agentPrivacy(lock, agent.profile) === 'locked' && <button type="button" className="refresh-button" onClick={() => setOpenAgent(undefined)}>← SEMUA AGEN</button>}</> : data && <section className="folder-agents">{data.agents.map((item) => <button type="button" key={item.profile} className="folder-agent" disabled={!item.available} onClick={() => setOpenAgent(item.profile)}>
      <span className="folder-glyph" aria-hidden="true"><PixelCharacter agent={item.profile}/></span>
      <span className="folder-meta"><strong>{agentPrivacy(lock, item.profile) === 'locked' && '🔒 '}{item.label}</strong><code className="folder-path">{item.path}</code><small>{item.available ? 'Buka folder →' : item.reason ?? 'Folder tidak tersedia'}</small>{item.warning && <small className="text-bad">⚠ {item.warning}</small>}</span>
    </button>)}</section>}
  </>
}
