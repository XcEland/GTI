import {
  Crosshair, Layers3, Minus, Plus,
} from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  type GeoJSONStoreFeatures,
} from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import type { Polygon } from 'geojson'
import { getPolygonBounds, validatePolygon } from '../utils/projectGeometry'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export interface ProjectBoundaryMapHandle {
  startDrawing: (mode: 'polygon' | 'rectangle') => void
  replaceBoundary: (boundary: Polygon) => void
  fitBoundary: () => void
}

interface ProjectBoundaryMapProps {
  boundary: Polygon | null
  editable?: boolean
  onBoundaryChange?: (boundary: Polygon) => void
}

function addPreviewBoundary(map: maplibregl.Map, boundary: Polygon) {
  map.addSource('project-aoi-preview', {
    type: 'geojson',
    data: { type: 'Feature', properties: {}, geometry: boundary },
  })
  map.addLayer({
    id: 'project-aoi-preview-fill', type: 'fill', source: 'project-aoi-preview',
    paint: { 'fill-color': '#03b89f', 'fill-opacity': 0.28 },
  })
  map.addLayer({
    id: 'project-aoi-preview-line', type: 'line', source: 'project-aoi-preview',
    paint: { 'line-color': '#10dbc1', 'line-width': 3 },
  })
}

export const ProjectBoundaryMap = forwardRef<ProjectBoundaryMapHandle, ProjectBoundaryMapProps>(
  function ProjectBoundaryMap({ boundary, editable = true, onBoundaryChange }, forwardedRef) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const drawRef = useRef<TerraDraw | null>(null)
    const boundaryRef = useRef(boundary)
    const onBoundaryChangeRef = useRef(onBoundaryChange)

    useEffect(() => { boundaryRef.current = boundary }, [boundary])
    useEffect(() => { onBoundaryChangeRef.current = onBoundaryChange }, [onBoundaryChange])

    function fitBoundary() {
      const map = mapRef.current
      const current = boundaryRef.current
      if (!map || !current) return
      map.fitBounds(getPolygonBounds(current), { padding: 54, duration: 500 })
    }

    function loadBoundaryIntoDraw(nextBoundary: Polygon) {
      const draw = drawRef.current
      if (!draw) return
      draw.clear()
      const id = draw.getFeatureId()
      draw.addFeatures([{
        type: 'Feature', id, properties: { mode: 'polygon' }, geometry: nextBoundary,
      } as GeoJSONStoreFeatures])
      draw.setMode('select')
      draw.selectFeature(id)
    }

    useImperativeHandle(forwardedRef, () => ({
      startDrawing(mode) {
        const draw = drawRef.current
        if (!draw) return
        draw.clear()
        draw.setMode(mode)
      },
      replaceBoundary(nextBoundary) {
        boundaryRef.current = nextBoundary
        loadBoundaryIntoDraw(nextBoundary)
        window.setTimeout(fitBoundary, 0)
      },
      fitBoundary,
    }))

    useEffect(() => {
      if (!containerRef.current) return
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [29.85, -18.7],
        zoom: 5.7,
        attributionControl: false,
      })
      mapRef.current = map

      map.on('load', () => {
        if (!editable) {
          if (boundaryRef.current) {
            addPreviewBoundary(map, boundaryRef.current)
            fitBoundary()
          }
          return
        }

        const draw = new TerraDraw({
          adapter: new TerraDrawMapLibreGLAdapter({ map }),
          modes: [
            new TerraDrawPolygonMode({
              styles: { fillColor: '#1684f8', fillOpacity: 0.3, outlineColor: '#1684f8', outlineWidth: 3 },
            }),
            new TerraDrawRectangleMode({
              styles: { fillColor: '#1684f8', fillOpacity: 0.3, outlineColor: '#1684f8', outlineWidth: 3 },
            }),
            new TerraDrawSelectMode({
              flags: {
                polygon: { feature: { draggable: true, coordinates: { draggable: true, midpoints: true, deletable: true } } },
                rectangle: { feature: { draggable: true, coordinates: { draggable: true } } },
              },
              styles: { selectedPolygonColor: '#1684f8', selectedPolygonOutlineColor: '#ffffff' },
            }),
          ],
        })
        drawRef.current = draw
        draw.start()

        const emitPolygon = (id: string | number) => {
          const feature = draw.getSnapshotFeature(id)
          if (feature?.geometry.type !== 'Polygon') return
          const polygon = validatePolygon(feature.geometry)
          boundaryRef.current = polygon
          onBoundaryChangeRef.current?.(polygon)
        }
        draw.on('finish', (id) => {
          emitPolygon(id)
          draw.setMode('select')
          draw.selectFeature(id)
        })
        draw.on('change', (ids, changeType) => {
          if (changeType === 'update' && ids[0] !== undefined) emitPolygon(ids[0])
        })

        if (boundaryRef.current) {
          loadBoundaryIntoDraw(boundaryRef.current)
          fitBoundary()
        } else {
          draw.setMode('polygon')
        }
      })

      const resizeObserver = new ResizeObserver(() => map.resize())
      resizeObserver.observe(containerRef.current)
      return () => {
        resizeObserver.disconnect()
        drawRef.current?.stop()
        drawRef.current = null
        mapRef.current = null
        map.remove()
      }
    }, [editable])

    return (
      <div className="project-boundary-map">
        <div ref={containerRef} className="project-boundary-map-canvas" aria-label="Project area map" />
        <div className="boundary-map-controls" aria-label="Map controls">
          <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}><Plus size={19} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}><Minus size={19} /></button>
          <button type="button" aria-label="Fit project boundary" onClick={fitBoundary}><Crosshair size={18} /></button>
          <button type="button" aria-label="Map style information" title="OpenFreeMap Liberty basemap"><Layers3 size={18} /></button>
        </div>
      </div>
    )
  },
)
