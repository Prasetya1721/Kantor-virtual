import { agentLabel } from '../format.ts'
import type { OfficeSnapshot, RuntimeSnapshot } from '../types.ts'
import { usePolling } from '../polling.ts'
import { EmptyState, LoadingState, PageTitle, RuntimeBadge } from '../ui.tsx'
import { PixelCharacter } from './Office.tsx'
import { SPECIALIZED_ROLES } from '../specialized-roles.ts'

/** Every Hermes profile on this machine is an agent, plus OpenCode when it is installed. */
export function Agents({ runtime, pending = false }: { runtime: RuntimeSnapshot | null; pending?: boolean }) {
  const office = usePolling<OfficeSnapshot>('/api/office', 15_000)
  if (pending) return <><PageTitle eyebrow="CREW" title="Agents"/><LoadingState message="Reading runtime details..."/></>
  if (!runtime || runtime.profiles.availability === 'unavailable') return <><PageTitle eyebrow="CREW" title="Agents"/><EmptyState title="Not Available">The Hermes profile list could not be read. Is <code>hermes</code> on the PATH of the server?</EmptyState></>
  const states = new Map(office.status === 'ready' ? office.data.stations.map((station) => [station.id, station]) : [])
  const openCode = runtime.openCode.availability === 'available' ? runtime.openCode.data : undefined
  const cards = [
    ...runtime.profiles.data.map((profile) => ({ id: profile.name, kind: 'Hermes profile', model: profile.model, gateway: profile.gateway })),
    ...(openCode ? [{ id: 'opencode', kind: 'OpenCode (CLI tool)', model: openCode, gateway: undefined }] : []),
  ]
  return <><PageTitle eyebrow="CREW" title="Agents">Every Hermes profile on this machine (from <code>hermes profile list</code>) is an agent{openCode ? ', plus OpenCode' : ''}. Nothing is configured by hand: new profiles appear here and in the office automatically.</PageTitle>
    <section className="agent-grid">{cards.map((card) => {
      const station = states.get(card.id)
      return <article className="agent-card" key={card.id}>
        <span className="folder-glyph" aria-hidden="true"><PixelCharacter agent={card.id}/></span>
        <div className="agent-card-body">
          <h2>{station?.privacy === 'locked' ? '🔒 ' : ''}{agentLabel(card.id)}</h2>
          <p className="muted">{card.kind}</p>
          <dl>
            <div><dt>Model</dt><dd>{card.model}</dd></div>
            <div><dt>Gateway</dt><dd>{card.gateway ? <RuntimeBadge source={{ availability: 'available', data: card.gateway }}/> : <span className="muted">None (CLI tool)</span>}</dd></div>
            <div><dt>In the office</dt><dd>{station ? `${station.state}${station.activity ? ` · ${station.activity}` : ''}` : '—'}</dd></div>
          </dl>
        </div>
      </article>
    })}</section>

    <section className="engineering-section">
      <p className="eyebrow">DIVISI ENGINEERING</p>
      <h2>Sub-Agent Spesialis & Peran Tim</h2>
      <div className="engineering-banner">
        <p><strong>💡 Optimalisasi Efisiensi 2-Core CPU:</strong> Peran-peran spesialis ini tidak dijalankan sebagai background daemon/gateway independen agar tidak membebani komputasi server. Mereka beroperasi sebagai <strong>Sub-Agent on-demand berbasis tugas</strong> yang dikoordinasikan langsung oleh Lead Engineer dan OpenCode.</p>
        <small>Eksekusi: Task-driven delegation · Standby resource: 0% CPU · Isolated tool execution</small>
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
