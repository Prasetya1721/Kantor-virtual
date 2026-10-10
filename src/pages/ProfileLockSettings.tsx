import { useState, type FormEvent } from 'react'
import { PinInput } from '../ProfileLock.tsx'
import { usePolling } from '../polling.ts'
import { profileLockRequest, useProfileLock, type ProfileLockStatus } from '../profile-lock.ts'
import type { RuntimeSnapshot } from '../types.ts'

type Mode = 'idle' | 'setup' | 'agents' | 'pin' | 'off'

/** Pick the agents whose private data needs the PIN, and manage that one 6-digit PIN. */
export function ProfileLockSettings() {
  const status = useProfileLock()
  const runtime = usePolling<RuntimeSnapshot>('/api/runtime', 60_000)
  const [mode, setMode] = useState<Mode>('idle')
  const [message, setMessage] = useState<string>()
  const agents = runtime.status === 'ready' ? [
    ...(runtime.data.profiles.availability === 'available' ? runtime.data.profiles.data.map((profile) => profile.name) : []),
    ...(runtime.data.openCode.availability === 'available' ? ['opencode'] : []),
  ] : []
  const finish = (text: string) => () => { setMode('idle'); setMessage(text) }
  const start = (next: Mode) => () => { setMessage(undefined); setMode(next) }
  return <section className="card settings-card" aria-labelledby="profile-lock-title">
    <div className="settings-head"><div><p className="eyebrow">PRIVASI</p><h2 id="profile-lock-title">Kunci profil</h2></div>{status && <span className={`badge ${status.enabled ? 'good' : 'muted'}`}>{status.enabled ? `Aktif · ${status.agents.length} terkunci` : 'Nonaktif'}</span>}</div>
    <p className="muted">Seperti app lock di ponsel: pilih agen dan setel satu PIN 6 digit. Agen terkunci tetap bekerja dan berjalan di kantor, tapi memori, berkas, tugas Kanban, nama cron, aktivitas langsung, dan (untuk <code>default</code>) sesi serta log-nya tetap privat sampai PIN membuka agen itu di peramban ini selama {status?.unlockMinutes ?? 15} menit. Server yang menahan datanya, bukan sekadar halamannya.</p>
    {!status ? <p className="muted">Memuat…</p> : <>
      {status.enabled && <p className="small-note">Terkunci: {status.agents.length ? status.agents.map((agent) => `${agent}${status.unlocked.includes(agent) ? ' (terbuka di sini)' : ''}`).join(', ') : 'belum ada agen'}.</p>}
      {message && mode === 'idle' && <p className="form-success" role="status">{message}</p>}
      {mode === 'idle' && <div className="access-actions">
        {status.enabled ? <>
          <button type="button" className="primary-button" onClick={start('agents')}>Pilih agen</button>
          <button type="button" className="refresh-button" onClick={start('pin')}>GANTI PIN</button>
          <button type="button" className="refresh-button" onClick={start('off')}>MATIKAN</button>
          {status.unlocked.length > 0 && <button type="button" className="refresh-button" onClick={() => void profileLockRequest('lock').then(() => setMessage('Semua agen terkunci lagi di peramban ini.'))}>🔒 KUNCI SEMUA LAGI</button>}
        </> : <button type="button" className="primary-button" onClick={start('setup')}>Siapkan kunci profil</button>}
      </div>}
      {mode === 'setup' && <LockForm kind="setup" agents={agents} status={status} onDone={finish('Kunci profil aktif.')} onCancel={() => setMode('idle')}/>}
      {mode === 'agents' && <LockForm kind="agents" agents={agents} status={status} onDone={finish('Daftar agen terkunci tersimpan.')} onCancel={() => setMode('idle')}/>}
      {mode === 'pin' && <LockForm kind="pin" agents={agents} status={status} onDone={finish('PIN baru tersimpan. Semua agen yang terbuka terkunci lagi.')} onCancel={() => setMode('idle')}/>}
      {mode === 'off' && <LockForm kind="off" agents={agents} status={status} onDone={finish('Kunci profil dimatikan. Semua agen terlihat.')} onCancel={() => setMode('idle')}/>}
      <p className="small-note">PIN hilang? Di mesin yang menjalankan Ruang, jalankan <code>ruang profile-lock off</code>.</p>
    </>}
  </section>
}

function LockForm({ kind, agents, status, onDone, onCancel }: { kind: 'setup' | 'agents' | 'pin' | 'off'; agents: string[]; status: ProfileLockStatus; onDone: () => void; onCancel: () => void }) {
  const [chosen, setChosen] = useState<string[]>(kind === 'agents' ? status.agents : [])
  const [pin, setPin] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const choosing = kind === 'setup' || kind === 'agents'
  const newPin = kind === 'setup' || kind === 'pin'
  const toggle = (agent: string) => setChosen((list) => list.includes(agent) ? list.filter((item) => item !== agent) : [...list, agent])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const fresh = kind === 'setup' ? pin : next
    if (newPin && (fresh.length !== 6 || fresh !== repeat)) { setError(fresh.length !== 6 ? 'PIN terdiri dari 6 digit.' : 'Kedua PIN tidak sama.'); return }
    if (kind !== 'setup' && pin.length !== 6) { setError('Masukkan PIN 6 digit saat ini.'); return }
    if (kind === 'setup' && chosen.length === 0) { setError('Pilih minimal satu agen untuk dikunci.'); return }
    setBusy(true)
    setError(undefined)
    const result = kind === 'setup' ? await profileLockRequest('setup', { pin, agents: chosen })
      : kind === 'agents' ? await profileLockRequest('update', { pin, agents: chosen })
        : kind === 'pin' ? await profileLockRequest('update', { pin, newPin: next })
          : await profileLockRequest('disable', { pin })
    setBusy(false)
    if (result.ok) onDone(); else { setError(result.message); setPin('') }
  }
  // Agents locked before but no longer listed (e.g. a removed profile) stay choosable.
  const list = [...new Set([...agents, ...status.agents])]
  return <form className="access-setup" onSubmit={submit}>
    {choosing && <fieldset className="lock-agents"><legend className="field-label">Agen yang dikunci</legend>
      {list.length === 0 ? <p className="muted">Tidak ada agen ditemukan.</p> : list.map((agent) => <label key={agent} className={`lock-agent${chosen.includes(agent) ? ' active' : ''}`}><input type="checkbox" checked={chosen.includes(agent)} onChange={() => toggle(agent)}/> {chosen.includes(agent) ? '🔒' : '🔓'} {agent}</label>)}
    </fieldset>}
    {kind === 'setup' ? <>
      <PinInput id="lock-new-pin" value={pin} onChange={setPin} label="PIN 6 digit baru" autoFocus/>
      <PinInput id="lock-repeat-pin" value={repeat} onChange={setRepeat} label="Ulangi PIN"/>
      <p className="small-note">Tidak ada reset PIN di aplikasi. Ingat PIN-nya, atau pakai <code>ruang profile-lock off</code> di mesin.</p>
    </> : <PinInput id="lock-current-pin" value={pin} onChange={setPin} label="PIN saat ini" autoFocus/>}
    {kind === 'pin' && <>
      <PinInput id="lock-next-pin" value={next} onChange={setNext} label="PIN 6 digit baru"/>
      <PinInput id="lock-next-repeat" value={repeat} onChange={setRepeat} label="Ulangi PIN baru"/>
    </>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="access-actions">
      <button type="submit" className={`primary-button${kind === 'off' ? ' danger' : ''}`} disabled={busy}>{busy ? 'Menyimpan…' : kind === 'setup' ? 'Aktifkan kunci profil' : kind === 'agents' ? 'Simpan agen terkunci' : kind === 'pin' ? 'Simpan PIN baru' : 'Matikan kunci profil'}</button>
      <button type="button" className="refresh-button" onClick={onCancel}>BATAL</button>
    </div>
  </form>
}
