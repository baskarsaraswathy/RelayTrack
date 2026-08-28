import { useState } from 'react'

export default function Settings() {
  const [refreshInterval, setRefreshInterval] = useState('10')
  const [demoMode, setDemoMode] = useState(true)

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#060b1e] text-[#dde3f0] overflow-hidden min-h-0">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold font-mono tracking-wide" style={{ color: '#dde3f0' }}>System Settings</h2>
        <p className="text-sm font-mono mt-1" style={{ color: '#5a6e8a' }}>Configure application display and backend connection parameters.</p>
      </div>
      
      <div className="max-w-3xl space-y-6">
        
        {/* System Status Read-Only */}
        <div className="rounded-lg shadow-lg border p-6" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-b pb-2" style={{ color: '#5a6e8a', borderColor: '#1a2845' }}>Core Connections</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-1 font-semibold" style={{ color: '#8899bb' }}>FastAPI Backend</div>
              <div className="font-mono text-sm flex items-center gap-2" style={{ color: '#22c55e' }}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span> ONLINE
              </div>
            </div>
            <div>
              <div className="text-xs mb-1 font-semibold" style={{ color: '#8899bb' }}>Supabase Pooler</div>
              <div className="font-mono text-sm flex items-center gap-2" style={{ color: '#22c55e' }}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span> CONNECTED
              </div>
            </div>
            <div>
              <div className="text-xs mb-1 font-semibold" style={{ color: '#8899bb' }}>Active Data Mode</div>
              <div className="font-mono text-sm" style={{ color: '#dde3f0' }}>Production Replica</div>
            </div>
          </div>
        </div>

        {/* UI Configuration */}
        <div className="rounded-lg shadow-lg border p-6" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-b pb-2" style={{ color: '#5a6e8a', borderColor: '#1a2845' }}>Interface Preferences</h3>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm" style={{ color: '#dde3f0' }}>Dashboard Refresh Interval</div>
                <div className="text-xs mt-0.5" style={{ color: '#8899bb' }}>How often the Command Center polls for new live data.</div>
              </div>
              <select 
                value={refreshInterval}
                onChange={e => setRefreshInterval(e.target.value)}
                className="bg-[#060b1e] border rounded px-3 py-1.5 text-sm font-mono outline-none cursor-pointer"
                style={{ borderColor: '#1a2845', color: '#dde3f0' }}
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm" style={{ color: '#dde3f0' }}>Demo Mode Presets</div>
                <div className="text-xs mt-0.5" style={{ color: '#8899bb' }}>Enable specific mock values for missing DB constraints.</div>
              </div>
              <button 
                onClick={() => setDemoMode(!demoMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${demoMode ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${demoMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t" style={{ borderColor: '#1a2845' }}>
            <p className="text-xs font-mono font-medium flex gap-2" style={{ color: '#ef4444' }}>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0"><path d="M8 1L1 13h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Sensitive environment variables (.env) and database credentials are intentionally hidden from this view.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
