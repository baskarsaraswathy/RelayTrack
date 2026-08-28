interface KPIData {
  total: number
  inTransit: number
  atRisk: number
  delayed: number
  delivered: number
}

interface KPICardsProps {
  kpi: KPIData
}

const CARDS = [
  {
    key: 'total' as const,
    label: 'Total Packages',
    accent: '#0ea5e9',
    trend: '+14 today',
    trendColor: '#0ea5e9',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <rect x="1" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 8h14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    key: 'inTransit' as const,
    label: 'In Transit',
    accent: '#8899bb',
    trend: '31 active hubs',
    trendColor: '#5a6e8a',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <path d="M1 8h10M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'atRisk' as const,
    label: 'At Risk',
    accent: '#f59e0b',
    trend: '+2 last hour',
    trendColor: '#f59e0b',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <path d="M8 1L1 13h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'delayed' as const,
    label: 'Delayed',
    accent: '#ef4444',
    trend: 'avg 47 min late',
    trendColor: '#ef4444',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'delivered' as const,
    label: 'Delivered Today',
    accent: '#22c55e',
    trend: '96.4% on-time rate',
    trendColor: '#22c55e',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <path d="M2 8l4 4 8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function KPICards({ kpi }: KPICardsProps) {
  return (
    <div className="flex gap-3 px-3 pt-3 pb-2 flex-shrink-0">
      {CARDS.map(card => (
        <div
          key={card.key}
          className="flex-1 rounded min-w-0 p-3.5 transition-all hover:brightness-110 cursor-default"
          style={{
            background: '#0c1328',
            border: '1px solid #1a2845',
            borderLeft: `4px solid ${card.accent}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <span
              className="text-3xl font-bold leading-none font-mono tracking-tight"
              style={{ color: card.accent }}
            >
              {kpi[card.key].toLocaleString()}
            </span>
            <span style={{ color: card.accent, opacity: 0.8 }}>{card.icon}</span>
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: '#dde3f0' }}>
            {card.label}
          </div>
          <div className="text-xs font-mono font-medium truncate" style={{ color: card.trendColor, opacity: 0.85 }}>
            {card.trend}
          </div>
        </div>
      ))}
    </div>
  )
}

