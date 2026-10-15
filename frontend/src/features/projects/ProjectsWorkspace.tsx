import { useEffect, useMemo, useState } from 'react'
import { ProjectDetailPage } from './components/ProjectDetailPage'
import { ProjectListPage } from './components/ProjectListPage'
import { CreateProjectWizard } from './components/CreateProjectWizard'
import type { ExplorationProject } from './types/projectTypes'
import { getProjectById } from './utils/projectFilters'
import './projects.css'

export type ProjectsView = 'list' | 'detail' | 'create'

interface ProjectsWorkspaceProps {
  view: ProjectsView
  projects: ExplorationProject[]
  selectedProjectId: string
  searchRequest: { id: number; query: string } | null
  onOpenProject: (project: ExplorationProject) => void
  onBack: () => void
  onCreateProject: () => void
  onProjectCreated: (project: ExplorationProject) => void
  onOpenMap: (project: ExplorationProject) => void
}

export function ProjectsWorkspace({
  view,
  projects,
  selectedProjectId,
  searchRequest,
  onOpenProject,
  onBack,
  onCreateProject,
  onProjectCreated,
  onOpenMap,
}: ProjectsWorkspaceProps) {
  const [notice, setNotice] = useState<string | null>(null)
  const project = useMemo(
    () => getProjectById(projects, selectedProjectId),
    [projects, selectedProjectId],
  )

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  return (
    <div className="projects-workspace">
      {view === 'create' ? (
        <CreateProjectWizard
          onCancel={onBack}
          onCreated={onProjectCreated}
          onViewProject={onOpenProject}
          onOpenMap={onOpenMap}
        />
      ) : view === 'detail' ? (
        <ProjectDetailPage
          project={project}
          onBack={onBack}
          onOpenMap={() => onOpenMap(project)}
          onNotice={setNotice}
        />
      ) : (
        <ProjectListPage
          projects={projects}
          searchRequest={searchRequest}
          onOpenProject={onOpenProject}
          onCreateProject={onCreateProject}
          onNotice={setNotice}
        />
      )}
      {notice && <div className="projects-toast" role="status">{notice}</div>}
    </div>
  )
}
