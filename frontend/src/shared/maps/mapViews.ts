import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'

export type MapViewId = 'street' | 'physical' | 'satellite' | 'realistic' | 'immersive' | 'oblique'

export interface MapViewDefinition {
  id: MapViewId
  label: string
  description: string
  pitch: number
  bearing: number
  terrain: boolean
  imagery: boolean
}

export const MAP_VIEW_OPTIONS: MapViewDefinition[] = [
  { id: 'street', label: 'Street', description: 'Labelled roads and places', pitch: 0, bearing: 0, terrain: false, imagery: false },
  { id: 'physical', label: 'Physical', description: 'Topographic relief and terrain', pitch: 20, bearing: 0, terrain: true, imagery: false },
  { id: 'satellite', label: 'Satellite', description: 'Global satellite imagery', pitch: 0, bearing: 0, terrain: false, imagery: true },
  { id: 'realistic', label: 'Realistic', description: 'Satellite imagery with elevation', pitch: 38, bearing: 0, terrain: true, imagery: true },
  { id: 'immersive', label: 'Immersive', description: 'High-angle terrain perspective', pitch: 66, bearing: 24, terrain: true, imagery: true },
  { id: 'oblique', label: 'Oblique', description: 'Angled geological interpretation', pitch: 58, bearing: -32, terrain: true, imagery: false },
]

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    },
  },
  layers: [
    { id: 'satellite-background', type: 'background', paint: { 'background-color': '#10272b' } },
    { id: 'satellite-imagery', type: 'raster', source: 'esri-world-imagery', paint: { 'raster-saturation': -0.04, 'raster-contrast': 0.08 } },
  ],
}

export function getMapView(viewId: MapViewId): MapViewDefinition {
  return MAP_VIEW_OPTIONS.find((view) => view.id === viewId) ?? MAP_VIEW_OPTIONS[0]
}

/**
 * Returns a new style object for raster imagery because MapLibre normalises the
 * supplied style in place. Browser map coordinates and overlay data remain in
 * WGS 84; the renderer handles Web Mercator tile requests internally.
 */
export function getMapStyle(viewId: MapViewId): string | StyleSpecification {
  const view = getMapView(viewId)
  if (view.imagery) return structuredClone(SATELLITE_STYLE)
  return view.id === 'street'
    ? 'https://tiles.openfreemap.org/styles/bright'
    : 'https://tiles.openfreemap.org/styles/liberty'
}

/**
 * Adds optional 3D terrain after the base style has loaded and before local
 * geological overlays are inserted. The public DEM is encoded as Mapbox RGB;
 * terrain affects presentation only and is not used for scientific metrics.
 */
export function configureTerrainView(map: MapLibreMap, viewId: MapViewId) {
  const view = getMapView(viewId)
  if (!view.terrain) return

  if (!map.getSource('gti-terrain-dem')) {
    map.addSource('gti-terrain-dem', {
      type: 'raster-dem',
      url: 'https://tiles.mapterhorn.com/tilejson.json',
      tileSize: 512,
    })
  }
  map.setTerrain({ source: 'gti-terrain-dem', exaggeration: view.id === 'physical' ? 1.15 : 1.35 })

  if (!map.getLayer('gti-terrain-hillshade')) {
    const firstSymbol = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
    map.addLayer({
      id: 'gti-terrain-hillshade',
      type: 'hillshade',
      source: 'gti-terrain-dem',
      paint: {
        'hillshade-exaggeration': view.imagery ? 0.18 : 0.35,
        'hillshade-shadow-color': '#102f35',
      },
    }, firstSymbol)
  }
}
