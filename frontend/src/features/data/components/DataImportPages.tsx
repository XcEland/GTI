import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, CloudUpload, Code2,
  Copy, Database, FileArchive, FileSpreadsheet, FileUp, Globe2, Layers3,
  Link2, Map, Search, ServerCog, Upload, X,
} from 'lucide-react'
import { useRef, useState } from 'react'
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

  function addFiles(list: FileList | null) {
    if (!list) return
    setFiles((current) => [...current, ...Array.from(list).map((file) => ({ name: file.name, detail: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB · Detected format`, progress: 100 }))])
  }

  return <div className="data-page upload-page">
    <button className="back-link" type="button" onClick={() => onNavigate('add')}><ArrowLeft /> Back to Add Data</button>
    <header className="data-page-header"><div><h1>Upload Dataset</h1><p>Add spatial or tabular data. Configure its metadata, validate it and publish it to the project library.</p></div></header>
    <ol className="upload-stepper">{['Upload Files', 'Set Metadata', 'Validate', 'Complete'].map((label, index) => <li key={label} className={step >= index + 1 ? 'is-active' : ''}><span>{step > index + 1 ? <Check /> : index + 1}</span><div><strong>{label}</strong><small>{index === 0 ? 'Select your data' : index === 1 ? 'Add details and configuration' : index === 2 ? 'Check data and preview' : 'Publish to your library'}</small></div></li>)}</ol>
    <div className="upload-layout">
      <section className="data-panel upload-files-panel"><header><div><h2><CloudUpload /> Upload Files</h2><p>Drag files here or browse. Vector, raster and tabular formats are supported.</p></div><button type="button">View supported formats <ArrowRight /></button></header>
        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}><span><CloudUpload /></span><strong>Drag and drop files here</strong><small>or</small><button type="button" onClick={() => pickerRef.current?.click()}><FileUp /> Browse Files</button><p>Shapefile (.zip), GeoTIFF, KML, GeoJSON, CSV and Excel · Maximum 2 GB per file</p><input ref={pickerRef} type="file" multiple hidden onChange={(event) => addFiles(event.target.files)} /></div>
        <div className="uploaded-files"><header><h3>Uploaded Files ({files.length})</h3><button type="button" onClick={() => setFiles([])}>Clear all</button></header>{files.map((file) => <div key={file.name}><span><FileArchive /></span><div><strong>{file.name}</strong><small>{file.detail}</small></div><i><b style={{ width: `${file.progress}%` }} /></i><em>{file.progress}%</em><strong className="upload-state"><CheckCircle2 /> Uploaded</strong><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.name !== file.name))}><X /></button></div>)}</div>
      </section>
      <section className="data-panel dataset-metadata-form"><h2><FileSpreadsheet /> Dataset Details</h2><p>Describe this dataset so it can be discovered, reviewed and used correctly.</p><label>Dataset Name *<input value={name} onChange={(event) => setName(event.target.value)} /></label><div className="form-row"><label>Category *<select><option>Geology</option><option>Geophysics</option><option>Geochemistry</option><option>Drilling</option></select></label><label>Source *<select><option>Government (ZGS)</option><option>Field Survey</option><option>Commercial Provider</option></select></label></div><label>Coordinate Reference System (CRS) *<select><option>WGS 84 (EPSG:4326)</option><option>WGS 84 / UTM Zone 35S</option><option>WGS 84 / UTM Zone 36S</option></select></label><label>Access Level *<select><option>Project Team (Private)</option><option>Organization</option></select></label><label>Description<textarea defaultValue="Updated geological interpretation for Zimbabwe, including lithology, structures and mineral occurrences." /></label><label>Tags<input defaultValue="geology, lithology, zimbabwe, chrome" /></label></section>
    </div>
    <footer className="data-form-footer"><button type="button" onClick={() => onNavigate('add')}>Cancel</button><button className="primary-data-button" disabled={!files.length || !name.trim()} type="button" onClick={() => setStep((current) => Math.min(4, current + 1))}>{step === 4 ? 'Published to Library' : step === 3 ? 'Publish Dataset' : 'Next'} <ArrowRight /></button></footer>
  </div>
}

export function ApiImportPage({ onNavigate }: ImportPageProps) {
  const [selectedProvider, setSelectedProvider] = useState(API_PROVIDERS[0])
  const [notice, setNotice] = useState<string | null>(null)
  return <div className="data-page api-import-page">
    <div className="data-breadcrumb">Datasets <ArrowRight /> <strong>API Import</strong></div>
    <header className="data-page-header"><div><h1>API Import</h1><p>Connect to trusted geospatial and geological providers and import data into a project.</p></div><button type="button"><BookOpen /> View Documentation</button></header>
    <div className="api-import-grid">
      <section className="data-panel provider-column"><h2>1. Choose a Data Provider</h2><p>Connect to a provider to browse its data.</p><label className="data-search"><Search /><input placeholder="Search providers…" /></label><div className="filter-chips"><button className="is-active" type="button">All</button><button type="button">Satellite</button><button type="button">Geological</button><button type="button">Topographic</button></div><div className="provider-list">{API_PROVIDERS.map((provider) => <button key={provider.id} type="button" className={selectedProvider.id === provider.id ? 'is-active' : ''} onClick={() => setSelectedProvider(provider)}><span>{provider.id === 'custom' ? <Code2 /> : provider.label}</span><div><strong>{provider.name} <em>Official</em></strong><small>{provider.description}</small></div><ArrowRight /></button>)}</div></section>
      <section className="data-panel api-config-column"><header><div><h2>2. Configure Connection & Data Selection</h2><p>Choose datasets and define the area of interest.</p></div><b><CheckCircle2 /> Connected</b></header><div className="provider-connection"><span>{selectedProvider.label}</span><div><strong>{selectedProvider.name}</strong><a href="#provider">provider API endpoint</a></div><button type="button">Disconnect</button></div><div className="connection-success"><CheckCircle2 /> Authenticated successfully <span>API key valid · 1,000 requests/day</span></div><nav className="config-tabs"><button className="is-active" type="button">Data Selection</button><button type="button">Area of Interest</button><button type="button">Filters</button><button type="button">Advanced Options</button></nav><h3>Dataset Type</h3><div className="dataset-type-options"><button className="is-active" type="button"><Layers3 /><strong>Provider imagery</strong><small>Daily project coverage</small><CheckCircle2 /></button><button type="button"><Map /><strong>Basemaps</strong><small>Mosaics and visual layers</small></button><button type="button"><Database /><strong>Catalog data</strong><small>Metadata and features</small></button></div><h3>Area of Interest (AOI)</h3><div className="aoi-tabs"><button className="is-active" type="button">Use Project Area</button><button type="button">Upload File</button><button type="button">Coordinates</button></div><div className="api-map"><DatasetMapPreview theme="imagery" /></div></section>
      <aside className="data-panel import-summary"><h2>3. Import Summary & Options</h2><p>Review the selection and configure the import.</p><article><h3>Selected Provider</h3><div className="summary-provider"><span>{selectedProvider.label}</span><strong>{selectedProvider.name}</strong></div></article><article><h3>Selection Summary</h3><dl><div><dt>Dataset Type</dt><dd>Project imagery</dd></div><div><dt>Date Range</dt><dd>1 Jan 2024 – 31 Dec 2024</dd></div><div><dt>Area of Interest</dt><dd>1 project polygon</dd></div><div><dt>Estimated Size</dt><dd>~ 48.2 GB</dd></div></dl></article><article><h3>Import Options</h3><label><input type="radio" defaultChecked name="sync" /> One-time import</label><label><input type="radio" name="sync" /> Scheduled sync</label><label><input type="checkbox" defaultChecked /> Clip to project area</label><label><input type="checkbox" defaultChecked /> Apply cloud mask</label><label>Save to<select><option>Great Dyke Chrome Project</option></select></label><label>Dataset name<input defaultValue={`${selectedProvider.name.replaceAll(' ', '_')}_Great_Dyke_2025`} /></label></article><button className="primary-data-button full" type="button" onClick={() => setNotice('Import job created and queued for validation.')}><Upload /> Import Data</button><button type="button" className="cancel-link" onClick={() => onNavigate('add')}>Cancel</button></aside>
    </div>
    {notice && <div className="data-toast"><CheckCircle2 /> {notice}<button type="button" onClick={() => setNotice(null)}>×</button></div>}
  </div>
}
