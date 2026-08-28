import type { Package, Hub, RiskLevel, PackageStatus } from '../App'

interface RiskMonitorProps {
  packages: Package[]
  hubs: Hub[]
}

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  LOW: { bg: '#052e16', border: '#14532d', text: '#22c55e' },
  MEDIUM: { bg: '#1c1000', border: '#713f12', text: '#f59e0b' },
  HIGH: { bg: '#200606', border: '#991b1b', text: '#ef4444' },
  CRITICAL: { bg: '#160000', border: '#7f1d1d', text: '#ff3333' },
}

export default function RiskMonitor({ packages, hubs }: RiskMonitorProps) {
  const getHub = (id: string) => hubs.find(h => h.id === id)
  
  // Filter for medium/high/critical risks
  const alertPackages = packages.filter(p => p.riskLevel !== 'LOW').sort((a, b) => {
    const riskScore = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 }
    return riskScore[b.riskLevel] - riskScore[a.riskLevel]
  })

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#060b1e] text-[#dde3f0] overflow-hidden min-h-0">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-wide flex items-center gap-3" style={{ color: '#dde3f0' }}>
            Risk Monitor
            <span className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" style={{ background: '#ef4444' }}></span>
          </h2>
          <p className="text-sm font-mono mt-1" style={{ color: '#5a6e8a' }}>Active threat tracking and delay escalation management.</p>
        </div>
        <div className="px-4 py-2 rounded border text-sm font-bold font-mono flex items-center gap-2 shadow-sm" style={{ background: '#200606', borderColor: '#991b1b', color: '#ef4444' }}>
          Active Alerts: <span>{alertPackages.length}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto rounded-lg">
        {alertPackages.length === 0 ? (
          <div className="flex items-center justify-center h-full rounded border border-dashed" style={{ borderColor: '#1a2845', background: '#0c1328' }}>
            <span className="text-sm font-mono" style={{ color: '#22c55e' }}>No active risks detected. Network is healthy.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
            {alertPackages.map(pkg => {
              const from = getHub(pkg.fromId)
              const to = getHub(pkg.toId)
              const risk = RISK_STYLES[pkg.riskLevel]
              const isCritical = pkg.riskLevel === 'CRITICAL'
              
              return (
                <div key={pkg.id} className="rounded-lg p-5 shadow-lg relative overflow-hidden" 
                  style={{ background: risk.bg, border: `1px solid ${risk.border}`, boxShadow: isCritical ? `0 0 15px ${risk.border}40` : '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  
                  {isCritical && <div className="absolute top-0 left-0 w-1 h-full bg-red-600 animate-pulse"></div>}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-mono font-bold" style={{ color: '#dde3f0' }}>{pkg.id}</h3>
                      <p className="text-sm font-medium mt-1" style={{ color: '#8899bb' }}>
                        {from?.name} <span className="mx-1" style={{ color: '#5a6e8a' }}>→</span> {to?.name}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono px-3 py-1 rounded shadow-sm border" style={{ color: risk.text, background: '#00000040', borderColor: risk.text }}>
                      {pkg.riskLevel}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded" style={{ background: '#00000030' }}>
                    <div>
                      <span className="block text-[10px] uppercase font-bold mb-1" style={{ color: '#5a6e8a' }}>Current ETA</span>
                      <span className="font-mono text-sm font-medium" style={{ color: '#dde3f0' }}>{pkg.eta}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold mb-1" style={{ color: '#5a6e8a' }}>Deadline</span>
                      <span className="font-mono text-sm font-bold" style={{ color: risk.text }}>{pkg.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="block text-[10px] uppercase font-bold mb-1.5" style={{ color: '#5a6e8a' }}>Delay Reason</span>
                    <p className="text-sm leading-snug font-medium" style={{ color: '#dde3f0' }}>{pkg.delayReason || 'Unknown transit delay.'}</p>
                  </div>
                  
                  <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: `${risk.border}60` }}>
                    <div className="text-xs font-semibold" style={{ color: '#8899bb' }}>
                      Recommended Action: <span className="font-bold ml-1" style={{ color: risk.text }}>{isCritical ? 'Use Route Planner to bypass.' : 'Monitor tracking.'}</span>
                    </div>
                    <button className="px-4 py-1.5 rounded text-xs font-bold font-mono shadow-md transition-transform active:scale-95" 
                      style={{ background: risk.text, color: '#ffffff' }}
                      onClick={() => alert(`Switching to Route Planner for ${pkg.id}`)}>
                      RESOLVE
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
