import { describe, expect, it } from 'vitest'
import { DEMO_TARGETS } from '../data/demoTargets'
import { filterTargets } from './targetFilters'

describe('filterTargets', () => {
  it('finds targets by identifier and area', () => {
    expect(filterTargets(DEMO_TARGETS, 'GT-001')[0]?.area).toBe('Central Dyke')
    expect(filterTargets(DEMO_TARGETS, 'north')[0]?.id).toBe('GT-003')
  })

  it('combines priority and review status filters', () => {
    expect(filterTargets(DEMO_TARGETS, '', 'Moderate', 'In review').map((target) => target.id)).toEqual(['GT-002'])
  })
})
