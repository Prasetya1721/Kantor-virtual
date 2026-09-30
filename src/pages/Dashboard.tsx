import { formatCompact, formatDateTime, formatNumber, orderedStatuses, statusLabelId, statusTone } from '../format.ts'
import { usePolling } from '../polling.ts'
import type { DashboardSnapshot, OpenCodeBuildSnapshot } from '../types.ts'
import { EmptyState, LoadingState, RuntimeBadge } from '../ui.tsx'
import type { Page } from '../routes.ts'

function availableCount(source: { availability: string; total: number }, unit?: string) {
  return source.availability === 'available' ? `${formatNumber(source.total)}${unit ? ` ${unit}` : ''}` : 'Tidak Tersedia'
}

function StatTile({ label, value, detail, onClick }: { label: string; value: string; detail?: string; onClick?: () => void }) {
  return <button type="button" className="stat-tile" onClick={onClick} disabled={!onClick}><span>{label}</span><strong className={value === 'Tidak Tersedia' || value === 'Not Available' ? 'na' : undefined}>{value}</strong>{detail && <small>{detail}</small>}</button>
}

export function Dashboard({ dashboard, pending = false, onNavigate }: { dashboard: DashboardSnapshot | null; pending?: boolean; onNavigate?: (page: Page) => void }) {
  const buildSnapshot = usePolling<OpenCodeBuildSnapshot>('/api/build', 15_000)
  const buildData = buildSnapshot.status === 'ready' ? buildSnapshot.data : null

  if (pending) return <><section className="hero"><p className="eyebrow">PUSAT KENDALI OPERASIONAL</p><h1>Pusat Komando AI, <em>tanpa kebisingan.</em></h1></section><LoadingState message="Membaca sinyal runtime sistem..."/></>
  if (!dashboard) return <EmptyState title="Tidak Tersedia">API Mission Control tidak dapat dijangkau. Jalankan server dengan perintah <code>npm run dev</code> atau <code>npm start</code>.</EmptyState>
  const { runtime, tasks, calendar, activity, knowledge, channels, office, usage, commands } = dashboard
  const go = (page: Page) => onNavigate ? () => onNavigate(page) : undefined
  const lead = runtime.profiles.data.find((profile) => profile.name === 'default')
  const openTasks = Object.entries(tasks.byStatus).filter(([status]) => !['done', 'archived'].includes(status)).reduce((sum, [, count]) => sum + count, 0)
  const statuses = orderedStatuses(Object.keys(tasks.byStatus))
  const insight = usage.availability === 'available' ? usage.data : null
  const topModel = insight?.models[0]
  const maxTool = Math.max(1, ...(insight?.tools.map((tool) => tool.calls) ?? [1]))
  const hermesMissing = /not installed/i.test(runtime.profiles.error?.message ?? '')
  const reviewTasks = tasks.byStatus.review ?? 0

  return <>
    <section className="hero">
      <p className="eyebrow">PUSAT KENDALI OPERASIONAL</p>
      <h1>Pusat Komando AI, <em>tanpa kebisingan.</em></h1>
      <p>Pemantauan langsung dari agen Hermes dan OpenCode, di-cache di server selama 10 detik dan diperbarui secara otomatis.</p>
    </section>

    {hermesMissing && <section className="notice" role="status"><strong>Hermes CLI tidak ditemukan.</strong> Mission Control membaca seluruh data melalui perintah <code>hermes</code>. Pastikan Hermes Agent terpasang dan berada di PATH sistem Anda, lalu tekan Muat Ulang Semua.</section>}

    {reviewTasks > 0 && (
      <section className="approval-banner" role="status" aria-label="Antrean Persetujuan">
        <div>
          <p className="eyebrow" style={{ color: 'var(--c-5b9bd5)', marginBottom: 4 }}>ANTREAN PERSETUJUAN · TINDAKAN DIPERLUKAN</p>
          <h3>Terdapat {reviewTasks} tugas teknis menunggu review & persetujuan Anda</h3>
          <p>Hasil pekerjaan dari tim agen (Lead Engineer / OpenCode) telah selesai dan siap diverifikasi sebelum diteruskan.</p>
        </div>
        <button type="button" className="approval-action-btn" onClick={go('Task Board')}>
          Buka Antrean Review ({reviewTasks}) →
        </button>
      </section>
    )}

    <section className="stat-grid" aria-label="Statistik utama">
      <StatTile label="Gateway Berjalan" value={`${office.gatewaysReachable} / ${office.gatewaysDeclared}`} detail="Lead Agent + Engineer" onClick={go('Agents')}/>
      <StatTile label="Tim AI Aktif" value={`${office.active} / ${office.declared}`} detail={`${office.idle} santai · ${office.offline} luring · ${office.unknown} tidak diketahui`} onClick={go('Office')}/>
      <StatTile label="Tugas Terbuka" value={tasks.availability === 'available' ? formatNumber(openTasks) : 'Tidak Tersedia'} detail={tasks.availability === 'available' ? `${formatNumber(tasks.total)} total · ${tasks.byStatus.running ?? 0} berjalan` : undefined} onClick={go('Task Board')}/>
      <StatTile label="Jadwal Otomatis" value={availableCount(calendar, 'jadwal')} detail={calendar.availability === 'available' ? `${calendar.active} aktif · ${calendar.paused} dijeda` : undefined} onClick={go('Calendar')}/>
      <StatTile label="Sesi Interaksi" value={availableCount(activity, 'sesi')} detail={channels.activeSessions !== undefined ? `${channels.activeSessions} aktif saat ini` : '20 sesi terakhir'} onClick={go('Activity')}/>
      <StatTile label="Keahlian Aktif" value={availableCount(knowledge, 'skill')} detail={knowledge.availability === 'available' ? `${Object.keys(knowledge.byCategory).length} kategori keahlian` : undefined} onClick={go('Folders')}/>
      <StatTile label="Kanal Pesan" value={availableCount(channels, 'kanal')} detail={channels.availability === 'available' ? `${channels.connected} terhubung` : undefined} onClick={go('Office')}/>
      <StatTile label="Pembacaan CLI" value={formatNumber(commands.total)} detail={`${commands.failed} gagal · rata-rata ${commands.averageMs} ms`} onClick={go('Logs')}/>
    </section>

    <section className="dash-grid">
      <article className="card">
        <p className="eyebrow">PENGGUNAAN · {insight?.days ?? 7} HARI TERAKHIR</p>
        {usage.availability === 'unavailable' ? <p className="muted">Tidak Tersedia — {usage.error?.message ?? 'Data penggunaan hermes insights tidak dapat dibaca.'}</p> : !insight ? <p className="muted">Belum ada data penggunaan tercatat.</p> : <>
          <dl className="metric-grid">
            <div><dt>Total Sesi</dt><dd>{formatNumber(insight.sessions)}</dd></div>
            <div><dt>Total Pesan</dt><dd>{formatNumber(insight.messages)}</dd></div>
            <div><dt>Panggilan Alat</dt><dd>{formatNumber(insight.toolCalls)}</dd></div>
            <div><dt>Total Token</dt><dd>{formatCompact(insight.totalTokens)}</dd></div>
            <div><dt>Input / Output</dt><dd>{formatCompact(insight.inputTokens)} / {formatCompact(insight.outputTokens)}</dd></div>
            <div><dt>Perkiraan Biaya</dt><dd>{insight.estimatedCost ?? '—'}</dd></div>
          </dl>
          {topModel && <p className="card-note">Model teratas: <b>{topModel.model}</b> · {topModel.sessions} sesi · {formatCompact(topModel.tokens)} token</p>}
          {insight.tools.length > 0 && <div className="bar-list" aria-label="Alat teratas">{insight.tools.slice(0, 5).map((tool) => <div key={tool.tool}><span>{tool.tool}</span><i style={{ width: `${Math.max(4, (tool.calls / maxTool) * 100)}%` }}/><b>{formatNumber(tool.calls)}</b></div>)}</div>}
        </>}
      </article>

      <article className="card">
        <p className="eyebrow">AKTIVITAS BUILD & REPOSITORI · OPENCODE</p>
        {buildSnapshot.status === 'pending' ? <p className="muted">Membaca riwayat build OpenCode...</p> : buildData?.availability === 'unavailable' ? <p className="muted">Data build OpenCode tidak tersedia di host ini.</p> : !buildData || buildData.sessions.length === 0 ? <p className="muted">Tidak ada sesi build dalam 6 jam terakhir ({buildData?.totalSessions ?? 0} total riwayat).</p> : <>
          <dl className="metric-grid">
            <div><dt>Sesi Aktif</dt><dd>{buildData.sessions.length} sesi</dd></div>
            <div><dt>Total Riwayat</dt><dd>{formatNumber(buildData.totalSessions)}</dd></div>
            <div><dt>Token Terpakai</dt><dd>{formatCompact(buildData.sessions.reduce((acc, s) => acc + s.tokensInput + s.tokensOutput, 0))}</dd></div>
          </dl>
          <div className="runtime-list" style={{ marginTop: 12 }}>
            <div>
              <dt>Sesi Terakhir</dt>
              <dd><b>{buildData.sessions[0]?.title ?? '—'}</b></dd>
            </div>
            <div>
              <dt>Model Eksekusi</dt>
              <dd>{buildData.sessions[0]?.model ?? '—'}</dd>
            </div>
            <div>
              <dt>Repositori Kerja</dt>
              <dd style={{ fontSize: 12 }}>{buildData.sessions[0]?.directory ? buildData.sessions[0].directory.split(/[/\\]/).slice(-2).join('/') : '—'}</dd>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="chip-button" onClick={go('Build')}>
              Buka Halaman Build OpenCode →
            </button>
          </div>
        </>}
      </article>

      <article className="card">
        <p className="eyebrow">STATUS PAPAN TUGAS (KANBAN)</p>
        {tasks.availability === 'unavailable' ? <p className="muted">Tidak Tersedia</p> : tasks.total === 0 ? <p className="muted">Belum ada tugas di papan tugas.</p> : <>
          <div className="stack-bar" role="img" aria-label={statuses.map((status) => `${statusLabelId(status)} ${tasks.byStatus[status]}`).join(', ')}>{statuses.map((status) => <i key={status} className={`tone-${statusTone(status)}`} style={{ flexGrow: tasks.byStatus[status] }} title={`${statusLabelId(status)}: ${tasks.byStatus[status]}`}/>)}</div>
          <ul className="legend">{statuses.map((status) => <li key={status}><i className={`tone-${statusTone(status)}`}/>{statusLabelId(status)}<b>{tasks.byStatus[status]}</b></li>)}</ul>
          <p className="card-note">{tasks.assigned} dari {tasks.total} tugas memiliki penanggung jawab khusus.</p>
        </>}
      </article>

      <article className="card">
        <p className="eyebrow">STATUS SISTEM & RUNTIME</p>
        <dl className="runtime-list">
          <div><dt>Gateway Lead Agent</dt><dd><RuntimeBadge source={runtime.gateways.default}/></dd></div>
          <div><dt>Gateway Lead Engineer</dt><dd><RuntimeBadge source={runtime.gateways.leadEngineer}/></dd></div>
          <div><dt>Versi OpenCode</dt><dd>{runtime.openCode.availability === 'available' ? runtime.openCode.data : 'Tidak Tersedia'}</dd></div>
          <div><dt>Model Lead Agent</dt><dd>{runtime.profiles.availability === 'unavailable' ? 'Tidak Tersedia' : lead?.model ?? 'Tidak Diketahui'}</dd></div>
          <div><dt>Profil Hermes Terdaftar</dt><dd>{runtime.profiles.availability === 'available' ? `${runtime.profiles.data.length} profil` : 'Tidak Tersedia'}</dd></div>
        </dl>
      </article>

      <article className="card">
        <p className="eyebrow">AGENDA BERIKUTNYA</p>
        <dl className="runtime-list">
          <div><dt>Jadwal cron berikutnya</dt><dd>{calendar.availability === 'unavailable' ? 'Tidak Tersedia' : formatDateTime(calendar.nextRun)}</dd></div>
          <div><dt>Sesi interaksi terakhir</dt><dd>{activity.availability === 'unavailable' ? 'Tidak Tersedia' : activity.latest ? `${activity.latest.title} · ${activity.latest.lastActive}` : '—'}</dd></div>
          <div><dt>Kategori keahlian utama</dt><dd>{knowledge.availability === 'unavailable' ? 'Tidak Tersedia' : Object.entries(knowledge.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category, count]) => `${category} (${count})`).join(', ') || '—'}</dd></div>
        </dl>
      </article>
    </section>
  </>
}
