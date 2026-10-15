export type DataView = 'library' | 'add' | 'upload' | 'api' | 'sources' | 'validation' | 'detail' | 'approval'

export type DatasetType = 'Raster' | 'Vector' | 'Tabular'
export type DatasetStatus = 'Map-ready' | 'Approved' | 'Validated' | 'Processing' | 'Pending'
export type DatasetOrigin = 'API' | 'Uploaded' | 'Processed' | 'AI Generated'
export type DatasetTheme = 'magnetics' | 'geology' | 'geochemistry' | 'gravity' | 'drilling' | 'imagery' | 'topography'

export interface ExplorationDataset {
  id: string
  name: string
  description: string
  type: DatasetType
  category: string
  source: string
  origin: DatasetOrigin
  status: DatasetStatus
  updated: string
  owner: string
  size: string
  format: string
  crs: string
  resolution: string
  extent: string
  theme: DatasetTheme
}

export interface DataSourceRecord {
  id: string
  name: string
  provider: string
  providerType: string
  status: 'Active' | 'Attention'
  health: 'Healthy' | 'N/A' | 'Delayed'
  synced: string
  datasets: number
  group: 'API Providers' | 'Internal Sources' | 'Manual Sources'
  theme: DatasetTheme
}

export interface ValidationIssue {
  id: string
  title: string
  detail: string
  severity: 'Critical' | 'Minor' | 'Info'
}
