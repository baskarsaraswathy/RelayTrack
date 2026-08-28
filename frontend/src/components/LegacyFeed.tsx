import { useState } from 'react'
import type { ActivityEvent } from '../App'

interface LegacyFeedProps {
  events: ActivityEvent[]
}

type FilterType = 'ALL' | 'INCIDENTS' | 'RFID'

export default function LegacyFeed({ events }: LegacyFeedProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true
    if (filter === 'INCIDENTS') return e.type === 'incident'
    if (filter === 'RFID') return e.type === 'rfid'
    return true
  })

  // Simulated severity generation if not directly provided by backend typing, but we adapt based on string parsing for hackathon purposes.
  const getSeverity = (msg: string) => {
    const m = msg.toLowerCase()
    if (m.includes('severe') || m.includes('critical') || m.includes('blocked')) return 'CRITICAL'
    if (m.includes('heavy') || m.includes('accident') || m.includes('delay')) return 'HIGH'
    if (m.includes('moderate') || m.includes('slow')) return 'MEDIUM'
    return 'LOW'
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#060b1e] text-[#dde3f0] overflow-hidden min-h-0">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wide" style={{ color: '#dde3f0' }}>Legacy Systems Feed</h2>
          <p className="text-sm font-mono mt-1" style={{ color: '#5a6e8a' }}>Unified timeline of historical RFID scans and legacy queue messages.</p>
        </div>
        <div className="px-3 py-1.5 rounded border text-sm font-mono shadow-sm" style={{ background: '#0c1328', borderColor: '#1a2845', color: '#8899bb' }}>
          Total Events: <span className="font-bold text-white">{events.length}</span>
        </div>
      </div>

      {/* Filter / Operations Bar */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 bg-[#0c1328] p-2 rounded-lg border shadow-sm" style={{ borderColor: '#1a2845' }}>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded text-xs font-bold font-mono transition-colors border ${filter === 'ALL' ? 'bg-[#1e3060] text-white border-[#2a3a5a]' : 'bg-transparent text-[#5a6e8a] border-transparent hover:bg-[#152040]'}`}
          >
            ALL EVENTS
          </button>
          <button 
            onClick={() => setFilter('INCIDENTS')}
            className={`px-4 py-1.5 rounded text-xs font-bold font-mono transition-colors border ${filter === 'INCIDENTS' ? 'bg-[#4a1111] text-[#ef4444] border-[#7f1d1d]' : 'bg-transparent text-[#5a6e8a] border-transparent hover:bg-[#152040]'}`}
          >
            INCIDENTS
          </button>
          <button 
            onClick={() => setFilter('RFID')}
            className={`px-4 py-1.5 rounded text-xs font-bold font-mono transition-colors border ${filter === 'RFID' ? 'bg-[#1c1000] text-[#f59e0b] border-[#713f12]' : 'bg-transparent text-[#5a6e8a] border-transparent hover:bg-[#152040]'}`}
          >
            RFID SCANS
          </button>
        </div>
        <div className="text-xs font-mono font-medium px-2" style={{ color: '#5a6e8a' }}>
          Showing {filteredEvents.length} events
        </div>
      </div>
      
      {/* Timeline */}
      <div className="flex-1 overflow-auto rounded-lg shadow-lg border p-6 relative" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
        
        {filteredEvents.length > 0 && (
          <div className="absolute left-[39px] top-8 bottom-8 w-px" style={{ background: '#1a2845' }}></div>
        )}
        
        <div className="space-y-6">
          {filteredEvents.map((event) => {
            const isIncident = event.type === 'incident'
            const severity = isIncident ? getSeverity(event.message) : 'LOW'
            
            // Incident Styling
            let bg = '#152040'
            let border = '#1a2845'
            let badgeBg = '#1e3060'
            let badgeText = '#4d7ef2'
            let title = 'RFID Scan'
            
            if (isIncident) {
              title = 'Traffic / Network Incident'
              if (severity === 'CRITICAL') { bg = '#160000'; border = '#991b1b'; badgeBg = '#ef4444'; badgeText = '#ffffff' }
              else if (severity === 'HIGH') { bg = '#200606'; border = '#7f1d1d'; badgeBg = '#4a1111'; badgeText = '#ef4444' }
              else if (severity === 'MEDIUM') { bg = '#1c1000'; border = '#713f12'; badgeBg = '#4d2a00'; badgeText = '#f59e0b' }
              else { bg = '#150808'; border = '#4a1111'; badgeBg = '#2a0808'; badgeText = '#ef4444' }
            } else if (event.type === 'rfid') {
              title = 'RFID Hub Registration'
              bg = '#0c1328'
              border = '#1a2845'
              badgeBg = '#1c1000'
              badgeText = '#f59e0b'
            }
            
            return (
              <div key={event.id} className="flex gap-6 relative z-10 transition-transform hover:translate-x-1 cursor-default">
                
                {/* Timeline Node */}
                <div className="flex-shrink-0 w-4 flex justify-center pt-2">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 ${severity === 'CRITICAL' ? 'animate-pulse' : ''}`} 
                    style={{ 
                      background: bg, 
                      borderColor: badgeText, 
                      boxShadow: (severity === 'CRITICAL' || severity === 'HIGH') ? `0 0 8px ${badgeText}80` : 'none' 
                    }}>
                  </div>
                </div>
                
                {/* Event Card */}
                <div className="flex-1 rounded-lg p-5 border shadow-sm" style={{ background: bg, borderColor: border }}>
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 border-b pb-3" style={{ borderColor: `${border}80` }}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold px-2.5 py-0.5 rounded text-[10px] uppercase shadow-sm border" 
                        style={{ color: badgeText, background: badgeBg, borderColor: border, letterSpacing: '0.05em' }}>
                        {isIncident ? 'INCIDENT' : 'RFID SCAN'}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: '#dde3f0' }}>{title}</span>
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: '#8899bb' }}>{event.timestamp}</span>
                  </div>
                  
                  {/* Body */}
                  <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: '#dde3f0' }}>
                    {event.message}
                  </p>
                  
                  {/* Footer / Metadata */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono" style={{ color: '#8899bb' }}>
                    {event.packageId && (
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: '#5a6e8a' }}>ID:</span>
                        <span className="font-bold" style={{ color: '#dde3f0' }}>{event.packageId}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: '#5a6e8a' }}>Loc:</span>
                      <span className="font-medium" style={{ color: '#dde3f0' }}>{event.location}</span>
                    </div>
                    {isIncident && (
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: '#5a6e8a' }}>Severity:</span>
                        <span className="font-bold" style={{ color: badgeText }}>{severity}</span>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            )
          })}
          
          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#152040', color: '#5a6e8a' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: '#dde3f0' }}>NO LEGACY EVENTS</h3>
              <p className="text-sm font-medium" style={{ color: '#5a6e8a' }}>Historical RFID scans and system incidents will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
