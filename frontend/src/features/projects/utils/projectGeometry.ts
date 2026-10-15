import type { GeoJSON, Polygon, Position } from 'geojson'

const EARTH_RADIUS_METRES = 6_371_008.8

function radians(value: number) {
  return value * Math.PI / 180
}

function validPosition(position: Position) {
  return position.length >= 2
    && Number.isFinite(position[0]) && Number.isFinite(position[1])
    && position[0] >= -180 && position[0] <= 180
    && position[1] >= -90 && position[1] <= 90
}

function closeRing(ring: Position[]) {
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) return ring
  return [...ring, [...first]]
}

export function validatePolygon(polygon: Polygon): Polygon {
  if (!polygon.coordinates.length || polygon.coordinates[0].length < 3) {
    throw new Error('The boundary must contain at least three points.')
  }
  if (!polygon.coordinates.every((ring) => ring.every(validPosition))) {
    throw new Error('Boundary coordinates must use valid WGS 84 longitude and latitude values.')
  }
  return {
    type: 'Polygon',
    coordinates: polygon.coordinates.map(closeRing),
  }
}

export function extractPolygon(input: GeoJSON): Polygon {
  if (input.type === 'Polygon') return validatePolygon(input)
  if (input.type === 'Feature' && input.geometry?.type === 'Polygon') {
    return validatePolygon(input.geometry)
  }
  if (input.type === 'FeatureCollection') {
    const polygon = input.features.find((feature) => feature.geometry?.type === 'Polygon')
    if (polygon?.geometry.type === 'Polygon') return validatePolygon(polygon.geometry)
  }
  throw new Error('Choose a GeoJSON Polygon or a FeatureCollection containing a polygon.')
}

function distanceMetres(start: Position, end: Position) {
  const latitudeDelta = radians(end[1] - start[1])
  const longitudeDelta = radians(end[0] - start[0])
  const startLatitude = radians(start[1])
  const endLatitude = radians(end[1])
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(a))
}

export function getPolygonMetrics(polygon: Polygon) {
  const ring = closeRing(polygon.coordinates[0])
  let areaAccumulator = 0
  let perimeterMetres = 0

  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index]
    const next = ring[index + 1]
    areaAccumulator += radians(next[0] - current[0])
      * (2 + Math.sin(radians(current[1])) + Math.sin(radians(next[1])))
    perimeterMetres += distanceMetres(current, next)
  }

  // Spherical area is accurate enough for immediate UI feedback. Django saves
  // authoritative metrics after projecting the AOI into its local UTM zone.
  const areaKm2 = Math.abs(areaAccumulator * EARTH_RADIUS_METRES ** 2 / 2) / 1_000_000
  return {
    areaKm2,
    perimeterKm: perimeterMetres / 1_000,
    vertexCount: ring.length - 1,
  }
}

export function getPolygonBounds(polygon: Polygon): [[number, number], [number, number]] {
  const positions = polygon.coordinates.flat()
  const longitudes = positions.map((position) => position[0])
  const latitudes = positions.map((position) => position[1])
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ]
}
