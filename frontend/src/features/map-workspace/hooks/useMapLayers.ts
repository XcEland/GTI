import { useCallback, useEffect, useMemo, useState } from 'react'
import { INITIAL_LAYERS } from '../data/demoWorkspace'
import type { LayerGroup, MapLayerDefinition } from '../types/mapTypes'

export function useMapLayers(initialLayers: MapLayerDefinition[] = INITIAL_LAYERS) {
  const [layers, setLayers] = useState<MapLayerDefinition[]>(initialLayers)

  useEffect(() => setLayers(initialLayers), [initialLayers])

  const updateLayer = useCallback(
    (layerId: string, changes: Partial<MapLayerDefinition>) => {
      setLayers((currentLayers) =>
        currentLayers.map((layer) =>
          layer.id === layerId ? { ...layer, ...changes } : layer,
        ),
      )
    },
    [],
  )

  const toggleVisibility = useCallback(
    (layerId: string) => {
      setLayers((currentLayers) =>
        currentLayers.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
        ),
      )
    },
    [],
  )

  const addLayer = useCallback((layerId: string) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.id === layerId && layer.approved
          ? { ...layer, active: true, visible: true }
          : layer,
      ),
    )
  }, [])

  const removeLayer = useCallback((layerId: string) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.id === layerId && layer.id !== 'project-boundary'
          ? { ...layer, active: false, visible: false }
          : layer,
      ),
    )
  }, [])

  const activeLayers = useMemo(
    () => layers.filter((layer) => layer.active),
    [layers],
  )

  const availableLayers = useMemo(
    () => layers.filter((layer) => !layer.active),
    [layers],
  )

  const groupedLayers = useMemo(() => {
    return activeLayers.reduce<Partial<Record<LayerGroup, MapLayerDefinition[]>>>(
      (groups, layer) => {
        groups[layer.group] = [...(groups[layer.group] ?? []), layer]
        return groups
      },
      {},
    )
  }, [activeLayers])

  return {
    layers,
    activeLayers,
    availableLayers,
    groupedLayers,
    updateLayer,
    toggleVisibility,
    addLayer,
    removeLayer,
  }
}

