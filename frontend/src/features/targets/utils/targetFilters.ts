import type { ExplorationTarget } from '../types/targetTypes'

export function filterTargets(targets: ExplorationTarget[], query: string, priority = 'All', status = 'All') {
  const normalized = query.trim().toLowerCase()
  return targets.filter((target) => {
    const matchesQuery = !normalized || [target.id, target.area, target.runId].some((value) => value.toLowerCase().includes(normalized))
    return matchesQuery
      && (priority === 'All' || target.priority === priority)
      && (status === 'All' || target.reviewStatus === status)
  })
}
