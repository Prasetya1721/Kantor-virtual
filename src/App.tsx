import { useEffect, useState } from 'react'
import { formatTime } from './format.ts'
import { Activity } from './pages/Activity.tsx'
import { Agents } from './pages/Agents.tsx'
import { Build } from './pages/Build.tsx'
import { Calendar } from './pages/Calendar.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Folders } from './pages/Folders.tsx'
import { Logs } from './pages/Logs.tsx'
import { Memory } from './pages/Memory.tsx'
import { Office } from './pages/Office.tsx'
import { TaskBoard } from './pages/TaskBoard.tsx'
import { API_VERSION } from './api-version.ts'
import { RefreshContext, usePolling } from './polling.ts'
import { usePreferences } from './preferences.ts'
import { navigation, pageFromHash, pageSlug, type Page } from './routes.ts'
import type { DashboardSnapshot } from './types.ts'

function currentPage(): Page {
  return typeof window === 'undefined' ? 'Dashboard' : pageFromHash(window.location.hash)
}

function Shell({ onRefresh }: { onRefresh: () => void }) {
  const [page, setPage] = useState<Page>(currentPage)
  const { theme, toggleTheme, sidebarHidden, toggleSidebar } = usePreferences()
  const dashboard = usePolling<DashboardSnapshot>('/api/dashboard', 15_000)
  const data = dashboard.status === 'ready' ? dashboard.data : null
  const health = usePolling<{ apiVersion?: number }>('/api/health', 60_000)
  const serverVersion = health.status === 'ready' ? health.data.apiVersion ?? 0 : health.status === 'failed' && health.httpStatus === 404 ? 0 : undefined
  const versionNotice = serverVersion === undefined || serverVersion === API_VERSION ? undefined
    : serverVersion < API_VERSION ? 'The Mission Control server is running an older version than this page, so newer menus (such as Memory) cannot load. Restart the server: stop it, run npm run build, then npm start (npm run dev restarts by itself).'
      : 'This page is older than the Mission Control server. Reload the page (and run npm run build if you use npm start).'

  useEffect(() => {
    const onHashChange = () => setPage(currentPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => { document.title = `${page} · Mission Control` }, [page])

  const navigate = (next: Page) => {
    window.location.hash = `/${pageSlug(next)}`
    setPage(next)
    window.scrollTo?.({ top: 0 })
  }
  const syncLabel = data ? `TERSINKRON ${formatTime(data.fetchedAt)}${dashboard.status === 'ready' && dashboard.stale ? ' · USANG' : ''}` : dashboard.status === 'failed' ? 'API TIDAK TERSEDIA' : 'MENGHUBUNGKAN...'
  const failedGateways = data ? data.office.gatewaysDeclared - data.office.gatewaysReachable : 0
  const pendingReviews = data?.tasks.byStatus.review ?? 0

  return <div className={`app${sidebarHidden ? ' sidebar-hidden' : ''}`}><aside id="app-sidebar" hidden={sidebarHidden}><a className="brand" href="#/dashboard" onClick={(event) => { event.preventDefault(); navigate('Dashboard') }}>MC<span>01</span></a>
    <nav aria-label="Main">{navigation.map((item) => <a href={`#/${pageSlug(item)}`} className={page === item ? 'active' : ''} aria-current={page === item ? 'page' : undefined} key={item} onClick={(event) => { event.preventDefault(); navigate(item) }}>{item}{item === 'Task Board' && pendingReviews > 0 && <span className="nav-badge" title="Tugas butuh review" style={{ background: 'var(--c-5b9bd5)', color: '#fff' }}>{pendingReviews}</span>}{item === 'Logs' && data && data.commands.failed > 0 && <span className="nav-badge" title="Failed CLI reads">{data.commands.failed}</span>}{item === 'Agents' && failedGateways > 0 && <span className="nav-badge" title="Gateways not running">{failedGateways}</span>}</a>)}</nav>
    <div className="sidebar-note"><span className="dot"/> MODE HANYA-BACA</div><button type="button" className="sidebar-theme" onClick={toggleTheme}>{theme === 'dark' ? '☀ Mode Terang' : '☾ Mode Gelap'}</button></aside>
    <main><header><span className="header-title"><button type="button" className="icon-button" onClick={toggleSidebar} aria-controls="app-sidebar" aria-expanded={!sidebarHidden} aria-label={sidebarHidden ? 'Tampilkan menu' : 'Sembunyikan menu'} title={sidebarHidden ? 'Tampilkan menu' : 'Sembunyikan menu'}>{sidebarHidden ? '☰' : '⟨'}</button><span>PUSAT KOMANDO / {page.toUpperCase()}</span></span><span className="header-actions"><span className={dashboard.status === 'failed' ? 'text-bad' : ''}>{syncLabel}</span><button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`} title={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}>{theme === 'dark' ? '☀' : '☾'}<span>{theme === 'dark' ? 'TERANG' : 'GELAP'}</span></button><button type="button" className="refresh-button" onClick={onRefresh} aria-label="Segarkan semua sumber data">↻ SEGARKAN SEMUA</button></span></header>
      {versionNotice && <section className="notice version-notice" role="alert"><strong>Restart needed.</strong> {versionNotice}</section>}
      {page === 'Dashboard' ? <Dashboard dashboard={data} pending={dashboard.status === 'pending'} onNavigate={navigate}/> : page === 'Agents' ? <Agents runtime={data?.runtime ?? null} pending={dashboard.status === 'pending'}/> : page === 'Office' ? <Office/> : page === 'Task Board' ? <TaskBoard/> : page === 'Build' ? <Build/> : page === 'Calendar' ? <Calendar/> : page === 'Activity' ? <Activity/> : page === 'Memory' ? <Memory onOpenFolders={() => navigate('Folders')}/> : page === 'Folders' ? <Folders/> : <Logs/>}
    </main></div>
}

export function App() {
  const [tick, setTick] = useState(0)
  return <RefreshContext.Provider value={tick}><Shell onRefresh={() => setTick((value) => value + 1)}/></RefreshContext.Provider>
}
