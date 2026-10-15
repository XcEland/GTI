import { describe, expect, it } from 'vitest'
import { getMapStyle, getMapView, MAP_VIEW_OPTIONS } from './mapViews'

describe('map view configuration', () => {
  it('exposes the six supported user-facing views', () => {
    expect(MAP_VIEW_OPTIONS.map((view) => view.id)).toEqual([
      'street',
      'physical',
      'satellite',
      'realistic',
      'immersive',
      'oblique',
    ])
  })

  it('uses imagery for satellite-derived views and terrain for perspective views', () => {
    expect(getMapView('satellite')).toMatchObject({ imagery: true, terrain: false, pitch: 0 })
    expect(getMapView('realistic')).toMatchObject({ imagery: true, terrain: true })
    expect(getMapView('immersive').pitch).toBeGreaterThan(60)
    expect(getMapView('oblique')).toMatchObject({ imagery: false, terrain: true })
  })

  it('returns a raster style for imagery and an OpenFreeMap style for streets', () => {
    expect(typeof getMapStyle('street')).toBe('string')
    const satelliteStyle = getMapStyle('satellite')
    expect(typeof satelliteStyle).toBe('object')
    expect(satelliteStyle).toMatchObject({ version: 8 })
  })
})
