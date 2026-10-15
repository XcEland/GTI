import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Database,
  FileSearch, Layers3, Map, Search, ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DEMO_TARGETS } from './data/demoTargets'
import { TargetMap } from './components/TargetMap'
import type { ExplorationTarget, TargetView } from './types/targetTypes'
import { filterTargets } from './utils/targetFilters'
import './targets.css'

interface TargetWorkspaceProps {
  view: TargetView
  selectedTargetId?: string
  searchRequest: { id: number; query: string } | null
  onViewChange: (view: TargetView, targetId?: string) => void
  onOpenMap: () => void
}

const priorityClass = (priority: string) => priority.toLowerCase()

export function TargetWorkspace({ view, selectedTargetId, searchRequest, onViewChange, onOpenMap }: TargetWorkspaceProps) {
  const selected = DEMO_TARGETS.find((target) => target.id === selectedTargetId) ?? DEMO_TARGETS[0]
  if (view === 'detail') return <TargetDetailPage target={selected} onBack={() => onViewChange('library')} onReview={() => onViewChange('review', selected.id)} onOpenMap={onOpenMap} />
  if (view === 'review') return <TargetReviewPage target={selected} onBack={() => onViewChange('detail', selected.id)} />
  return <TargetLibraryPage searchRequest={searchRequest} onInspect={(target) => onViewChange('detail', target.id)} onReviewQueue={() => onViewChange('review', selected.id)} />
}

function WorkspaceBreadcrumb({ current }: { current: string }) {
  return <div className="target-breadcrumb">Projects <ArrowRight /> Great Dyke Chrome Project <ArrowRight /> <strong>{current}</strong></div>
}

interface TargetLibraryPageProps {
  searchRequest: { id: number; query: string } | null
  onInspect: (target: ExplorationTarget) => void
  onReviewQueue: () => void
}

function TargetLibraryPage({ searchRequest, onInspect, onReviewQueue }: TargetLibraryPageProps) {
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('All')
  const [status, setStatus] = useState('All')
  const [selectedId, setSelectedId] = useState(DEMO_TARGETS[0].id)
  useEffect(() => { if (searchRequest) setQuery(searchRequest.query) }, [searchRequest])
  const visibleTargets = useMemo(() => filterTargets(DEMO_TARGETS, query, priority, status), [priority, query, status])

  return <div className="target-page target-library-page">
    <WorkspaceBreadcrumb current="Target Library" />
    <header className="target-page-header"><div><h1>Target Library</h1><p>Screening candidates awaiting geological evaluation and follow-up.</p></div><button type="button" onClick={onReviewQueue}>Review queue <ArrowRight /></button></header>
    <div className="target-filterbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search targets by ID or location" /></label><label><select value={priority} onChange={(event) => setPriority(event.target.value)}><option>All</option><option>High</option><option>Moderate</option><option>Low</option></select><ChevronDown /></label><label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Review pending</option><option>In review</option><option>Needs evidence</option><option>Deferred</option></select><ChevronDown /></label></div>
    <div className="target-library-layout">
      <section className="target-card target-table" aria-label="Target candidates"><div className="target-table-head"><span>ID</span><span>Area</span><span>Priority</span><span>Review status</span><span>Run</span><span /></div>{visibleTargets.map((target) => <div role="button" tabIndex={0} className={`target-row ${selectedId === target.id ? 'is-selected' : ''}`} key={target.id} onClick={() => setSelectedId(target.id)} onDoubleClick={() => onInspect(target)} onKeyDown={(event) => { if (event.key === 'Enter') onInspect(target) }}><strong>{target.id}</strong><span>{target.area}</span><span><b className={`target-priority priority-${priorityClass(target.priority)}`}>{target.priority}</b></span><span>{target.reviewStatus}</span><span>{target.runId}</span><span onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => onInspect(target)}>Inspect <ArrowRight /></button></span></div>)}{!visibleTargets.length && <div className="target-empty"><FileSearch /><strong>No matching targets</strong><button type="button" onClick={() => { setQuery(''); setPriority('All'); setStatus('All') }}>Clear filters</button></div>}</section>
      <section className="target-card target-locations"><h2>Target locations</h2><TargetMap targets={DEMO_TARGETS} selectedTargetId={selectedId} compact onTargetSelect={(target) => setSelectedId(target.id)} /></section>
    </div>
  </div>
}

interface TargetDetailPageProps { target: ExplorationTarget; onBack: () => void; onReview: () => void; onOpenMap: () => void }

function TargetDetailPage({ target, onBack, onReview, onOpenMap }: TargetDetailPageProps) {
  return <div className="target-page target-detail-page">
    <WorkspaceBreadcrumb current={`${target.id} · ${target.area}`} />
    <header className="target-page-header"><div><button className="inline-back" type="button" onClick={onBack}><ArrowLeft /> Target Library</button><h1>{target.id} · {target.area}</h1><p>A preliminary candidate area; inspect the supporting evidence before deciding on fieldwork.</p></div><button className="primary-target-button" type="button" onClick={onReview}>Send for review <ArrowRight /></button></header>
    <div className="target-tags"><span className={`priority-${priorityClass(target.priority)}`}>{target.priority} screening priority</span><span className="hypothesis">{target.hypothesis}</span><span>Great Dyke Chrome Project</span></div>
    <div className="target-detail-layout"><section className="target-card target-location-card"><header><h2>Target location</h2><button type="button" onClick={onOpenMap}>Open in Map <ArrowRight /></button></header><TargetMap targets={DEMO_TARGETS} selectedTargetId={target.id} /></section><aside className="target-detail-side"><article className="target-card target-summary"><h2>Target summary</h2><dl><div><dt>Deposit model</dt><dd>{target.depositModel}</dd></div><div><dt>Screening method</dt><dd>{target.screeningMethod}</dd></div><div><dt>Screening rank</dt><dd>{target.screeningRank}</dd></div><div><dt>Review status</dt><dd>Not yet validated</dd></div><div><dt>Data confidence</dt><dd>{target.confidence}</dd></div></dl></article><article className="target-card supporting-evidence"><h2>Supporting evidence</h2>{target.evidence.map((item, index) => <div key={item.title}><span>{index === 0 ? <Layers3 /> : index === 1 ? <Map /> : <Database />}</span><p><strong>{item.title}</strong><small>{item.detail}</small></p></div>)}</article></aside></div>
  </div>
}

interface TargetReviewPageProps { target: ExplorationTarget; onBack: () => void }

function TargetReviewPage({ target, onBack }: TargetReviewPageProps) {
  const [checks, setChecks] = useState([true, true, true, false])
  const [comments, setComments] = useState('Promising geological setting; requires geological field verification before any target advancement.')
  const [decision, setDecision] = useState<string | null>(null)
  const checklist = ['Source datasets traceable', 'Deposit model appropriate', 'Major data limitations documented', 'Independent occurrence validation available']
  function toggle(index: number) { setChecks((current) => current.map((checked, itemIndex) => itemIndex === index ? !checked : checked)) }

  return <div className="target-page target-review-page">
    <WorkspaceBreadcrumb current="Geological Target Review" />
    <header className="target-page-header"><div><h1>Geological Target Review</h1><p>Decide whether {target.id} warrants further investigation.</p></div><button type="button" onClick={onBack}><ArrowLeft /> Back to Target</button></header>
    <div className="target-review-layout"><section className="target-card review-evidence"><h2>Review evidence</h2><TargetMap targets={DEMO_TARGETS} selectedTargetId={target.id} /><div className="target-review-warning"><AlertTriangle /> The screening rank is not the probability of a mineral deposit. Missing field evidence must be acknowledged.</div></section><section className="target-card review-decision"><header><h2>Reviewer checklist &amp; decision</h2><div><span>{target.id} · {target.area}</span><b>Review in progress</b></div></header><div className="target-checklist">{checklist.map((item, index) => <label key={item}><input type="checkbox" checked={checks[index]} onChange={() => toggle(index)} /><span><CheckCircle2 /></span><strong>{item}</strong></label>)}</div><label className="review-comments">Reviewer comments<textarea value={comments} onChange={(event) => setComments(event.target.value)} /></label><div className="review-actions"><button type="button" onClick={() => setDecision('Evidence request recorded. The target remains in review.')}><ShieldCheck /> Request evidence</button><button className="primary-target-button" type="button" onClick={() => setDecision('Fieldwork recommendation recorded for professional review.')} disabled={!comments.trim()}>Recommend fieldwork <ArrowRight /></button></div>{decision && <div className="target-decision-message"><CheckCircle2 /> {decision}</div>}</section></div>
  </div>
}
