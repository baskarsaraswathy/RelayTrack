import type { Package, Hub, RiskLevel, PackageStatus } from '../App'

interface RiskAlertsPanelProps {
  packages: Package[]
  hubs: Hub[]
  selectedPackageId: string | null
  onSelectPackage: (id: string | null) => void
}

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string; badge: string }> = {
  LOW: {
    bg: '#04160a',
    border: '#14532d',
    text: '#22c55e',
    badge: '#052e16',
  },
  MEDIUM: {
    bg: '#1c1000',
    border: '#713f12',
    text: '#f59e0b',
    badge: '#1c1000',
  },
  HIGH: {
    bg: '#200606',
    border: '#991b1b',
    text: '#ef4444',
    badge: '#200606',
  },
  CRITICAL: {
    bg: '#160000',
    border: '#7f1d1d',
    text: '#ff3333',
    badge: '#160000',
  },
}

const STATUS_STYLES: Record<PackageStatus, { label: string; color: string }> = {
  normal: { label: 'ON TRACK', color: '#22c55e' },
  'at-risk': { label: 'AT RISK', color: '#f59e0b' },
  delayed: { label: 'DELAYED', color: '#ef4444' },
  rerouted: { label: 'REROUTED', color: '#a78bfa' },
  delivered: { label: 'DELIVERED', color: '#3b82f6' },
}

const STATUS_ORDER: PackageStatus[] = ['delayed', 'at-risk', 'rerouted', 'normal', 'delivered']

function RouteArrow({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 18 8" className="w-4 h-3 flex-shrink-0">
      <path d="M0 4h13M10 1.5l3 2.5-3 2.5" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="h-1 rounded overflow-hidden" style={{ background: '#1a2845' }}>
      <div
        className="h-full rounded"
        style={{ width: `${Math.round(progress * 100)}%`, background: color }}
      />
    </div>
  )
}

export default function RiskAlertsPanel({
  packages,
  hubs,
  selectedPackageId,
  onSelectPackage,
}: RiskAlertsPanelProps) {
  const getHub = (id: string) => hubs.find(h => h.id === id)

  const sortedPackages = [...packages].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )

  const alertPackages = sortedPackages.filter(
    p => p.status === 'delayed' || p.status === 'at-risk' || p.status === 'rerouted'
  )
  const normalPackages = sortedPackages.filter(
    p => p.status === 'normal' || p.status === 'delivered'
  )

  return (
    <div
      className="w-72 flex flex-col rounded overflow-hidden flex-shrink-0"
      style={{ background: '#0c1328', border: '1px solid #1a2845' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2845' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#dde3f0' }}>
            Risk Alerts
          </span>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono"
            style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444' }}
          >
            {alertPackages.length}
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: '#3a4a5a' }}>
          16:42 IST
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* Alert section label */}
        <div className="px-1 pb-0.5 pt-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6e8a' }}>
            Active Alerts
          </span>
        </div>

        {alertPackages.map(pkg => {
          const from = getHub(pkg.fromId)
          const to = getHub(pkg.toId)
          const risk = RISK_STYLES[pkg.riskLevel]
          const status = STATUS_STYLES[pkg.status]
          const isSelected = selectedPackageId === pkg.id

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(isSelected ? null : pkg.id)}
              className="rounded p-3 cursor-pointer transition-all hover:brightness-110"
              style={{
                background: risk.bg,
                border: `1px solid ${isSelected ? '#f59e0b' : risk.border}`,
                boxShadow: pkg.riskLevel === 'CRITICAL' ? `0 0 12px ${risk.border}40` : (isSelected ? '0 0 0 1px #f59e0b33' : undefined),
                animation: pkg.riskLevel === 'CRITICAL' ? 'pulse 2s infinite' : 'none'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold" style={{ color: '#dde3f0' }}>
                  {pkg.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                    style={{
                      color: risk.text,
                      background: risk.badge,
                      border: `1px solid ${risk.text}60`,
                      fontSize: '10px',
                    }}
                  >
                    {pkg.riskLevel}
                  </span>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-1.5 mb-2.5 font-medium">
                <span className="text-xs" style={{ color: '#8899bb' }}>
                  {from?.name ?? pkg.fromId}
                </span>
                <RouteArrow color={status.color} />
                <span className="text-xs" style={{ color: '#8899bb' }}>
                  {to?.name ?? pkg.toId}
                </span>
              </div>

              {/* Progress */}
              <ProgressBar progress={pkg.progress} color={status.color} />

              {/* ETA / Deadline */}
              <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: '#3a4a5a' }}>
                    Current ETA
                  </div>
                  <div className="font-mono text-xs font-medium" style={{ color: '#dde3f0' }}>
                    {pkg.eta}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: '#3a4a5a' }}>
                    Deadline
                  </div>
                  <div className="font-mono text-xs font-bold" style={{ color: risk.text }}>
                    {pkg.deadline}
                  </div>
                </div>
              </div>

              {/* Status + reason */}
              <div className="flex items-start gap-2 flex-wrap mt-3 bg-black/20 p-2 rounded">
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded-sm whitespace-nowrap"
                  style={{ color: status.color, background: `${status.color}15`, fontSize: '10px' }}
                >
                  {status.label}
                </span>
                {pkg.delayReason && (
                  <span className="text-xs leading-tight font-medium" style={{ color: '#dde3f0' }}>
                    {pkg.delayReason}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* All shipments divider */}
        <div
          className="flex items-center gap-2 pt-2 pb-1"
          style={{ borderTop: '1px solid #1a2845' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6e8a' }}>
            All Shipments
          </span>
          <span className="font-mono text-xs" style={{ color: '#3a4a5a' }}>
            ({normalPackages.length})
          </span>
        </div>

        {normalPackages.map(pkg => {
          const from = getHub(pkg.fromId)
          const to = getHub(pkg.toId)
          const status = STATUS_STYLES[pkg.status]
          const isSelected = selectedPackageId === pkg.id

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(isSelected ? null : pkg.id)}
              className="rounded p-2 cursor-pointer transition-colors"
              style={{
                background: '#0e1530',
                border: `1px solid ${isSelected ? '#f59e0b' : '#1a2845'}`,
              }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-mono text-xs" style={{ color: '#8899bb' }}>
                  {pkg.id}
                </span>
                <span className="font-mono text-xs font-medium" style={{ color: status.color, fontSize: '10px' }}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs" style={{ color: '#3a4a5a' }}>
                  {from?.name} → {to?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar progress={pkg.progress} color={status.color} />
                </div>
                <span className="font-mono text-xs flex-shrink-0" style={{ color: '#5a6e8a' }}>
                  ETA {pkg.eta}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
