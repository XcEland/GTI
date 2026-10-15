import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, CloudUpload, Code2,
  Copy, Database, FileArchive, FileSpreadsheet, FileUp, Globe2, Layers3,
  Link2, Map, Search, ServerCog, Upload, X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { API_PROVIDERS } from '../data/demoData'
import type { DataView } from '../types/dataTypes'
import { DatasetMapPreview } from './DatasetMapPreview'

interface ImportPageProps { onNavigate: (view: DataView) => void }

export function AddDataPage({ onNavigate }: ImportPageProps) {
  return <div className="data-page add-data-page">
    <div className="data-breadcrumb">Datasets <ArrowRight /> <strong>Add Data</strong></div>
    <header className="data-page-header"><div><small className="eyebrow">Add data</small><h1>Bring your data into GeoTarget Intelligence</h1><p>Add datasets to the exploration workflow using the method that best fits the source.</p></div></header>
    <section className="add-method-grid">
      <article className="data-panel"><div className="add-method-art upload-art"><FileArchive /><FileSpreadsheet /><FileUp /><CloudUpload /></div><h2>Upload Files</h2><p>Upload geospatial and tabular data from your computer to create a new dataset.</p><ul><li><Check /> Shapefiles, GeoTIFF, CSV and more</li><li><Check /> Automatic format detection</li><li><Check /> Coordinate system handling</li><li><Check /> Preview and validate before import</li></ul><button className="primary-data-button" type="button" onClick={() => onNavigate('upload')}><Upload /> Upload Files</button></article>
      <article className="data-panel"><div className="add-method-art api-art"><span>API</span><Database /><ServerCog /><Globe2 /></div><h2>Import from API</h2><p>Connect to external data sources and import data directly through an API.</p><ul><li><Check /> Public and private provider APIs</li><li><Check /> WMS, WFS, REST and STAC support</li><li><Check /> Scheduled recurring imports</li><li><Check /> Automatic dataset updates</li></ul><button type="button" onClick={() => onNavigate('api')}><Link2 /> Import from API</button></article>
      <article className="data-panel"><div className="add-method-art reuse-art"><Layers3 /><Copy /></div><h2>Reuse Existing Dataset</h2><p>Create a project dataset from data that has already passed validation.</p><ul><li><Check /> Copy and modify existing datasets</li><li><Check /> Filter or clip to a new area</li><li><Check /> Combine multiple datasets</li><li><Check /> Maintain data lineage</li></ul><button type="button" onClick={() => onNavigate('library')}><Copy /> Browse Datasets</button></article>
    </section>
  </div>
}

export function UploadDatasetPage({ onNavigate }: ImportPageProps) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState([
    { name: 'geology_zimbabwe.zip', detail: '245 MB · Shapefile', progress: 100 },
  ])
  const [step, setStep] = useState(1)
  const [name, setName] = useState('Great Dyke Geology 2025')
  const [notice, setNotice] = useState<string | null>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    setFiles((current) => [...current, ...Array.from(list).map((file) => ({ name: file.name, detail: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB · Detected format`, progress: 100 }))])
  }

  return <div className="data-page upload-page">
    <button className="back-link" type="button" onClick={() => onNavigate('add')}><ArrowLeft /> Back to Add Data</button>
    <header className="data-page-header"><div><h1>Upload Dataset</h1><p>Add spatial or tabular data. Configure its metadata, validate it and publish it to the project library.</p></div></header>
    <ol className="upload-stepper">{['Upload Files', 'Set Metadata', 'Validate', 'Complete'].map((label, index) => <li key={label} className={step >= index + 1 ? 'is-active' : ''}><span>{step > index + 1 ? <Check /> : index + 1}</span><div><strong>{label}</strong><small>{index === 0 ? 'Select your data' : index === 1 ? 'Add details and configuration' : index === 2 ? 'Check data and preview' : 'Publish to your library'}</small></div></li>)}</ol>
    <div className="upload-layout">
      <section className="data-panel upload-files-panel"><header><div><h2><CloudUpload /> Upload Files</h2><p>Drag files here or browse. Vector, raster and tabular formats are supported.</p></div><button type="button" onClick={() => setNotice('Supported: zipped Shapefile, GeoTIFF, KML, GeoJSON, CSV and Excel. Maximum 2 GB per file.')} >View supported formats <ArrowRight /></button></header>
        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}><span><CloudUpload /></span><strong>Drag and drop files here</strong><small>or</small><button type="button" onClick={() => pickerRef.current?.click()}><FileUp /> Browse Files</button><p>Shapefile (.zip), GeoTIFF, KML, GeoJSON, CSV and Excel · Maximum 2 GB per file</p><input ref={pickerRef} type="file" multiple hidden onChange={(event) => addFiles(event.target.files)} /></div>
        <div className="uploaded-files"><header><h3>Uploaded Files ({files.length})</h3><button type="button" onClick={() => setFiles([])}>Clear all</button></header>{files.map((file) => <div key={file.name}><span><FileArchive /></span><div><strong>{file.name}</strong><small>{file.detail}</small></div><i><b style={{ width: `${file.progress}%` }} /></i><em>{file.progress}%</em><strong className="upload-state"><CheckCircle2 /> Uploaded</strong><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.name !== file.name))}><X /></button></div>)}</div>
      </section>
      <section className="data-panel dataset-metadata-form"><h2><FileSpreadsheet /> Dataset Details</h2><p>Describe this dataset so it can be discovered, reviewed and used correctly.</p><label>Dataset Name *<input value={name} onChange={(event) => setName(event.target.value)} /></label><div className="form-row"><label>Category *<select><option>Geology</option><option>Geophysics</option><option>Geochemistry</option><option>Drilling</option></select></label><label>Source *<select><option>Government (ZGS)</option><option>Field Survey</option><option>Commercial Provider</option></select></label></div><label>Coordinate Reference System (CRS) *<select><option>WGS 84 (EPSG:4326)</option><option>WGS 84 / UTM Zone 35S</option><option>WGS 84 / UTM Zone 36S</option></select></label><label>Access Level *<select><option>Project Team (Private)</option><option>Organization</option></select></label><label>Description<textarea defaultValue="Updated geological interpretation for Zimbabwe, including lithology, structures and mineral occurrences." /></label><label>Tags<input defaultValue="geology, lithology, zimbabwe, chrome" /></label></section>
    </div>
    <footer className="data-form-footer"><button type="button" onClick={() => onNavigate('add')}>Cancel</button><button className="primary-data-button" disabled={!files.length || !name.trim()} type="button" onClick={() => setStep((current) => Math.min(4, current + 1))}>{step === 4 ? 'Published to Library' : step === 3 ? 'Publish Dataset' : 'Next'} <ArrowRight /></button></footer>
    {notice && <div className="data-toast"><CheckCircle2 /> {notice}<button type="button" onClick={() => setNotice(null)}>×</button></div>}
  </div>
}

export function ApiImportPage({ onNavigate }: ImportPageProps) {
  const [selectedProvider, setSelectedProvider] = useState(API_PROVIDERS[0])
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState('All')
  const [connected, setConnected] = useState(true)
  const [configTab, setConfigTab] = useState('Data Selection')
  const [datasetType, setDatasetType] = useState('Provider imagery')
  const [aoiMode, setAoiMode] = useState('Use Project Area')
  const filteredProviders = useMemo(() => API_PROVIDERS.filter((provider) => {
    const matchesQuery = `${provider.name} ${provider.description}`.toLowerCase().includes(query.toLowerCase())
    const categories: Record<string, string[]> = {
      Satellite: ['planet', 'sentinel', 'gee', 'copernicus'],
      Geological: ['gee', 'usgs', 'custom'],
      Topographic: ['usgs', 'gee', 'custom'],
    }
    return matchesQuery && (providerFilter === 'All' || categories[providerFilter]?.includes(provider.id))
  }), [providerFilter, query])
  return <div className="data-page api-import-page">
    <div className="data-breadcrumb">Datasets <ArrowRight /> <strong>API Import</strong></div>
    <header className="data-page-header"><div><h1>API Import</h1><p>Connect to trusted geospatial and geological providers and import data into a project.</p></div><button type="button" onClick={() => setNotice('API imports support authenticated STAC, WMS, WFS and REST endpoints. Credentials are never stored in the browser demo.')}><BookOpen /> View Documentation</button></header>
    <div className="api-import-grid">
      <section className="data-panel provider-column"><h2>1. Choose a Data Provider</h2><p>Connect to a provider to browse its data.</p><label className="data-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search providers…" /></label><div className="filter-chips">{['All', 'Satellite', 'Geological', 'Topographic'].map((filter) => <button className={providerFilter === filter ? 'is-active' : ''} type="button" key={filter} onClick={() => setProviderFilter(filter)}>{filter}</button>)}</div><div className="provider-list">{filteredProviders.map((provider) => <button key={provider.id} type="button" className={selectedProvider.id === provider.id ? 'is-active' : ''} onClick={() => { setSelectedProvider(provider); setConnected(true) }}><span>{provider.id === 'custom' ? <Code2 /> : provider.label}</span><div><strong>{provider.name} <em>{provider.id === 'custom' ? 'Custom' : 'Official'}</em></strong><small>{provider.description}</small></div><ArrowRight /></button>)}</div></section>
      <section className="data-panel api-config-column"><header><div><h2>2. Configure Connection & Data Selection</h2><p>Choose datasets and define the area of interest.</p></div><b className={connected ? '' : 'is-disconnected'}>{connected ? <CheckCircle2 /> : <X />} {connected ? 'Connected' : 'Disconnected'}</b></header><div className="provider-connection"><span>{selectedProvider.label}</span><div><strong>{selectedProvider.name}</strong><a href="#provider" onClick={(event) => { event.preventDefault(); setNotice(`${selectedProvider.name} endpoint configuration opened.`) }}>provider API endpoint</a></div><button type="button" onClick={() => setConnected((current) => !current)}>{connected ? 'Disconnect' : 'Connect'}</button></div>{connected && <div className="connection-success"><CheckCircle2 /> Authenticated successfully <span>API key valid · 1,000 requests/day</span></div>}<nav className="config-tabs">{['Data Selection', 'Area of Interest', 'Filters', 'Advanced Options'].map((tab) => <button className={configTab === tab ? 'is-active' : ''} type="button" key={tab} onClick={() => setConfigTab(tab)}>{tab}</button>)}</nav><h3>Dataset Type</h3><div className="dataset-type-options">{[['Provider imagery', Layers3, 'Daily project coverage'], ['Basemaps', Map, 'Mosaics and visual layers'], ['Catalog data', Database, 'Metadata and features']].map(([label, Icon, detail]) => <button className={datasetType === label ? 'is-active' : ''} type="button" key={label as string} onClick={() => setDatasetType(label as string)}>{typeof Icon !== 'string' && <Icon />}<strong>{label as string}</strong><small>{detail as string}</small>{datasetType === label && <CheckCircle2 />}</button>)}</div><h3>Area of Interest (AOI)</h3><div className="aoi-tabs">{['Use Project Area', 'Upload File', 'Coordinates'].map((mode) => <button className={aoiMode === mode ? 'is-active' : ''} type="button" key={mode} onClick={() => setAoiMode(mode)}>{mode}</button>)}</div><div className="api-map"><DatasetMapPreview theme="imagery" /></div></section>
      <aside className="data-panel import-summary"><h2>3. Import Summary & Options</h2><p>Review the selection and configure the import.</p><article><h3>Selected Provider</h3><div className="summary-provider"><span>{selectedProvider.label}</span><strong>{selectedProvider.name}</strong></div></article><article><h3>Selection Summary</h3><dl><div><dt>Dataset Type</dt><dd>{datasetType}</dd></div><div><dt>Date Range</dt><dd>1 Jan 2024 – 31 Dec 2024</dd></div><div><dt>Area of Interest</dt><dd>{aoiMode}</dd></div><div><dt>Estimated Size</dt><dd>~ 48.2 GB</dd></div></dl></article><article><h3>Import Options</h3><label><input type="radio" defaultChecked name="sync" /> One-time import</label><label><input type="radio" name="sync" /> Scheduled sync</label><label><input type="checkbox" defaultChecked /> Clip to project area</label><label><input type="checkbox" defaultChecked /> Apply cloud mask</label><label>Save to<select><option>Great Dyke Chrome Project</option></select></label><label>Dataset name<input defaultValue={`${selectedProvider.name.replaceAll(' ', '_')}_Great_Dyke_2025`} /></label></article><button className="primary-data-button full" type="button" disabled={!connected} onClick={() => setNotice('Import job created and queued for validation.')}><Upload /> Import Data</button><button type="button" className="cancel-link" onClick={() => onNavigate('add')}>Cancel</button></aside>
    </div>
    {notice && <div className="data-toast"><CheckCircle2 /> {notice}<button type="button" onClick={() => setNotice(null)}>×</button></div>}
  </div>
}
