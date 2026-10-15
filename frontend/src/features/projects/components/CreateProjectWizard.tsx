import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, FileJson, FileText, Layers3,
  MapPin, Mountain, Pencil, Ruler, Shapes, Upload, Waypoints,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { GeoJSON, Polygon } from 'geojson'
import { createProject, apiProjectToExplorationProject } from '../services/projectsApi'
import type { ExplorationProject, ProjectFormValues } from '../types/projectTypes'
import { extractPolygon, getPolygonMetrics } from '../utils/projectGeometry'
import { ProjectBoundaryMap, type ProjectBoundaryMapHandle } from './ProjectBoundaryMap'
import '../create-project.css'

interface CreateProjectWizardProps {
  onCancel: () => void
  onCreated: (project: ExplorationProject) => void
  onViewProject: (project: ExplorationProject) => void
  onOpenMap: (project: ExplorationProject) => void
}

type WizardStep = 1 | 2 | 3 | 4
type FormErrors = Partial<Record<keyof ProjectFormValues | 'boundary', string>>

const COMMODITIES = ['Chrome', 'Nickel', 'PGM', 'Gold', 'Copper', 'Lithium', 'Cobalt', 'Rare Earths', 'Other']
const COUNTRIES = ['Zimbabwe', 'South Africa', 'Botswana', 'Mozambique', 'Zambia', 'Namibia', 'Malawi', 'Tanzania']
const PROJECT_TYPES = ['Exploration', 'Geological Mapping', 'Regional Survey', 'Prospect Evaluation']

const initialValues: ProjectFormValues = {
  name: '', commodity: 'Chrome', country: 'Zimbabwe', projectType: 'Exploration', description: '',
}

function formatMetric(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

export function CreateProjectWizard({
  onCancel, onCreated, onViewProject, onOpenMap,
}: CreateProjectWizardProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [values, setValues] = useState<ProjectFormValues>(initialValues)
  const [boundary, setBoundary] = useState<Polygon | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdProject, setCreatedProject] = useState<ExplorationProject | null>(null)
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle'>('polygon')
  const [areaTab, setAreaTab] = useState<'draw' | 'upload'>('draw')
  const mapRef = useRef<ProjectBoundaryMapHandle>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const metrics = useMemo(() => boundary ? getPolygonMetrics(boundary) : null, [boundary])

  function updateField<Key extends keyof ProjectFormValues>(key: Key, value: ProjectFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function validateDetails() {
    const nextErrors: FormErrors = {}
    if (values.name.trim().length < 3) nextErrors.name = 'Enter a project name with at least 3 characters.'
    if (!values.commodity) nextErrors.commodity = 'Select the main commodity.'
    if (!values.country) nextErrors.country = 'Select a country.'
    if (!values.projectType) nextErrors.projectType = 'Select a project type.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function submitDetails(event: FormEvent) {
    event.preventDefault()
    if (validateDetails()) setStep(2)
  }

  async function importGeoJSON(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const json = JSON.parse(await file.text()) as GeoJSON
      const polygon = extractPolygon(json)
      setBoundary(polygon)
      setErrors((current) => ({ ...current, boundary: undefined }))
      setAreaTab('draw')
      mapRef.current?.replaceBoundary(polygon)
    } catch (error) {
      setErrors((current) => ({
        ...current,
        boundary: error instanceof Error ? error.message : 'The selected file is not valid GeoJSON.',
      }))
    }
  }

  function continueFromArea() {
    if (!boundary) {
      setErrors((current) => ({ ...current, boundary: 'Draw or import a project boundary before continuing.' }))
      return
    }
    setErrors((current) => ({ ...current, boundary: undefined }))
    setStep(3)
  }

  async function submitProject() {
    if (!boundary || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await createProject({
        name: values.name.trim(),
        commodity: values.commodity,
        country: values.country,
        project_type: values.projectType,
        description: values.description.trim(),
        area_of_interest: boundary,
      })
      const project = apiProjectToExplorationProject(response)
      setCreatedProject(project)
      onCreated(project)
      setStep(4)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'The project could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-project-page">
      <header className="create-project-heading">
        <button type="button" className="create-mobile-back" onClick={onCancel}><ArrowLeft size={18} /> Projects</button>
        <h1>Create Project</h1>
      </header>

      <ol className="create-stepper" aria-label="Project creation progress">
        {[1, 2, 3].map((number) => {
          const complete = step > number
          const active = step === number || (step === 4 && number === 3)
          const labels = ['Project Details', 'Area of Interest', 'Review & Create']
          return (
            <li className={`${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}`} key={number}>
              <span>{complete ? <Check size={17} /> : number}</span>
              <strong>{labels[number - 1]}</strong>
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <form className="create-project-card details-step" onSubmit={submitDetails} noValidate>
          <div className="create-card-title"><h2>Project Details</h2><p>Provide the key details for your exploration project.</p></div>
          <div className="create-form-grid">
            <label><strong>Project Name <em>*</em></strong><input autoFocus value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Great Dyke Chrome Pilot" aria-invalid={Boolean(errors.name)} />{errors.name && <small>{errors.name}</small>}</label>
            <label><strong>Commodity <em>*</em></strong><select value={values.commodity} onChange={(event) => updateField('commodity', event.target.value)}>{COMMODITIES.map((item) => <option key={item}>{item}</option>)}</select>{errors.commodity && <small>{errors.commodity}</small>}</label>
            <label><strong>Country <em>*</em></strong><select value={values.country} onChange={(event) => updateField('country', event.target.value)}>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select>{errors.country && <small>{errors.country}</small>}</label>
            <label><strong>Project Type <em>*</em></strong><select value={values.projectType} onChange={(event) => updateField('projectType', event.target.value)}>{PROJECT_TYPES.map((item) => <option key={item}>{item}</option>)}</select>{errors.projectType && <small>{errors.projectType}</small>}</label>
            <label className="create-description-field"><strong>Description</strong><textarea value={values.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Enter a brief description of the project (optional)" rows={5} /></label>
          </div>
          <footer className="create-card-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Next <ArrowRight size={18} /></button></footer>
        </form>
      )}

      {step === 2 && (
        <section className="create-project-card area-step">
          <div className="create-card-title"><h2>Define Area of Interest</h2><p>Draw a boundary on the map or upload GeoJSON to define your project area.</p></div>
          <div className="area-workspace">
            <aside className="area-tools">
              <div className="area-tool-tabs"><button className={areaTab === 'draw' ? 'is-active' : ''} type="button" onClick={() => setAreaTab('draw')}>Draw on Map</button><button className={areaTab === 'upload' ? 'is-active' : ''} type="button" onClick={() => setAreaTab('upload')}>Upload Boundary</button></div>
              {areaTab === 'draw' ? <>
                <h3>Drawing Tools</h3><p>Select a drawing mode and create one boundary on the map.</p>
                <button className={`draw-tool ${drawMode === 'polygon' ? 'is-active' : ''}`} type="button" onClick={() => { setDrawMode('polygon'); mapRef.current?.startDrawing('polygon') }}><Waypoints size={20} /> Polygon</button>
                <button className={`draw-tool ${drawMode === 'rectangle' ? 'is-active' : ''}`} type="button" onClick={() => { setDrawMode('rectangle'); mapRef.current?.startDrawing('rectangle') }}><Shapes size={20} /> Rectangle</button>
                <button className="draw-tool" type="button" onClick={() => fileRef.current?.click()}><Upload size={20} /> Import GeoJSON</button>
                <div className="area-help"><span>i</span><p>Click to add points. Click the first point to complete a polygon. Select it afterwards to edit.</p></div>
              </> : <div className="boundary-upload-box" onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && fileRef.current?.click()}><FileJson size={32} /><strong>Choose GeoJSON file</strong><span>Polygon or FeatureCollection · WGS 84</span><button type="button">Browse files</button></div>}
              <input ref={fileRef} className="sr-only" type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={importGeoJSON} />
              {errors.boundary && <p className="create-error-message">{errors.boundary}</p>}
            </aside>
            <div className="area-map-column">
              <ProjectBoundaryMap ref={mapRef} boundary={boundary} onBoundaryChange={(polygon) => { setBoundary(polygon); setErrors((current) => ({ ...current, boundary: undefined })) }} />
              <div className="area-metrics">
                <div><Shapes size={22} /><span>Area<strong>{metrics ? `${formatMetric(metrics.areaKm2)} km²` : '—'}</strong></span></div>
                <div><Ruler size={22} /><span>Perimeter<strong>{metrics ? `${formatMetric(metrics.perimeterKm)} km` : '—'}</strong></span></div>
                <div><Waypoints size={22} /><span>Vertices<strong>{metrics?.vertexCount ?? '—'}</strong></span></div>
              </div>
            </div>
          </div>
          <footer className="create-card-actions"><button type="button" className="secondary" onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button><button type="button" className="primary" onClick={continueFromArea}>Next <ArrowRight size={18} /></button></footer>
        </section>
      )}

      {step === 3 && boundary && (
        <section className="create-project-card review-step">
          <div className="review-grid">
            <article><div className="review-title"><h2>Project Details</h2><button type="button" onClick={() => setStep(1)}><Pencil size={17} /> Edit</button></div><dl><div><dt>Project Name</dt><dd>{values.name}</dd></div><div><dt>Commodity</dt><dd>{values.commodity}</dd></div><div><dt>Country</dt><dd>{values.country}</dd></div><div><dt>Project Type</dt><dd>{values.projectType}</dd></div><div><dt>Description</dt><dd>{values.description || 'No description supplied.'}</dd></div></dl></article>
            <article className="review-area"><div className="review-title"><h2>Area of Interest</h2><button type="button" onClick={() => setStep(2)}><Pencil size={17} /> Edit</button></div><ProjectBoundaryMap boundary={boundary} editable={false} /><div className="review-metrics"><span>Area<strong>{formatMetric(metrics?.areaKm2 ?? 0)} km²</strong></span><span>Perimeter<strong>{formatMetric(metrics?.perimeterKm ?? 0)} km</strong></span><span>Vertices<strong>{metrics?.vertexCount}</strong></span></div></article>
          </div>
          {submitError && <p className="submit-error" role="alert">{submitError}</p>}
          <footer className="create-card-actions"><button type="button" className="secondary" onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</button><button type="button" className="primary" disabled={submitting} onClick={submitProject}>{submitting ? <><span className="button-spinner" /> Creating…</> : <>Create Project <ArrowRight size={18} /></>}</button></footer>
        </section>
      )}

      {step === 4 && createdProject && (
        <section className="create-project-card success-step">
          <div className="success-icon"><CheckCircle2 size={58} /></div><h2>Project Created Successfully</h2><p>Your project has been saved and is ready for exploration analysis.</p>
          <div className="success-summary"><div><FileText size={27} /><span>Project Name<strong>{createdProject.name}</strong></span></div><div><MapPin size={27} /><span>Country<strong>{createdProject.country}</strong></span></div><div><Mountain size={27} /><span>Commodity<strong>{values.commodity}</strong></span></div><div><Layers3 size={27} /><span>Project Type<strong>{createdProject.projectType}</strong></span></div></div>
          <footer className="create-card-actions"><button type="button" className="secondary" onClick={() => onViewProject(createdProject)}>View Project Details</button><button type="button" className="primary" onClick={() => onOpenMap(createdProject)}>Open Map Workspace <ArrowRight size={18} /></button></footer>
        </section>
      )}
    </div>
  )
}
