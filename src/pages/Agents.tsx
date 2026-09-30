import type { RuntimeSnapshot } from '../types.ts'
import { LoadingState, PageTitle, RuntimeBadge } from '../ui.tsx'

interface SpecializedRole {
  title: string
  category: 'Peran Utama' | 'Peran Pendukung & Tim'
  icon: string
  focus: string
  skills: string[]
  responsibilities: string[]
}

const SPECIALIZED_ROLES: SpecializedRole[] = [
  {
    title: 'Front-End Developer',
    category: 'Peran Utama',
    icon: '🖥️',
    focus: 'UI Components, State & Responsive Design',
    skills: ['vibe-coding-pms', 'popular-web-designs', 'vibe-ui-ux-pms'],
    responsibilities: [
      'Membangun antarmuka pengguna interaktif (React, Vite, CSS modern)',
      'Integrasi endpoint REST API dengan penanganan error yang jujur',
      'Optimasi performa rendering dan aksesibilitas antarmuka pengguna',
    ],
  },
  {
    title: 'Back-End Developer',
    category: 'Peran Utama',
    icon: '⚙️',
    focus: 'APIs, Database & Server Architecture',
    skills: ['vibe-coding-pms', 'node-inspect-debugger', 'systematic-debugging'],
    responsibilities: [
      'Merancang skema PostgreSQL dan query aman tanpa SQL injection',
      'Menyediakan REST endpoint Node.js/Express dengan caching andal',
      'Manajemen concurrency dan pencegahan penumpukan proses CPU',
    ],
  },
  {
    title: 'Full-Stack Developer',
    category: 'Peran Utama',
    icon: '🔄',
    focus: 'End-to-End Features & Build Pipeline',
    skills: ['vibe-coding-pms', 'test-driven-development', 'project-handoff'],
    responsibilities: [
      'Menghubungkan alur data dari basis data hingga komponen layar',
      'Sinkronisasi kontrak tipe data TypeScript (Client ↔ Server)',
      'Memastikan pipeline build produksi bersih dan bebas warning',
    ],
  },
  {
    title: 'UI/UX Designer',
    category: 'Peran Pendukung & Tim',
    icon: '🎨',
    focus: 'Maritime Design System & Pixel Art',
    skills: ['vibe-ui-ux-pms', 'claude-design', 'design-md'],
    responsibilities: [
      'Menjaga estetika visual retro pixel-art maritim anti-slop',
      'Hierarki informasi data-dense yang ramah bagi staf operasional',
      'Audit konsistensi token tema (Dark & Light mode)',
    ],
  },
  {
    title: 'Project Manager',
    category: 'Peran Pendukung & Tim',
    icon: '📋',
    focus: 'WBS, Kanban Triage & Approval Gateways',
    skills: ['weekly-review-planning', 'document-to-action-items'],
    responsibilities: [
      'Memecah tujuan besar menjadi tiket tugas terukur (Kanban)',
      'Manajemen prioritas tiket (P1 Critical s.d. P3 Normal)',
      'Memastikan alur review gerbang persetujuan sebelum deploy',
    ],
  },
  {
    title: 'QA (Quality Assurance) Tester',
    category: 'Peran Pendukung & Tim',
    icon: '🧪',
    focus: 'TDD, Vitest Suites & Acceptance Criteria',
    skills: ['test-driven-development', 'dogfood', 'systematic-debugging'],
    responsibilities: [
      'Menulis unit & integration tests sebelum dan sesudah koding (TDD)',
      'Verifikasi kepatuhan Acceptance Criteria (Given/When/Then)',
      'Deteksi regresi bug otomatis untuk menjaga akurasi 100%',
    ],
  },
]

export function Agents({ runtime, pending = false }: { runtime: RuntimeSnapshot | null; pending?: boolean }) {
  if (pending) return <><PageTitle eyebrow="ORGANIZATION" title="Agent chain"/><LoadingState message="Reading runtime details..."/></>
  const profiles = runtime?.profiles.availability === 'available' ? runtime.profiles.data : []
  const lead = profiles.find((item) => item.name === 'default')
  const engineer = profiles.find((item) => item.name === 'leadengineer')
  const security = profiles.find((item) => item.name === 'security')
  const profileField = (value: string | undefined) => !runtime || runtime.profiles.availability === 'unavailable' ? 'Not Available' : value ?? 'Unknown'
  const openCodeVersion = !runtime || runtime.openCode.availability === 'unavailable' ? 'Not Available' : runtime.openCode.data ?? 'Unknown'
  const rows = [
    ['Lead Agent', 'Declarative role', profileField(lead?.name), profileField(lead?.model), runtime?.gateways.default],
    ['Lead Engineer', 'Declarative role', profileField(engineer?.name), profileField(engineer?.model), runtime?.gateways.leadEngineer],
    ['Cyber Security', 'Declarative role', profileField(security?.name), profileField(security?.model), runtime?.gateways.security],
    ['OpenCode', 'Declarative role', 'Unknown', openCodeVersion, undefined],
  ] as const
  const others = profiles.filter((profile) => !['default', 'leadengineer', 'security'].includes(profile.name))
  return <><PageTitle eyebrow="ORGANIZATION" title="Agent chain">Role labels are declared architecture. Runtime details below are independently discovered.</PageTitle><section className="chain">Lead Agent <i>→</i> Lead Engineer <i>→</i> Cyber Security <i>→</i> OpenCode</section>
    <section className="agent-list">{rows.map(([role, label, profile, version, gateway]) => <article className="agent" key={role}><div><p className="eyebrow">{label}</p><h2>{role}</h2></div><dl><div><dt>Profile</dt><dd>{profile}</dd></div><div><dt>Model / version</dt><dd>{version}</dd></div><div><dt>Gateway</dt><dd>{gateway ? <RuntimeBadge source={gateway}/> : <span className="muted">No gateway (CLI tool)</span>}</dd></div></dl></article>)}</section>
    {others.length > 0 && <section className="data-list other-profiles"><p className="eyebrow">OTHER HERMES PROFILES</p>{others.map((profile) => <article key={profile.name}><div><h2>{profile.name}</h2><p>Not part of the declared chain.</p></div><dl><div><dt>Model</dt><dd>{profile.model}</dd></div></dl></article>)}</section>}

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
            {role.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
          </ul>
          <div className="role-skills">
            {role.skills.map((skill) => <span className="role-tag" key={skill}>#{skill}</span>)}
          </div>
          <div className="role-footer">
            <span>Koordinasi: Lead Engineer · Eksekusi: OpenCode / Hermes</span>
          </div>
        </article>)}
      </div>
    </section>
  </>
}
