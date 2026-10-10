import { useState } from 'react'
import { formatDateTime, formatNumber } from '../format.ts'
import { usePolling } from '../polling.ts'
import type { AgentMemory, MemoryDocument, MemorySnapshot, MemoryStore } from '../types.ts'
import { EmptyState, LoadingState, PageTitle, SearchInput, SourceStatus, Unavailable } from '../ui.tsx'
import { PixelCharacter } from './Office.tsx'
import { PrivateGate, ProfileUnlock } from '../ProfileLock.tsx'

function DocumentBody({ document, empty }: { document?: MemoryDocument; empty: string }) {
  if (!document || !document.exists) return <p className="muted">{empty}</p>
  if (document.error) return <p className="file-notice locked">{document.error}</p>
  return <>
    <p className="doc-meta">{formatNumber(document.chars ?? 0)} karakter · diperbarui {formatDateTime(document.modified)}{document.redactions ? ` · ${document.redactions} baris disamarkan` : ''}{document.truncated ? ' · menampilkan 256 KB pertama' : ''}</p>
    <pre className="task-text doc-text">{document.content || <span className="muted">(berkas kosong)</span>}</pre>
  </>
}

function StoreCard({ title, subtitle, store, enabled, needle }: { title: string; subtitle: string; store?: MemoryStore; enabled: boolean; needle: string }) {
  const percent = store?.percent ?? 0
  const tone = percent >= 100 ? 'bad' : percent >= 80 ? 'unknown' : 'good'
  const entries = (store?.entries ?? []).map((entry, index) => ({ entry, index })).filter(({ entry }) => !needle || entry.toLowerCase().includes(needle))
  return <article className="card memory-card">
    <header className="memory-card-head"><div><p className="eyebrow">{title}</p><h2>{subtitle}</h2></div>{!enabled && <span className="badge muted">nonaktif di config</span>}</header>
    {!store || !store.exists ? <p className="muted">Belum ada entri. <code>{store?.path ?? 'memories/'}</code> dibuat saat agen pertama kali menyimpan lewat alat <code>memory</code>.</p>
      : store.error ? <p className="file-notice locked">{store.error}</p>
        : <>
          <div className="usage" role="img" aria-label={`pemakaian ${title} ${percent}%`}><i className={`tone-${tone}`} style={{ width: `${Math.min(100, percent)}%` }}/></div>
          <p className="doc-meta"><b>{percent}%</b> — {formatNumber(store.used)} / {formatNumber(store.limit)} karakter · {store.entries.length} entri · diperbarui {formatDateTime(store.modified)}</p>
          {percent >= 80 && <p className="file-notice">Di atas 80% batas. Hermes menolak penulisan yang akan melewatinya, jadi agen perlu merapikan entri segera.</p>}
          {entries.length === 0 ? <p className="muted">{needle ? 'Tidak ada entri yang cocok.' : 'Berkas kosong.'}</p> : <ol className="memory-entries">{entries.map(({ entry, index }) => <li key={index}><span className="entry-index">§{index + 1}</span><p>{entry}</p><small>{formatNumber(entry.length)} karakter</small></li>)}</ol>}
        </>}
  </article>
}

function AgentPanel({ agent, onOpenFolders }: { agent: AgentMemory; onOpenFolders?: () => void }) {
  const [query, setQuery] = useState('')
  const [openContext, setOpenContext] = useState<string | undefined>()
  const needle = query.trim().toLowerCase()
  if (!agent.available) return <EmptyState title="Tidak tersedia">{agent.reason ?? 'Folder agen ini tidak tersedia.'}</EmptyState>
  const settings = agent.settings
  return <div className="memory-panel">
    <div className="toolbar">
      {agent.kind === 'hermes' && <SearchInput value={query} onChange={setQuery} label="Cari entri memori"/>}
      <code className="folder-path">{agent.path}</code>
      {onOpenFolders && <button type="button" className="refresh-button" onClick={onOpenFolders}>BUKA DI FOLDER →</button>}
    </div>
    {settings && <div className="chip-row" aria-label="Pengaturan memori">
      <span className={`chip ${settings.memoryEnabled ? '' : 'chip-muted'}`}>memori {settings.memoryEnabled ? 'aktif' : 'nonaktif'}</span>
      <span className={`chip ${settings.userProfileEnabled ? '' : 'chip-muted'}`}>profil pengguna {settings.userProfileEnabled ? 'aktif' : 'nonaktif'}</span>
      <span className={`chip ${settings.writeApproval ? 'chip-priority' : 'chip-muted'}`}>persetujuan tulis {settings.writeApproval ? 'wajib' : 'nonaktif'}</span>
      {settings.provider && <span className="chip chip-priority">penyedia eksternal: {settings.provider}</span>}
      <span className="chip chip-muted">batas dari {settings.source}</span>
    </div>}
    {agent.kind === 'hermes' ? <>
      <section className="memory-grid">
        <StoreCard title="MEMORY.MD" subtitle="Catatan agen" store={agent.memory} enabled={settings?.memoryEnabled ?? true} needle={needle}/>
        <StoreCard title="USER.MD" subtitle="Profil pengguna" store={agent.user} enabled={settings?.userProfileEnabled ?? true} needle={needle}/>
      </section>
      <article className="card memory-soul">
        <header className="memory-card-head"><div><p className="eyebrow">SOUL.MD · IDENTITAS (SLOT PROMPT SISTEM #1)</p><h2>Siapa agen ini</h2></div></header>
        <DocumentBody document={agent.soul} empty="Tidak ada SOUL.md di profil ini. Hermes menyemai satu bawaan; sampai saat itu agen memakai identitas bawaannya."/>
      </article>
    </> : <p className="card-note">OpenCode bukan profil Hermes, jadi tidak punya MEMORY.md / USER.md. Berkas aturan globalnya ditampilkan di bawah.</p>}
    <article className="card memory-soul">
      <header className="memory-card-head"><div><p className="eyebrow">BERKAS KONTEKS</p><h2>{agent.kind === 'hermes' ? 'AGENTS.md, HERMES.md, CLAUDE.md…' : 'Aturan global'}</h2></div></header>
      {agent.contextFiles.length === 0 ? <p className="muted">Tidak ada berkas konteks di folder ini. Berkas konteks proyek (AGENTS.md, .hermes.md) biasanya ada di proyek yang dikerjakan, bukan di profil.</p>
        : <ul className="context-list">{agent.contextFiles.map((document) => <li key={document.path}>
          <button type="button" className="file-row" aria-expanded={openContext === document.path} onClick={() => setOpenContext(openContext === document.path ? undefined : document.path)}><span className="file-icon" aria-hidden="true">📄</span><span className="file-name">{document.name}</span><span className="file-size">{formatNumber(document.chars ?? 0)} karakter</span></button>
          {openContext === document.path && <DocumentBody document={document} empty=""/>}
        </li>)}</ul>}
    </article>
  </div>
}

/** One agent's memory (SOUL.md, MEMORY.md, USER.md, context files), for the Office agent dialog. */
export function AgentMemoryView({ profile }: { profile: string }) {
  const snapshot = usePolling<MemorySnapshot>('/api/memory', 30_000)
  const agent = snapshot.status === 'ready' ? snapshot.data.agents.find((item) => item.profile === profile) : undefined
  if (snapshot.status === 'pending') return <LoadingState message="Membaca memori agen..."/>
  if (snapshot.status === 'failed') return <EmptyState title="Tidak Tersedia">{snapshot.message ?? 'Memori tidak dapat dibaca.'}</EmptyState>
  if (!agent) return <EmptyState title="Tidak tersedia">Tidak ada memori untuk agen ini.</EmptyState>
  return <PrivateGate agent={agent.profile} compact>{agent.locked ? <ProfileUnlock agent={agent.profile} compact/> : <AgentPanel key={agent.profile} agent={agent}/>}</PrivateGate>
}

export function Memory({ onOpenFolders }: { onOpenFolders?: () => void }) {
  const snapshot = usePolling<MemorySnapshot>('/api/memory', 30_000)
  const data = snapshot.status === 'ready' ? snapshot.data : undefined
  const [selected, setSelected] = useState<string | undefined>()
  const agents = data?.agents ?? []
  const agent = agents.find((item) => item.profile === selected) ?? agents.find((item) => item.available) ?? agents[0]
  const source = data ? { availability: 'available' as const, data: null } : undefined
  return <><PageTitle eyebrow="MEMORI & PENGETAHUAN" title="Memori">Yang dibawa setiap agen ke tiap sesi: identitasnya (SOUL.md), memori terbatasnya (MEMORY.md dan USER.md, disuntikkan sebagai snapshot beku saat sesi dimulai), dan berkas konteksnya. Hanya-baca; rahasia disamarkan.</PageTitle>
    <SourceStatus source={source} fetchedAt={data?.fetchedAt} request={snapshot}/>
    <Unavailable source={source} request={snapshot}/>
    {snapshot.status === 'pending' ? <LoadingState message="Membaca memori agen..."/> : agent && <>
      <div className="memory-tabs" role="tablist" aria-label="Agen">{agents.map((item) => {
        const peak = Math.max(item.memory?.percent ?? 0, item.user?.percent ?? 0)
        return <button key={item.profile} role="tab" aria-selected={item.profile === agent.profile} className={`memory-tab${item.profile === agent.profile ? ' active' : ''}`} onClick={() => setSelected(item.profile)} disabled={!item.available && !item.locked}>
          <span className="folder-glyph small" aria-hidden="true"><PixelCharacter agent={item.profile}/></span>
          <span><strong>{item.locked ? '🔒 ' : ''}{item.label}</strong><small>{!item.available ? item.reason ?? 'tidak tersedia' : item.kind === 'opencode' ? `${item.contextFiles.length} berkas aturan` : `${(item.memory?.entries.length ?? 0) + (item.user?.entries.length ?? 0)} entri · puncak ${peak}%`}</small></span>
        </button>
      })}</div>
      <PrivateGate agent={agent.profile}>{agent.locked ? <ProfileUnlock agent={agent.profile}/> : <AgentPanel key={agent.profile} agent={agent} onOpenFolders={onOpenFolders}/>}</PrivateGate>
    </>}
  </>
}
