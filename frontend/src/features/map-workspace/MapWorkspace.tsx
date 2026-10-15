import { AlertTriangle, Layers3 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActiveLayersBar } from './components/ActiveLayersBar'
import {
  CompareLayersPanel,
  ComparisonInsights,
} from './components/ComparisonPanels'
import { FeatureDetailsPanel } from './components/FeatureDetailsPanel'
import { LayerLegend } from './components/LayerLegend'
import { MapCanvas, type MapCanvasHandle } from './components/MapCanvas'
import { MapLayersPanel } from './components/MapLayersPanel'
import { MapToolbar } from './components/MapToolbar'
import { ProjectOverviewPanel } from './components/ProjectOverviewPanel'
import { useMapLayers } from './hooks/useMapLayers'
import { useWorkspaceData } from './hooks/useWorkspaceData'
import type {
  SelectedMapFeature,
  WorkspaceDataset,
  WorkspaceView,
} from './types/mapTypes'
import type { ExplorationProject } from '../projects/types/projectTypes'
import { INITIAL_LAYERS } from './data/demoWorkspace'

interface MapWorkspaceProps {
  project: ExplorationProject
  view: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
  searchRequest: { id: number; query: string } | null
}

function targetFromDataset(
  data: WorkspaceDataset,
  requestedId = 'CHR-021',
): SelectedMapFeature | null {
  const target = data.targets.features.find(
    (feature) => String(feature.properties?.name).toLowerCase() === requestedId.toLowerCase(),
  )
  if (!target || target.geometry.type !== 'Point') return null
  const properties = target.properties ?? {}

  return {
    id: String(target.id ?? properties.name),
    layerId: 'targets-circle',
    featureType: 'target',
    title: String(properties.name),
    subtitle: String(properties.category ?? 'Screening target'),
    coordinates: [target.geometry.coordinates[0], target.geometry.coordinates[1]],
    geometry: target.geometry,
    attributes: {
      relativeScore: Number(properties.relativeScore),
      reviewStatus: String(properties.reviewStatus),
      screeningRun: String(properties.screeningRun),
      supportingEvidence: Array.isArray(properties.evidence)
        ? properties.evidence.map(String)
        : [],
      nearbySamples: Number(properties.nearbySamples),
      source: String(properties.source),
    },
  }
}

export function MapWorkspace({
  project,
  view,
  onViewChange,
  searchRequest,
}: MapWorkspaceProps) {
  const mapRef = useRef<MapCanvasHandle>(null)
  const { data, loading, error } = useWorkspaceData(project.id, project)
  const initialLayers = useMemo(
    () => project.id === 'great-dyke-chrome-demo'
      ? INITIAL_LAYERS
      : INITIAL_LAYERS.map((layer) => layer.id === 'project-boundary'
        ? layer
        : { ...layer, active: false, visible: false }),
    [project.id],
  )
  const {
    layers,
    activeLayers,
    availableLayers,
    groupedLayers,
    updateLayer,
    toggleVisibility,
    addLayer,
    removeLayer,
  } = useMapLayers(initialLayers)
  const [selectedFeature, setSelectedFeature] = useState<SelectedMapFeature | null>(null)
  const [measuring, setMeasuring] = useState(false)
  const [inspecting, setInspecting] = useState(true)
  const [comparisonSplit, setComparisonSplit] = useState(52)
  const [notice, setNotice] = useState<string | null>(null)

  const defaultTarget = useMemo(
    () => (data ? targetFromDataset(data) : null),
    [data],
  )

  useEffect(() => {
    if (view === 'inspect' && !selectedFeature && defaultTarget) {
      setSelectedFeature(defaultTarget)
    }
  }, [defaultTarget, selectedFeature, view])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!searchRequest || !data) return
    const query = searchRequest.query.trim()
    const coordinateMatch = query.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/,
    )

    if (coordinateMatch) {
      const longitude = Number(coordinateMatch[1])
      const latitude = Number(coordinateMatch[2])
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        mapRef.current?.flyToCoordinates([longitude, latitude], 11)
        setNotice(`Map centred on ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        return
      }
    }

    const target = targetFromDataset(data, query)
    if (target) {
      setSelectedFeature(target)
      onViewChange('inspect')
      mapRef.current?.flyToCoordinates(target.coordinates, 10.5)
      setNotice(`${target.title} selected`)
      return
    }

    setNotice(`No project feature matches “${query}”.`)
  }, [data, onViewChange, searchRequest])

  function selectFeature(feature: SelectedMapFeature) {
    setSelectedFeature(feature)
    onViewChange('inspect')
  }

  function closeDetails() {
    setSelectedFeature(null)
    onViewChange('overview')
  }

  if (loading) {
    return (
      <div className="workspace-status">
        <span className="loading-spinner" />
        <strong>Preparing the project map</strong>
        <p>Loading approved layers and project context…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="workspace-status is-error">
        <AlertTriangle size={26} />
        <strong>Map Workspace unavailable</strong>
        <p>{error ?? 'No project map data was returned.'}</p>
      </div>
    )
  }

  return (
    <div className={`map-workspace map-view-${view}`}>
      <MapCanvas
        ref={mapRef}
        data={data}
        layers={layers}
        selectedFeature={selectedFeature}
        comparison={view === 'compare'}
        measuring={measuring}
        inspecting={inspecting}
        comparisonSplit={comparisonSplit}
        onComparisonSplitChange={setComparisonSplit}
        onSelectFeature={selectFeature}
      />

      <div className="workspace-context-label">
        <span>Map Workspace</span>
        <strong>{data.project.name}</strong>
      </div>

      {view === 'overview' && <ProjectOverviewPanel project={data.project} />}

      {view === 'layers' && (
        <MapLayersPanel
          layers={layers}
          groupedLayers={groupedLayers}
          availableLayers={availableLayers}
          onToggle={toggleVisibility}
          onOpacityChange={(layerId, opacity) => updateLayer(layerId, { opacity })}
          onRemove={removeLayer}
          onAdd={addLayer}
          onClose={() => onViewChange('overview')}
        />
      )}

      {view === 'inspect' && selectedFeature && (
        <FeatureDetailsPanel
          feature={selectedFeature}
          onClose={closeDetails}
          onOpenReview={() =>
            setNotice('Target Review is intentionally reserved for the next workspace milestone.')
          }
        />
      )}

      {view === 'compare' && (
        <>
          <CompareLayersPanel
            layers={layers}
            onClose={() => onViewChange('overview')}
            onOpacityChange={(layerId, opacity) => updateLayer(layerId, { opacity })}
          />
          <ComparisonInsights />
        </>
      )}

      {view !== 'compare' && <LayerLegend layers={layers} />}

      <MapToolbar
        measuring={measuring}
        inspecting={inspecting}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onFitProject={() => mapRef.current?.fitProject()}
        onToggleInspect={() => {
          setInspecting((current) => !current)
          setMeasuring(false)
        }}
        onToggleMeasure={() => {
          setMeasuring((current) => !current)
          setInspecting(false)
        }}
        onFullscreen={() => mapRef.current?.fullscreen()}
      />

      <ActiveLayersBar
        layers={activeLayers}
        comparison={view === 'compare'}
        onOpenLayers={() => onViewChange('layers')}
      />

      <div className="prototype-data-note">
        <Layers3 size={14} /> {data.project.isDemonstration
          ? 'Prototype workspace · demonstration geology only'
          : 'Project workspace · saved boundary only'}
      </div>

      {notice && <div className="workspace-toast" role="status">{notice}</div>}
    </div>
  )
}

