import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useRef, useState } from 'react'
import type { ExplorationProject } from '../types/projectTypes'
import { getPolygonBounds } from '../utils/projectGeometry'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

interface ProjectThumbnailProps {
  project: ExplorationProject
  detailed?: boolean
}

/**
 * A real, non-interactive MapLibre preview for project cards and summaries.
 * The map uses OpenFreeMap for geographic context and the project's WGS 84 AOI
 * when available. IntersectionObserver avoids creating off-screen WebGL maps.
 */
export function ProjectThumbnail({ project, detailed = false }: ProjectThumbnailProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '180px' })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !mapContainerRef.current) return
    setReady(false)
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [29.8, -19],
      zoom: 5.5,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    })

    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(mapContainerRef.current)

    map.once('load', () => {
      map.resize()
      if (project.areaOfInterest) {
        map.addSource('thumbnail-aoi', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { name: project.name },
            geometry: project.areaOfInterest,
          },
        })
        map.addLayer({
          id: 'thumbnail-aoi-fill',
          type: 'fill',
          source: 'thumbnail-aoi',
          paint: { 'fill-color': '#00b79f', 'fill-opacity': 0.22 },
        })
        map.addLayer({
          id: 'thumbnail-aoi-line',
          type: 'line',
          source: 'thumbnail-aoi',
          paint: { 'line-color': '#ff3f59', 'line-width': detailed ? 3 : 2.25 },
        })
        map.fitBounds(getPolygonBounds(project.areaOfInterest), {
          padding: detailed ? 38 : 20,
          duration: 0,
        })
      }
      map.getCanvas().setAttribute('aria-hidden', 'true')
      map.getCanvas().removeAttribute('tabindex')
      setReady(true)
    })

    return () => {
      resizeObserver.disconnect()
      map.remove()
    }
  }, [detailed, project, visible])

  return (
    <div
      ref={rootRef}
      className={`project-thumbnail project-map-thumbnail ${ready ? 'is-ready' : ''}`}
      role="img"
      aria-label={`Map preview for ${project.name} in ${project.location}, ${project.country}`}
    >
      <div ref={mapContainerRef} className="project-map-thumbnail-canvas" />
      {!ready && <span className="project-map-thumbnail-loading">Loading map…</span>}
      <span className="project-map-thumbnail-attribution">© OpenFreeMap · OSM</span>
    </div>
  )
}
