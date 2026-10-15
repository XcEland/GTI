const EARTH_RADIUS_KM = 6371.0088

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

/**
 * Calculate geodesic distance between WGS 84 longitude/latitude coordinates.
 * Haversine is appropriate for an interactive measuring aid at project scale;
 * authoritative survey measurements should use a suitable projected CRS.
 */
export function haversineDistanceKm(
  start: [number, number],
  end: [number, number],
): number {
  const [startLongitude, startLatitude] = start
  const [endLongitude, endLatitude] = end
  const latitudeDelta = toRadians(endLatitude - startLatitude)
  const longitudeDelta = toRadians(endLongitude - startLongitude)
  const startLatitudeRadians = toRadians(startLatitude)
  const endLatitudeRadians = toRadians(endLatitude)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitudeRadians) *
      Math.cos(endLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 2 : 1)} km`
}

