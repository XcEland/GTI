import {
  ArrowUpRight,
  CircleGauge,
  Database,
  MapPin,
  Target,
} from 'lucide-react'
import type { SelectedMapFeature } from '../types/mapTypes'
import { FloatingPanel } from './FloatingPanel'

interface FeatureDetailsPanelProps {
  feature: SelectedMapFeature
  onClose: () => void
  onOpenReview: () => void
}

function formatValue(value: string | number | string[] | null): string {
  if (value === null || value === '') return 'Not provided'
  if (Array.isArray(value)) return value.join(' · ')
  return String(value)
}

function labelFromKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase())
}

export function FeatureDetailsPanel({
  feature,
  onClose,
  onOpenReview,
}: FeatureDetailsPanelProps) {
  const isTarget = feature.featureType === 'target'

  return (
    <FloatingPanel
      title={feature.title}
      icon={isTarget ? <Target size={20} /> : <MapPin size={20} />}
      className="feature-details-panel"
      onClose={onClose}
    >
      <div className="feature-heading">
        <span className={`feature-type feature-type-${feature.featureType}`}>
          {feature.featureType}
        </span>
        <h3>{feature.subtitle}</h3>
        <p>
          {feature.coordinates[1].toFixed(5)}, {feature.coordinates[0].toFixed(5)}
        </p>
      </div>

      {isTarget && (
        <div className="decision-support-note">
          <CircleGauge size={20} />
          <span>
            <strong>Screening output</strong>
            <small>Relative prioritisation for expert review—not a discovery claim.</small>
          </span>
        </div>
      )}

      <dl className="attribute-list">
        {Object.entries(feature.attributes).map(([key, value]) => (
          <div key={key}>
            <dt>{labelFromKey(key)}</dt>
            <dd className={value === null ? 'is-missing' : ''}>{formatValue(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="provenance-note">
        <Database size={16} />
        <span>
          Attributes shown exactly as supplied by the selected demonstration feature.
        </span>
      </div>

      {isTarget && (
        <button className="primary-action" type="button" onClick={onOpenReview}>
          Open target review <ArrowUpRight size={17} />
        </button>
      )}
    </FloatingPanel>
  )
}

