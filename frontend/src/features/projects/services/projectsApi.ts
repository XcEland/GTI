import type { Polygon } from 'geojson'
import type { ExplorationProject, ProjectStatus } from '../types/projectTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010/api'

export interface ApiProject {
  id: string
  name: string
  commodity: string
  country: string
  project_type: string
  description: string
  status: string
  status_label: string
  area_of_interest: Polygon
  area_km2: string
  perimeter_km: string
  vertex_count: number
  coordinate_system: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateProjectPayload {
  name: string
  commodity: string
  country: string
  project_type: string
  description: string
  area_of_interest: Polygon
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body && typeof body === 'object'
      ? Object.values(body).flat().join(' ')
      : `Request failed with status ${response.status}.`
    throw new Error(message || 'The project could not be saved.')
  }
  return response.json() as Promise<T>
}

export function listProjects() {
  return request<ApiProject[]>('/projects/')
}

export function createProject(payload: CreateProjectPayload) {
  return request<ApiProject>('/projects/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

const commoditySymbols: Record<string, string> = {
  Chrome: 'Cr', Nickel: 'Ni', Gold: 'Au', Copper: 'Cu', Lithium: 'Li',
  PGM: 'PGM', 'Rare Earths': 'REE', Cobalt: 'Co', Zinc: 'Zn', Lead: 'Pb',
}

function projectStatus(status: string): ProjectStatus {
  if (status === 'active') return 'Active'
  if (status === 'review') return 'Review'
  if (status === 'archived') return 'Archived'
  return 'Planning'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(value))
}

export function apiProjectToExplorationProject(project: ApiProject): ExplorationProject {
  return {
    id: project.id,
    name: project.name,
    location: 'Project AOI',
    country: project.country,
    status: projectStatus(project.status),
    scope: 'mine',
    commodities: [commoditySymbols[project.commodity] ?? project.commodity],
    areaKm2: Number(project.area_km2),
    targetCount: 0,
    datasetCount: 0,
    updatedAt: formatDate(project.updated_at),
    updatedAtIso: project.updated_at,
    createdAt: formatDate(project.created_at),
    owner: project.created_by,
    coordinateSystem: project.coordinate_system,
    projectType: project.project_type,
    description: project.description || `${project.commodity} exploration project in ${project.country}.`,
    fieldPlanCount: 0,
    reportCount: 0,
    areaOfInterest: project.area_of_interest,
    perimeterKm: Number(project.perimeter_km),
    vertexCount: project.vertex_count,
    isPersisted: true,
  }
}
