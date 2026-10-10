import { formatDateTime, formatNumber, orderedStatuses, statusLabelId, statusTone } from '../format.ts'
import type { DashboardSnapshot } from '../types.ts'
import { EmptyState, LoadingState } from '../ui.tsx'
import { TokenUsage } from './TokenUsage.tsx'
import type { Page } from '../routes.ts'

function availableCount(source: { availability: string; total: number }, unit?: string) {
  return source.availability === 'available' ? `${formatNumber(source.total)}${unit ? ` ${unit}` : ''}` : 'Tidak Tersedia'
}

function StatTile({ label, value, detail, onClick }: { label: string; value: string; detail?: string; onClick?: () => void }) {
  return <button type="button" className="stat-tile" onClick={onClick} disabled={!onClick}><span>{label}</span><strong className={value === 'Tidak Tersedia' ? 'na' : undefined}>{value}</strong>{detail && <small>{detail}</small>}</button>
}

/** The operations overview (formerly the Dashboard page), shown in the Office panel's Stats tab. */
export function Stats({ dashboard, pending = false, onNavigate }: { dashboard: DashboardSnapshot | null; pending?: boolean; onNavigate?: (page: Page) => void }) {
  if (pending) return <LoadingState message="Membaca sinyal runtime sistem..."/>
  if (!dashboard) return <EmptyState title="Tidak Tersedia">API Ruang tidak dapat dijangkau. Jalankan server dengan perintah <code>npm run dev</code> atau <code>npm start</code>.</EmptyState>
  const { runtime, tasks, calendar, activity, knowledge, channels, office, commands } = dashboard
  const go = (page: Page) => onNavigate ? () => onNavigate(page) : undefined
  const openTasks = Object.entries(tasks.byStatus).filter(([status]) => !['done', 'archived'].includes(status)).reduce((sum, [, count]) => sum + count, 0)
  const statuses = orderedStatuses(Object.keys(tasks.byStatus))
  const hermesMissing = /not installed/i.test(runtime.profiles.error?.message ?? '')
  const reviewTasks = tasks.byStatus.review ?? 0

  return <div className="stats-view">
    {hermesMissing && <section className="notice" role="status"><strong>Hermes CLI tidak ditemukan.</strong> Ruang membaca seluruh data melalui perintah <code>hermes</code>. Pastikan Hermes Agent terpasang dan berada di PATH shell yang menjalankan server, lalu tekan Segarkan Semua.</section>}

    {reviewTasks > 0 && (
      <section className="approval-banner" role="status" aria-label="Antrean Persetujuan">
        <div>
          <p className="eyebrow">ANTREAN PERSETUJUAN · TINDAKAN DIPERLUKAN</p>
          <h3>Terdapat {reviewTasks} tugas teknis menunggu review &amp; persetujuan</h3>
          <p>Hasil pekerjaan dari tim agen (Lead Engineer / OpenCode) sudah selesai dan siap diverifikasi sebelum diteruskan.</p>
        </div>
        <button type="button" className="approval-action-btn" onClick={go('Task Board')}>
          Buka Antrean Review ({reviewTasks}) →
        </button>
      </section>
    )}

    <section className="stat-grid" aria-label="Statistik utama">
      <StatTile label="Gateway Berjalan" value={`${office.gatewaysReachable} / ${office.gatewaysDeclared}`} detail="Profil Hermes" onClick={go('Agents')}/>
      <StatTile label="Tim AI Aktif" value={`${office.active} / ${office.declared}`} detail={`${office.idle} santai · ${office.offline} luring · ${office.unknown} tidak diketahui`} />
      <StatTile label="Tugas Terbuka" value={tasks.availability === 'available' ? formatNumber(openTasks) : 'Tidak Tersedia'} detail={tasks.availability === 'available' ? `${formatNumber(tasks.total)} total · ${tasks.byStatus.running ?? 0} berjalan` : undefined} onClick={go('Task Board')}/>
      <StatTile label="Jadwal Otomatis" value={availableCount(calendar, 'jadwal')} detail={calendar.availability === 'available' ? `${calendar.active} aktif · ${calendar.paused} dijeda` : undefined} onClick={go('Calendar')}/>
      <StatTile label="Sesi Interaksi" value={availableCount(activity, 'sesi')} detail={channels.activeSessions !== undefined ? `${channels.activeSessions} aktif saat ini` : '20 sesi terakhir'} onClick={go('Activity')}/>
      <StatTile label="Keahlian Aktif" value={availableCount(knowledge, 'skill')} detail={knowledge.availability === 'available' ? `${Object.keys(knowledge.byCategory).length} kategori keahlian` : undefined} onClick={go('Folders')}/>
      <StatTile label="Kanal Pesan" value={availableCount(channels, 'kanal')} detail={channels.availability === 'available' ? `${channels.connected} terhubung` : undefined} />
      <StatTile label="Pembacaan CLI" value={formatNumber(commands.total)} detail={`${commands.failed} gagal · rata-rata ${commands.averageMs} ms`} onClick={go('Logs')}/>
    </section>

    <TokenUsage/>

    <section className="dash-grid">
      <article className="card">
        <p className="eyebrow">STATUS PAPAN TUGAS (KANBAN)</p>
        {tasks.availability === 'unavailable' ? <p className="muted">Tidak Tersedia</p> : tasks.total === 0 ? <p className="muted">Belum ada tugas di papan tugas.</p> : <>
          <div className="stack-bar" role="img" aria-label={statuses.map((status) => `${statusLabelId(status)} ${tasks.byStatus[status]}`).join(', ')}>{statuses.map((status) => <i key={status} className={`tone-${statusTone(status)}`} style={{ flexGrow: tasks.byStatus[status] }} title={`${statusLabelId(status)}: ${tasks.byStatus[status]}`}/>)}</div>
          <ul className="legend">{statuses.map((status) => <li key={status}><i className={`tone-${statusTone(status)}`}/>{statusLabelId(status)}<b>{tasks.byStatus[status]}</b></li>)}</ul>
          <p className="card-note">{tasks.assigned} dari {tasks.total} tugas memiliki penanggung jawab khusus.</p>
        </>}
      </article>

      <article className="card">
        <p className="eyebrow">RUNTIME</p>
        <dl className="runtime-list">
          <div><dt>Profil Hermes</dt><dd>{runtime.profiles.availability === 'available' ? runtime.profiles.data.length : 'Tidak Tersedia'}</dd></div>
          <div><dt>Gateway berjalan</dt><dd>{runtime.profiles.availability === 'available' ? `${runtime.profiles.data.filter((profile) => profile.gateway === 'Running').length} dari ${runtime.profiles.data.length}` : 'Tidak Tersedia'}</dd></div>
          <div><dt>Model dipakai</dt><dd>{runtime.profiles.availability === 'available' ? [...new Set(runtime.profiles.data.map((profile) => profile.model).filter((model) => model !== 'Belum dikonfigurasi'))].join(', ') || '—' : 'Tidak Tersedia'}</dd></div>
          <div><dt>OpenCode</dt><dd>{runtime.openCode.availability === 'available' ? runtime.openCode.data : 'Tidak terpasang'}</dd></div>
          <div><dt>Status gateway</dt><dd>{runtime.profiles.availability === 'available' ? (runtime.profiles.data.some((profile) => profile.gateway === 'Running') ? 'Berjalan' : 'Berhenti') : 'Tidak Tersedia'}</dd></div>
        </dl>
      </article>

      <article className="card">
        <p className="eyebrow">BERIKUTNYA</p>
        <dl className="runtime-list">
          <div><dt>Jadwal cron berikutnya</dt><dd>{calendar.availability === 'unavailable' ? 'Tidak Tersedia' : formatDateTime(calendar.nextRun)}</dd></div>
          <div><dt>Sesi terbaru</dt><dd>{activity.availability === 'unavailable' ? 'Tidak Tersedia' : activity.latest ? `${activity.latest.title} · ${activity.latest.lastActive}` : '—'}</dd></div>
          <div><dt>Kategori keahlian</dt><dd>{knowledge.availability === 'unavailable' ? 'Tidak Tersedia' : Object.entries(knowledge.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category, count]) => `${category} (${count})`).join(', ') || '—'}</dd></div>
        </dl>
      </article>
    </section>
    <p className="card-note">Pembacaan langsung dari Hermes dan OpenCode, di-cache di server selama 10 detik dan diperbarui otomatis.</p>
  </div>
}
