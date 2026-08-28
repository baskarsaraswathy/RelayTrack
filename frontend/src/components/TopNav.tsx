interface TopNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center' },
  { id: 'live-shipments', label: 'Live Shipments' },
  { id: 'risk-monitor', label: 'Risk Monitor' },
  { id: 'route-planner', label: 'Route Planner' },
  { id: 'legacy-feed', label: 'Legacy Feed' },
  { id: 'offline-sync', label: 'Offline Sync' },
  { id: 'settings', label: 'Settings' },
]

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <nav
      className="flex items-center h-12 px-4 flex-shrink-0"
      style={{ background: '#06091a', borderBottom: '1px solid #1a2845' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6 flex-shrink-0">
        <div
          className="w-7 h-7 flex items-center justify-center rounded"
          style={{ background: '#f59e0b' }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path
              d="M10 2L3 11h6l-1 7 9-11h-6l1-7z"
              fill="#06091a"
            />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: '#f59e0b' }}
            >
              RelayTrack
            </span>
            <span className="text-xs" style={{ color: '#3a4a5a', fontSize: '9px', letterSpacing: '0.08em' }}>
              SMART DELIVERY & DELAY TRACKER
            </span>
          </div>
          <span className="text-xs mt-1" style={{ color: '#5a6e8a', fontSize: '10px' }}>
            Predict delays. Detect risks. Reroute smarter.
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 mx-4 flex-shrink-0" style={{ background: '#1a2845' }} />

      {/* Nav items */}
      <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all"
            style={
              activeTab === item.id
                ? {
                    background: '#152040',
                    color: '#dde3f0',
                    border: '1px solid #1e3060',
                  }
                : {
                    background: 'transparent',
                    color: '#5a6e8a',
                    border: '1px solid transparent',
                  }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full blink-dot"
            style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e88' }}
          />
          <span className="text-xs font-mono" style={{ color: '#22c55e', letterSpacing: '0.08em' }}>
            ONLINE
          </span>
        </div>

        <div className="w-px h-5" style={{ background: '#1a2845' }} />

        {/* Timestamp */}
        <span className="text-xs font-mono hidden lg:block" style={{ color: '#3a4a5a' }}>
          16:42:31
        </span>

        <div className="w-px h-5 hidden lg:block" style={{ background: '#1a2845' }} />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background: '#152040', border: '1px solid #1a2845', color: '#8899bb' }}
          >
            RK
          </div>
          <span className="text-[10px] hidden xl:block truncate max-w-[200px]" style={{ color: '#8899bb', letterSpacing: '0.02em' }}>
            Smart Delivery & Delay Tracker
          </span>
        </div>
      </div>
    </nav>
  )
}
