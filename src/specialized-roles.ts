/**
 * Declared engineering sub-roles for the Kantor Virtual crew page.
 *
 * These are NOT Hermes profiles and never run as background daemons or gateways. On a 2-CPU host
 * an idle specialist agent is pure overhead, so each role exists only as an on-demand, task-driven
 * sub-agent that the Lead Engineer or OpenCode spins up for one piece of work and then drops.
 */
export interface SpecializedRole {
  title: string
  category: 'Peran Utama' | 'Peran Pendukung & Tim'
  icon: string
  focus: string
  skills: string[]
  responsibilities: string[]
}

export const SPECIALIZED_ROLES: SpecializedRole[] = [
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
