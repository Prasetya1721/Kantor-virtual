import { agentLabel, stationActivityText } from '../format.ts'
import type { OfficeSnapshot, RuntimeSnapshot } from '../types.ts'
import { usePolling } from '../polling.ts'
import { EmptyState, LoadingState, PageTitle, RuntimeBadge } from '../ui.tsx'
import { PixelCharacter } from './Office.tsx'
import { SPECIALIZED_ROLES } from '../specialized-roles.ts'

/** Every Hermes profile on this machine is an agent, plus OpenCode when it is installed. */
export function Agents({ runtime, pending = false }: { runtime: RuntimeSnapshot | null; pending?: boolean }) {
  const office = usePolling<OfficeSnapshot>('/api/office', 15_000)
  if (pending) return <><PageTitle eyebrow="KRU" title="Agen"/><LoadingState message="Membaca detail runtime..."/></>
  if (!runtime || runtime.profiles.availability === 'unavailable') return <><PageTitle eyebrow="KRU" title="Agen"/><EmptyState title="Tidak Tersedia">Daftar profil Hermes tidak dapat dibaca. Apakah <code>hermes</code> ada di PATH server?</EmptyState></>
  const states = new Map(office.status === 'ready' ? office.data.stations.map((station) => [station.id, station]) : [])
  const openCode = runtime.openCode.availability === 'available' ? runtime.openCode.data : undefined
  const cards = [
    ...runtime.profiles.data.map((profile) => ({ id: profile.name, kind: 'Profil Hermes', model: profile.model, gateway: profile.gateway })),
    ...(openCode ? [{ id: 'opencode', kind: 'OpenCode (alat CLI)', model: openCode, gateway: undefined }] : []),
  ]
  return <><PageTitle eyebrow="KRU" title="Agen">Setiap profil Hermes di mesin ini (dari <code>hermes profile list</code>) adalah agen{openCode ? ', ditambah OpenCode' : ''}. Tidak ada yang dikonfigurasi manual: profil baru muncul di sini dan di kantor secara otomatis.</PageTitle>
    <section className="agent-grid">{cards.map((card) => {
      const station = states.get(card.id)
      return <article className="agent-card" key={card.id}>
        <span className="folder-glyph" aria-hidden="true"><PixelCharacter agent={card.id}/></span>
        <div className="agent-card-body">
          <h2>{station?.privacy === 'locked' ? '🔒 ' : ''}{agentLabel(card.id)}</h2>
          <p className="muted">{card.kind}</p>
          <dl>
            <div><dt>Model</dt><dd>{card.model}</dd></div>
            <div><dt>Gateway</dt><dd>{card.gateway ? <RuntimeBadge source={{ availability: 'available', data: card.gateway }}/> : <span className="muted">Tidak ada (alat CLI)</span>}</dd></div>
            <div><dt>Di kantor</dt><dd>{station ? stationActivityText(station.state, station.activity) : '—'}</dd></div>
          </dl>
        </div>
      </article>
    })}</section>

    <section className="engineering-section">
      <p className="eyebrow">DIVISI ENGINEERING</p>
      <h2>Sub-Agent Spesialis & Peran Tim</h2>
      <div className="engineering-banner">
        <p><strong>💡 Optimalisasi Efisiensi 2-Core CPU:</strong> Peran-peran spesialis ini tidak dijalankan sebagai background daemon/gateway independen agar tidak membebani komputasi server. Mereka beroperasi sebagai <strong>Sub-Agent on-demand berbasis tugas</strong> yang dikoordinasikan langsung oleh Lead Engineer dan OpenCode.</p>
        <small>Eksekusi: delegasi berbasis tugas · Sumber daya siaga: 0% CPU · Eksekusi alat terisolasi</small>
      </div>
      <div className="role-grid">
        {SPECIALIZED_ROLES.map((role) => <article className="role-card" key={role.title}>
          <header>
            <div>
              <p className="eyebrow">{role.icon} {role.focus}</p>
              <h3>{role.title}</h3>
            </div>
            <span className={`role-badge ${role.category === 'Peran Utama' ? 'core' : 'supporting'}`}>{role.category}</span>
          </header>
          <ul className="role-list">
            {role.responsibilities.map((resp) => <li key={resp}>{resp}</li>)}
          </ul>
          <div className="role-skills">
            {role.skills.map((skill) => <span className="role-tag" key={skill}>#{skill}</span>)}
          </div>
          <div className="role-footer">Koordinasi: Lead Engineer · Eksekusi: OpenCode / Hermes</div>
        </article>)}
      </div>
    </section>
  </>
}
