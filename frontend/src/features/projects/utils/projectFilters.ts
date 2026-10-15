import type {
  ExplorationProject,
  ProjectFilters,
} from '../types/projectTypes'

export function filterAndSortProjects(
  projects: ExplorationProject[],
  filters: ProjectFilters,
) {
  const query = filters.query.trim().toLocaleLowerCase()

  return projects
    .filter((project) => {
      if (filters.scope === 'mine' && project.scope !== 'mine') return false
      if (filters.scope === 'shared' && project.scope !== 'shared') return false
      if (filters.scope === 'archived' && project.status !== 'Archived') return false
      if (filters.scope !== 'archived' && project.status === 'Archived') return false
      if (filters.commodity !== 'all' && !project.commodities.includes(filters.commodity)) return false
      if (filters.status !== 'all' && project.status !== filters.status) return false
      if (!query) return true

      return [project.name, project.location, project.country, ...project.commodities]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query)
    })
    .sort((left, right) => {
      if (filters.sort === 'name') return left.name.localeCompare(right.name)
      if (filters.sort === 'area') return right.areaKm2 - left.areaKm2
      return right.updatedAtIso.localeCompare(left.updatedAtIso)
    })
}

export function getProjectById(projects: ExplorationProject[], id: string) {
  return projects.find((project) => project.id === id) ?? projects[0]
}
