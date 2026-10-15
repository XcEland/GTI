import { Check, Layers3, MoreHorizontal, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type {
  LayerGroup,
  MapLayerDefinition,
} from '../types/mapTypes'
import { FloatingPanel } from './FloatingPanel'

interface MapLayersPanelProps {
  layers: MapLayerDefinition[]
  groupedLayers: Partial<Record<LayerGroup, MapLayerDefinition[]>>
  availableLayers: MapLayerDefinition[]
  onToggle: (layerId: string) => void
  onOpacityChange: (layerId: string, opacity: number) => void
  onRemove: (layerId: string) => void
  onAdd: (layerId: string) => void
  onClose: () => void
}

const groupOrder: LayerGroup[] = [
  'Project',
  'Geology',
  'Geophysics',
  'Structures',
  'Samples',
  'Occurrences',
  'Targets',
]

function LayerSwatch({ layer }: { layer: MapLayerDefinition }) {
  return (
    <span
      className={`layer-swatch layer-swatch-${layer.kind}`}
      style={{ '--swatch': layer.color } as React.CSSProperties}
      aria-hidden="true"
    />
  )
}

export function MapLayersPanel({
  layers,
  groupedLayers,
  availableLayers,
  onToggle,
  onOpacityChange,
  onRemove,
  onAdd,
  onClose,
}: MapLayersPanelProps) {
  const [tab, setTab] = useState<'active' | 'available'>('active')
  const [editingLayer, setEditingLayer] = useState<string | null>(null)

  return (
    <FloatingPanel
      title="Map layers"
      icon={<Layers3 size={19} />}
      className="layers-panel"
      onClose={onClose}
    >
      <div className="panel-tabs" role="tablist" aria-label="Layer collections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'active'}
          className={tab === 'active' ? 'is-active' : ''}
          onClick={() => setTab('active')}
        >
          Active <span>{layers.filter((layer) => layer.active).length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'available'}
          className={tab === 'available' ? 'is-active' : ''}
          onClick={() => setTab('available')}
        >
          Available <span>{availableLayers.length}</span>
        </button>
      </div>

      {tab === 'active' ? (
        <div className="layer-groups">
          {groupOrder.map((group) => {
            const groupLayers = groupedLayers[group]
            if (!groupLayers?.length) return null

            return (
              <section className="layer-group" key={group}>
                <h3>
                  {group} <span>{groupLayers.length}</span>
                </h3>
                {groupLayers.map((layer) => (
                  <div className="layer-item-wrap" key={layer.id}>
                    <div className="layer-item">
                      <label className="layer-visibility">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => onToggle(layer.id)}
                        />
                        <span><Check size={13} /></span>
                      </label>
                      <LayerSwatch layer={layer} />
                      <button
                        type="button"
                        className="layer-name"
                        onClick={() => onToggle(layer.id)}
                      >
                        {layer.name}
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                          setEditingLayer((current) =>
                            current === layer.id ? null : layer.id,
                          )
                        }
                        aria-label={`Layer options for ${layer.name}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    {editingLayer === layer.id && (
                      <div className="layer-options">
                        <label>
                          <span>Opacity</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(layer.opacity * 100)}
                            onChange={(event) =>
                              onOpacityChange(layer.id, Number(event.target.value) / 100)
                            }
                          />
                          <output>{Math.round(layer.opacity * 100)}%</output>
                        </label>
                        {layer.id !== 'project-boundary' && (
                          <button type="button" onClick={() => onRemove(layer.id)}>
                            Remove from map
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="available-list">
          <p className="panel-note">
            Only validated, map-compatible datasets can be added.
          </p>
          {availableLayers.map((layer) => (
            <div className="available-item" key={layer.id}>
              <LayerSwatch layer={layer} />
              <span>
                <strong>{layer.name}</strong>
                <small>
                  {layer.approved ? 'Approved for mapping' : 'Awaiting validated dataset'}
                </small>
              </span>
              <button
                type="button"
                className="small-action"
                onClick={() => onAdd(layer.id)}
                disabled={!layer.approved}
                aria-label={`Add ${layer.name}`}
              >
                {layer.approved ? <Plus size={15} /> : <ShieldCheck size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </FloatingPanel>
  )
}

