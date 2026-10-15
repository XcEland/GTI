import type { FeatureCollection, Point } from 'geojson'
import type {
  MapLayerDefinition,
  ProjectSummary,
  WorkspaceDataset,
} from '../types/mapTypes'

export const DEMO_PROJECT: ProjectSummary = {
  id: 'great-dyke-chrome-demo',
  name: 'Great Dyke Chrome Project',
  country: 'Zimbabwe',
  commodityFocus: ['Chrome'],
  areaKm2: 864,
  targetCount: 3,
  approvedLayerCount: 7,
  sampleCount: 148,
  updatedAt: '15 Oct 2026',
  isDemonstration: true,
}

export const INITIAL_LAYERS: MapLayerDefinition[] = [
  {
    id: 'project-boundary',
    name: 'Project boundary',
    shortName: 'Boundary',
    group: 'Project',
    kind: 'boundary',
    color: '#ff4d61',
    visible: true,
    opacity: 1,
    active: true,
    approved: true,
  },
  {
    id: 'geology',
    name: 'Interpreted geology',
    shortName: 'Geology',
    group: 'Geology',
    kind: 'fill',
    color: '#8b73c9',
    visible: true,
    opacity: 0.58,
    active: true,
    approved: true,
  },
  {
    id: 'magnetics',
    name: 'Magnetic response (RTP)',
    shortName: 'Magnetics',
    group: 'Geophysics',
    kind: 'heatmap',
    color: 'linear-gradient(90deg, #2357ff, #23d5ab, #f5df39, #f04464)',
    visible: true,
    opacity: 0.72,
    active: true,
    approved: true,
    unit: 'relative intensity',
  },
  {
    id: 'structures',
    name: 'Mapped structures',
    shortName: 'Structures',
    group: 'Structures',
    kind: 'line',
    color: '#f8fafc',
    visible: true,
    opacity: 0.84,
    active: true,
    approved: true,
  },
  {
    id: 'surface-samples',
    name: 'Surface samples',
    shortName: 'Samples',
    group: 'Samples',
    kind: 'point',
    color: '#38a5ff',
    visible: true,
    opacity: 1,
    active: true,
    approved: true,
  },
  {
    id: 'mineral-occurrences',
    name: 'Chrome occurrences',
    shortName: 'Occurrences',
    group: 'Occurrences',
    kind: 'point',
    color: '#f6c945',
    visible: true,
    opacity: 1,
    active: true,
    approved: true,
  },
  {
    id: 'targets',
    name: 'Screening targets',
    shortName: 'Targets',
    group: 'Targets',
    kind: 'point',
    color: '#ff334e',
    visible: true,
    opacity: 1,
    active: true,
    approved: true,
  },
  {
    id: 'terrain-contours',
    name: 'Terrain contours',
    shortName: 'Terrain',
    group: 'Terrain',
    kind: 'line',
    color: '#9ca3af',
    visible: false,
    opacity: 0.7,
    active: false,
    approved: false,
  },
  {
    id: 'remote-sensing',
    name: 'Remote sensing composite',
    shortName: 'Remote sensing',
    group: 'Remote sensing',
    kind: 'fill',
    color: '#d97706',
    visible: false,
    opacity: 0.7,
    active: false,
    approved: false,
  },
]

const boundary: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Great Dyke Chrome Project AOI' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [29.56, -20.43],
            [29.38, -19.83],
            [29.45, -19.05],
            [29.66, -18.27],
            [29.83, -17.53],
            [30.0, -16.75],
            [30.22, -16.84],
            [30.09, -17.62],
            [29.93, -18.38],
            [29.76, -19.18],
            [29.78, -19.92],
            [29.56, -20.43],
          ],
        ],
      },
    },
  ],
}

const geology: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'geo-ultramafic',
      properties: {
        name: 'Ultramafic sequence',
        lithology: 'Dunite, harzburgite and pyroxenite',
        classification: 'Layered mafic–ultramafic intrusion',
        age: 'Archaean',
        source: 'Demonstration interpreted geology',
        version: 'Prototype v1',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [29.55, -20.3],
            [29.49, -19.7],
            [29.58, -19.05],
            [29.75, -18.32],
            [29.91, -17.56],
            [30.06, -16.86],
            [30.16, -16.9],
            [30.01, -17.62],
            [29.87, -18.39],
            [29.69, -19.12],
            [29.65, -19.83],
            [29.55, -20.3],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'geo-mafic',
      properties: {
        name: 'Mafic sequence',
        lithology: 'Gabbro and norite',
        classification: 'Layered mafic intrusion',
        age: 'Archaean',
        source: 'Demonstration interpreted geology',
        version: 'Prototype v1',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [29.65, -20.32],
            [29.64, -19.82],
            [29.7, -19.1],
            [29.88, -18.38],
            [30.02, -17.62],
            [30.17, -16.9],
            [30.22, -16.94],
            [30.09, -17.62],
            [29.93, -18.38],
            [29.76, -19.18],
            [29.77, -19.91],
            [29.65, -20.32],
          ],
        ],
      },
    },
  ],
}

const structures: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'structure-west',
      properties: { name: 'Western axial structure', trend: 'NNE–SSW' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [29.41, -20.35],
          [29.45, -19.5],
          [29.62, -18.65],
          [29.78, -17.75],
          [29.95, -16.8],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'structure-east',
      properties: { name: 'Eastern contact structure', trend: 'NNE–SSW' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [29.79, -20.28],
          [29.79, -19.42],
          [29.91, -18.57],
          [30.08, -17.65],
          [30.23, -16.82],
        ],
      },
    },
  ],
}

const magneticPoints: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: Array.from({ length: 38 }, (_, index) => {
    const progress = index / 37
    const longitude = 29.52 + progress * 0.57 + Math.sin(index * 1.7) * 0.07
    const latitude = -20.25 + progress * 3.25 + Math.cos(index * 1.3) * 0.08
    return {
      type: 'Feature' as const,
      id: `mag-${index}`,
      properties: {
        intensity: 0.38 + ((index * 17) % 61) / 100,
      },
      geometry: { type: 'Point' as const, coordinates: [longitude, latitude] },
    }
  }),
}

const samples: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: Array.from({ length: 24 }, (_, index) => {
    const progress = index / 23
    return {
      type: 'Feature' as const,
      id: `sample-${index + 1}`,
      properties: {
        name: `GC-S-${String(index + 1).padStart(3, '0')}`,
        sampleType: 'Surface sample',
        status: index % 4 === 0 ? 'Anomalous' : 'Reviewed',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [
          29.55 + progress * 0.53 + Math.sin(index * 2.2) * 0.05,
          -20.18 + progress * 3.08 + Math.cos(index * 1.4) * 0.06,
        ],
      },
    }
  }),
}

const occurrences: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    [29.61, -19.72, 'CR-OCC-08'],
    [29.73, -18.93, 'CR-OCC-14'],
    [29.89, -18.08, 'CR-OCC-19'],
    [30.04, -17.28, 'CR-OCC-27'],
  ].map(([longitude, latitude, id]) => ({
    type: 'Feature' as const,
    id: String(id),
    properties: {
      name: id,
      commodity: 'Chrome',
      mineralisation: 'Reported chromitite occurrence',
      source: 'Demonstration occurrence register',
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [Number(longitude), Number(latitude)],
    },
  })),
}

const targets: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'CHR-014',
      properties: {
        name: 'CHR-014',
        category: 'Review target',
        relativeScore: 74,
        reviewStatus: 'Needs review',
        screeningRun: 'Chrome screening — demo run 01',
        evidence: ['Magnetic response', 'Ultramafic geology'],
        nearbySamples: 8,
        source: 'Demonstration screening output',
      },
      geometry: { type: 'Point', coordinates: [30.03, -17.22] },
    },
    {
      type: 'Feature',
      id: 'CHR-021',
      properties: {
        name: 'CHR-021',
        category: 'Priority review target',
        relativeScore: 82,
        reviewStatus: 'Shortlisted',
        screeningRun: 'Chrome screening — demo run 01',
        evidence: ['Magnetic response', 'Mapped structure', 'Surface geochemistry'],
        nearbySamples: 12,
        source: 'Demonstration screening output',
      },
      geometry: { type: 'Point', coordinates: [29.82, -18.48] },
    },
    {
      type: 'Feature',
      id: 'CHR-029',
      properties: {
        name: 'CHR-029',
        category: 'Review target',
        relativeScore: 69,
        reviewStatus: 'Needs review',
        screeningRun: 'Chrome screening — demo run 01',
        evidence: ['Occurrence proximity', 'Ultramafic geology'],
        nearbySamples: 5,
        source: 'Demonstration screening output',
      },
      geometry: { type: 'Point', coordinates: [29.61, -19.62] },
    },
  ],
}

export const DEMO_WORKSPACE: WorkspaceDataset = {
  project: DEMO_PROJECT,
  projectBounds: [
    [29.3, -20.55],
    [30.31, -16.65],
  ],
  boundary,
  geology,
  magnetics: magneticPoints,
  structures,
  samples,
  occurrences,
  targets,
}

