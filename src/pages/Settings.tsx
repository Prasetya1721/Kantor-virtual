import { useState, type FormEvent } from 'react'
import { accessRequest, downloadCode, generateCode, type AccessStatus } from '../access.ts'
import { formatDateTime } from '../format.ts'
import { PageTitle } from '../ui.tsx'
import { ProfileLockSettings } from './ProfileLockSettings.tsx'

type Mode = 'idle' | 'set' | 'off'

function CodeField({ id, label, value, onChange, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return <><label className="field-label" htmlFor={id}>{label}</label>
    <div className="code-input-row"><input id={id} className="text-input" type={show ? 'text' : 'password'} autoComplete={autoComplete} spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)}/><button type="button" className="refresh-button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={`${show ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}>{show ? 'SEMBUNYI' : 'TAMPILKAN'}</button></div></>
}

/** Turn the access code on, or replace it: a generated code (default) or a custom one. */
function CodeSetup({ status, onDone, onCancel }: { status: AccessStatus; onDone: (status: AccessStatus) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<'generated' | 'custom'>('generated')
  const [generated, setGenerated] = useState(() => generateCode())
  const [custom, setCustom] = useState('')
  const [confirm, setConfirm] = useState('')
  const [current, setCurrent] = useState('')
  const [saved, setSaved] = useState(false)
  const [remember, setRemember] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const code = kind === 'generated' ? generated : custom.trim()
  const customProblem = kind === 'custom' && (code.length < status.minLength ? `Gunakan minimal ${status.minLength} karakter.` : custom !== confirm ? 'Kedua kode tidak sama.' : undefined)
  const changeCode = (next: () => void) => { next(); setSaved(false); setCopied(false) }

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true) } catch { setError('Salin tidak tersedia di sini. Unduh kodenya saja.') }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (customProblem) { setError(customProblem); return }
    if (status.enabled && !current.trim()) { setError('Masukkan kode akses saat ini.'); return }
    setBusy(true)
    setError(undefined)
    const result = await accessRequest('code', { code, remember, ...(status.enabled ? { currentCode: current } : {}) })
    setBusy(false)
    if (result.ok) onDone(result.status); else setError(result.message)
  }

  return <form className="access-setup" onSubmit={submit}>
    <fieldset className="segmented"><legend className="field-label">Kode</legend>
      <label className={kind === 'generated' ? 'active' : ''}><input type="radio" name="code-kind" checked={kind === 'generated'} onChange={() => changeCode(() => setKind('generated'))}/> Buat otomatis</label>
      <label className={kind === 'custom' ? 'active' : ''}><input type="radio" name="code-kind" checked={kind === 'custom'} onChange={() => changeCode(() => setKind('custom'))}/> Kustom</label>
    </fieldset>
    {kind === 'generated'
      ? <div className="generated-code"><code aria-label="Kode akses yang dibuat">{generated}</code><button type="button" className="refresh-button" onClick={() => changeCode(() => setGenerated(generateCode()))}>↻ GANTI</button></div>
      : <><CodeField id="custom-code" label="Kode akses baru" value={custom} onChange={(value) => changeCode(() => setCustom(value))} autoComplete="new-password"/>
        <CodeField id="confirm-code" label="Ulangi kode baru" value={confirm} onChange={setConfirm} autoComplete="new-password"/>
        <p className="small-note">Minimal {status.minLength} karakter. Spasi di awal dan akhir diabaikan.</p></>}
    <p className="muted">Ruang tidak punya reset kata sandi, jadi simpan salinan kodenya. Kode hanya ditampilkan di sini, saat diatur.</p>
    <div className="access-actions">
      <button type="button" className="refresh-button" onClick={() => downloadCode(code)} disabled={Boolean(customProblem) || !code}>⬇ UNDUH .TXT</button>
      <button type="button" className="refresh-button" onClick={() => void copy()} disabled={Boolean(customProblem) || !code}>{copied ? '✓ TERSALIN' : 'SALIN'}</button>
    </div>
    {status.enabled && <CodeField id="current-code" label="Kode akses saat ini" value={current} onChange={setCurrent} autoComplete="current-password"/>}
    <label className="check-label"><input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)}/> Saya sudah menyimpan kode ini (diunduh atau disalin)</label>
    <label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/> Ingat perangkat ini selama {status.rememberDays} hari</label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="access-actions">
      <button type="submit" className="primary-button" disabled={!saved || busy}>{busy ? 'Menyimpan…' : status.enabled ? 'Simpan kode baru' : 'Aktifkan kode akses'}</button>
      <button type="button" className="refresh-button" onClick={onCancel}>BATAL</button>
    </div>
  </form>
}

function TurnOff({ onDone, onCancel }: { onDone: (status: AccessStatus) => void; onCancel: () => void }) {
  const [current, setCurrent] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!current.trim()) { setError('Masukkan kode akses saat ini.'); return }
    setBusy(true)
    const result = await accessRequest('disable', { currentCode: current })
    setBusy(false)
    if (result.ok) onDone(result.status); else setError(result.message)
  }
  return <form className="access-setup" onSubmit={submit}>
    <p className="muted">Siapa pun yang bisa membuka alamat ini akan melihat Ruang tanpa kode.</p>
    <CodeField id="disable-code" label="Kode akses saat ini" value={current} onChange={setCurrent} autoComplete="current-password"/>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="access-actions"><button type="submit" className="primary-button danger" disabled={busy}>{busy ? 'Mematikan…' : 'Matikan kode akses'}</button><button type="button" className="refresh-button" onClick={onCancel}>CANCEL</button></div>
  </form>
}

export function Settings({ access, onAccessChange }: { access: AccessStatus | undefined; onAccessChange: (status: AccessStatus) => void }) {
  const [mode, setMode] = useState<Mode>('idle')
  const [message, setMessage] = useState<string>()
  const done = (text: string) => (status: AccessStatus) => { setMode('idle'); setMessage(text); onAccessChange(status) }
  const lock = async () => {
    const result = await accessRequest('lock')
    if (result.ok) onAccessChange(result.status)
  }
  return <><PageTitle eyebrow="RUANG" title="Pengaturan">Pengaturan server Ruang ini. Hermes sendiri tetap hanya-baca.</PageTitle>
    <section className="card settings-card" aria-labelledby="access-title">
      <div className="settings-head"><div><p className="eyebrow">KEAMANAN</p><h2 id="access-title">Kode akses</h2></div>{access && <span className={`badge ${access.enabled ? 'good' : 'muted'}`}>{access.enabled ? 'Aktif' : 'Nonaktif'}</span>}</div>
      <p className="muted">Minta kode setiap kali Ruang dibuka di peramban. Seperti API key: buat (atau pilih) sekali, unduh, lalu masukkan saat diminta. Hanya hash-nya yang disimpan di server.</p>
      {!access ? <p className="muted">Memuat…</p> : <>
        {access.enabled && access.since && <p className="small-note">Ditetapkan {formatDateTime(access.since)}.</p>}
        {message && mode === 'idle' && <p className="form-success" role="status">{message}</p>}
        {mode === 'idle' && <div className="access-actions">
          {access.enabled
            ? <><button type="button" className="primary-button" onClick={() => { setMessage(undefined); setMode('set') }}>Ganti kode</button><button type="button" className="refresh-button" onClick={() => { setMessage(undefined); setMode('off') }}>MATIKAN</button><button type="button" className="refresh-button" onClick={() => void lock()}>KUNCI PERAMBAN INI</button></>
            : <button type="button" className="primary-button" onClick={() => { setMessage(undefined); setMode('set') }}>Siapkan kode akses</button>}
        </div>}
        {mode === 'set' && <CodeSetup status={access} onDone={done(access.enabled ? 'Kode akses baru tersimpan. Peramban lain sudah dikeluarkan.' : 'Kode akses aktif. Peramban lain kini memerlukannya.')} onCancel={() => setMode('idle')}/>}
        {mode === 'off' && <TurnOff onDone={done('Kode akses dimatikan.')} onCancel={() => setMode('idle')}/>}
        <p className="small-note">Kode hilang? Di mesin yang menjalankan Ruang, jalankan <code>ruang access-code off</code> (atau <code>ruang access-code new</code> untuk kode acak baru).</p>
      </>}
    </section>
    <ProfileLockSettings/>
  </>
}
