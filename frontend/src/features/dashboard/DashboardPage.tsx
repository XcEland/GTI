import {
  ArrowRight, CheckCircle2, Clock3, Database, FilePlus2, FolderKanban,
  Layers3, Map, MapPin, MoreVertical, Plus, ScanSearch, Target, Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PROJECT_ACTIVITIES } from '../projects/data/demoProjects'
import type { ExplorationProject } from '../projects/types/projectTypes'
import { ProjectBoundaryMap } from '../projects/components/ProjectBoundaryMap'
import { ProjectThumbnail } from '../projects/components/ProjectThumbnail'
import './dashboard.css'

interface DashboardPageProps {
  projects: ExplorationProject[]
  onOpenProjects: () => void
  onCreateProject: () => void
  onOpenProject: (project: ExplorationProject) => void
  onOpenMap: (project: ExplorationProject) => void
  onOpenData: () => void
  onAddData: () => void
  onOpenTargets: () => void
}

const recentDatasets = [
  { name: 'Airborne Magnetics (RTP)', source: 'Great Dyke survey', date: '12 Oct 2026', kind: 'magnetics' },
  { name: 'Geology (1:250k)', source: 'Zimbabwe Geological Survey', date: '10 Oct 2026', kind: 'geology' },
  { name: 'Chrome Geochemistry', source: 'Field campaign 2026', date: '08 Oct 2026', kind: 'geochemistry' },
  { name: 'Mapped Structures', source: 'Regional compilation', date: '05 Oct 2026', kind: 'structures' },
]

const activityIcons = {
  data: Database,
  target: Target,
  map: Map,
  report: FilePlus2,
  field: Users,
  sample: Layers3,
}

function currentZimbabweDate() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Africa/Harare',
  }).format(new Date())
}

export function DashboardPage({
  projects, onOpenProjects, onCreateProject, onOpenProject, onOpenMap, onOpenData, onAddData, onOpenTargets,
}: DashboardPageProps) {
  const [notice, setNotice] = useState<string | null>(null)
  const featured = projects.find((project) => project.id === 'great-dyke-chrome-demo') ?? projects[0]
  const activeProjects = projects.filter((project) => project.status === 'Active').length
  const datasetCount = projects.reduce((total, project) => total + project.datasetCount, 0)
  const targetCount = projects.reduce((total, project) => total + project.targetCount, 0)
  const recentActivity = useMemo(() => PROJECT_ACTIVITIES.slice(0, 5), [])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function showMilestoneNotice(message: string) {
    setNotice(message)
  }

  if (!featured) return null

  return (
    <div className="dashboard-page">
      <header className="dashboard-welcome">
        <div><h1>Welcome back, Demo</h1><p>Review your projects and turn geospatial evidence into exploration decisions.</p></div>
        <div className="dashboard-date"><span>{currentZimbabweDate()}</span><small>Zimbabwe (CAT)</small></div>
        <button type="button" onClick={onCreateProject}><Plus size={20} /> New Project</button>
      </header>

      <section className="dashboard-metrics" aria-label="Portfolio summary">
        <button type="button" onClick={onOpenProjects}><span className="metric-icon metric-blue"><FolderKanban /></span><strong>{activeProjects}</strong><small>Active Projects</small><ArrowRight /></button>
        <button type="button" onClick={onOpenData}><span className="metric-icon metric-teal"><Layers3 /></span><strong>{datasetCount}</strong><small>Approved Datasets</small><ArrowRight /></button>
        <button type="button" onClick={onOpenTargets}><span className="metric-icon metric-green"><Target /></span><strong>{targetCount}</strong><small>Targets Screened</small><ArrowRight /></button>
        <button type="button" onClick={onOpenTargets}><span className="metric-icon metric-cyan"><ScanSearch /></span><strong>6</strong><small>Priority Targets</small><ArrowRight /></button>
      </section>

      <section className="dashboard-feature-row">
        <article className="dashboard-card featured-dashboard-project">
          <div className="dashboard-card-heading"><h2>Featured Exploration Project</h2><span><i /> Active</span></div>
          <div className="featured-dashboard-body">
            <div><h3>{featured.name}</h3><p className="featured-location"><MapPin size={15} /> {featured.location}, {featured.country}</p><div className="featured-commodities">{featured.commodities.map((commodity) => <span key={commodity}>{commodity}</span>)}</div><p>{featured.description}</p></div>
            <div className="featured-dashboard-map"><ProjectThumbnail project={featured} detailed /></div>
          </div>
          <footer><dl><div><dt>Targets</dt><dd><Target size={17} /> {featured.targetCount}</dd></div><div><dt>Datasets</dt><dd><Layers3 size={17} /> {featured.datasetCount}</dd></div><div><dt>Last updated</dt><dd><Clock3 size={17} /> {featured.updatedAt}</dd></div></dl><button type="button" onClick={() => onOpenProject(featured)}>Open Project <ArrowRight size={17} /></button></footer>
        </article>

        <article className="dashboard-card dashboard-location-card">
          <div className="dashboard-card-heading"><h2>Project Location</h2><span className="location-caption">{featured.location}, {featured.country}</span></div>
          {featured.areaOfInterest && <div className="dashboard-location-map"><ProjectBoundaryMap boundary={featured.areaOfInterest} editable={false} /><div className="dashboard-map-legend"><strong>{featured.name}</strong><span><i className="boundary" /> AOI outline</span><span><i className="area" /> Project area</span></div><button type="button" onClick={() => onOpenMap(featured)}>Open in Map <ArrowRight size={17} /></button></div>}
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-card dashboard-list-card">
          <div className="dashboard-card-heading"><h2>Recent Datasets</h2><button type="button" onClick={onOpenData}>View all <ArrowRight size={14} /></button></div>
          <ul>{recentDatasets.map((dataset) => <li key={dataset.name}><span className={`dataset-preview dataset-${dataset.kind}`}><Layers3 size={18} /></span><div><strong>{dataset.name}</strong><small>{dataset.source}</small></div><time>{dataset.date}</time><button type="button" aria-label={`Open data library for ${dataset.name}`} onClick={onOpenData}><MoreVertical size={16} /></button></li>)}</ul>
        </article>

        <article className="dashboard-card dashboard-list-card">
          <div className="dashboard-card-heading"><h2>Recent Activity</h2><button type="button" onClick={() => showMilestoneNotice('Showing the latest activity available in this prototype.')}>View all <ArrowRight size={14} /></button></div>
          <ul>{recentActivity.map((activity) => { const Icon = activityIcons[activity.kind]; const project = projects.find((item) => item.id === activity.projectId); return <li key={activity.id}><span className={`dashboard-activity-icon activity-${activity.kind}`}><Icon size={18} /></span><div><strong>{activity.title}</strong><small>{project?.name ?? activity.detail}</small></div><time>{activity.time}</time></li> })}</ul>
        </article>

        <div className="dashboard-side-stack">
          <article className="dashboard-card screening-progress-card">
            <div className="dashboard-card-heading"><h2>Target Screening Progress</h2><button type="button" onClick={() => showMilestoneNotice('Target Screening will be implemented after data validation.')}>View all <ArrowRight size={14} /></button></div>
            <div className="screening-progress-body"><div className="progress-donut"><span><strong>68%</strong><small>Complete</small></span></div><dl><div><dt><i className="screened" /> Targets screened</dt><dd>17 / 25</dd></div><div><dt><i className="priority" /> Priority targets</dt><dd>6</dd></div><div><dt><i className="review" /> In review</dt><dd>5</dd></div><div><dt><i className="low" /> Low priority</dt><dd>6</dd></div></dl></div>
          </article>
          <article className="dashboard-card quick-actions-card"><div className="dashboard-card-heading"><h2>Quick Actions</h2></div><div><button type="button" onClick={onCreateProject}><Plus /><span>New Project</span></button><button type="button" onClick={onAddData}><Database /><span>Add Dataset</span></button><button type="button" onClick={onOpenTargets}><Target /><span>Review Targets</span></button><button type="button" onClick={() => onOpenMap(featured)}><Map /><span>Open Map</span></button></div></article>
        </div>
      </section>

      {notice && <div className="dashboard-toast" role="status"><CheckCircle2 size={16} /> {notice}</div>}
    </div>
  )
}
