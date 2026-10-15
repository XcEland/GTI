import { Crosshair, Layers3, Minus, Plus } from 'lucide-react'
import type { FeatureCollection, LineString, Polygon } from 'geojson'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useRef } from 'react'
import type { ExplorationTarget } from '../types/targetTypes'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const GREAT_DYKE_BOUNDS: [[number, number], [number, number]] = [[28.9, -20.85], [30.55, -16.45]]

const PROJECT_CORRIDOR: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[
    [29.35, -20.62], [29.43, -19.80], [29.57, -18.95], [29.78, -18.03],
    [30.04, -16.62], [30.34, -16.69], [30.13, -17.94], [29.91, -18.91],
    [29.79, -19.84], [29.70, -20.56], [29.35, -20.62],
  ]] } }],
}

const DYKE_AXIS: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [
    [29.50, -20.55], [29.59, -20.03], [29.61, -19.40], [29.84, -18.36], [29.98, -17.63], [30.16, -16.70],
  ] } }],
}

interface TargetMapProps {
  targets: ExplorationTarget[]
  selectedTargetId?: string
  onTargetSelect?: (target: ExplorationTarget) => void
  compact?: boolean
}

/**
 * Interactive target context map. All browser geometries use WGS 84
 * longitude/latitude (EPSG:4326); authoritative distance and intersection
 * operations remain a backend/PostGIS responsibility.
 */
export function TargetMap({ targets, selectedTargetId, onTargetSelect, compact = false }: TargetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const markers: maplibregl.Marker[] = []
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [29.78, -18.6],
      zoom: 6,
      attributionControl: false,
    })
    mapRef.current = map
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    // style.load fires as soon as the style graph is ready. Waiting for the
    // broader map load event can delay local overlays on slow remote tile sets.
    map.on('style.load', () => {
      map.addSource('target-project-corridor', { type: 'geojson', data: PROJECT_CORRIDOR })
      map.addLayer({ id: 'target-corridor-fill', type: 'fill', source: 'target-project-corridor', paint: { 'fill-color': '#09a98e', 'fill-opacity': 0.16 } })
      map.addLayer({ id: 'target-corridor-line', type: 'line', source: 'target-project-corridor', paint: { 'line-color': '#08a58d', 'line-width': 2, 'line-dasharray': [2, 1] } })
      map.addSource('target-dyke-axis', { type: 'geojson', data: DYKE_AXIS })
      ;[['#7242a4', 24], ['#4f9d60', 16], ['#e1b85d', 8]].forEach(([color, width], index) => {
        map.addLayer({ id: `target-geology-band-${index}`, type: 'line', source: 'target-dyke-axis', paint: { 'line-color': color as string, 'line-width': width as number, 'line-opacity': 0.68 } })
      })

      targets.forEach((target) => {
        const marker = document.createElement('button')
        marker.type = 'button'
        marker.className = `target-map-marker priority-${target.priority.toLowerCase()} ${target.id === selectedTargetId ? 'is-selected' : ''}`
        marker.setAttribute('aria-label', `Select ${target.id}, ${target.area}`)
        marker.innerHTML = `<i></i><span>${target.id}</span>`
        marker.addEventListener('click', () => onTargetSelect?.(target))
        markers.push(new maplibregl.Marker({ element: marker, anchor: 'center' }).setLngLat(target.coordinates).addTo(map))
      })
      map.fitBounds(GREAT_DYKE_BOUNDS, { padding: compact ? 24 : 46, duration: 0 })
    })

    return () => {
      resizeObserver.disconnect()
      markers.forEach((marker) => marker.remove())
      mapRef.current = null
      map.remove()
    }
  }, [compact, onTargetSelect, selectedTargetId, targets])

  function fitMap() {
    mapRef.current?.fitBounds(GREAT_DYKE_BOUNDS, { padding: compact ? 24 : 46, duration: 450 })
  }

  return <div className={`target-map ${compact ? 'is-compact' : ''}`}>
    <div ref={containerRef} className="target-map-canvas" aria-label="Target location map" />
    <div className="target-map-controls"><button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in"><Plus /></button><button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out"><Minus /></button><button type="button" onClick={fitMap} aria-label="Fit target corridor"><Crosshair /></button><button type="button" title="OpenFreeMap Liberty" aria-label="Basemap information"><Layers3 /></button></div>
    <div className="target-map-legend"><strong>Exploration evidence</strong><span><i className="host" /> Project corridor</span><span><i className="candidate" /> Candidate area</span><span><i className="occurrence" /> Target location</span></div>
    <small className="target-map-disclaimer">Illustrative exploration data · © OpenFreeMap / OSM</small>
  </div>
}
