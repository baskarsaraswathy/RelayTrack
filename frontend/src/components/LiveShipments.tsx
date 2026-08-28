import React, { useState } from 'react'
import type { Package, Hub, RiskLevel, PackageStatus } from '../App'

interface LiveShipmentsProps {
  packages: Package[]
  hubs: Hub[]
  selectedPackageId: string | null
  onSelectPackage: (id: string | null) => void
  onNavigate: (tab: string) => void
}

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  LOW: { bg: '#052e16', border: '#14532d', text: '#22c55e' },
  MEDIUM: { bg: '#1c1000', border: '#713f12', text: '#f59e0b' },
  HIGH: { bg: '#200606', border: '#991b1b', text: '#ef4444' },
  CRITICAL: { bg: '#160000', border: '#7f1d1d', text: '#ff3333' },
}

const STATUS_STYLES: Record<PackageStatus, { label: string; color: string }> = {
  normal: { label: 'ON TRACK', color: '#22c55e' },
  'at-risk': { label: 'AT RISK', color: '#f59e0b' },
  delayed: { label: 'DELAYED', color: '#ef4444' },
  rerouted: { label: 'REROUTED', color: '#a78bfa' },
  delivered: { label: 'DELIVERED', color: '#3b82f6' },
}

export default function LiveShipments({ packages, hubs, selectedPackageId, onSelectPackage, onNavigate }: LiveShipmentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | PackageStatus>('ALL')
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL')

  const getHub = (id: string) => hubs.find(h => h.id === id)

  const filteredPackages = packages.filter(pkg => {
    const matchSearch = pkg.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || pkg.status === statusFilter
    const matchRisk = riskFilter === 'ALL' || pkg.riskLevel === riskFilter
    return matchSearch && matchStatus && matchRisk
  })

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#060b1e] text-[#dde3f0] overflow-hidden min-h-0">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold font-mono tracking-wide flex items-center gap-3" style={{ color: '#dde3f0' }}>
              Live Shipments
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-[0_0_8px_#22c55e40]" style={{ background: '#052e16', color: '#22c55e', border: '1px solid #14532d' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                LIVE
              </span>
            </h2>
            <p className="text-sm font-mono mt-1" style={{ color: '#5a6e8a' }}>Real-time overview of all active logistics packages.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded border text-sm font-mono flex items-center gap-2 shadow-sm" style={{ background: '#0c1328', borderColor: '#1a2845', color: '#8899bb' }}>
            Total Active: <span className="font-bold text-white">{packages.length}</span>
          </div>
        </div>
      </div>
      
      {/* Filters Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-lg border mb-4 flex-shrink-0" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search package ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#060b1e] border rounded px-3 py-1.5 text-sm font-mono outline-none w-48 transition-colors focus:border-blue-500"
            style={{ borderColor: '#1a2845', color: '#dde3f0' }}
          />
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#060b1e] border rounded px-3 py-1.5 text-sm font-mono outline-none cursor-pointer"
            style={{ borderColor: '#1a2845', color: '#8899bb' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="normal">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="rerouted">Rerouted</option>
            <option value="delivered">Delivered</option>
          </select>
          
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="bg-[#060b1e] border rounded px-3 py-1.5 text-sm font-mono outline-none cursor-pointer"
            style={{ borderColor: '#1a2845', color: '#8899bb' }}
          >
            <option value="ALL">All Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>
        </div>
        
        <div className="text-xs font-mono font-medium" style={{ color: '#5a6e8a' }}>
          Showing {filteredPackages.length} of {packages.length} shipments
        </div>
      </div>
      
      {/* Table Area */}
      <div className="flex-1 overflow-auto rounded-lg shadow-lg border" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="sticky top-0 z-10 text-xs font-semibold uppercase tracking-wider shadow-sm" style={{ background: '#152040', color: '#8899bb' }}>
              <th className="p-4 border-b border-[#1a2845]">Package ID</th>
              <th className="p-4 border-b border-[#1a2845]">Origin</th>
              <th className="p-4 border-b border-[#1a2845]">Destination</th>
              <th className="p-4 border-b border-[#1a2845]">Status</th>
              <th className="p-4 border-b border-[#1a2845]">Risk Level</th>
              <th className="p-4 border-b border-[#1a2845]">Progress</th>
              <th className="p-4 border-b border-[#1a2845]">ETA</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map(pkg => {
              const from = getHub(pkg.fromId)
              const to = getHub(pkg.toId)
              const status = STATUS_STYLES[pkg.status]
              const risk = RISK_STYLES[pkg.riskLevel]
              const isSelected = pkg.id === selectedPackageId
              
              return (
                <React.Fragment key={pkg.id}>
                  <tr 
                    onClick={() => onSelectPackage(isSelected ? null : pkg.id)}
                    className="transition-colors cursor-pointer border-b last:border-b-0 group" 
                    style={{ 
                      borderColor: '#1a2845', 
                      background: isSelected ? '#152040' : '#0c1328'
                    }}
                  >
                    <td className="p-4 font-mono font-bold" style={{ color: isSelected ? '#4d7ef2' : '#dde3f0' }}>{pkg.id}</td>
                    <td className="p-4 text-sm font-medium" style={{ color: '#8899bb' }}>{from?.name ?? pkg.fromId}</td>
                    <td className="p-4 text-sm font-medium" style={{ color: '#8899bb' }}>{to?.name ?? pkg.toId}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold font-mono px-2 py-1 rounded shadow-sm whitespace-nowrap border" style={{ color: status.color, background: `${status.color}15`, borderColor: `${status.color}40` }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold font-mono px-2 py-1 rounded shadow-sm border" style={{ color: risk.text, background: risk.bg, borderColor: risk.border }}>
                        {pkg.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded overflow-hidden shadow-inner" style={{ background: '#1a2845' }}>
                          <div className="h-full rounded" style={{ width: `${Math.round(pkg.progress * 100)}%`, background: status.color }} />
                        </div>
                        <span className="text-xs font-mono font-medium" style={{ color: '#5a6e8a' }}>{Math.round(pkg.progress * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm font-medium" style={{ color: '#dde3f0' }}>
                      <div className="flex flex-col">
                        <span>{pkg.eta}</span>
                        {pkg.status === 'delayed' && pkg.delayReason && <span className="text-[10px] text-red-400 font-bold">{pkg.delayReason}</span>}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Row */}
                  {isSelected && (
                    <tr style={{ background: '#090e1c' }}>
                      <td colSpan={7} className="p-0 border-b" style={{ borderColor: '#1a2845' }}>
                        <div className="p-4 mx-4 my-3 rounded border shadow-inner flex justify-between items-start" style={{ background: '#060b1e', borderColor: '#1a2845' }}>
                          
                          <div className="space-y-3 flex-1">
                            <div>
                              <div className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: '#5a6e8a' }}>Current Location Status</div>
                              <div className="text-sm font-medium" style={{ color: '#dde3f0' }}>In transit between <span className="font-bold">{from?.name}</span> and <span className="font-bold">{to?.name}</span>.</div>
                            </div>
                            
                            {(pkg.riskLevel !== 'LOW' || pkg.status === 'delayed') && (
                              <div>
                                <div className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: '#ef4444' }}>Operational Alert / Delay Reason</div>
                                <div className="text-sm font-medium" style={{ color: '#8899bb' }}>{pkg.delayReason || 'Unexpected delay detected on the active corridor.'}</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-8 border-l pl-8 py-2 flex flex-col items-center justify-center min-w-[200px]" style={{ borderColor: '#1a2845' }}>
                            <div className="text-[10px] uppercase font-bold tracking-wider mb-3 text-center" style={{ color: '#8899bb' }}>Actions</div>
                            <button 
                              className="w-full px-4 py-2 rounded text-xs font-bold font-mono transition-colors shadow-md border hover:brightness-110 active:scale-95"
                              style={{ background: '#1e3060', color: '#4d7ef2', borderColor: '#2a3a5a' }}
                              onClick={(e) => { e.stopPropagation(); onNavigate('route-planner'); }}
                            >
                              OPEN ROUTE PLANNER
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            
            {/* Empty State */}
            {filteredPackages.length === 0 && (
              <tr>
                <td colSpan={7} className="p-16 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#152040', color: '#5a6e8a' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#dde3f0' }}>NO ACTIVE SHIPMENTS</h3>
                  <p className="text-sm font-medium" style={{ color: '#5a6e8a' }}>Active logistics packages matching this criteria will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
