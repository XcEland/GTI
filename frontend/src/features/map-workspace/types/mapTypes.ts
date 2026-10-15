import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type WorkspaceView = 'overview' | 'layers' | 'inspect' | 'compare'

export type LayerGroup =
  | 'Project'
  | 'Geology'
  | 'Geophysics'
  | 'Structures'
  | 'Samples'
  | 'Occurrences'
  | 'Targets'
  | 'Terrain'
  | 'Remote sensing'

export type LayerKind = 'boundary' | 'fill' | 'line' | 'heatmap' | 'point'

export interface MapLayerDefinition {
  id: string
  name: string
  shortName: string
  group: LayerGroup
  kind: LayerKind
  color: string
  visible: boolean
  opacity: number
  active: boolean
  approved: boolean
  unit?: string
}

export interface ProjectSummary {
  id: string
  name: string
  country: string
  commodityFocus: string[]
  areaKm2: number
  targetCount: number
  approvedLayerCount: number
  sampleCount: number
  updatedAt: string
  isDemonstration?: boolean
}

export interface SelectedMapFeature {
  id: string
  layerId: string
  featureType: 'geology' | 'occurrence' | 'target' | 'sample' | 'structure'
  title: string
  subtitle: string
  coordinates: [number, number]
  geometry: Geometry
  attributes: Record<string, string | number | string[] | null>
}

export interface WorkspaceDataset {
  project: ProjectSummary
  projectBounds: [[number, number], [number, number]]
  boundary: FeatureCollection
  geology: FeatureCollection
  magnetics: FeatureCollection
  structures: FeatureCollection
  samples: FeatureCollection
  occurrences: FeatureCollection
  targets: FeatureCollection
}

export type WorkspaceFeature = Feature<Geometry, Record<string, unknown>>

