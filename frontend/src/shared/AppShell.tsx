import {
  BarChart3, BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardCheck, Database, FileText, Layers3, Map, MapPinned, Plus,
  Search, Settings, ShieldCheck, SlidersHorizontal, Target, Upload, UserRound,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import geoTargetMark from '../assets/geotarget-mark.png'
import type { WorkspaceView } from '../features/map-workspace/types/mapTypes'
import type { DataView } from '../features/data/types/dataTypes'
import type { TargetView } from '../features/targets/types/targetTypes'

export type AppWorkspace = 'dashboard' | 'projects' | 'data' | 'map' | 'targets'

interface AppShellProps {
  children: ReactNode
  activeWorkspace: AppWorkspace
  contextLabel: string
  contextValue: string
  searchPlaceholder: string
  mapView: WorkspaceView
  onMapViewChange: (view: WorkspaceView) => void
  onNavigate: (workspace: AppWorkspace) => void
  onSearch: (query: string) => void
  onProjectCreate: () => void
  projectsSection?: 'list' | 'create'
  dataView?: DataView
  onDataViewChange: (view: DataView) => void
  targetView?: TargetView
  onTargetViewChange: (view: TargetView) => void
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'map', label: 'Map Workspace', icon: Map },
  { id: 'screening', label: 'Target Screening', icon: SlidersHorizontal },
  { id: 'targets', label: 'Targets', icon: Target },
  { id: 'field', label: 'Field Plans', icon: ClipboardCheck },
  { id: 'reports', label: 'Reports', icon: FileText },
] as const

const viewOptions: { value: WorkspaceView; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'layers', label: 'Layers' },
  { value: 'inspect', label: 'Inspect' },
  { value: 'compare', label: 'Compare' },
]

export function AppShell({ children, activeWorkspace, contextLabel, contextValue,
  searchPlaceholder, mapView, onMapViewChange, onNavigate, onSearch,
  onProjectCreate, projectsSection = 'list', dataView = 'library', onDataViewChange,
  targetView = 'library', onTargetViewChange }: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(activeWorkspace !== 'map')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (activeWorkspace !== 'map') setSidebarExpanded(true)
  }, [activeWorkspace])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <div className={`app-shell workspace-${activeWorkspace} ${sidebarExpanded ? 'sidebar-is-expanded' : ''}`}>
      <aside className="global-sidebar" aria-label="Primary navigation">
        <div className={`brand-mark ${sidebarExpanded ? 'is-expanded' : ''}`} aria-label="GeoTarget Intelligence">
          <img className="brand-logo" src={geoTargetMark} alt="" aria-hidden="true" />
          {sidebarExpanded && (
            <span className="brand-copy" aria-hidden="true">
              <strong>Geo<span>Target</span></strong>
              <small>Intelligence</small>
            </span>
          )}
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ id, label, icon: Icon }) => {
            const available = id === 'dashboard' || id === 'projects' || id === 'data' || id === 'map' || id === 'targets'
            const active = id === activeWorkspace
            return (
              <div className="sidebar-nav-group" key={id}>
                <button className={`nav-item ${active ? 'is-active' : ''}`} type="button"
                  title={sidebarExpanded ? undefined : label} aria-label={label}
                  aria-current={active ? 'page' : undefined} disabled={!available}
                  onClick={() => available && onNavigate(id as AppWorkspace)}>
                  <Icon size={21} strokeWidth={1.8} />
                  {sidebarExpanded && <><span>{label}</span>{(id === 'projects' || id === 'data' || id === 'targets') && <ChevronDown className="nav-chevron" size={15} />}</>}
                </button>
                {sidebarExpanded && id === 'projects' && activeWorkspace === 'projects' && (
                  <div className="sidebar-subnav" aria-label="Projects navigation">
                    <button className={projectsSection === 'list' ? 'is-active' : ''} type="button" onClick={() => onNavigate('projects')}><Layers3 size={16} /> All Projects</button>
                    <button className={projectsSection === 'create' ? 'is-active' : ''} type="button" onClick={onProjectCreate}><Plus size={16} /> Create Project</button>
                    <button type="button" disabled><Database size={16} /> Archived</button>
                    <button type="button" disabled><FileText size={16} /> Templates</button>
                  </div>
                )}
                {sidebarExpanded && id === 'data' && activeWorkspace === 'data' && (
                  <div className="sidebar-subnav data-subnav" aria-label="Data navigation">
                    <button className={dataView === 'library' || dataView === 'detail' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('library')}><Layers3 size={15} /> Data Library</button>
                    <button className={dataView === 'add' || dataView === 'upload' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('add')}><Plus size={15} /> Add Data</button>
                    <button className={dataView === 'api' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('api')}><Upload size={15} /> API Import</button>
                    <button className={dataView === 'sources' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('sources')}><Database size={15} /> Data Sources</button>
                    <button className={dataView === 'validation' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('validation')}><ClipboardCheck size={15} /> Validation Queue</button>
                    <button className={dataView === 'approval' ? 'is-active' : ''} type="button" onClick={() => onDataViewChange('approval')}><ShieldCheck size={15} /> Geological Approval</button>
                  </div>
                )}
                {sidebarExpanded && id === 'targets' && activeWorkspace === 'targets' && (
                  <div className="sidebar-subnav target-subnav" aria-label="Targets navigation">
                    <button className={targetView === 'library' || targetView === 'detail' ? 'is-active' : ''} type="button" onClick={() => onTargetViewChange('library')}><Target size={15} /> Target Library</button>
                    <button className={targetView === 'review' ? 'is-active' : ''} type="button" onClick={() => onTargetViewChange('review')}><ShieldCheck size={15} /> Review Queue</button>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" type="button" title={sidebarExpanded ? undefined : 'Settings'} aria-label="Settings" disabled>
            <Settings size={21} strokeWidth={1.8} />{sidebarExpanded && <span>Help & Support</span>}
          </button>
          {sidebarExpanded && <small className="sidebar-version">GeoTarget Intelligence v0.1</small>}
          <button className="sidebar-toggle" type="button" onClick={() => setSidebarExpanded((expanded) => !expanded)} aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </aside>

      <header className="global-topbar">
        {activeWorkspace !== 'dashboard' && activeWorkspace !== 'data' && <div className="project-switcher" aria-label={`${contextLabel}: ${contextValue}`}>
          {activeWorkspace === 'map' ? <MapPinned size={17} aria-hidden="true" /> : <BriefcaseBusiness size={17} aria-hidden="true" />}
          <span><small>{contextLabel}</small><strong>{contextValue}</strong></span>
          <ChevronDown className="context-chevron" size={15} aria-hidden="true" />
          <select className="context-workspace-select" value={activeWorkspace} onChange={(event) => onNavigate(event.target.value as AppWorkspace)} aria-label="Switch workspace">
            <option value="dashboard">Dashboard</option>
            <option value="projects">Projects</option>
            <option value="data">Data</option>
            <option value="map">Map Workspace</option>
            <option value="targets">Targets</option>
          </select>
        </div>}
        <form className="global-search" role="search" onSubmit={submitSearch}>
          <Search size={19} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search" placeholder={searchPlaceholder} />
          <kbd>Enter</kbd>
        </form>
        {activeWorkspace === 'map' && (
          <label className="view-switcher"><Layers3 size={16} aria-hidden="true" /><span className="sr-only">Map workspace view</span>
            <select value={mapView} onChange={(event) => onMapViewChange(event.target.value as WorkspaceView)}>
              {viewOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}
        {activeWorkspace === 'data' && <button className="topbar-create-project" type="button" onClick={onProjectCreate}><Plus size={17} /> New Project</button>}
        <div className="user-chip" aria-label="Signed in as Demo Geologist">
          <span>DG</span><div><strong>Demo Geologist</strong><small>Exploration team</small></div><UserRound size={16} aria-hidden="true" />
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  )
}
