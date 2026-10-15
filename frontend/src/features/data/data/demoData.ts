import type { DataSourceRecord, ExplorationDataset, ValidationIssue } from '../types/dataTypes'

/**
 * Demonstration records are isolated from the workspace components so a future
 * project-scoped REST endpoint can replace them without changing presentation.
 */
export const DEMO_DATASETS: ExplorationDataset[] = [
  { id: 'airborne-magnetics', name: 'Airborne Magnetics (RTP)', description: 'Regional magnetics, 50 m resolution', type: 'Raster', category: 'Geophysics', source: 'Geoscience Portal', origin: 'API', status: 'Map-ready', updated: '12 Apr 2025', owner: 'Alex Moyo', size: '1.2 GB', format: 'GeoTIFF', crs: 'WGS 84 / UTM Zone 35S', resolution: '50 m', extent: '29.1°E – 31.2°E, 17.8°S – 20.1°S', theme: 'magnetics' },
  { id: 'drill-holes', name: 'Drill Holes', description: 'Collar locations and assays', type: 'Vector', category: 'Drilling', source: 'Drilling Programme', origin: 'Uploaded', status: 'Processing', updated: '06 Apr 2025', owner: 'Sarah Ndlovu', size: '320 MB', format: 'GeoPackage', crs: 'WGS 84 / UTM Zone 35S', resolution: 'Point features', extent: 'Great Dyke corridor', theme: 'drilling' },
  { id: 'soil-geochemistry', name: 'Soil Geochemistry (Ni)', description: 'Soil samples, 1,204 points', type: 'Tabular', category: 'Geochemistry', source: 'Field Sampling', origin: 'Uploaded', status: 'Validated', updated: '08 Apr 2025', owner: 'Alex Moyo', size: '86 MB', format: 'CSV', crs: 'WGS 84 (EPSG:4326)', resolution: '1,204 samples', extent: 'Project AOI', theme: 'geochemistry' },
  { id: 'geology-250k', name: 'Geology (1:250k)', description: 'Zimbabwe Geological Map', type: 'Vector', category: 'Geology', source: 'Zimbabwe Geological Survey', origin: 'API', status: 'Approved', updated: '10 Apr 2025', owner: 'GeoMin', size: '540 MB', format: 'GeoPackage', crs: 'WGS 84 (EPSG:4326)', resolution: '1:250,000', extent: 'Zimbabwe national', theme: 'geology' },
  { id: 'gravity-anomalies', name: 'Gravity Anomalies', description: 'Bouguer gravity, 250 m', type: 'Raster', category: 'Geophysics', source: 'Geoscience Portal', origin: 'API', status: 'Map-ready', updated: '08 Apr 2025', owner: 'Alex Moyo', size: '450 MB', format: 'GeoTIFF', crs: 'WGS 84 / UTM Zone 35S', resolution: '250 m', extent: 'Central Zimbabwe', theme: 'gravity' },
  { id: 'rock-samples', name: 'Rock Samples', description: 'Petrography and assays', type: 'Tabular', category: 'Samples', source: 'Field Sampling', origin: 'Uploaded', status: 'Pending', updated: '03 Apr 2025', owner: 'T. Chirwa', size: '54 MB', format: 'CSV', crs: 'WGS 84 (EPSG:4326)', resolution: '842 samples', extent: 'Project AOI', theme: 'geochemistry' },
  { id: 'structure-interpretation', name: 'Structure Interpretation', description: 'Faults and lineaments', type: 'Vector', category: 'Geology', source: 'Interpretation Team', origin: 'AI Generated', status: 'Validated', updated: '02 Apr 2025', owner: 'Alex Moyo', size: '28 MB', format: 'GeoJSON', crs: 'WGS 84 (EPSG:4326)', resolution: 'Vector features', extent: 'Great Dyke corridor', theme: 'geology' },
  { id: 'geochemical-grids', name: 'Geochemical Grids', description: 'Ni, Cu, Pd interpolated surfaces', type: 'Raster', category: 'Geochemistry', source: 'GeoTarget Processing', origin: 'Processed', status: 'Map-ready', updated: '01 Apr 2025', owner: 'Alex Moyo', size: '670 MB', format: 'Cloud Optimized GeoTIFF', crs: 'WGS 84 / UTM Zone 35S', resolution: '100 m', extent: 'Project AOI', theme: 'geochemistry' },
  { id: 'historical-workings', name: 'Historical Workings', description: 'Mines, adits and shafts', type: 'Vector', category: 'Mining', source: 'Mining Cadastre', origin: 'API', status: 'Approved', updated: '28 Mar 2025', owner: 'GeoMin', size: '12 MB', format: 'GeoJSON', crs: 'WGS 84 (EPSG:4326)', resolution: 'Point features', extent: 'Zimbabwe national', theme: 'drilling' },
  { id: 'stream-sediments', name: 'Stream Sediments', description: 'Regional geochemistry', type: 'Tabular', category: 'Geochemistry', source: 'Field Sampling', origin: 'Uploaded', status: 'Validated', updated: '25 Mar 2025', owner: 'Sarah Ndlovu', size: '110 MB', format: 'CSV', crs: 'WGS 84 (EPSG:4326)', resolution: '2,105 samples', extent: 'Midlands', theme: 'geochemistry' },
]

export const DEMO_DATA_SOURCES: DataSourceRecord[] = [
  { id: 'zgs-mag', name: 'Airborne Magnetics (RTP)', provider: 'Zimbabwe Geological Survey (ZGS)', providerType: 'WMS / API', status: 'Active', health: 'Healthy', synced: '12 Apr 2025, 14:32', datasets: 8, group: 'API Providers', theme: 'magnetics' },
  { id: 'zgs-soil', name: 'Soil Geochemistry (Ni)', provider: 'Zimbabwe Geological Survey (ZGS)', providerType: 'REST API', status: 'Active', health: 'Healthy', synced: '11 Apr 2025, 09:18', datasets: 12, group: 'API Providers', theme: 'geochemistry' },
  { id: 'landsat', name: 'Landsat Imagery', provider: 'USGS EarthExplorer', providerType: 'REST API', status: 'Active', health: 'Healthy', synced: '12 Apr 2025, 07:46', datasets: 6, group: 'API Providers', theme: 'imagery' },
  { id: 'srtm', name: 'SRTM Elevation Model', provider: 'NASA Earthdata', providerType: 'WMS / API', status: 'Active', health: 'Healthy', synced: '10 Apr 2025, 16:20', datasets: 4, group: 'API Providers', theme: 'topography' },
  { id: 'worldpop', name: 'Population Data', provider: 'WorldPop', providerType: 'REST API', status: 'Active', health: 'Healthy', synced: '08 Apr 2025, 11:05', datasets: 3, group: 'API Providers', theme: 'imagery' },
  { id: 'drill-db', name: 'Company Drill Hole Database', provider: 'GeoTarget Internal', providerType: 'PostgreSQL', status: 'Active', health: 'Healthy', synced: '14 Apr 2025, 08:12', datasets: 5, group: 'Internal Sources', theme: 'drilling' },
  { id: 'reports', name: 'Historical Reports Archive', provider: 'GeoTarget Internal', providerType: 'File Server', status: 'Active', health: 'Healthy', synced: '13 Apr 2025, 17:24', datasets: 9, group: 'Internal Sources', theme: 'geology' },
  { id: 'field-app', name: 'Field Observations', provider: 'GeoTarget Mobile App', providerType: 'Internal API', status: 'Active', health: 'Healthy', synced: '14 Apr 2025, 09:01', datasets: 2, group: 'Internal Sources', theme: 'geochemistry' },
  { id: 'concessions', name: 'Concession Boundaries', provider: 'Shapefile upload', providerType: 'File Upload', status: 'Active', health: 'N/A', synced: '10 Apr 2025, 13:45', datasets: 1, group: 'Manual Sources', theme: 'geology' },
  { id: 'artisanal', name: 'Artisanal Mining Locations', provider: 'Excel upload', providerType: 'File Upload', status: 'Active', health: 'N/A', synced: '09 Apr 2025, 15:20', datasets: 1, group: 'Manual Sources', theme: 'drilling' },
  { id: 'permits', name: 'Environmental Permits', provider: 'PDF Documents', providerType: 'Manual Entry', status: 'Active', health: 'N/A', synced: '08 Apr 2025, 10:11', datasets: 1, group: 'Manual Sources', theme: 'topography' },
]

export const VALIDATION_ISSUES: ValidationIssue[] = [
  { id: 'nodata', title: 'Missing NoData value definition', detail: 'Raster file does not define a NoData value. This may affect analysis results.', severity: 'Critical' },
  { id: 'range', title: 'Unexpected value range', detail: 'Values outside the typical RTP range (-1000 to 1000 nT) were detected.', severity: 'Minor' },
  { id: 'crs', title: 'Coordinate system not explicitly defined in metadata', detail: 'Projection information should be included in the dataset metadata.', severity: 'Minor' },
]

export const API_PROVIDERS = [
  { id: 'planet', name: 'Planet Labs', description: 'High-resolution satellite imagery (3–5 m) with daily global coverage.', label: 'planet.' },
  { id: 'sentinel', name: 'Sentinel Hub', description: 'Access Sentinel-1, 2, 3 and 5P data via cloud API.', label: 'S' },
  { id: 'gee', name: 'Google Earth Engine', description: 'Petabyte-scale geospatial data and analysis.', label: 'GEE' },
  { id: 'usgs', name: 'USGS', description: 'Topographic, geological and imagery data.', label: 'USGS' },
  { id: 'copernicus', name: 'ESA Copernicus', description: 'Sentinel data and Copernicus products via API.', label: 'ESA' },
  { id: 'custom', name: 'Custom API', description: 'Connect to any STAC, WMS, WFS or REST endpoint.', label: '</>' },
]
