import { useEffect, useState } from 'react'
import { DEMO_DATASETS } from './data/demoData'
import { AddDataPage, ApiImportPage, UploadDatasetPage } from './components/DataImportPages'
import { DataLibraryPage, DatasetDetailsPage } from './components/DataLibraryPages'
import { DataSourcesPage, GeologicalApprovalPage, ValidationQueuePage } from './components/DataGovernancePages'
import type { DataView } from './types/dataTypes'
import './data-workspace.css'

interface DataWorkspaceProps {
  view: DataView
  selectedDatasetId?: string
  searchRequest: { id: number; query: string } | null
  onViewChange: (view: DataView, datasetId?: string) => void
  onOpenMap: () => void
}

export function DataWorkspace({ view, selectedDatasetId, searchRequest, onViewChange, onOpenMap }: DataWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(selectedDatasetId ?? DEMO_DATASETS[0].id)

  useEffect(() => {
    if (selectedDatasetId) setSelectedId(selectedDatasetId)
  }, [selectedDatasetId])

  const selected = DEMO_DATASETS.find((dataset) => dataset.id === selectedId) ?? DEMO_DATASETS[0]

  if (view === 'add') return <AddDataPage onNavigate={onViewChange} />
  if (view === 'upload') return <UploadDatasetPage onNavigate={onViewChange} />
  if (view === 'api') return <ApiImportPage onNavigate={onViewChange} />
  if (view === 'sources') return <DataSourcesPage />
  if (view === 'validation') return <ValidationQueuePage selectedId={selectedId} onSelect={setSelectedId} onReview={(id) => onViewChange('approval', id)} onOpenMap={onOpenMap} />
  if (view === 'approval') return <GeologicalApprovalPage dataset={selected} onBack={() => onViewChange('validation')} />
  if (view === 'detail') return <DatasetDetailsPage dataset={selected} onBack={() => onViewChange('library')} onOpenMap={onOpenMap} />

  return <DataLibraryPage selectedId={selectedId} searchRequest={searchRequest} onSelect={setSelectedId}
    onAddData={() => onViewChange('add')} onOpenDetails={(id) => onViewChange('detail', id)} onOpenMap={onOpenMap} />
}
