import { ChevronUp, Plus } from 'lucide-react'
import type { MapLayerDefinition } from '../types/mapTypes'

interface ActiveLayersBarProps {
  layers: MapLayerDefinition[]
  comparison?: boolean
  onOpenLayers: () => void
}

export function ActiveLayersBar({
  layers,
  comparison = false,
  onOpenLayers,
}: ActiveLayersBarProps) {
  const displayedLayers = layers
    .filter((layer) => layer.active && layer.visible)
    .slice(0, comparison ? 4 : 6)
  const visibleLayerCount = layers.filter((layer) => layer.active && layer.visible).length

  return (
    <div className="active-layers-bar">
      <button type="button" className="active-layer-summary" onClick={onOpenLayers}>
        {comparison ? 'Analysis layers' : `Active layers (${visibleLayerCount})`}
        <ChevronUp size={15} />
      </button>
      <div className="active-layer-chips">
        {displayedLayers.map((layer) => (
          <span className="active-layer-chip" key={layer.id}>
            <i
              className={`layer-swatch layer-swatch-${layer.kind}`}
              style={{ '--swatch': layer.color } as React.CSSProperties}
            />
            {layer.shortName}
          </span>
        ))}
      </div>
      <button type="button" className="add-layer-button" onClick={onOpenLayers}>
        <Plus size={15} /> Add layer
      </button>
    </div>
  )
}

