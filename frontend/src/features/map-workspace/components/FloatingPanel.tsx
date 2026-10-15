import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

interface FloatingPanelProps {
  title: string
  icon: ReactNode
  children: ReactNode
  className?: string
  onClose?: () => void
  defaultCollapsed?: boolean
}

export function FloatingPanel({
  title,
  icon,
  children,
  className = '',
  onClose,
  defaultCollapsed = false,
}: FloatingPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <section className={`floating-panel ${className} ${collapsed ? 'is-collapsed' : ''}`}>
      <header className="panel-header">
        <span className="panel-title-icon">{icon}</span>
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {collapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
        </button>
        {onClose && (
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={17} />
          </button>
        )}
      </header>
      {!collapsed && <div className="panel-body">{children}</div>}
    </section>
  )
}

