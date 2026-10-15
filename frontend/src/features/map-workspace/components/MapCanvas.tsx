import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import {
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type Map as MapLibreMap,
} from 'maplibre-gl'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection, LineString } from 'geojson'
import type {
  MapLayerDefinition,
  SelectedMapFeature,
  WorkspaceDataset,
} from '../types/mapTypes'
import { formatDistance, haversineDistanceKm } from '../utils/geo'
import {
  configureTerrainView,
  getMapStyle,
  getMapView,
  MAP_VIEW_OPTIONS,
  type MapViewId,
} from '../../../shared/maps/mapViews'

// Vite pre-bundles MapLibre's main module into node_modules/.vite/deps during
// development, but its sibling worker is not copied beside that generated file.
// Supplying the worker as an explicit Vite URL keeps development and production
// builds on the same, same-origin module worker instead of relying on inference.
maplibregl.setWorkerUrl(maplibreWorkerUrl)

const OFFLINE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'offline-background',
      type: 'background',
      paint: { 'background-color': '#173b3a' },
    },
  ],
}

const EMPTY_LINE: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [],
}

const RENDER_IDS: Record<string, string[]> = {
  'project-boundary': ['project-boundary-fill', 'project-boundary-line'],
  geology: ['geology-fill', 'geology-line'],
  magnetics: ['magnetics-heat'],
  structures: ['structures-line'],
  'surface-samples': ['samples-circle'],
  'mineral-occurrences': ['occurrences-circle'],
  targets: ['targets-halo', 'targets-circle', 'targets-label'],
}

const SELECTABLE_LAYERS = [
  'targets-circle',
  'occurrences-circle',
  'samples-circle',
  'structures-line',
  'geology-fill',
]

export interface MapCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  fitProject: () => void
  fullscreen: () => void
  flyToCoordinates: (coordinates: [number, number], zoom?: number) => void
}

interface MapCanvasProps {
  data: WorkspaceDataset
  layers: MapLayerDefinition[]
  selectedFeature: SelectedMapFeature | null
  comparison: boolean
  measuring: boolean
  inspecting: boolean
  comparisonSplit: number
  onComparisonSplitChange: (value: number) => void
  onSelectFeature: (feature: SelectedMapFeature) => void
}

function addGeoJsonSource(
  map: MapLibreMap,
  id: string,
  data: FeatureCollection,
) {
  if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data })
}

function addWorkspaceLayers(
  map: MapLibreMap,
  data: WorkspaceDataset,
  comparisonSide: 'all' | 'magnetics' | 'geology',
) {
  addGeoJsonSource(map, 'project-boundary', data.boundary)
  addGeoJsonSource(map, 'geology', data.geology)
  addGeoJsonSource(map, 'magnetics', data.magnetics)
  addGeoJsonSource(map, 'structures', data.structures)
  addGeoJsonSource(map, 'surface-samples', data.samples)
  addGeoJsonSource(map, 'mineral-occurrences', data.occurrences)
  addGeoJsonSource(map, 'targets', data.targets)
  addGeoJsonSource(map, 'selected-feature', { type: 'FeatureCollection', features: [] })
  addGeoJsonSource(map, 'measurement', EMPTY_LINE)

  if (comparisonSide !== 'geology') {
    map.addLayer({
      id: 'magnetics-heat',
      type: 'heatmap',
      source: 'magnetics',
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.75, 9, 1.35],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 26, 9, 72],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(30,64,175,0)',
          0.15,
          '#3157d5',
          0.35,
          '#13b8a6',
          0.55,
          '#f4df4e',
          0.75,
          '#f97346',
          1,
          '#e93468',
        ],
        'heatmap-opacity': 0.75,
      },
    })
  }

  if (comparisonSide !== 'magnetics') {
    map.addLayer({
      id: 'geology-fill',
      type: 'fill',
      source: 'geology',
      paint: {
        'fill-color': [
          'match',
          ['get', 'name'],
          'Ultramafic sequence',
          '#7263a8',
          'Mafic sequence',
          '#55a565',
          '#b9a46a',
        ],
        'fill-opacity': 0.64,
      },
    })
    map.addLayer({
      id: 'geology-line',
      type: 'line',
      source: 'geology',
      paint: { 'line-color': '#2f365f', 'line-width': 1.1, 'line-opacity': 0.7 },
    })
  }

  map.addLayer({
    id: 'structures-line',
    type: 'line',
    source: 'structures',
    paint: {
      'line-color': '#f8fafc',
      'line-width': 2,
      'line-dasharray': [3, 2],
      'line-opacity': 0.9,
    },
  })
  map.addLayer({
    id: 'project-boundary-fill',
    type: 'fill',
    source: 'project-boundary',
    paint: { 'fill-color': '#ff334e', 'fill-opacity': 0.035 },
  })
  map.addLayer({
    id: 'project-boundary-line',
    type: 'line',
    source: 'project-boundary',
    paint: { 'line-color': '#ff4d61', 'line-width': 2.5, 'line-opacity': 0.95 },
  })
  map.addLayer({
    id: 'samples-circle',
    type: 'circle',
    source: 'surface-samples',
    paint: {
      'circle-color': '#278fff',
      'circle-radius': 4,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.4,
    },
  })
  map.addLayer({
    id: 'occurrences-circle',
    type: 'circle',
    source: 'mineral-occurrences',
    paint: {
      'circle-color': '#f6c945',
      'circle-radius': 5,
      'circle-stroke-color': '#18243c',
      'circle-stroke-width': 1.3,
    },
  })
  map.addLayer({
    id: 'targets-halo',
    type: 'circle',
    source: 'targets',
    paint: {
      'circle-color': 'rgba(255,51,78,0.12)',
      'circle-radius': 22,
      'circle-stroke-color': '#ff334e',
      'circle-stroke-width': 1.5,
      'circle-stroke-opacity': 0.55,
    },
  })
  map.addLayer({
    id: 'targets-circle',
    type: 'circle',
    source: 'targets',
    paint: {
      'circle-color': '#ff334e',
      'circle-radius': 8,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
    },
  })
  map.addLayer({
    id: 'targets-label',
    type: 'symbol',
    source: 'targets',
    layout: {
      'text-field': ['get', 'name'],
      // This font stack is available from OpenFreeMap's glyph endpoint. The
      // MapLibre default stack references a legacy glyph path that returns 404.
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-offset': [1.25, 0],
      'text-anchor': 'left',
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#eafffb',
      'text-halo-color': '#063c3b',
      'text-halo-width': 4,
    },
  })
  map.addLayer({
    id: 'selected-fill',
    type: 'fill',
    source: 'selected-feature',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: { 'fill-color': '#16d6b4', 'fill-opacity': 0.18 },
  })
  map.addLayer({
    id: 'selected-line',
    type: 'line',
    source: 'selected-feature',
    paint: { 'line-color': '#ecfeff', 'line-width': 4 },
  })
  map.addLayer({
    id: 'selected-point',
    type: 'circle',
    source: 'selected-feature',
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-color': 'rgba(22,214,180,0.15)',
      'circle-radius': 17,
      'circle-stroke-color': '#ecfeff',
      'circle-stroke-width': 3,
    },
  })
  map.addLayer({
    id: 'measurement-line',
    type: 'line',
    source: 'measurement',
    paint: {
      'line-color': '#ffffff',
      'line-width': 3,
      'line-dasharray': [2, 1.5],
    },
  })
}

function updateLayerPresentation(map: MapLibreMap, layers: MapLayerDefinition[]) {
  for (const layer of layers) {
    for (const renderId of RENDER_IDS[layer.id] ?? []) {
      if (!map.getLayer(renderId)) continue
      map.setLayoutProperty(renderId, 'visibility', layer.visible && layer.active ? 'visible' : 'none')

      if (renderId.includes('fill')) map.setPaintProperty(renderId, 'fill-opacity', layer.opacity * 0.64)
      if (renderId.includes('line')) map.setPaintProperty(renderId, 'line-opacity', layer.opacity)
      if (renderId.includes('circle') || renderId.includes('halo')) {
        map.setPaintProperty(renderId, 'circle-opacity', layer.opacity)
      }
      if (renderId === 'magnetics-heat') map.setPaintProperty(renderId, 'heatmap-opacity', layer.opacity)
    }
  }
}

function parseArrayProperty(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : [value]
  } catch {
    return value.split(',').map((item) => item.trim())
  }
}

function toSelectedFeature(
  feature: MapGeoJSONFeature,
  coordinates: [number, number],
): SelectedMapFeature {
  const properties = feature.properties ?? {}
  const layerId = feature.layer.id
  const featureType: SelectedMapFeature['featureType'] = layerId.startsWith('target')
    ? 'target'
    : layerId.startsWith('occurrence')
      ? 'occurrence'
      : layerId.startsWith('sample')
        ? 'sample'
        : layerId.startsWith('structure')
          ? 'structure'
          : 'geology'

  const common = {
    id: String(feature.id ?? properties.name ?? 'selected-feature'),
    layerId,
    featureType,
    title: String(properties.name ?? 'Selected feature'),
    coordinates,
    geometry: feature.geometry,
  }

  if (featureType === 'target') {
    return {
      ...common,
      subtitle: String(properties.category ?? 'Screening target'),
      attributes: {
        relativeScore: properties.relativeScore ?? null,
        reviewStatus: properties.reviewStatus ?? null,
        screeningRun: properties.screeningRun ?? null,
        supportingEvidence: parseArrayProperty(properties.evidence),
        nearbySamples: properties.nearbySamples ?? null,
        source: properties.source ?? null,
      },
    }
  }

  if (featureType === 'geology') {
    return {
      ...common,
      subtitle: String(properties.lithology ?? 'Geological unit'),
      attributes: {
        lithology: properties.lithology ?? null,
        classification: properties.classification ?? null,
        geologicalAge: properties.age ?? null,
        datasetSource: properties.source ?? null,
        datasetVersion: properties.version ?? null,
      },
    }
  }

  return {
    ...common,
    subtitle: String(
      properties.mineralisation ?? properties.sampleType ?? properties.trend ?? featureType,
    ),
    attributes: Object.fromEntries(
      Object.entries(properties).filter(([key]) => key !== 'name'),
    ) as SelectedMapFeature['attributes'],
  }
}

function setSelectedSource(map: MapLibreMap, selected: SelectedMapFeature | null) {
  const source = map.getSource('selected-feature') as GeoJSONSource | undefined
  if (!source) return
  source.setData({
    type: 'FeatureCollection',
    features: selected
      ? [{ type: 'Feature', properties: {}, geometry: selected.geometry }]
      : [],
  })
}

function showFeaturePopup(
  map: MapLibreMap,
  feature: SelectedMapFeature,
  popupRef: React.MutableRefObject<maplibregl.Popup | null>,
  onSelectFeature: (feature: SelectedMapFeature) => void,
) {
  popupRef.current?.remove()
  const content = document.createElement('div')
  content.className = 'feature-popup-content'

  const eyebrow = document.createElement('span')
  eyebrow.textContent = feature.featureType
  const title = document.createElement('strong')
  title.textContent = feature.title
  const subtitle = document.createElement('p')
  subtitle.textContent = feature.subtitle
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'View details'
  button.addEventListener('click', () => onSelectFeature(feature))
  content.append(eyebrow, title, subtitle, button)

  popupRef.current = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    offset: 14,
    maxWidth: '260px',
  })
    .setLngLat(feature.coordinates)
    .setDOMContent(content)
    .addTo(map)
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  function MapCanvas(
    {
      data,
      layers,
      selectedFeature,
      comparison,
      measuring,
      inspecting,
      comparisonSplit,
      onComparisonSplitChange,
      onSelectFeature,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null)
    const primaryContainerRef = useRef<HTMLDivElement>(null)
    const comparisonContainerRef = useRef<HTMLDivElement>(null)
    const primaryMapRef = useRef<MapLibreMap | null>(null)
    const comparisonMapRef = useRef<MapLibreMap | null>(null)
    const popupRef = useRef<maplibregl.Popup | null>(null)
    const measurePointsRef = useRef<[number, number][]>([])
    const layersRef = useRef(layers)
    const selectedFeatureRef = useRef(selectedFeature)
    const measuringRef = useRef(measuring)
    const inspectingRef = useRef(inspecting)
    const onSelectFeatureRef = useRef(onSelectFeature)
    const [mapView, setMapView] = useState<MapViewId>(() => {
      const requested = new URLSearchParams(window.location.search).get('mapStyle') as MapViewId | null
      return requested && MAP_VIEW_OPTIONS.some((option) => option.id === requested) ? requested : 'physical'
    })
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
    const [measureLabel, setMeasureLabel] = useState<string | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const [usingFallbackBasemap, setUsingFallbackBasemap] = useState(false)

    layersRef.current = layers
    selectedFeatureRef.current = selectedFeature
    measuringRef.current = measuring
    inspectingRef.current = inspecting
    onSelectFeatureRef.current = onSelectFeature

    useImperativeHandle(ref, () => ({
      zoomIn: () => primaryMapRef.current?.zoomIn(),
      zoomOut: () => primaryMapRef.current?.zoomOut(),
      fitProject: () =>
        primaryMapRef.current?.fitBounds(data.projectBounds, {
          padding: { top: 70, right: 90, bottom: 100, left: 90 },
          duration: 700,
        }),
      fullscreen: () => rootRef.current?.requestFullscreen(),
      flyToCoordinates: (targetCoordinates, zoom = 11) =>
        primaryMapRef.current?.flyTo({ center: targetCoordinates, zoom, duration: 800 }),
    }))

    useEffect(() => {
      if (!primaryContainerRef.current) return

      setMapReady(false)
      setUsingFallbackBasemap(false)
      const viewDefinition = getMapView(mapView)
      const primaryMap = new maplibregl.Map({
        container: primaryContainerRef.current,
        style: getMapStyle(mapView),
        center: [29.79, -18.58],
        zoom: 6.7,
        pitch: viewDefinition.pitch,
        bearing: viewDefinition.bearing,
        maxPitch: 85,
        minZoom: 4,
        maxZoom: 17,
        attributionControl: false,
      })
      primaryMapRef.current = primaryMap
      primaryMap.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      primaryMap.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')

      // The workspace changes size when the sidebar, developer tools, or browser
      // viewport changes. Explicitly resize both canvases so their WebGL drawing
      // buffers always match the CSS layout.
      const resizeObserver = new ResizeObserver(() => {
        primaryMap.resize()
        comparisonMapRef.current?.resize()
      })
      if (rootRef.current) resizeObserver.observe(rootRef.current)

      const handleLoad = () => {
        window.clearTimeout(fallbackTimer)
        primaryMap.resize()
        configureTerrainView(primaryMap, mapView)
        addWorkspaceLayers(primaryMap, data, comparison ? 'magnetics' : 'all')
        updateLayerPresentation(primaryMap, layersRef.current)
        setSelectedSource(primaryMap, selectedFeatureRef.current)
        primaryMap.fitBounds(data.projectBounds, {
          padding: { top: 70, right: 90, bottom: 110, left: 90 },
          duration: 0,
        })
        setMapReady(true)
      }

      const fallbackTimer = window.setTimeout(() => {
        if (primaryMap.getSource('project-boundary')) return
        setUsingFallbackBasemap(true)
        primaryMap.setStyle(OFFLINE_STYLE)
      }, 15000)

      const handleMove = () => {
        const companionMap = comparisonMapRef.current
        if (!companionMap?.isStyleLoaded()) return
        companionMap.jumpTo({
          center: primaryMap.getCenter(),
          zoom: primaryMap.getZoom(),
          bearing: primaryMap.getBearing(),
          pitch: primaryMap.getPitch(),
        })
      }

      const handleMouseMove = (event: maplibregl.MapMouseEvent) => {
        setCoordinates([event.lngLat.lng, event.lngLat.lat])
        const interactiveLayers = SELECTABLE_LAYERS.filter((id) => primaryMap.getLayer(id))
        const hasFeature = primaryMap.queryRenderedFeatures(event.point, {
          layers: interactiveLayers,
        }).length > 0
        primaryMap.getCanvas().style.cursor = measuringRef.current
          ? 'crosshair'
          : hasFeature && inspectingRef.current
            ? 'pointer'
            : ''
      }

      const handleClick = (event: maplibregl.MapMouseEvent) => {
        if (measuringRef.current) {
          const coordinate: [number, number] = [event.lngLat.lng, event.lngLat.lat]
          const nextPoints =
            measurePointsRef.current.length >= 2
              ? [coordinate]
              : [...measurePointsRef.current, coordinate]
          measurePointsRef.current = nextPoints
          const source = primaryMap.getSource('measurement') as GeoJSONSource | undefined
          source?.setData({
            type: 'FeatureCollection',
            features:
              nextPoints.length > 1
                ? [
                    {
                      type: 'Feature',
                      properties: {},
                      geometry: { type: 'LineString', coordinates: nextPoints },
                    },
                  ]
                : [],
          })
          setMeasureLabel(
            nextPoints.length === 2
              ? formatDistance(haversineDistanceKm(nextPoints[0], nextPoints[1]))
              : 'Select an end point',
          )
          return
        }

        if (!inspectingRef.current) return
        const interactiveLayers = SELECTABLE_LAYERS.filter((id) => primaryMap.getLayer(id))
        const [renderedFeature] = primaryMap.queryRenderedFeatures(event.point, {
          layers: interactiveLayers,
        })
        if (!renderedFeature) return

        const pointCoordinates: [number, number] =
          renderedFeature.geometry.type === 'Point'
            ? [renderedFeature.geometry.coordinates[0], renderedFeature.geometry.coordinates[1]]
            : [event.lngLat.lng, event.lngLat.lat]
        const selected = toSelectedFeature(renderedFeature, pointCoordinates)
        setSelectedSource(primaryMap, selected)
        showFeaturePopup(primaryMap, selected, popupRef, onSelectFeatureRef.current)
        onSelectFeatureRef.current(selected)
      }

      primaryMap.once('style.load', handleLoad)
      primaryMap.on('move', handleMove)
      primaryMap.on('mousemove', handleMouseMove)
      primaryMap.on('click', handleClick)

      let comparisonMap: MapLibreMap | null = null
      let comparisonFallbackTimer: number | null = null
      if (comparison && comparisonContainerRef.current) {
        const companionMap = new maplibregl.Map({
          container: comparisonContainerRef.current,
          style: getMapStyle(mapView),
          center: [29.79, -18.58],
          zoom: 6.7,
          pitch: viewDefinition.pitch,
          bearing: viewDefinition.bearing,
          maxPitch: 85,
          interactive: false,
          attributionControl: false,
        })
        comparisonMap = companionMap
        comparisonMapRef.current = companionMap
        comparisonFallbackTimer = window.setTimeout(() => {
          if (!companionMap.getSource('project-boundary')) {
            companionMap.setStyle(OFFLINE_STYLE)
          }
        }, 15000)
        companionMap.once('style.load', () => {
          if (comparisonFallbackTimer !== null) {
            window.clearTimeout(comparisonFallbackTimer)
          }
          configureTerrainView(companionMap, mapView)
          addWorkspaceLayers(companionMap, data, 'geology')
          updateLayerPresentation(companionMap, layersRef.current)
          setSelectedSource(companionMap, selectedFeatureRef.current)
          handleMove()
        })
      }

      return () => {
        resizeObserver.disconnect()
        window.clearTimeout(fallbackTimer)
        if (comparisonFallbackTimer !== null) {
          window.clearTimeout(comparisonFallbackTimer)
        }
        popupRef.current?.remove()
        popupRef.current = null
        primaryMap.remove()
        comparisonMap?.remove()
        primaryMapRef.current = null
        comparisonMapRef.current = null
      }
    }, [comparison, data, mapView])

    useEffect(() => {
      if (!mapReady) return
      if (primaryMapRef.current) updateLayerPresentation(primaryMapRef.current, layers)
      if (comparisonMapRef.current) updateLayerPresentation(comparisonMapRef.current, layers)
    }, [layers, mapReady])

    useEffect(() => {
      if (primaryMapRef.current) {
        setSelectedSource(primaryMapRef.current, selectedFeature)
      }
      if (comparisonMapRef.current) setSelectedSource(comparisonMapRef.current, selectedFeature)
      if (selectedFeature && primaryMapRef.current?.isStyleLoaded()) {
        showFeaturePopup(
          primaryMapRef.current,
          selectedFeature,
          popupRef,
          onSelectFeatureRef.current,
        )
      }
    }, [selectedFeature])

    useEffect(() => {
      if (measuring) return
      measurePointsRef.current = []
      setMeasureLabel(null)
      const source = primaryMapRef.current?.getSource('measurement') as GeoJSONSource | undefined
      source?.setData(EMPTY_LINE)
    }, [measuring])

    return (
      <div className="map-canvas" ref={rootRef}>
        <div className="map-renderer" ref={primaryContainerRef} />
        {comparison && (
          <>
            <div
              className="map-renderer comparison-renderer"
              ref={comparisonContainerRef}
              style={{ clipPath: `inset(0 0 0 ${comparisonSplit}%)` }}
            />
            <div className="comparison-label comparison-label-left">Magnetic response</div>
            <div className="comparison-label comparison-label-right">Interpreted geology</div>
            <div className="comparison-divider" style={{ left: `${comparisonSplit}%` }}>
              <span>↔</span>
              <input
                type="range"
                min="18"
                max="82"
                value={comparisonSplit}
                onChange={(event) => onComparisonSplitChange(Number(event.target.value))}
                aria-label="Comparison split position"
              />
            </div>
          </>
        )}

        <div className="basemap-selector">
          <span>Map view</span>
          <select
            value={mapView}
            onChange={(event) => {
              const nextView = event.target.value as MapViewId
              setMapView(nextView)
              const url = new URL(window.location.href)
              url.searchParams.set('mapStyle', nextView)
              window.history.replaceState({}, '', url)
            }}
            aria-label="Map view"
          >
            {MAP_VIEW_OPTIONS.map((option) => (
              <option value={option.id} key={option.id}>{option.label}</option>
            ))}
          </select>
          <small>{getMapView(mapView).description}</small>
        </div>

        {coordinates && (
          <output className="coordinate-readout">
            {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)} · WGS 84
          </output>
        )}
        {measureLabel && <output className="measure-readout">{measureLabel}</output>}
        {!mapReady && <div className="map-loading">Loading project map…</div>}
        {usingFallbackBasemap && (
          <div className="basemap-fallback-note">
            Basemap unavailable · project layers remain interactive
          </div>
        )}
      </div>
    )
  },
)

