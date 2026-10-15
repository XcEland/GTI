import { Crosshair, Database, MapPin, MoveUpRight } from 'lucide-react'
import type { ExplorationProject } from '../types/projectTypes'
import { ProjectThumbnail } from './ProjectThumbnail'

interface ProjectCardProps {
  project: ExplorationProject
  layout: 'grid' | 'list'
  onOpen: (project: ExplorationProject) => void
}

const commodityClasses: Record<string, string> = {
  Cr: 'green', Ni: 'emerald', PGM: 'blue', Li: 'violet', Rb: 'purple', Ta: 'purple',
  Cu: 'orange', Co: 'cyan', Au: 'gold', Ag: 'slate', Zn: 'sky', Pb: 'blue', REE: 'pink', Nb: 'sky',
}

export function ProjectCard({ project, layout, onOpen }: ProjectCardProps) {
  return (
    <article className={`project-card is-${layout}`}>
      <button
        className="project-card-hit-area"
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open ${project.name}`}
      />
      <div className="project-card-preview">
        <ProjectThumbnail project={project} />
      </div>
      <div className="project-card-content">
        <div className="project-card-heading">
          <div>
            <h3>{project.name}</h3>
            <p><MapPin size={13} /> {project.location}, {project.country}</p>
          </div>
          <span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span>
        </div>

        <div className="project-commodities" aria-label="Commodities">
          {project.commodities.map((commodity) => (
            <span className={`commodity-${commodityClasses[commodity] ?? 'slate'}`} key={commodity}>
              {commodity}
            </span>
          ))}
        </div>

        <dl className="project-card-metrics">
          <div><dt><MoveUpRight size={15} /> Project area</dt><dd>{project.areaKm2.toLocaleString()} km²</dd></div>
          <div><dt><Crosshair size={15} /> Targets</dt><dd>{project.targetCount}</dd></div>
          <div><dt><Database size={15} /> Datasets</dt><dd>{project.datasetCount}</dd></div>
        </dl>

        <div className="project-card-footer">
          <span>Updated {project.updatedAt}</span>
          <span aria-hidden="true">Open project →</span>
        </div>
      </div>
    </article>
  )
}
