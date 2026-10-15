import { Crosshair, Layers3, Minus, Plus } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useRef } from 'react'
import type { FeatureCollection, LineString, Point, Polygon } from 'geojson'
import type { DatasetTheme } from '../types/dataTypes'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const ZIMBABWE_BOUNDS: [[number, number], [number, number]] = [[25.15, -22.55], [33.15, -15.55]]

const GREAT_DYKE: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature', properties: {}, geometry: {
      type: 'LineString', coordinates: [
        [29.45, -20.58], [29.62, -20.05], [29.58, -19.52], [29.73, -18.95],
        [29.85, -18.36], [29.94, -17.78], [30.13, -17.12], [30.19, -16.68],
      ],
    },
  }],
}

const COVERAGE: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature', properties: {}, geometry: {
      type: 'Polygon', coordinates: [[
        [28.2, -21.1], [28.0, -19.6], [28.8, -17.1], [30.5, -16.1],
        [31.6, -17.3], [31.4, -19.7], [30.4, -21.3], [28.2, -21.1],
      ]],
    },
  }],
}

const SAMPLE_POINTS: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    [29.52, -20.25], [29.64, -19.74], [29.66, -19.16], [29.82, -18.52],
    [29.93, -17.91], [30.08, -17.26], [30.17, -16.84],
  ].map((coordinates, index) => ({ type: 'Feature', properties: { id: `GD-${index + 11}` }, geometry: { type: 'Point', coordinates } })),
}

interface DatasetMapPreviewProps {
  theme?: DatasetTheme
  compact?: boolean
  interactive?: boolean
}

/**
 * MapLibre preview using browser GeoJSON in WGS 84 (EPSG:4326). These lightweight
 * demonstration geometries show spatial context only; source rasters will later
 * be served as project-authorized tiles after backend validation.
 */
export function DatasetMapPreview({ theme = 'magnetics', compact = false, interactive = true }: DatasetMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const thematicMarkers: maplibregl.Marker[] = []
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [29.75, -18.7],
      zoom: compact ? 5.1 : 5.55,
      interactive,
      attributionControl: false,
      fadeDuration: 0,
    })
    mapRef.current = map
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    // Add local WGS 84 overlays as soon as the style is ready; remote basemap
    // tiles may continue loading independently on slower development networks.
    map.on('style.load', () => {
      map.addSource('data-coverage', { type: 'geojson', data: COVERAGE })
      map.addLayer({
        id: 'data-coverage-fill', type: 'fill', source: 'data-coverage',
        paint: {
          'fill-color': theme === 'geology' ? '#9c5ce3' : theme === 'geochemistry' ? '#f1b733' : '#075be8',
          'fill-opacity': compact ? 0.12 : 0.16,
        },
      })
      map.addLayer({
        id: 'data-coverage-line', type: 'line', source: 'data-coverage',
        paint: { 'line-color': '#0d806f', 'line-width': 2, 'line-dasharray': [2, 1] },
      })
      map.addSource('great-dyke', { type: 'geojson', data: GREAT_DYKE })

      const bands = theme === 'geology'
        ? [['#7b3fc6', 22], ['#58a553', 14], ['#d8af68', 8]] as const
        : theme === 'topography'
          ? [['#815c3f', 26], ['#c89252', 16], ['#f0d07a', 7]] as const
          : [['#2e31d5', 30], ['#00b9ea', 23], ['#46da74', 17], ['#ffdc38', 11], ['#f05627', 6]] as const

      bands.forEach(([color, width], index) => map.addLayer({
        id: `great-dyke-band-${index}`, type: 'line', source: 'great-dyke',
        paint: { 'line-color': color, 'line-width': width, 'line-opacity': 0.72, 'line-blur': theme === 'magnetics' || theme === 'gravity' ? 3 : 0 },
      }))

      map.addSource('data-samples', { type: 'geojson', data: SAMPLE_POINTS })
      map.addLayer({
        id: 'data-samples-points', type: 'circle', source: 'data-samples',
        paint: { 'circle-color': '#ffc72c', 'circle-radius': compact ? 3 : 5, 'circle-stroke-color': '#071d2d', 'circle-stroke-width': 1.5 },
      })
      if (!compact) {
        map.addLayer({
          id: 'data-samples-labels', type: 'symbol', source: 'data-samples',
          layout: { 'text-field': ['get', 'id'], 'text-size': 10, 'text-offset': [0.9, 0], 'text-anchor': 'left' },
          paint: { 'text-color': '#10263b', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
        })
      }

      // DOM markers supplement the vector layers with a legible thematic ribbon
      // at thumbnail scale. They remain geographically anchored while panning.
      const route = GREAT_DYKE.features[0].geometry.coordinates
      const colors = theme === 'geology'
        ? ['#7850bd', '#62a653', '#d6aa62', '#ae6ab4']
        : ['#2831d7', '#00bfe8', '#52d65a', '#ffe236', '#f15a2a', '#c3157b']
      route.slice(0, -1).forEach((start, segmentIndex) => {
        const end = route[segmentIndex + 1]
        for (let step = 0; step < 5; step += 1) {
          const fraction = step / 5
          const element = document.createElement('span')
          element.className = `dataset-map-signal ${compact ? 'is-compact' : ''}`
          element.style.setProperty('--signal-color', colors[(segmentIndex * 3 + step) % colors.length])
          const marker = new maplibregl.Marker({ element, anchor: 'center' })
            .setLngLat([
              start[0] + (end[0] - start[0]) * fraction,
              start[1] + (end[1] - start[1]) * fraction,
            ])
            .addTo(map)
          thematicMarkers.push(marker)
        }
      })
      map.fitBounds(ZIMBABWE_BOUNDS, { padding: compact ? 8 : 28, duration: 0 })
    })

    return () => {
      resizeObserver.disconnect()
      thematicMarkers.forEach((marker) => marker.remove())
      mapRef.current = null
      map.remove()
    }
  }, [compact, interactive, theme])

  function fit() {
    mapRef.current?.fitBounds(ZIMBABWE_BOUNDS, { padding: compact ? 8 : 28, duration: 450 })
  }

  return (
    <div className={`dataset-map ${compact ? 'is-compact' : ''}`}>
      <div ref={containerRef} className="dataset-map-canvas" aria-label="Live spatial dataset preview" />
      {!compact && <div className="dataset-map-controls">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}><Plus size={18} /></button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}><Minus size={18} /></button>
        <button type="button" aria-label="Fit Zimbabwe" onClick={fit}><Crosshair size={18} /></button>
        <button type="button" aria-label="Basemap information" title="OpenFreeMap Liberty"><Layers3 size={18} /></button>
      </div>}
      <div className="dataset-map-key"><strong>{theme === 'geology' ? 'Geological units' : 'RTP response'}</strong><span><i className="key-high" /> High</span><span><i className="key-low" /> Low</span></div>
      <small className="dataset-map-credit">© OpenFreeMap · OpenStreetMap</small>
    </div>
  )
}
