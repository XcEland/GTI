import type { ExplorationDataset } from '../types/dataTypes'

export function filterDatasets(datasets: ExplorationDataset[], query: string, type = 'All', status = 'All') {
  const normalized = query.trim().toLowerCase()
  return datasets.filter((dataset) => {
    const matchesQuery = !normalized || [dataset.name, dataset.description, dataset.category, dataset.source]
      .some((value) => value.toLowerCase().includes(normalized))
    return matchesQuery
      && (type === 'All' || dataset.type === type)
      && (status === 'All' || dataset.status === status)
  })
}
