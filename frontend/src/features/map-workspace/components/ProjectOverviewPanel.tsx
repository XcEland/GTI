import { Database, FlaskConical, Layers3, MapPinned, Target } from 'lucide-react'
import type { ProjectSummary } from '../types/mapTypes'
import { FloatingPanel } from './FloatingPanel'

interface ProjectOverviewPanelProps {
  project: ProjectSummary
}

export function ProjectOverviewPanel({ project }: ProjectOverviewPanelProps) {
  const stats = [
    { label: 'Project area', value: `${project.areaKm2} km²`, icon: MapPinned },
    { label: 'Review targets', value: project.targetCount, icon: Target },
    { label: 'Active layers', value: project.approvedLayerCount, icon: Layers3 },
    { label: 'Surface samples', value: project.sampleCount, icon: FlaskConical },
  ]

  return (
    <FloatingPanel
      title="Project overview"
      icon={<Database size={19} />}
      className="project-overview-panel"
    >
      <div className="project-heading">
        <span className="eyebrow">Current project</span>
        <h3>{project.name}</h3>
        <p>{project.country}</p>
      </div>
      <div className="commodity-row">
        {project.commodityFocus.map((commodity) => (
          <span className="commodity-tag" key={commodity}>
            {commodity}
          </span>
        ))}
        <span className="demo-badge">{project.isDemonstration ? 'Demonstration data' : 'Boundary saved'}</span>
      </div>
      <div className="summary-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="summary-stat" key={label}>
            <Icon size={18} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </FloatingPanel>
  )
}

