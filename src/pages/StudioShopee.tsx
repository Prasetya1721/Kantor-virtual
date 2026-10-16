import { useMemo, useState } from 'react'
import { PageTitle } from '../ui.tsx'
import { addContent, advanceContent, countDone, loadState, QUOTA_PER_PERIOD, quotaStatus, removeContent, resetPeriod, saveState, STAGE_LABELS_ID, STUDIO_STAGES, type StudioStage, type StudioState } from '../studio-state.ts'
import { SPECIALIZED_ROLES } from '../specialized-roles.ts'
import { PixelCharacter } from './Office.tsx'

const STAGE_TONE: Record<StudioStage, string> = { riset: 'unknown', naskah: 'unknown', video: 'good', upload: 'good' }

/** Research findings shipped with the studio (read at build time from the repo data folder). */
const RISET_RINGKASAN = [
  { nama: 'Anker Soundcore R50i (TWS)', kategori: 'Elektronik', alasan: 'TWS entry-level terlaris 2026, promo Rp158–199rb, garansi resmi 18 bulan' },
  { nama: 'Skintific Serum', kategori: 'Skincare', alasan: 'Brand serum #1 Shopee Q1 2026, pangsa 6,4% (Compas)' },
  { nama: 'Wardah', kategori: 'Kecantikan lokal', alasan: 'Brand lokal terlaris Shopee, halal, pasar luas' },
  { nama: "d'Alba Mist / Skin1004", kategori: 'Skincare premium', alasan: 'Naik ke #2–#3 serum Q1 2026, tren naik' },
  { nama: 'Hanasui', kategori: 'Kecantikan lokal', alasan: 'Harga murah, konversi mudah untuk konten massal' },
]

const studioTeam = SPECIALIZED_ROLES.filter((role) => role.category === 'Tim Studio Shopee')

export function StudioShopee() {
  const [state, setState] = useState<StudioState>(() => loadState())
  const [title, setTitle] = useState('')
  const [product, setProduct] = useState('')
  const update = (next: StudioState) => { setState(next); saveState(next) }
  const status = useMemo(() => quotaStatus(state.period), [state])
  const add = () => {
    if (!title.trim()) return
    update(addContent(state, title, product))
    setTitle('')
    setProduct('')
  }
  return <>
    <PageTitle eyebrow="STUDIO SHOPEE" title="Konten Affiliate">Pipeline konten Shopee Affiliate: setiap konten melewati Riset → Naskah → Video → Upload. Kuota minimal {QUOTA_PER_PERIOD} konten selesai (upload) per periode — periode berganti otomatis setiap Senin, dan yang lama diarsipkan.</PageTitle>
    <section className="quota-card" aria-label="Kuota konten periode ini">
      <div className="quota-head">
        <div><p className="eyebrow">PERIODE BERJALAN · SEJAK {state.period.startedAt}</p>
          <strong className={status.met ? 'text-good' : 'text-warn'}>{status.done} / {status.quota} konten diupload</strong></div>
        <button type="button" className="refresh-button" onClick={() => { if (window.confirm('Reset periode? Konten periode ini diarsipkan dan kuota mulai dari 0.')) update(resetPeriod(state)) }}>↺ Reset Periode</button>
      </div>
      <div className="quota-bar" role="progressbar" aria-valuenow={status.done} aria-valuemin={0} aria-valuemax={status.quota} aria-label={`Kuota konten: ${status.done} dari ${status.quota}`}>
        <div className={`quota-fill${status.met ? ' met' : ''}`} style={{ width: `${Math.min(100, (status.done / status.quota) * 100)}%` }}/>
      </div>
      <small className="muted">{status.met ? 'Kuota terpenuhi minggu ini. 🌹' : `Butuh ${status.quota - status.done} konten lagi sampai ${new Date(state.period.startedAt).getTime() + 6 * 864e5 > Date.now() ? 'Minggu' : 'batas'} berakhir.`}</small>
    </section>
    <section className="studio-add" aria-label="Tambah konten">
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul konten (mis. Unboxing R50i bass test)" aria-label="Judul konten"/>
      <input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Produk (mis. Anker Soundcore R50i)" aria-label="Produk" list="studio-products"/>
      <datalist id="studio-products">{RISET_RINGKASAN.map((item) => <option key={item.nama} value={item.nama}/>)}</datalist>
      <button type="button" className="refresh-button" onClick={add} disabled={!title.trim()}>+ Tambah Konten</button>
    </section>
    {state.period.contents.length === 0
      ? <p className="muted studio-empty">Belum ada konten di periode ini. Tambahkan minimal {QUOTA_PER_PERIOD} dan dorong semuanya sampai Upload.</p>
      : <ul className="studio-list">{state.period.contents.map((content) => <li key={content.id}>
          <div className="studio-row">
            <strong>{content.title}</strong>
            <span className="chip chip-muted">{content.product}</span>
            <span className={`badge ${STAGE_TONE[content.stage]}`}>{STAGE_LABELS_ID[content.stage]}</span>
          </div>
          <div className="studio-row-actions">
            <div className="studio-steps" aria-label="Tahap">{STUDIO_STAGES.map((stage, index) => <span key={stage} className={STUDIO_STAGES.indexOf(content.stage) >= index ? 'step done' : 'step'}>{STAGE_LABELS_ID[stage]}</span>)}</div>
            <div>
              <button type="button" className="refresh-button" onClick={() => update(advanceContent(state, content.id))} disabled={content.stage === 'upload'}>Lanjut →</button>
              <button type="button" className="icon-button" onClick={() => update(removeContent(state, content.id))} aria-label={`Hapus ${content.title}`}>✕</button>
            </div>
          </div>
        </li>)}</ul>}
    {state.archive.length > 0 && <section className="studio-archive"><p className="eyebrow">ARSIP PERIODE</p><ul>{state.archive.slice(0, 4).map((period) => <li key={period.archivedAt}>{period.startedAt} — {countDone(period)} konten diupload dari {period.contents.length}</li>)}</ul></section>}
    <section className="studio-riset"><p className="eyebrow">HASIL RISET PRODUK · OKTOBER 2026</p>
      <ul className="riset-list">{RISET_RINGKASAN.map((item) => <li key={item.nama}><strong>{item.nama}</strong><span className="chip chip-muted">{item.kategori}</span><small>{item.alasan}</small></li>)}</ul>
      <small className="muted">Data dari GoodStats/Compas & Media90 (Q1 2026). Pemenang video pertama: Anker Soundcore R50i — video 14 detik sudah tersedia di data/shopee-studio.</small>
    </section>
    <section className="studio-team"><p className="eyebrow">TIM STUDIO SHOPEE</p>
      <div className="team-grid">{studioTeam.map((role) => <article key={role.title}>
        <div className="team-head"><span className="team-icon" aria-hidden="true">{role.icon}</span><div><strong>{role.title}</strong><small>{role.focus}</small></div></div>
        <ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>)}</div>
      <div className="team-crew">{studioTeam.map((role) => <PixelCharacter key={role.title} agent={role.title}/>)}</div>
    </section>
  </>
}
