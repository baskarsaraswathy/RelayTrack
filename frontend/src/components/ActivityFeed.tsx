import type { ActivityEvent } from '../App'

interface ActivityFeedProps {
  events: ActivityEvent[]
}

type EventType = ActivityEvent['type']

const EVENT_CONFIG: Record<EventType, { icon: JSX.Element; color: string; label: string }> = {
  arrival: {
    label: 'ARRIVAL',
    color: '#22c55e',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M6 1v8M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  departure: {
    label: 'DEPARTURE',
    color: '#0ea5e9',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M6 11V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  incident: {
    label: 'INCIDENT',
    color: '#ef4444',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M6 1L1 10.5h10L6 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M6 4.5v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  reroute: {
    label: 'REROUTED',
    color: '#a78bfa',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M2 6h5M5 4l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 3v6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  rfid: {
    label: 'RFID SCAN',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <rect x="3.5" y="3.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1.5 3.5C1.5 2.4 2.4 1.5 3.5 1.5M8.5 1.5C9.6 1.5 10.5 2.4 10.5 3.5M10.5 8.5C10.5 9.6 9.6 10.5 8.5 10.5M3.5 10.5C2.4 10.5 1.5 9.6 1.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  offline: {
    label: 'OFFLINE',
    color: '#6b7280',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 4l4 4M8 4L4 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  sync: {
    label: 'SYNC',
    color: '#22c55e',
    icon: (
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M2 6a4 4 0 014-4 4 4 0 013.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 6a4 4 0 01-4 4 4 4 0 01-3.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 2v3h-3M2 10v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div
      className="flex-shrink-0"
      style={{ height: '108px', borderTop: '1px solid #1a2845', background: '#06091a' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-1.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2845' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6e8a' }}>
            Activity Feed
          </span>
          <span className="flex items-center gap-1 font-mono text-xs" style={{ color: '#22c55e' }}>
            <span className="w-1.5 h-1.5 rounded-full blink-dot" style={{ background: '#22c55e' }} />
            LIVE
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: '#3a4a5a' }}>
          Last 30 min &middot; {events.length} events
        </span>
      </div>

      {/* Scrollable event cards */}
      <div
        className="flex gap-2 overflow-x-auto px-3 py-2"
        style={{ height: '72px', alignItems: 'flex-start' }}
      >
        {events.map(event => {
          const cfg = EVENT_CONFIG[event.type]
          return (
            <div
              key={event.id}
              className="flex-shrink-0 rounded p-2 transition-colors"
              style={{
                minWidth: '218px',
                background: '#0c1328',
                border: '1px solid #1a2845',
              }}
            >
              <div className="flex items-start gap-1.5">
                {/* Icon badge */}
                <span
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
                  style={{ background: `${cfg.color}18`, color: cfg.color }}
                >
                  {cfg.icon}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                      style={{
                        color: cfg.color,
                        background: event.type === 'incident' ? '#ef444420' : (event.type === 'rfid' ? '#f59e0b20' : `${cfg.color}15`),
                        fontSize: '9px',
                        letterSpacing: '0.06em',
                        border: `1px solid ${cfg.color}40`
                      }}
                    >
                      {cfg.label}
                    </span>
                    {event.packageId && (
                      <span className="font-mono font-medium" style={{ color: '#8899bb', fontSize: '10px' }}>
                        ID: {event.packageId}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs leading-snug truncate"
                    style={{ color: '#8899bb', fontSize: '11px' }}
                  >
                    {event.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t" style={{ borderColor: '#1a2845' }}>
                <span className="font-mono font-medium" style={{ color: '#5a6e8a', fontSize: '10px' }}>
                  {event.timestamp}
                </span>
                <span className="truncate max-w-24 font-semibold" style={{ color: '#8899bb', fontSize: '10px' }}>
                  {event.location}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
