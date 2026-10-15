import { describe, expect, it } from 'vitest'
import { formatDistance, haversineDistanceKm } from './geo'

describe('haversineDistanceKm', () => {
  it('returns zero for identical WGS 84 coordinates', () => {
    expect(haversineDistanceKm([29.82, -18.48], [29.82, -18.48])).toBe(0)
  })

  it('calculates a reasonable project-scale geodesic distance', () => {
    const distance = haversineDistanceKm([29.82, -18.48], [29.92, -18.48])

    expect(distance).toBeGreaterThan(10)
    expect(distance).toBeLessThan(11)
  })
})

describe('formatDistance', () => {
  it('uses metres below one kilometre and kilometres above it', () => {
    expect(formatDistance(0.42)).toBe('420 m')
    expect(formatDistance(12.34)).toBe('12.3 km')
  })
})

