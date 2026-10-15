import { describe, expect, it } from 'vitest'
import { DEMO_PROJECTS } from '../data/demoProjects'
import { filterAndSortProjects, getProjectById } from './projectFilters'

const baseFilters = {
  query: '',
  commodity: 'all',
  status: 'all',
  scope: 'all' as const,
  sort: 'updated' as const,
}

describe('project portfolio filtering', () => {
  it('matches project locations and commodities without case sensitivity', () => {
    expect(filterAndSortProjects(DEMO_PROJECTS, { ...baseFilters, query: 'chrome' }))
      .toHaveLength(1)
    expect(filterAndSortProjects(DEMO_PROJECTS, { ...baseFilters, query: 'mashonaland' })[0].id)
      .toBe('mashonaland-nickel-survey')
  })

  it('combines ownership and commodity filters', () => {
    const result = filterAndSortProjects(DEMO_PROJECTS, {
      ...baseFilters,
      scope: 'shared',
      commodity: 'Li',
    })
    expect(result.map((project) => project.id)).toEqual(['mberengwa-lithium-prospect'])
  })

  it('sorts large areas first and falls back to the first known project', () => {
    const result = filterAndSortProjects(DEMO_PROJECTS, { ...baseFilters, sort: 'area' })
    expect(result[0].id).toBe('mashonaland-nickel-survey')
    expect(getProjectById(DEMO_PROJECTS, 'missing').id).toBe('great-dyke-chrome-demo')
  })
})
