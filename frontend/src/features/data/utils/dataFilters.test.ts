import { describe, expect, it } from 'vitest'
import { DEMO_DATASETS } from '../data/demoData'
import { filterDatasets } from './dataFilters'

describe('filterDatasets', () => {
  it('matches dataset names and descriptions case-insensitively', () => {
    expect(filterDatasets(DEMO_DATASETS, 'MAGNETICS')).toHaveLength(1)
    expect(filterDatasets(DEMO_DATASETS, 'collar locations')[0]?.id).toBe('drill-holes')
  })

  it('combines type and status filters', () => {
    const result = filterDatasets(DEMO_DATASETS, '', 'Raster', 'Map-ready')
    expect(result.every((dataset) => dataset.type === 'Raster' && dataset.status === 'Map-ready')).toBe(true)
    expect(result.length).toBeGreaterThan(1)
  })
})
