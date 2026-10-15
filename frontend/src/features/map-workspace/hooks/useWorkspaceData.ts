import { useEffect, useState } from 'react'
import { getMapWorkspace } from '../services/mapApi'
import type { WorkspaceDataset } from '../types/mapTypes'
import type { ExplorationProject } from '../../projects/types/projectTypes'

interface WorkspaceDataState {
  data: WorkspaceDataset | null
  loading: boolean
  error: string | null
}

export function useWorkspaceData(projectId: string, project?: ExplorationProject): WorkspaceDataState {
  const [state, setState] = useState<WorkspaceDataState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true

    setState({ data: null, loading: true, error: null })
    getMapWorkspace(projectId, project)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch(() => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: 'The project map could not be loaded.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [project, projectId])

  return state
}

