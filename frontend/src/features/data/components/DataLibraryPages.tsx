import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Cloud, Database, Download,
  ExternalLink, FileText, Filter, Layers3, Map, MapPin, MoreHorizontal, Search,
  Share2, ShieldCheck, TableProperties,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DEMO_DATASETS } from '../data/demoData'
import type { ExplorationDataset } from '../types/dataTypes'
import { filterDatasets } from '../utils/dataFilters'
import { DatasetMapPreview } from './DatasetMapPreview'

interface DataLibraryPageProps {
  selectedId: string
  searchRequest: { id: number; query: string } | null
  onSelect: (id: string) => void
  onAddData: () => void
  onOpenDetails: (id: string) => void
  onOpenMap: () => void
}

const statusClass = (value: string) => value.toLowerCase().replaceAll(' ', '-')

export function DatasetSwatch({ dataset, compact = false }: { dataset: ExplorationDataset; compact?: boolean }) {
  return <span className={`dataset-swatch theme-${dataset.theme} ${compact ? 'is-compact' : ''}`}><Layers3 size={compact ? 15 : 18} /></span>
}

export function DataLibraryPage({ selectedId, searchRequest, onSelect, onAddData, onOpenDetails, onOpenMap }: DataLibraryPageProps) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const selected = DEMO_DATASETS.find((dataset) => dataset.id === selectedId) ?? DEMO_DATASETS[0]

  useEffect(() => {
    if (searchRequest) setQuery(searchRequest.query)
  }, [searchRequest])

  const visible = useMemo(() => filterDatasets(DEMO_DATASETS, query, type, status), [query, status, type])

  return (
    <div className="data-page data-library-page">
      <header className="data-page-header data-library-header">
        <div><div className="data-breadcrumb">Projects <ArrowRight /> Great Dyke Chrome Project <ArrowRight /> <strong>Data Library</strong></div><h1>Data Library</h1><p>Manage, explore and review project-authorized geological datasets.</p></div>
        <div className="current-project-card"><DatasetMapPreview compact interactive={false} theme="geology" /><div><small>Current project</small><strong>Great Dyke Chrome Project</strong><span><MapPin size={14} /> Zimbabwe <i /> Active</span></div><ArrowRight /></div>
      </header>

      <section className="data-stat-grid" aria-label="Dataset summary">
        <article><span className="stat-icon stat-green"><Database /></span><div><small>Total Datasets</small><strong>128 <em>↑ 12</em></strong><p>across all sources</p></div></article>
        <article><span className="stat-icon stat-blue"><Layers3 /></span><div><small>Spatial Datasets</small><strong>86 <em>↑ 8</em></strong><p>with geometry</p></div></article>
        <article><span className="stat-icon stat-slate"><TableProperties /></span><div><small>Tabular Datasets</small><strong>42 <em>↑ 4</em></strong><p>assays, geochemistry, samples</p></div></article>
        <article><span className="stat-icon stat-cyan"><Cloud /></span><div><small>Data Size</small><strong>12.4 GB <em>↑ 18%</em></strong><p>in project storage</p></div></article>
      </section>

      <div className="data-library-layout">
        <section className="data-panel dataset-table-panel">
          <div className="data-toolbar">
            <label className="data-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search datasets by name, type, source, or keywords…" /></label>
            <label><Filter className="sr-only" /><select value={type} onChange={(event) => setType(event.target.value)}><option>All</option><option>Raster</option><option>Vector</option><option>Tabular</option></select><ChevronDown /></label>
            <label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Map-ready</option><option>Approved</option><option>Validated</option><option>Processing</option><option>Pending</option></select><ChevronDown /></label>
            <button className="primary-data-button" type="button" onClick={onAddData}>+ Add Data</button>
          </div>
          <div className="dataset-table" role="table" aria-label="Project datasets">
            <div className="dataset-table-head" role="row"><span /><span>Name</span><span>Type</span><span>Source / Origin</span><span>Status</span><span>Updated</span><span>Size</span><span /></div>
            {visible.map((dataset) => <button key={dataset.id} type="button" role="row" className={selectedId === dataset.id ? 'is-selected' : ''} onClick={() => onSelect(dataset.id)} onDoubleClick={() => onOpenDetails(dataset.id)}>
              <span><input type="checkbox" checked={selectedId === dataset.id} onChange={() => onSelect(dataset.id)} onClick={(event) => event.stopPropagation()} aria-label={`Select ${dataset.name}`} /></span>
              <span className="dataset-name-cell"><DatasetSwatch dataset={dataset} /><span><strong>{dataset.name}</strong><small>{dataset.description}</small></span></span>
              <span>{dataset.type}</span><span><i className={`origin-${statusClass(dataset.origin)}`} /> {dataset.origin}</span><span><b className={`status-pill status-${statusClass(dataset.status)}`}><i /> {dataset.status}</b></span><span>{dataset.updated}<small>{dataset.owner}</small></span><span>{dataset.size}</span><span onClick={(event) => event.stopPropagation()}><MoreHorizontal size={17} /></span>
            </button>)}
            {!visible.length && <div className="data-empty-state"><Search /><strong>No datasets match these filters</strong><button type="button" onClick={() => { setQuery(''); setType('All'); setStatus('All') }}>Clear filters</button></div>}
          </div>
          <footer className="dataset-pagination"><span>1–{visible.length} of 128 datasets</span><div><button type="button" disabled>‹</button><button type="button" className="is-active">1</button><button type="button">2</button><button type="button">3</button><button type="button">…</button><button type="button">13</button><button type="button">›</button></div><label>Show <select><option>10</option><option>25</option></select></label></footer>
        </section>

        <aside className="data-library-detail">
          <article className="data-panel selected-dataset-card">
            <header><DatasetSwatch dataset={selected} /><div><strong>{selected.name}</strong><small>{selected.description}</small></div><button type="button" aria-label="Close dataset details"><span>×</span></button></header>
            <nav><button className="is-active" type="button">Overview</button><button type="button">Metadata</button><button type="button">Preview</button><button type="button">Lineage</button></nav>
            <DatasetMapPreview theme={selected.theme} compact />
          </article>
          <article className="data-panel dataset-information"><h2>Dataset Information</h2><dl><div><dt><TableProperties /> Type</dt><dd>{selected.type} ({selected.format})</dd></div><div><dt><Database /> Source / Origin</dt><dd>{selected.origin} · {selected.source}</dd></div><div><dt><CheckCircle2 /> Status</dt><dd><b className={`status-pill status-${statusClass(selected.status)}`}><i /> {selected.status}</b></dd></div><div><dt><FileText /> Date Added</dt><dd>{selected.updated}, 14:32</dd></div><div><dt><MapPin /> Spatial Reference</dt><dd>{selected.crs}</dd></div><div><dt><Layers3 /> Resolution</dt><dd>{selected.resolution}</dd></div><div><dt><Map /> Extent</dt><dd>{selected.extent}</dd></div></dl>
            <button className="primary-data-button full" type="button" onClick={onOpenMap}><Map size={17} /> Open in Map <ExternalLink size={15} /></button>
            <div className="dataset-actions"><button type="button"><Download /> Download</button><button type="button"><Share2 /> Share</button><button type="button" onClick={() => onOpenDetails(selected.id)}>Details</button></div>
          </article>
        </aside>
      </div>
    </div>
  )
}

interface DatasetDetailsPageProps { dataset: ExplorationDataset; onBack: () => void; onOpenMap: () => void }

export function DatasetDetailsPage({ dataset, onBack, onOpenMap }: DatasetDetailsPageProps) {
  const [tab, setTab] = useState('Overview')
  return <div className="data-page dataset-details-page">
    <div className="data-breadcrumb">Datasets <ArrowRight /> Data Library <ArrowRight /> <strong>{dataset.name}</strong></div>
    <header className="dataset-hero">
      <DatasetSwatch dataset={dataset} />
      <div><small>{dataset.category}</small><h1>{dataset.name}</h1><p>{dataset.description}. Reviewed for use in the Great Dyke Chrome Project.</p><div className="dataset-tags"><b><CheckCircle2 /> {dataset.status}</b><span>{dataset.category}</span><span>{dataset.type}</span><span>Zimbabwe</span></div></div>
      <div className="dataset-hero-actions"><button type="button"><Download /> Download</button><button className="primary-data-button" type="button">Add to Project</button><button type="button"><MoreHorizontal /></button></div>
      <dl><div><dt>Provider</dt><dd>{dataset.source}</dd></div><div><dt>Date Published</dt><dd>{dataset.updated}</dd></div><div><dt>Version</dt><dd>v2.1</dd></div><div><dt>License</dt><dd>Open Government Data</dd></div></dl>
    </header>
    <nav className="dataset-tabs">{['Overview', 'Map Preview', 'Schema', 'Versions', 'Related Data', 'Activity'].map((item) => <button key={item} type="button" className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</nav>
    <div className="dataset-details-grid">
      <section className="data-panel large-spatial-preview"><header><h2><Map /> Spatial Preview</h2><button type="button" onClick={onOpenMap}>Open in Map <ExternalLink /></button></header><DatasetMapPreview theme={dataset.theme} /></section>
      <aside className="dataset-side-cards"><article className="data-panel"><h2><Map /> Dataset Information</h2><dl className="details-list"><div><dt>Dataset ID</dt><dd>GTI-{dataset.id.toUpperCase()}</dd></div><div><dt>Category</dt><dd>{dataset.category}</dd></div><div><dt>Geometry Type</dt><dd>{dataset.type}</dd></div><div><dt>Coordinate Reference System</dt><dd>{dataset.crs}</dd></div><div><dt>Spatial Extent</dt><dd>{dataset.extent}</dd></div><div><dt>Resolution</dt><dd>{dataset.resolution}</dd></div><div><dt>File Size</dt><dd>{dataset.size}</dd></div><div><dt>Provider</dt><dd>{dataset.source}</dd></div></dl></article><article className="data-panel"><h2><ShieldCheck /> Data Quality</h2><dl className="details-list"><div><dt>Validation Status</dt><dd><b className="status-pill status-approved">Approved</b></dd></div><div><dt>Attribute Completeness</dt><dd>98%</dd></div><div><dt>Topology Validity</dt><dd>100%</dd></div><div><dt>Last Validated</dt><dd>08 Apr 2025</dd></div></dl></article></aside>
      <section className="data-panel dataset-description"><h2>Description</h2><p>This dataset provides a reviewed representation of Zimbabwe’s geological and geophysical context for exploration planning. It supports regional interpretation, target screening and evidence review.</p><h3>Key features</h3><ul><li><CheckCircle2 /> Consistent project coverage</li><li><CheckCircle2 /> Standardized symbology and classification</li><li><CheckCircle2 /> Compatible with map and screening workflows</li></ul><button type="button" onClick={onBack}><ArrowLeft /> Back to Data Library</button></section>
      <section className="data-panel quick-stats"><h2>Quick Stats</h2><div><span><Layers3 /><strong>1,243</strong><small>Features</small></span><span><Map /><strong>390,757 km²</strong><small>Area covered</small></span></div></section>
    </div>
  </div>
}
