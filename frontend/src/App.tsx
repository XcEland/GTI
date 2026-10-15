import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapWorkspace } from './features/map-workspace/MapWorkspace'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { DataWorkspace } from './features/data/DataWorkspace'
import type { DataView } from './features/data/types/dataTypes'
import type { WorkspaceView } from './features/map-workspace/types/mapTypes'
import { ProjectsWorkspace, type ProjectsView } from './features/projects/ProjectsWorkspace'
import { DEMO_PROJECTS } from './features/projects/data/demoProjects'
import { apiProjectToExplorationProject, listProjects } from './features/projects/services/projectsApi'
import type { ExplorationProject } from './features/projects/types/projectTypes'
import { AppShell, type AppWorkspace } from './shared/AppShell'
import { TargetWorkspace } from './features/targets/TargetWorkspace'
import type { TargetView } from './features/targets/types/targetTypes'

const workspaceViews: WorkspaceView[] = ['overview', 'layers', 'inspect', 'compare']
const dataViews: DataView[] = ['library', 'add', 'upload', 'api', 'sources', 'validation', 'detail', 'approval']
const targetViews: TargetView[] = ['library', 'detail', 'review']

function getInitialRoute() {
  const params = new URLSearchParams(window.location.search)
  const requestedView = params.get('view')
  const requestedWorkspace = params.get('workspace')
  const isDataRoute = requestedWorkspace === 'data'
  const isTargetRoute = requestedWorkspace === 'targets'
  const isMapRoute = requestedWorkspace === 'map'
    || (!requestedWorkspace && workspaceViews.includes(requestedView as WorkspaceView))
  const isProjectsRoute = !isDataRoute && !isTargetRoute && (requestedWorkspace === 'projects'
    || ['list', 'detail', 'create'].includes(requestedView ?? '')
  )
  return {
    workspace: (isDataRoute ? 'data' : isTargetRoute ? 'targets' : isMapRoute ? 'map' : isProjectsRoute ? 'projects' : 'dashboard') as AppWorkspace,
    mapView: workspaceViews.includes(requestedView as WorkspaceView) ? requestedView as WorkspaceView : 'overview',
    projectsView: (requestedView === 'detail' || requestedView === 'create' ? requestedView : 'list') as ProjectsView,
    dataView: (dataViews.includes(requestedView as DataView) ? requestedView : 'library') as DataView,
    targetView: (targetViews.includes(requestedView as TargetView) ? requestedView : 'library') as TargetView,
    projectId: params.get('project') ?? 'great-dyke-chrome-demo',
    datasetId: params.get('dataset') ?? 'airborne-magnetics',
    targetId: params.get('target') ?? 'GT-001',
  }
}

function replaceRoute(workspace: AppWorkspace, view: string, contextId?: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('workspace', workspace)
  url.searchParams.set('view', view)
  url.searchParams.delete('project')
  url.searchParams.delete('dataset')
  url.searchParams.delete('target')
  if (contextId) url.searchParams.set(workspace === 'data' ? 'dataset' : workspace === 'targets' ? 'target' : 'project', contextId)
  window.history.replaceState({}, '', url)
}

function App() {
  const [route, setRoute] = useState(getInitialRoute)
  const [searchRequest, setSearchRequest] = useState<{ id: number; query: string } | null>(null)
  const [shellNotice, setShellNotice] = useState<string | null>(null)
  const [apiProjects, setApiProjects] = useState<ExplorationProject[]>([])
  const projects = useMemo(() => {
    const apiIds = new Set(apiProjects.map((project) => project.id))
    return [...apiProjects, ...DEMO_PROJECTS.filter((project) => !apiIds.has(project.id))]
  }, [apiProjects])

  useEffect(() => {
    let active = true
    listProjects()
      .then((response) => {
        if (active) setApiProjects(response.map(apiProjectToExplorationProject))
      })
      .catch(() => {
        if (active) setShellNotice('The API is unavailable; showing demonstration projects only.')
      })
    return () => { active = false }
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchRequest({ id: Date.now(), query })
    if (route.workspace === 'dashboard' || (route.workspace === 'projects' && route.projectsView !== 'list')) {
      setRoute((current) => ({ ...current, workspace: 'projects', projectsView: 'list' }))
      replaceRoute('projects', 'list')
    }
  }, [route.projectsView, route.workspace])
  const handleMapViewChange = useCallback((mapView: WorkspaceView) => {
    setRoute((current) => ({ ...current, workspace: 'map', mapView }))
    replaceRoute('map', mapView)
  }, [])
  const navigateWorkspace = useCallback((workspace: AppWorkspace) => {
    if (workspace === 'map') {
      setRoute((current) => ({ ...current, workspace: 'map' }))
      replaceRoute('map', route.mapView)
    } else if (workspace === 'dashboard') {
      setRoute((current) => ({ ...current, workspace: 'dashboard' }))
      replaceRoute('dashboard', 'overview')
    } else if (workspace === 'data') {
      setRoute((current) => ({ ...current, workspace: 'data', dataView: 'library' }))
      replaceRoute('data', 'library')
    } else if (workspace === 'targets') {
      setRoute((current) => ({ ...current, workspace: 'targets', targetView: 'library' }))
      replaceRoute('targets', 'library')
    } else {
      setRoute((current) => ({ ...current, workspace: 'projects', projectsView: 'list' }))
      replaceRoute('projects', 'list')
    }
  }, [route.mapView])
  const handleDataViewChange = useCallback((dataView: DataView, datasetId?: string) => {
    setRoute((current) => ({ ...current, workspace: 'data', dataView, datasetId: datasetId ?? current.datasetId }))
    replaceRoute('data', dataView, datasetId)
  }, [])
  const handleTargetViewChange = useCallback((targetView: TargetView, targetId?: string) => {
    setRoute((current) => ({ ...current, workspace: 'targets', targetView, targetId: targetId ?? current.targetId }))
    replaceRoute('targets', targetView, targetId)
  }, [])
  const openProject = useCallback((project: ExplorationProject) => {
    setRoute((current) => ({ ...current, workspace: 'projects', projectsView: 'detail', projectId: project.id }))
    replaceRoute('projects', 'detail', project.id)
  }, [])
  const showProjectList = useCallback(() => {
    setRoute((current) => ({ ...current, workspace: 'projects', projectsView: 'list' }))
    replaceRoute('projects', 'list')
  }, [])
  const showCreateProject = useCallback(() => {
    setRoute((current) => ({ ...current, workspace: 'projects', projectsView: 'create' }))
    replaceRoute('projects', 'create')
  }, [])
  const addProject = useCallback((project: ExplorationProject) => {
    setApiProjects((current) => [project, ...current.filter((item) => item.id !== project.id)])
  }, [])
  const openProjectMap = useCallback((project: ExplorationProject) => {
    setRoute((current) => ({ ...current, workspace: 'map', mapView: 'overview', projectId: project.id }))
    replaceRoute('map', 'overview', project.id)
  }, [])
  const isProjectDetail = route.workspace === 'projects' && route.projectsView === 'detail'
  const selectedProject = projects.find((project) => project.id === route.projectId) ?? DEMO_PROJECTS[0]
  const selectedProjectName = selectedProject?.name
    ?? DEMO_PROJECTS[0].name

  return (
    <AppShell activeWorkspace={route.workspace}
      contextLabel={route.workspace === 'map' || route.workspace === 'targets' || isProjectDetail ? 'Active project' : 'Workspace'}
      contextValue={route.workspace === 'map' || route.workspace === 'targets' ? selectedProjectName : isProjectDetail ? selectedProjectName : route.workspace === 'data' ? 'Data' : 'Projects'}
      searchPlaceholder={route.workspace === 'map' ? 'Search target ID or enter longitude, latitude' : route.workspace === 'targets' ? 'Search targets, locations, screening runs, or projects' : route.workspace === 'data' ? 'Search datasets, sources, locations, or insights' : route.workspace === 'dashboard' ? 'Search projects, locations, datasets or insights' : 'Search projects, locations, or commodities'}
      mapView={route.mapView} onMapViewChange={handleMapViewChange} onNavigate={navigateWorkspace}
      onSearch={handleSearch} onProjectCreate={showCreateProject}
      projectsSection={route.projectsView === 'create' ? 'create' : 'list'} dataView={route.dataView} onDataViewChange={handleDataViewChange}
      targetView={route.targetView} onTargetViewChange={handleTargetViewChange}>
      {route.workspace === 'dashboard' ? (
        <DashboardPage projects={projects} onOpenProjects={showProjectList} onCreateProject={showCreateProject}
          onOpenProject={openProject} onOpenMap={openProjectMap}
          onOpenData={() => handleDataViewChange('library')} onAddData={() => handleDataViewChange('add')}
          onOpenTargets={() => handleTargetViewChange('library')} />
      ) : route.workspace === 'map' ? (
        <MapWorkspace project={selectedProject} view={route.mapView} onViewChange={handleMapViewChange} searchRequest={searchRequest} />
      ) : route.workspace === 'data' ? (
        <DataWorkspace view={route.dataView} selectedDatasetId={route.datasetId} searchRequest={searchRequest}
          onViewChange={handleDataViewChange} onOpenMap={() => openProjectMap(selectedProject)} />
      ) : route.workspace === 'targets' ? (
        <TargetWorkspace view={route.targetView} selectedTargetId={route.targetId} searchRequest={searchRequest}
          onViewChange={handleTargetViewChange} onOpenMap={() => openProjectMap(selectedProject)} />
      ) : (
        <ProjectsWorkspace view={route.projectsView} projects={projects} selectedProjectId={route.projectId}
          searchRequest={searchRequest} onOpenProject={openProject} onBack={showProjectList}
          onCreateProject={showCreateProject} onProjectCreated={addProject} onOpenMap={openProjectMap} />
      )}
      {shellNotice && <div className="shell-notice" role="status">{shellNotice}</div>}
    </AppShell>
  )
}

export default App
