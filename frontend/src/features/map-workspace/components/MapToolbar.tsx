import {
  Expand,
  Focus,
  LocateFixed,
  Minus,
  Plus,
  Ruler,
} from 'lucide-react'

interface MapToolbarProps {
  measuring: boolean
  inspecting: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onFitProject: () => void
  onToggleInspect: () => void
  onToggleMeasure: () => void
  onFullscreen: () => void
}

export function MapToolbar({
  measuring,
  inspecting,
  onZoomIn,
  onZoomOut,
  onFitProject,
  onToggleInspect,
  onToggleMeasure,
  onFullscreen,
}: MapToolbarProps) {
  const tools = [
    { label: 'Zoom in', icon: Plus, action: onZoomIn },
    { label: 'Zoom out', icon: Minus, action: onZoomOut },
    { label: 'Fit project boundary', icon: Focus, action: onFitProject },
    {
      label: inspecting ? 'Feature inspection active' : 'Inspect features',
      icon: LocateFixed,
      action: onToggleInspect,
      active: inspecting,
    },
    {
      label: measuring ? 'Stop measuring' : 'Measure distance',
      icon: Ruler,
      action: onToggleMeasure,
      active: measuring,
    },
    { label: 'Fullscreen map', icon: Expand, action: onFullscreen },
  ]

  return (
    <div className="map-toolbar" aria-label="Map tools">
      {tools.map(({ label, icon: Icon, action, active }) => (
        <button
          type="button"
          key={label}
          onClick={action}
          className={active ? 'is-active' : ''}
          title={label}
          aria-label={label}
          aria-pressed={active}
        >
          <Icon size={19} strokeWidth={1.9} />
        </button>
      ))}
    </div>
  )
}

