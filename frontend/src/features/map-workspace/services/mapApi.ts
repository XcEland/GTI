import { DEMO_WORKSPACE } from '../data/demoWorkspace'
import type { FeatureCollection } from 'geojson'
import type { ExplorationProject } from '../../projects/types/projectTypes'
import { getPolygonBounds } from '../../projects/utils/projectGeometry'
import type { WorkspaceDataset } from '../types/mapTypes'

/**
 * Data-access boundary for the Map Workspace.
 *
 * The Phase 1 spatial endpoints are not present yet, so the UI currently uses
 * an explicitly labelled demonstration dataset. Replacing this adapter with
 * project-scoped API calls will not require changes to map components.
 */
export async function getMapWorkspace(
  projectId: string,
  project?: ExplorationProject,
): Promise<WorkspaceDataset> {
  if (projectId === DEMO_WORKSPACE.project.id) return Promise.resolve(DEMO_WORKSPACE)
  if (!project?.areaOfInterest) throw new Error('This project does not have a saved area of interest.')

  const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }
  return Promise.resolve({
    project: {
      id: project.id,
      name: project.name,
      country: project.country,
      commodityFocus: project.commodities,
      areaKm2: project.areaKm2,
      targetCount: project.targetCount,
      approvedLayerCount: 1,
      sampleCount: 0,
      updatedAt: project.updatedAt,
      isDemonstration: false,
    },
    projectBounds: getPolygonBounds(project.areaOfInterest),
    boundary: {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { name: `${project.name} AOI` }, geometry: project.areaOfInterest }],
    },
    geology: empty,
    magnetics: empty,
    structures: empty,
    samples: empty,
    occurrences: empty,
    targets: empty,
  })
}

