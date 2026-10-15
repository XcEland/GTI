import { GitCompareArrows, Lightbulb, RefreshCw } from 'lucide-react'
import type { MapLayerDefinition } from '../types/mapTypes'
import { FloatingPanel } from './FloatingPanel'

interface CompareLayersPanelProps {
  layers: MapLayerDefinition[]
  onClose: () => void
  onOpacityChange: (layerId: string, opacity: number) => void
}

export function CompareLayersPanel({
  layers,
  onClose,
  onOpacityChange,
}: CompareLayersPanelProps) {
  const magnetics = layers.find((layer) => layer.id === 'magnetics')
  const geology = layers.find((layer) => layer.id === 'geology')

  return (
    <FloatingPanel
      title="Compare layers"
      icon={<GitCompareArrows size={19} />}
      className="compare-panel"
      onClose={onClose}
    >
      <div className="compare-layer-block">
        <span>Left side</span>
        <div className="compare-layer-select">
          <i
            className="layer-swatch layer-swatch-heatmap"
            style={{ '--swatch': magnetics?.color } as React.CSSProperties}
          />
          <strong>{magnetics?.name}</strong>
        </div>
        <label>
          <span>Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((magnetics?.opacity ?? 1) * 100)}
            onChange={(event) =>
              onOpacityChange('magnetics', Number(event.target.value) / 100)
            }
          />
          <output>{Math.round((magnetics?.opacity ?? 1) * 100)}%</output>
        </label>
      </div>
      <div className="compare-layer-block">
        <span>Right side</span>
        <div className="compare-layer-select">
          <i
            className="layer-swatch layer-swatch-fill"
            style={{ '--swatch': geology?.color } as React.CSSProperties}
          />
          <strong>{geology?.name}</strong>
        </div>
        <label>
          <span>Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((geology?.opacity ?? 1) * 100)}
            onChange={(event) =>
              onOpacityChange('geology', Number(event.target.value) / 100)
            }
          />
          <output>{Math.round((geology?.opacity ?? 1) * 100)}%</output>
        </label>
      </div>
      <div className="sync-row">
        <RefreshCw size={17} />
        <span>
          <strong>Synchronized extent</strong>
          <small>Both layers follow the same map view</small>
        </span>
      </div>
    </FloatingPanel>
  )
}

export function ComparisonInsights() {
  const insights = [
    {
      title: 'Layer alignment',
      copy: 'The demonstration magnetic response overlaps parts of the mapped ultramafic corridor.',
    },
    {
      title: 'Target context',
      copy: 'CHR-021 sits near several reviewed surface samples and a mapped structure.',
    },
    {
      title: 'Data coverage gap',
      copy: 'Northern sections contain fewer sample records and should be interpreted cautiously.',
    },
  ]

  return (
    <FloatingPanel
      title="Comparison notes"
      icon={<Lightbulb size={19} />}
      className="comparison-insights"
    >
      <p className="panel-note">
        Observations from demonstration layers—not automated geological conclusions.
      </p>
      <ol>
        {insights.map((insight, index) => (
          <li key={insight.title}>
            <span>{index + 1}</span>
            <div>
              <strong>{insight.title}</strong>
              <p>{insight.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </FloatingPanel>
  )
}

