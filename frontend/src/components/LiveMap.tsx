import type { Hub, Route, Package, PackageStatus } from '../App'

interface LiveMapProps {
  hubs: Hub[]
  routes: Route[]
  packages: Package[]
  selectedPackageId: string | null
  onSelectPackage: (id: string | null) => void
}

const STATUS_COLORS: Record<PackageStatus, string> = {
  normal: '#22c55e',
  'at-risk': '#f59e0b',
  delayed: '#ef4444',
  rerouted: '#a78bfa',
  delivered: '#3b82f6',
}

const ROUTE_COLORS = {
  normal: '#1e3a6a',
  congested: '#92400e',
  blocked: '#7f1d1d',
}

const ROUTE_HIGHLIGHT = {
  normal: 'none',
  congested: '#f59e0b',
  blocked: '#ef4444',
}

// Rough India landmass polygon — slightly compressed to keep southern cities visible
const INDIA_PATH =
  'M 30,200 L 43,234 L 114,250 L 158,268 L 201,318 L 243,354 L 307,390 L 350,454 L 414,440 L 457,392 L 469,374 L 477,356 L 499,322 L 585,286 L 670,234 L 670,162 L 670,108 L 542,90 L 414,74 L 329,56 L 243,38 L 158,38 L 73,74 L 30,108 L 30,162 Z'

const LEGEND_ITEMS = [
  { color: '#22c55e', label: 'Normal' },
  { color: '#f59e0b', label: 'At Risk' },
  { color: '#ef4444', label: 'Delayed' },
  { color: '#a78bfa', label: 'Rerouted' },
]

export default function LiveMap({
  hubs,
  routes,
  packages,
  selectedPackageId,
  onSelectPackage,
}: LiveMapProps) {
  const getHub = (id: string): Hub | undefined => hubs.find(h => h.id === id)

  const getPackagePos = (pkg: Package) => {
    const from = getHub(pkg.fromId)
    const to = getHub(pkg.toId)
    if (!from || !to) return null
    return {
      x: from.x + (to.x - from.x) * pkg.progress,
      y: from.y + (to.y - from.y) * pkg.progress,
    }
  }

  return (
    <div
      className="flex-1 rounded overflow-hidden relative flex flex-col min-w-0"
      style={{ background: '#07091e', border: '1px solid #1a2845' }}
    >
      {/* Map label bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2845', background: '#07091e' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#5a6e8a' }}>
            Live Transportation Map
          </span>
          <span className="flex items-center gap-1 text-xs font-mono" style={{ color: '#22c55e' }}>
            <span className="w-1.5 h-1.5 rounded-full blink-dot" style={{ background: '#22c55e' }} />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono" style={{ color: '#3a4a5a' }}>
          <span>India Network</span>
          <span style={{ color: '#1a2845' }}>|</span>
          <span>{packages.length} tracked</span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox="0 0 700 500"
          className="w-full h-full"
          style={{ display: 'block' }}
          onClick={() => onSelectPackage(null)}
        >
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="#1a2845" opacity="0.5" />
            </pattern>
            <filter id="glow-pulse" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="hub-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="map-vignette" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#07091e" stopOpacity="0" />
              <stop offset="100%" stopColor="#07091e" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          {/* Background fill */}
          <rect width="700" height="500" fill="#07091e" />

          {/* Dot grid */}
          <rect width="700" height="500" fill="url(#dot-grid)" />

          {/* India landmass polygon */}
          <path
            d={INDIA_PATH}
            fill="#0d1428"
            stroke="#1a2845"
            strokeWidth="0.8"
            opacity="0.9"
          />

          {/* Vignette */}
          <rect width="700" height="500" fill="url(#map-vignette)" />

          {/* Routes */}
          {routes.map(route => {
            const from = getHub(route.fromId)
            const to = getHub(route.toId)
            if (!from || !to) return null
            const baseColor = ROUTE_COLORS[route.status]
            const hlColor = ROUTE_HIGHLIGHT[route.status]
            return (
              <g key={route.id}>
                {/* Base line */}
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={baseColor}
                  strokeWidth={route.status === 'normal' ? 1.5 : 2.5}
                  strokeDasharray={route.status !== 'normal' ? '5 4' : undefined}
                  opacity={0.9}
                  style={{ filter: route.status !== 'normal' ? `drop-shadow(0px 0px 4px ${baseColor}80)` : 'none' }}
                />
                {/* Status highlight overlay */}
                {hlColor !== 'none' && (
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={hlColor}
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    opacity="0.8"
                  />
                )}
              </g>
            )
          })}

          {/* Package markers */}
          {packages.map(pkg => {
            const pos = getPackagePos(pkg)
            if (!pos) return null
            const color = STATUS_COLORS[pkg.status]
            const isSelected = selectedPackageId === pkg.id
            const isPulsing = pkg.status === 'at-risk' || pkg.status === 'delayed'
            const labelOffsetX = pos.x > 560 ? -72 : 12
            const labelOffsetY = pos.y > 450 ? -18 : -12

            return (
              <g
                key={pkg.id}
                onClick={e => {
                  e.stopPropagation()
                  onSelectPackage(isSelected ? null : pkg.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse rings for alerting packages */}
                {isPulsing && (
                  <>
                    <circle
                      cx={pos.x} cy={pos.y} r="12"
                      fill="none" stroke={color} strokeWidth="1"
                      className="pulse-ring"
                    />
                    <circle
                      cx={pos.x} cy={pos.y} r="18"
                      fill="none" stroke={color} strokeWidth="0.6"
                      className="pulse-ring-outer"
                    />
                  </>
                )}
                {/* Selected ring */}
                {isSelected && (
                  <circle
                    cx={pos.x} cy={pos.y} r="10"
                    fill="none" stroke="#fff" strokeWidth="1.5"
                    opacity="0.5"
                  />
                )}
                {/* Package dot */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isSelected ? 7 : 5}
                  fill={color}
                  stroke={isSelected ? '#fff' : '#07091e'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  filter={isPulsing ? 'url(#glow-pulse)' : undefined}
                />
                {/* ID label on hover/select */}
                {isSelected && (
                  <g transform={`translate(${pos.x + labelOffsetX}, ${pos.y + labelOffsetY})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      x="0" y="0" width="66" height="18"
                      fill="#0c1328" rx="3"
                      stroke="#4d7ef2" strokeWidth="1.5"
                    />
                    <text
                      x="4" y="12.5"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                    >
                      {pkg.id}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Hub markers */}
          {hubs.map(hub => {
            const isCongested = hub.status === 'congested'
            const hubColor = isCongested ? '#f59e0b' : '#3b82f6'
            const ringColor = isCongested ? '#92400e' : '#1e3a6a'
            return (
              <g key={hub.id}>
                {/* Outer ring */}
                <circle
                  cx={hub.x} cy={hub.y} r="16"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="1"
                  opacity="0.4"
                />
                {/* Inner ring */}
                <circle
                  cx={hub.x} cy={hub.y} r="10"
                  fill={isCongested ? '#1a0d00' : '#0c1328'}
                  stroke={isCongested ? '#92400e' : '#1e3a6a'}
                  strokeWidth="1.5"
                  filter="url(#hub-glow)"
                />
                {/* Center dot */}
                <circle
                  cx={hub.x} cy={hub.y} r="3"
                  fill={hubColor}
                />
                {/* Hub label */}
                <text
                  x={hub.x}
                  y={hub.y + 26}
                  textAnchor="middle"
                  fill={isCongested ? '#f59e0b' : '#8899bb'}
                  fontSize="9"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="600"
                  letterSpacing="0.3"
                >
                  {hub.name}
                </text>
                {/* Package count badge */}
                <text
                  x={hub.x}
                  y={hub.y + 35}
                  textAnchor="middle"
                  fill={isCongested ? '#92400e' : '#3a4a5a'}
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {hub.packagesCount} pkgs
                </text>
                {/* Congested indicator */}
                {isCongested && (
                  <text
                    x={hub.x + 14}
                    y={hub.y - 10}
                    fill="#f59e0b"
                    fontSize="8"
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="700"
                  >
                    CONG
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend panel */}
          <g transform="translate(16, 438)">
            <rect x="0" y="-6" width="232" height="56" fill="#07091e" rx="3" opacity="0.92" />
            <rect x="0" y="-6" width="232" height="56" fill="none" rx="3" stroke="#1a2845" strokeWidth="1" />
            <text
              x="8" y="8"
              fill="#3a4a5a"
              fontSize="7"
              fontFamily="'DM Sans', sans-serif"
              fontWeight="600"
              letterSpacing="0.9"
            >
              PACKAGE STATUS
            </text>
            {LEGEND_ITEMS.map(({ color, label }, i) => (
              <g key={label} transform={`translate(${i * 56 + 8}, 22)`}>
                <circle cx="5" cy="0" r="4" fill={color} />
                <text
                  x="13" y="4"
                  fill="#8899bb"
                  fontSize="7.5"
                  fontFamily="'DM Sans', sans-serif"
                >
                  {label}
                </text>
              </g>
            ))}
            <g transform="translate(8, 40)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#1e3a6a" strokeWidth="1.5" />
              <text x="18" y="4" fill="#5a6e8a" fontSize="7.5" fontFamily="'DM Sans', sans-serif">Normal route</text>
            </g>
            <g transform="translate(88, 40)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#92400e" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="18" y="4" fill="#5a6e8a" fontSize="7.5" fontFamily="'DM Sans', sans-serif">Congested</text>
            </g>
            <g transform="translate(160, 40)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#7f1d1d" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="18" y="4" fill="#5a6e8a" fontSize="7.5" fontFamily="'DM Sans', sans-serif">Blocked</text>
            </g>
          </g>

          {/* Hub legend */}
          <g transform="translate(16, 396)">
            <g>
              <circle cx="5" cy="4" r="5" fill="#0c1328" stroke="#1e3a6a" strokeWidth="1.2" />
              <circle cx="5" cy="4" r="1.8" fill="#3b82f6" />
              <text x="14" y="8" fill="#5a6e8a" fontSize="7.5" fontFamily="'DM Sans', sans-serif">Hub active</text>
            </g>
            <g transform="translate(80, 0)">
              <circle cx="5" cy="4" r="5" fill="#1a0d00" stroke="#92400e" strokeWidth="1.2" />
              <circle cx="5" cy="4" r="1.8" fill="#f59e0b" />
              <text x="14" y="8" fill="#5a6e8a" fontSize="7.5" fontFamily="'DM Sans', sans-serif">Hub congested</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
