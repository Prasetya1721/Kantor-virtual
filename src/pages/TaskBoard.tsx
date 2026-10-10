import { useEffect, useRef, useState } from 'react'
import { formatDateTime, orderedStatuses, statusLabelId, statusTone } from '../format.ts'
import { usePolling } from '../polling.ts'
import { loadSnapshot, type RequestState } from '../request-state.ts'
import type { Task, TaskBoardSnapshot, TaskDetailSnapshot } from '../types.ts'
import { Dialog, EmptyState, PageTitle, SearchInput, SourceStatus, Unavailable } from '../ui.tsx'
import { ProfileUnlock, RelockBar } from '../ProfileLock.tsx'
import { agentPrivacy, useProfileLock } from '../profile-lock.ts'

const UNASSIGNED = '(tanpa penanggung jawab)'

function Field({ label, value }: { label: string; value?: string | number }) {
  return value === undefined || value === '' ? null : <div><dt>{label}</dt><dd>{value}</dd></div>
}

export function TaskDetailDialog({ task, onClose, onOpenTask }: { task: Task; onClose: () => void; onOpenTask?: (id: string) => void }) {
  const [state, setState] = useState<RequestState<TaskDetailSnapshot>>({ status: 'pending' })
  const lock = useProfileLock()
  // A locked agent's task stays private until its PIN is entered; the server refuses it too.
  const privacy = agentPrivacy(lock, task.assignee)
  const locked = privacy === 'locked' || (task.private === true && !lock)
  useEffect(() => {
    if (!task.id || locked) return
    let active = true
    setState({ status: 'pending' })
    void loadSnapshot<TaskDetailSnapshot>(`/api/tasks/${encodeURIComponent(task.id)}${task.board ? `?board=${encodeURIComponent(task.board)}` : ''}`).then((next) => { if (active) setState(next) })
    return () => { active = false }
  }, [task.id, task.board, locked])
  const detail = state.status === 'ready' && state.data.task.availability === 'available' ? state.data.task.data : null
  const failed = !task.id || state.status === 'failed' || (state.status === 'ready' && !detail)
  const status = detail?.status ?? task.status
  const links = (label: string, ids: string[]) => ids.length > 0 && <div><dt>{label}</dt><dd className="task-links">{ids.map((id) => <button type="button" key={id} className="chip chip-button" onClick={() => onOpenTask?.(id)}>{id}</button>)}</dd></div>
  return <Dialog labelledBy="task-detail-title" onClose={onClose} closeLabel={`Tutup detail ${task.title}`} className="task-detail">
    <p className="eyebrow">TUGAS KANBAN{task.board ? ` · PAPAN ${task.board.toUpperCase()}` : ''}{task.id ? ` · ${task.id}` : ''}</p>
    <h2 id="task-detail-title">{detail?.title ?? task.title}</h2>
    <div className="task-meta"><span className={`badge ${statusTone(status)}`}>{statusLabelId(status)}</span><span className={`chip ${task.assignee ? '' : 'chip-muted'}`}>{detail?.assignee ?? task.assignee ?? 'tanpa penanggung jawab'}</span>{(detail?.priority ?? task.priority) ? <span className="chip chip-priority">P{detail?.priority ?? task.priority}</span> : null}</div>
    {locked && task.assignee ? <ProfileUnlock agent={task.assignee} minutes={lock?.unlockMinutes} compact/> : <>
    {privacy === 'unlocked' && task.assignee && <RelockBar agent={task.assignee} minutes={lock?.unlockMinutes ?? 15}/>}
    {state.status === 'pending' && task.id && <p className="muted">Memuat detail tugas…</p>}
    {failed && <p className="file-notice">{task.id ? 'Detail lengkap belum tersedia saat ini (hermes kanban show tidak dapat dibaca). Menampilkan ringkasan papan.' : 'Tugas ini tidak punya id, jadi hanya ringkasan papan yang tersedia.'}</p>}
    {detail && <>
      <dl className="office-detail-grid task-grid">
        <Field label="Dibuat" value={detail.createdAt ? `${formatDateTime(detail.createdAt)}${detail.createdBy ? ` oleh ${detail.createdBy}` : ''}` : undefined}/>
        <Field label="Dimulai" value={detail.startedAt && formatDateTime(detail.startedAt)}/>
        <Field label="Selesai" value={detail.completedAt && formatDateTime(detail.completedAt)}/>
        <Field label="Ruang Kerja" value={detail.workspace}/>
        <Field label="Cabang" value={detail.branch}/>
        <Field label="Model" value={detail.model}/>
        <Field label="Tenant" value={detail.tenant}/>
        <Field label="Keahlian" value={detail.skills.join(', ')}/>
        {links('Bergantung pada', detail.parents)}
        {links('Menghambat', detail.children)}
      </dl>
      {detail.lastError && <section className="task-section"><p className="eyebrow">KEGAGALAN TERAKHIR</p><pre className="task-text text-bad">{detail.lastError}</pre></section>}
      <section className="task-section"><p className="eyebrow">DESKRIPSI</p>{detail.body ? <pre className="task-text">{detail.body}</pre> : <p className="muted">Tidak ada deskripsi.</p>}</section>
      {detail.result && <section className="task-section"><p className="eyebrow">HASIL / RINGKASAN TERBARU</p><pre className="task-text">{detail.result}</pre></section>}
      {detail.runs.length > 0 && <section className="task-section"><p className="eyebrow">JALAN ({detail.runs.length})</p><table className="log-table"><thead><tr><th>Jalan</th><th>Profil</th><th>Status</th><th>Dimulai</th><th>Berakhir</th></tr></thead><tbody>{detail.runs.map((run) => <tr key={run.id}><td>#{run.id}</td><td>{run.profile ?? '—'}</td><td><span className={`badge ${statusTone(run.outcome ?? run.status ?? '')}`}>{run.outcome ?? run.status ?? '—'}</span>{run.error && <div className="text-bad small-note">{run.error}</div>}{run.summary && <div className="small-note">{run.summary}</div>}</td><td>{formatDateTime(run.startedAt)}</td><td>{formatDateTime(run.endedAt)}</td></tr>)}</tbody></table></section>}
      {detail.comments.length > 0 && <section className="task-section"><p className="eyebrow">KOMENTAR ({detail.comments.length})</p><ul className="task-timeline">{detail.comments.map((comment, index) => <li key={index}><b>{comment.author}</b><small>{formatDateTime(comment.createdAt)}</small><p>{comment.body}</p></li>)}</ul></section>}
      {detail.events.length > 0 && <section className="task-section"><p className="eyebrow">AKTIVITAS ({detail.events.length})</p><ul className="task-timeline">{[...detail.events].reverse().map((event, index) => <li key={index}><b>{event.kind}</b><small>{formatDateTime(event.createdAt)}{event.runId ? ` · jalan #${event.runId}` : ''}</small>{event.detail && <code>{event.detail}</code>}</li>)}</ul></section>}
    </>}
    </>}
  </Dialog>
}

export function TaskBoard() {
  const snapshot = usePolling<TaskBoardSnapshot>('/api/tasks', 10_000)
  const [query, setQuery] = useState('')
  const [assignee, setAssignee] = useState('all')
  const [board, setBoard] = useState('all')
  const [openTask, setOpenTask] = useState<Task | undefined>()
  const trigger = useRef<HTMLButtonElement | null>(null)
  const boardRef = useRef<HTMLElement | null>(null)
  /** Scrolls the board sideways by about one column, or to a column. */
  const scrollBoard = (direction: number) => boardRef.current?.scrollBy({ left: direction * 250, behavior: 'smooth' })
  const showColumn = (status: string) => boardRef.current?.querySelector<HTMLElement>(`[data-status="${CSS.escape(status)}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  const closeTask = () => { setOpenTask(undefined); trigger.current?.focus() }
  const data = snapshot.status === 'ready' ? snapshot.data : undefined
  const tasks = data?.tasks
  const all = tasks?.data ?? []
  const assignees = [...new Set(all.map((task) => task.assignee ?? UNASSIGNED))].sort()
  const boards = data?.boards ?? []
  const multiBoard = boards.length > 1
  const needle = query.trim().toLowerCase()
  const visible = all.filter((task) => (assignee === 'all' || (task.assignee ?? UNASSIGNED) === assignee) && (board === 'all' || task.board === board) && (!needle || `${task.title} ${task.id ?? ''} ${task.assignee ?? ''}`.toLowerCase().includes(needle)))
  const columns = orderedStatuses(all.map((task) => task.status), true)
  return <><PageTitle eyebrow="KANBAN HERMES" title="Papan Tugas">Tampilan langsung hanya-baca dari <code>hermes kanban list</code> di setiap papan Kanban. Kolom mengikuti urutan papan Hermes; papan disegarkan setiap 10 detik.</PageTitle>
    <SourceStatus source={tasks} fetchedAt={data?.fetchedAt} request={snapshot}/><Unavailable source={tasks} request={snapshot}/>
    {data?.failedBoards && <p className="file-notice">Papan {data.failedBoards.join(', ')} tidak dapat dibaca; menampilkan yang lain.</p>}
    {tasks?.availability === 'available' && (all.length === 0 ? <EmptyState title="Tidak ada tugas">{multiBoard ? `Tidak ada tugas terbuka di ${boards.length} papan Kanban.` : 'Hermes mengembalikan daftar tugas Kanban yang kosong.'} Buat satu dengan <code>hermes kanban create</code>.</EmptyState> : <>
      <div className="toolbar"><SearchInput value={query} onChange={setQuery} label="Cari tugas"/><label className="select-label">Penanggung jawab <select value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="all">Semua ({all.length})</option>{assignees.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>{multiBoard && <label className="select-label">Papan <select value={board} onChange={(event) => setBoard(event.target.value)}><option value="all">Semua papan</option>{boards.map((item) => <option key={item.slug} value={item.slug}>{item.name}{item.current ? ' (saat ini)' : ''}</option>)}</select></label>}<span className="toolbar-count">{visible.length} ditampilkan</span></div>
      <nav className="board-nav" aria-label="Kolom Kanban">
        <button type="button" className="refresh-button" onClick={() => scrollBoard(-1)} aria-label="Geser papan ke kiri">‹</button>
        <div className="board-nav-chips">{columns.map((status) => <button type="button" key={status} className={`chip chip-button tone-border-${statusTone(status)}`} onClick={() => showColumn(status)}>{statusLabelId(status)} <b>{visible.filter((task) => task.status === status).length}</b></button>)}</div>
        <button type="button" className="refresh-button" onClick={() => scrollBoard(1)} aria-label="Geser papan ke kanan">›</button>
      </nav>
      <section className="board" aria-label="Papan Kanban" ref={boardRef}>{columns.map((status) => {
        const items = visible.filter((task) => task.status === status).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        return <article key={status} data-status={status} className={`column tone-border-${statusTone(status)}`} aria-label={`Kolom ${statusLabelId(status)}`}><header className="column-head"><p className="eyebrow">{statusLabelId(status)}</p><span className="column-count">{items.length}</span></header>
          {items.length === 0 ? <p className="column-empty">—</p> : items.map((task) => <button type="button" className="task task-card" key={`${task.board ?? ''}-${task.status}-${task.id ?? task.title}`} onClick={(event) => { trigger.current = event.currentTarget; setOpenTask(task) }} aria-label={`${task.title}. ${statusLabelId(task.status)}. Buka detail tugas.`}><strong>{task.title}</strong><div className="task-meta">{task.id && <small>{task.id}</small>}{multiBoard && task.board && <span className="chip chip-muted">{task.board}</span>}<span className={`chip ${task.assignee ? '' : 'chip-muted'}`}>{task.assignee ?? 'tanpa penanggung jawab'}</span>{task.priority ? <span className="chip chip-priority">P{task.priority}</span> : null}</div></button>)}
        </article>
      })}</section>
    </>)}
    {openTask && <TaskDetailDialog key={`${openTask.board ?? ''}-${openTask.id ?? openTask.title}`} task={openTask} onClose={closeTask} onOpenTask={(id) => setOpenTask(all.find((task) => task.id === id && task.board === openTask.board) ?? { id, title: id, status: 'unknown', ...(openTask.board ? { board: openTask.board } : {}) })}/>}
  </>
}
