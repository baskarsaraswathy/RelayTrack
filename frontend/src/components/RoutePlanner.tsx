import { useEffect, useState } from 'react'
import type { Package, Hub, RiskLevel } from '../App'
import { fetchRoutePlan, RoutePlan, queueDispatchAction } from '../services/api'

interface RoutePlannerProps {
  packages: Package[]
  hubs: Hub[]
  selectedPackageId: string | null
}

const RISK_STYLES: Record<RiskLevel, { text: string; bg: string }> = {
  LOW: { text: '#22c55e', bg: '#052e16' },
  MEDIUM: { text: '#f59e0b', bg: '#1c1000' },
  HIGH: { text: '#ef4444', bg: '#200606' },
  CRITICAL: { text: '#ff3333', bg: '#160000' },
}

export default function RoutePlanner({ packages, hubs, selectedPackageId }: RoutePlannerProps) {
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dispatchState, setDispatchState] = useState<'idle' | 'analyzing' | 'validating' | 'calculating' | 'approved' | 'success'>('idle')

  const selectedPkg = packages.find(p => p.id === selectedPackageId)
  
  useEffect(() => {
    if (selectedPackageId) {
      setIsLoading(true)
      setDispatchState('idle')
      fetchRoutePlan(selectedPackageId).then(plan => {
        setRoutePlan(plan)
        setIsLoading(false)
      })
    } else {
      setRoutePlan(null)
      setDispatchState('idle')
    }
  }, [selectedPackageId])

  const handleDispatch = () => {
    setDispatchState('analyzing')
    setTimeout(() => setDispatchState('validating'), 800)
    setTimeout(() => setDispatchState('calculating'), 1600)
    setTimeout(() => setDispatchState('approved'), 2400)
    setTimeout(() => {
      setDispatchState('success')
      if (selectedPkg && routePlan) {
        queueDispatchAction(selectedPkg.id, routePlan.recommended_path).catch(console.error);
      }
    }, 3200)
  }

  return (
    <div
      className="w-72 flex flex-col rounded overflow-hidden flex-shrink-0"
      style={{ background: '#0c1328', border: '1px solid #1a2845' }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2845' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#dde3f0' }}>
            Route Planner
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!selectedPkg ? (
          <div className="text-sm text-center py-8" style={{ color: '#5a6e8a' }}>
            Select a package from the map to view intelligent routing options.
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a6e8a' }}>
                Selected Package
              </div>
              <div className="font-mono font-semibold" style={{ color: '#dde3f0' }}>
                {selectedPkg.id}
              </div>
              <div className="flex gap-2 items-center mt-2">
                <span className="text-xs uppercase px-1.5 py-0.5 rounded font-mono" style={{
                  color: RISK_STYLES[selectedPkg.riskLevel].text,
                  background: RISK_STYLES[selectedPkg.riskLevel].bg,
                  border: `1px solid ${RISK_STYLES[selectedPkg.riskLevel].text}40`
                }}>
                  Current Risk: {selectedPkg.riskLevel}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-sm text-center py-4 animate-pulse" style={{ color: '#4d7ef2' }}>
                Calculating optimal route...
              </div>
            ) : routePlan ? (
              <div className="space-y-4 mt-6">
                <div>
                  <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#5a6e8a' }}>
                    Recommended Path
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-[#1a2845]"></div>
                    {routePlan.recommended_path_names.map((name, i) => (
                      <div key={i} className="flex items-center gap-3 relative z-10">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                             style={{ background: i === 0 || i === routePlan.recommended_path_names.length - 1 ? '#4d7ef2' : '#152040', color: '#fff' }}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#dde3f0' }}>
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded mt-4 shadow-sm" style={{ background: '#1c1000', border: '1px solid #713f12' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-amber-500">
                      <path d="M8 1L1 13h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>
                      Reason for Diversion
                    </div>
                  </div>
                  <div className="text-sm font-medium leading-snug" style={{ color: '#dde3f0' }}>
                    {routePlan.reason}
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 mt-4 rounded text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${dispatchState === 'success' ? 'cursor-default' : 'hover:brightness-110 active:scale-95 cursor-pointer'}`}
                  style={{ 
                    background: dispatchState === 'success' ? '#052e16' : '#4d7ef2', 
                    color: dispatchState === 'success' ? '#22c55e' : '#ffffff', 
                    border: dispatchState === 'success' ? '1px solid #14532d' : 'none',
                    boxShadow: dispatchState === 'success' ? 'none' : '0 0 15px rgba(77, 126, 242, 0.3)' 
                  }}
                  onClick={dispatchState === 'idle' ? handleDispatch : undefined}
                  disabled={dispatchState !== 'idle'}
                >
                  {dispatchState === 'idle' && 'DISPATCH NEW ROUTE'}
                  {dispatchState === 'analyzing' && <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>ANALYZING ROUTE...</>}
                  {dispatchState === 'validating' && <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>VALIDATING HUBS...</>}
                  {dispatchState === 'calculating' && <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>CALCULATING ETA...</>}
                  {dispatchState === 'approved' && <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>ROUTE APPROVED...</>}
                  {dispatchState === 'success' && 'DISPATCH SUCCESSFUL'}
                </button>
                {dispatchState === 'success' && (
                  <div className="text-[10px] text-center mt-2 font-medium" style={{ color: '#5a6e8a' }}>
                    *Action queued. Check Offline Sync for status.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-center py-4 text-red-400">
                Failed to compute alternative route.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
