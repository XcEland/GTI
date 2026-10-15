import { ListTree } from 'lucide-react'
import type { MapLayerDefinition } from '../types/mapTypes'
import { FloatingPanel } from './FloatingPanel'

export function LayerLegend({ layers }: { layers: MapLayerDefinition[] }) {
  const visibleLayers = layers.filter((layer) => layer.active && layer.visible)

  return (
    <FloatingPanel
      title="Legend"
      icon={<ListTree size={18} />}
      className="legend-panel"
      defaultCollapsed
    >
      <div className="legend-list">
        {visibleLayers.map((layer) => (
          <div className="legend-item" key={layer.id}>
            <span
              className={`layer-swatch layer-swatch-${layer.kind}`}
              style={{ '--swatch': layer.color } as React.CSSProperties}
            />
            <span>
              {layer.name}
              {layer.unit && <small>{layer.unit}</small>}
            </span>
          </div>
        ))}
      </div>
    </FloatingPanel>
  )
}

