import {
  Archive,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Grid2X2,
  Layers3,
  List,
  Map,
  Plus,
  Search,
  Sparkles,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DEMO_PROJECTS, PROJECT_ACTIVITIES } from '../data/demoProjects'
import type {
  ExplorationProject,
  ProjectFilters,
} from '../types/projectTypes'
import { filterAndSortProjects } from '../utils/projectFilters'
import { ProjectCard } from './ProjectCard'
import { ProjectThumbnail } from './ProjectThumbnail'

interface ProjectListPageProps {
  projects: ExplorationProject[]
  searchRequest: { id: number; query: string } | null
  onOpenProject: (project: ExplorationProject) => void
  onCreateProject: () => void
  onNotice: (message: string) => void
}

const scopeTabs: { value: ProjectFilters['scope']; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mine', label: 'My Projects' },
  { value: 'shared', label: 'Shared with Me' },
  { value: 'archived', label: 'Archived' },
]

const activityIcons = {
  data: Database,
  target: Target,
  map: Map,
  report: FileText,
  field: Layers3,
  sample: Sparkles,
}

export function ProjectListPage({
  projects,
  searchRequest,
  onOpenProject,
  onCreateProject,
  onNotice,
}: ProjectListPageProps) {
  const [filters, setFilters] = useState<ProjectFilters>({
    query: '',
    commodity: 'all',
    status: 'all',
    scope: 'all',
    sort: 'updated',
  })
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!searchRequest) return
    setFilters((current) => ({ ...current, query: searchRequest.query }))
  }, [searchRequest])

  const visibleProjects = useMemo(
    () => filterAndSortProjects(projects, filters),
    [filters, projects],
  )
  const commodityOptions = Array.from(new Set(projects.flatMap((project) => project.commodities))).sort()
  const activeCount = projects.filter((project) => project.status === 'Active').length
  const planningCount = projects.filter((project) => project.status === 'Planning').length
  const reviewCount = projects.filter((project) => project.status === 'Review').length
  const totalTargets = projects.reduce((total, project) => total + project.targetCount, 0)
  const featuredProject = projects.find((project) => project.id === DEMO_PROJECTS[0].id) ?? projects[0]

  function setFilter<Key extends keyof ProjectFilters>(key: Key, value: ProjectFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function scopeCount(scope: ProjectFilters['scope']) {
    if (scope === 'all') return projects.length
    if (scope === 'archived') return projects.filter((project) => project.status === 'Archived').length
    return projects.filter((project) => project.scope === scope).length
  }

  return (
    <div className="projects-page">
      <div className="projects-main-column">
        <nav className="projects-breadcrumb" aria-label="Breadcrumb">
          <span>Projects</span><ChevronRight size={14} /><strong>All Projects</strong>
        </nav>

        <header className="projects-page-header">
          <div>
            <h1>Projects</h1>
            <p>Manage exploration projects, spatial evidence, and review targets.</p>
          </div>
          <button className="projects-primary-button" type="button" onClick={onCreateProject}>
            <Plus size={18} /> New Project
          </button>
        </header>

        <div className="project-scope-tabs" role="tablist" aria-label="Project scopes">
          {scopeTabs.map((tab) => (
            <button
              className={filters.scope === tab.value ? 'is-active' : ''}
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filters.scope === tab.value}
              onClick={() => setFilter('scope', tab.value)}
            >
              {tab.label} <span>{scopeCount(tab.value)}</span>
            </button>
          ))}
          <button type="button" role="tab" aria-selected="false" onClick={() => onNotice('Project templates are planned for a later milestone.') }>
            Templates <span>0</span>
          </button>
        </div>

        <section className="projects-toolbar" aria-label="Project filters">
          <label className="projects-search-field">
            <Search size={16} />
            <span className="sr-only">Search projects</span>
            <input
              value={filters.query}
              onChange={(event) => setFilter('query', event.target.value)}
              placeholder="Search projects by name, location, commodity…"
            />
          </label>
          <label>
            <span className="sr-only">Commodity</span>
            <select value={filters.commodity} onChange={(event) => setFilter('commodity', event.target.value)}>
              <option value="all">All commodities</option>
              {commodityOptions.map((commodity) => <option value={commodity} key={commodity}>{commodity}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
              <option value="all">All statuses</option>
              {['Active', 'Planning', 'Review', 'Concept'].map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </label>
          <label className="projects-sort-field">
            <span>Sort by</span>
            <select value={filters.sort} onChange={(event) => setFilter('sort', event.target.value as ProjectFilters['sort'])}>
              <option value="updated">Last updated</option>
              <option value="name">Project name</option>
              <option value="area">Largest area</option>
            </select>
          </label>
          <div className="projects-layout-toggle" aria-label="Project layout">
            <button className={layout === 'grid' ? 'is-active' : ''} type="button" onClick={() => setLayout('grid')} aria-label="Grid view"><Grid2X2 size={16} /></button>
            <button className={layout === 'list' ? 'is-active' : ''} type="button" onClick={() => setLayout('list')} aria-label="List view"><List size={17} /></button>
          </div>
        </section>

        {visibleProjects.length ? (
          <section className={`project-card-grid layout-${layout}`} aria-label="Exploration projects">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} layout={layout} onOpen={onOpenProject} />
            ))}
          </section>
        ) : (
          <section className="projects-empty-state">
            <Archive size={28} />
            <h2>No matching projects</h2>
            <p>Adjust the search or filters to return to the demonstration portfolio.</p>
            <button type="button" onClick={() => setFilters({ query: '', commodity: 'all', status: 'all', scope: 'all', sort: 'updated' })}>Clear filters</button>
          </section>
        )}
      </div>

      <aside className="projects-right-rail" aria-label="Project portfolio summary">
        <section className="projects-side-card overview-card">
          <h2><Layers3 size={18} /> Project Overview</h2>
          <div className="portfolio-stat-grid">
            <div><strong>{projects.length}</strong><span>Total projects</span></div>
            <div className="is-green"><strong>{activeCount}</strong><span>Active</span></div>
            <div className="is-blue"><strong>{planningCount}</strong><span>Planning</span></div>
            <div className="is-purple"><strong>{reviewCount}</strong><span>Under review</span></div>
            <div><strong>0</strong><span>Archived</span></div>
            <div><strong>{totalTargets}</strong><span>Total targets</span></div>
          </div>
        </section>

        <section className="projects-side-card recent-card">
          <div className="side-card-title-row">
            <h2><Clock3 size={18} /> Recent Activity</h2>
            <button type="button" onClick={() => onNotice('Showing the latest portfolio activity available in this prototype.')}>View all →</button>
          </div>
          <ol className="portfolio-activity-list">
            {PROJECT_ACTIVITIES.slice(0, 5).map((activity) => {
              const Icon = activityIcons[activity.kind]
              const project = projects.find((item) => item.id === activity.projectId)
              return (
                <li key={activity.id}>
                  <span className={`activity-icon activity-${activity.kind}`}><Icon size={16} /></span>
                  <div><strong>{project?.name}</strong><span>{activity.title}</span><small>{activity.time}</small></div>
                </li>
              )
            })}
          </ol>
        </section>

        {featuredProject && <section className="projects-side-card featured-card">
          <h2><Sparkles size={17} /> Featured Project</h2>
          <div className="featured-project-summary">
            <div className="featured-preview"><ProjectThumbnail project={featuredProject} /></div>
            <div><strong>{featuredProject.name}</strong><span>{featuredProject.location}, {featuredProject.country}</span><small className="project-status status-active">Active</small></div>
          </div>
          <p>{featuredProject.description}</p>
          <button type="button" onClick={() => onOpenProject(featuredProject)}>Open Project →</button>
        </section>}
      </aside>
    </div>
  )
}
