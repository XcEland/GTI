import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Expand,
  FileText,
  FlaskConical,
  Layers3,
  Map,
  MapPin,
  Maximize2,
  Minus,
  MoreVertical,
  Plus,
  Route,
  Settings,
  Share2,
  Sparkles,
  Target,
  Truck,
  Zap,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { PROJECT_ACTIVITIES, PROJECT_PROGRESS } from '../data/demoProjects'
import type { ExplorationProject } from '../types/projectTypes'
import { ProjectBoundaryMap } from './ProjectBoundaryMap'
import { ProjectThumbnail } from './ProjectThumbnail'

interface ProjectDetailPageProps {
  project: ExplorationProject
  onBack: () => void
  onOpenMap: () => void
  onNotice: (message: string) => void
}

const activityIcons = {
  data: Database,
  target: Target,
  map: Map,
  report: FileText,
  field: Truck,
  sample: FlaskConical,
}

const progressIcons = {
  data: Database,
  map: Map,
  screening: Sparkles,
  target: Target,
  field: Truck,
  report: FileText,
}

export function ProjectDetailPage({ project, onBack, onOpenMap, onNotice }: ProjectDetailPageProps) {
  const mapPreviewRef = useRef<HTMLDivElement>(null)
  const [mapScale, setMapScale] = useState(1)
  const activities = useMemo(
    () => PROJECT_ACTIVITIES.filter((activity) => activity.projectId === project.id).slice(0, 5),
    [project.id],
  )
  const projectProgress = project.isPersisted ? PROJECT_PROGRESS.map((progress) => (
    progress.kind === 'map'
      ? { ...progress, complete: 1, total: 1 }
      : { ...progress, complete: 0, total: Math.max(1, progress.total) }
  )) : PROJECT_PROGRESS

  function fullscreenPreview() {
    if (mapPreviewRef.current?.requestFullscreen) void mapPreviewRef.current.requestFullscreen()
  }

  return (
    <div className="project-detail-page">
      <nav className="projects-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>Projects</button><ChevronRight size={14} /><strong>{project.name}</strong>
      </nav>

      <header className="project-detail-header">
        <button className="detail-back-button" type="button" onClick={onBack} aria-label="Back to all projects"><ArrowLeft size={18} /></button>
        <div className="detail-project-avatar"><ProjectThumbnail project={project} /></div>
        <div className="detail-title-block">
          <div><h1>{project.name}</h1><span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span></div>
          <p><MapPin size={15} /> {project.location}, {project.country}<span /><Layers3 size={15} /> {project.projectType}</p>
          <div className="project-commodities">
            {project.commodities.map((commodity) => <span key={commodity}>{commodity}</span>)}
          </div>
        </div>
        <div className="detail-header-actions">
          <button type="button" onClick={onOpenMap}><Map size={16} /> Open in Map</button>
          <button type="button" onClick={() => onNotice('A shareable project link is ready to copy when permissions are implemented.')}><Share2 size={16} /> Share</button>
          <button className="is-primary" type="button" onClick={() => onNotice('Project settings are reserved for the create/edit milestone.')}><Settings size={16} /> Project Settings</button>
          <button className="icon-only" type="button" onClick={() => onNotice('No additional project actions are available yet.')} aria-label="More project actions"><MoreVertical size={18} /></button>
        </div>
        <dl className="detail-project-meta">
          <div><dt>Created</dt><dd>{project.createdAt}</dd><span>by {project.owner}</span></div>
          <div><dt>Last Updated</dt><dd>{project.updatedAt}</dd><span>by {project.owner}</span></div>
          <div><dt>Project Area</dt><dd>{project.areaKm2.toLocaleString()} km²</dd></div>
          <div><dt>Coordinate System</dt><dd>{project.coordinateSystem}</dd></div>
        </dl>
      </header>

      <section className="detail-stat-grid" aria-label="Project summary">
        <div className="detail-stat stat-blue"><span><Maximize2 /></span><div><small>Project Area</small><strong>{project.areaKm2.toLocaleString()} km²</strong><p>{project.location}, {project.country}</p></div></div>
        <div className="detail-stat stat-purple"><span><Database /></span><div><small>Approved Datasets</small><strong>{project.datasetCount}</strong><p>Geological and geophysical</p></div></div>
        <div className="detail-stat stat-green"><span><Target /></span><div><small>Active Targets</small><strong>{project.targetCount}</strong><p>Decision-support candidates</p></div></div>
        <div className="detail-stat stat-amber"><span><Truck /></span><div><small>Field Plans</small><strong>{project.fieldPlanCount}</strong><p>{project.fieldPlanCount ? '1 in progress' : 'None scheduled'}</p></div></div>
        <div className="detail-stat stat-sky"><span><FileText /></span><div><small>Reports</small><strong>{project.reportCount}</strong><p>Project evidence records</p></div></div>
      </section>

      <div className="project-detail-grid">
        <section className="detail-panel project-map-panel">
          <div className="detail-panel-heading"><h2><Map size={19} /> Project Area Overview</h2><button type="button" onClick={onOpenMap}>Open workspace →</button></div>
          <div className="detail-map-preview" ref={mapPreviewRef}>
            {project.areaOfInterest ? (
              <ProjectBoundaryMap boundary={project.areaOfInterest} editable={false} />
            ) : <div className="detail-map-transform" style={{ transform: `scale(${mapScale})` }}><ProjectThumbnail project={project} detailed /></div>}
            {!project.areaOfInterest && <div className="detail-map-controls">
              <button type="button" onClick={() => setMapScale((scale) => Math.min(scale + 0.12, 1.6))} aria-label="Zoom map preview in"><Plus size={18} /></button>
              <button type="button" onClick={() => setMapScale((scale) => Math.max(scale - 0.12, 0.8))} aria-label="Zoom map preview out"><Minus size={18} /></button>
              <button type="button" onClick={fullscreenPreview} aria-label="Fullscreen map preview"><Expand size={17} /></button>
              <button type="button" onClick={onOpenMap} aria-label="Open map layers"><Layers3 size={18} /></button>
            </div>}
            <div className="map-preview-note">{project.areaOfInterest ? 'Saved WGS 84 project boundary' : 'Schematic preview'} · Open Map Workspace for geospatial interaction</div>
          </div>
          <div className="map-preview-legend">
            {project.areaOfInterest ? <span><i className="legend-target" /> Project boundary</span> : <>
              <span><i className="legend-target" /> Review target</span>
              <span><i className="legend-sample" /> Sample</span>
              <span><i className="legend-occurrence" /> Chrome occurrence</span>
              <span><i className="legend-structure" /> Mapped structure</span>
              <span><i className="legend-heat" /> Magnetic response</span>
            </>}
          </div>
        </section>

        <section className="detail-panel project-progress-panel">
          <div className="detail-panel-heading"><h2><Layers3 size={19} /> Project Progress</h2><button type="button" onClick={() => onNotice('The full project workflow will connect as later workspaces are reviewed.')}>View workflow →</button></div>
          <ol className="project-progress-list">
            {projectProgress.map((step, index) => {
              const Icon = progressIcons[step.kind]
              const percent = Math.round((step.complete / step.total) * 100)
              return (
                <li key={step.label}>
                  <span className={`progress-icon progress-${step.kind}`}><Icon size={17} /></span>
                  <div className="progress-copy"><strong>{index + 1}. {step.label}</strong><small>{step.description}</small></div>
                  <div className="progress-value"><span>{step.complete} / {step.total}</span><i><b style={{ width: `${percent}%` }} /></i></div>
                  <span className={`progress-state ${percent === 100 ? 'is-complete' : ''}`}>{percent === 100 ? <Check size={13} /> : null}</span>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="detail-panel project-activity-panel">
          <div className="detail-panel-heading"><h2><Clock3 size={19} /> Recent Activity</h2><button type="button" onClick={() => onNotice('Showing recent activity for this demonstration project.')}>View all →</button></div>
          <ol className="detail-activity-list">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.kind]
              return <li key={activity.id}><span className={`activity-icon activity-${activity.kind}`}><Icon size={16} /></span><div><strong>{activity.title}</strong><span>{activity.detail}</span><small>{activity.time}</small></div></li>
            })}
            {!activities.length && <li className="detail-empty-message">No activity yet. Import a dataset to begin building the project evidence record.</li>}
          </ol>
        </section>

        <section className="detail-panel recommended-actions-panel">
          <div className="detail-panel-heading"><h2><Zap size={19} /> Next Recommended Actions</h2><button type="button" onClick={() => onNotice('Recommendations are evidence prompts for professional review, not predictions.')}>About recommendations →</button></div>
          <div className="recommended-actions-grid">
            {project.isPersisted ? <>
              <button type="button" onClick={() => onNotice('Data import and validation are planned for the next Phase 1 increment.')}><Database /><span><strong>Import exploration data</strong><small>Add the first validated geological or geophysical dataset.</small><em>Recommended</em></span><ChevronRight /></button>
              <button type="button" onClick={onOpenMap}><Map /><span><strong>Review the project boundary</strong><small>Confirm the saved AOI before adding project evidence.</small><em>Ready</em></span><ChevronRight /></button>
              <button type="button" onClick={() => onNotice('Target Screening will follow data import and validation.')}><Target /><span><strong>Prepare {project.commodities[0]} screening</strong><small>Define evidence criteria after approved datasets are available.</small><em>Later milestone</em></span><ChevronRight /></button>
            </> : <>
              <button type="button" onClick={() => onNotice('Target Review will be implemented after the Projects workspace is approved.')}><Target /><span><strong>Review high-priority targets</strong><small>Assess three chrome-focused candidates with supporting evidence.</small><em>High priority</em></span><ChevronRight /></button>
              <button type="button" onClick={() => onNotice('Field Plans remains outside the current Projects milestone.')}><Route /><span><strong>Plan field reconnaissance</strong><small>Prepare a focused programme around CHR-021 and CHR-034.</small><em>Medium priority</em></span><ChevronRight /></button>
              <button type="button" onClick={() => onNotice('Data import and validation are planned for the next Phase 1 increment.')}><Database /><span><strong>Incorporate new datasets</strong><small>Add validated EM observations to refine the evidence model.</small><em>Medium priority</em></span><ChevronRight /></button>
            </>}
          </div>
        </section>
      </div>
    </div>
  )
}
