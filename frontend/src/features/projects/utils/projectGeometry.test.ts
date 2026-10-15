import { describe, expect, it } from 'vitest'
import { extractPolygon, getPolygonMetrics, validatePolygon } from './projectGeometry'

describe('project geometry', () => {
  it('closes an open WGS 84 polygon and calculates useful metrics', () => {
    const polygon = validatePolygon({
      type: 'Polygon',
      coordinates: [[[29.7, -19.1], [30.05, -19.1], [30.05, -18.75], [29.7, -18.75]]],
    })
    const metrics = getPolygonMetrics(polygon)

    expect(polygon.coordinates[0]).toHaveLength(5)
    expect(metrics.vertexCount).toBe(4)
    expect(metrics.areaKm2).toBeGreaterThan(1000)
    expect(metrics.perimeterKm).toBeGreaterThan(100)
  })

  it('extracts a polygon from a feature collection', () => {
    const polygon = extractPolygon({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature', properties: {},
        geometry: { type: 'Polygon', coordinates: [[[29, -19], [30, -19], [30, -18], [29, -19]]] },
      }],
    })
    expect(polygon.type).toBe('Polygon')
  })

  it('rejects non-polygon GeoJSON', () => {
    expect(() => extractPolygon({ type: 'Point', coordinates: [30, -19] })).toThrow(/Polygon/)
  })
})
