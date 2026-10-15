import type { Polygon } from 'geojson'

export type ProjectStatus = 'Active' | 'Planning' | 'Review' | 'Concept' | 'Archived'

export type ProjectScope = 'mine' | 'shared'

export interface ExplorationProject {
  id: string
  name: string
  location: string
  country: string
  status: ProjectStatus
  scope: ProjectScope
  commodities: string[]
  areaKm2: number
  targetCount: number
  datasetCount: number
  updatedAt: string
  updatedAtIso: string
  createdAt: string
  owner: string
  coordinateSystem: string
  projectType: string
  description: string
  fieldPlanCount: number
  reportCount: number
  areaOfInterest?: Polygon
  perimeterKm?: number
  vertexCount?: number
  isPersisted?: boolean
}

export interface ProjectFormValues {
  name: string
  commodity: string
  country: string
  projectType: string
  description: string
}

export type ProjectSort = 'updated' | 'name' | 'area'

export interface ProjectFilters {
  query: string
  commodity: string
  status: string
  scope: 'all' | 'mine' | 'shared' | 'archived'
  sort: ProjectSort
}

export interface ProjectActivity {
  id: string
  projectId: string
  title: string
  detail: string
  time: string
  kind: 'data' | 'target' | 'map' | 'report' | 'field' | 'sample'
}

export interface ProgressStep {
  label: string
  description: string
  complete: number
  total: number
  kind: 'data' | 'map' | 'screening' | 'target' | 'field' | 'report'
}
