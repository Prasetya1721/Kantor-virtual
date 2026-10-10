import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../format.ts'
import { usePolling } from '../polling.ts'
import type { CommandLogSnapshot, LogLevel, LogsSnapshot } from '../types.ts'
import { EmptyState, LoadingState, PageTitle, SearchInput, SourceStatus } from '../ui.tsx'

const LEVELS: ('ALL' | LogLevel)[] = ['ALL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']
const MISSION_CONTROL = 'mission-control'

export function Logs() {
  const [follow, setFollow] = useState(true)
  const logs = usePolling<LogsSnapshot>('/api/logs', follow ? 5_000 : 0)
  const commands = usePolling<CommandLogSnapshot>('/api/command-log', follow ? 5_000 : 0)
  const [tab, setTab] = useState('agent')
  const [level, setLevel] = useState<'ALL' | LogLevel>('ALL')
  const [query, setQuery] = useState('')
  const viewer = useRef<HTMLPreElement>(null)
  const data = logs.status === 'ready' ? logs.data : undefined
  const file = data?.files.find((item) => item.name === tab)
  const needle = query.trim().toLowerCase()
  const lines = (file?.source.data ?? []).filter((line) => (level === 'ALL' || line.level === level) && (!needle || line.text.toLowerCase().includes(needle)))
  const commandData = commands.status === 'ready' ? commands.data : undefined

  useEffect(() => {
    if (follow && viewer.current) viewer.current.scrollTop = viewer.current.scrollHeight
  }, [follow, lines.length, tab])

  const tabs = [...(data?.files.map((item) => ({ name: item.name, label: item.label, count: item.source.data.filter((line) => line.level === 'ERROR').length })) ?? []), { name: MISSION_CONTROL, label: 'Audit perintah', count: commandData?.health.failed ?? 0 }]
  return <><PageTitle eyebrow="LOG HERMES" title="Log">Ekor dari <code>hermes logs</code> (agen, gateway, error) dengan rahasia disamarkan, ditambah audit server sendiri atas setiap perintah baca yang dijalankannya.</PageTitle>
    {tab === MISSION_CONTROL ? <SourceStatus source={commandData ? { availability: 'available', data: null } : undefined} fetchedAt={commandData?.fetchedAt} request={commands}/> : <SourceStatus source={file?.source} fetchedAt={data?.fetchedAt} request={logs}/>}
    <div className="room-tabs log-tabs" role="tablist" aria-label="Berkas log">{tabs.map((item) => <button key={item.name} role="tab" aria-selected={tab === item.name} className={tab === item.name ? 'active' : ''} onClick={() => setTab(item.name)}>{item.label}{item.count > 0 && <span className="room-count error-count">{item.count}</span>}</button>)}</div>
    {tab === MISSION_CONTROL ? (commands.status === 'pending' ? <LoadingState message="Membaca audit perintah..."/> : !commandData ? <EmptyState title="Tidak Tersedia">API Ruang tidak dapat dijangkau.</EmptyState> : <>
      <p className="card-note">{commandData.health.total} pembacaan tercatat · {commandData.health.failed} gagal · rata-rata {commandData.health.averageMs} ms. Hanya perintah tetap dan hanya-baca yang pernah dijalankan.</p>
      {commandData.entries.length === 0 ? <EmptyState title="Belum ada pembacaan">Perintah muncul di sini saat halaman memuat data.</EmptyState> : <table className="log-table"><thead><tr><th>Waktu</th><th>Perintah</th><th>Hasil</th><th>Durasi</th></tr></thead><tbody>{commandData.entries.map((entry, index) => <tr key={`${entry.at}-${index}`}><td>{formatTime(entry.at)}</td><td><code>{entry.command}</code></td><td>{entry.ok ? <span className="badge good">ok</span> : <span className="badge bad" title={entry.error}>{entry.error ?? 'gagal'}</span>}</td><td>{entry.durationMs} ms</td></tr>)}</tbody></table>}
    </>) : logs.status === 'pending' ? <LoadingState message="Membaca log Hermes..."/> : !file ? <EmptyState title="Tidak Tersedia">API Ruang tidak dapat dijangkau.</EmptyState> : file.source.availability === 'unavailable' ? <EmptyState title="Tidak Tersedia">{file.source.error?.message ?? 'hermes logs tidak dapat dibaca.'}</EmptyState> : <>
      <div className="toolbar"><SearchInput value={query} onChange={setQuery} label="Saring baris log"/><label className="select-label">Level <select value={level} onChange={(event) => setLevel(event.target.value as 'ALL' | LogLevel)}>{LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="check-label"><input type="checkbox" checked={follow} onChange={(event) => setFollow(event.target.checked)}/> Ikuti (5 dtk)</label><span className="toolbar-count">{lines.length} dari {file.source.data.length} baris</span></div>
      {file.source.data.length === 0 ? <EmptyState title="Log kosong">Hermes belum menulis ke log {file.label.toLowerCase()}.</EmptyState> : <pre className="log-viewer" ref={viewer} tabIndex={0} aria-label={`log ${file.label}`}>{lines.map((line, index) => <span key={index} className={`log-line level-${line.level.toLowerCase()}`}>{line.text}{'\n'}</span>)}</pre>}
    </>}
  </>
}
