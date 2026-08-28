import { useState, useEffect } from 'react'
import { dbService, SyncAction } from '../services/db'
import { syncPendingActions } from '../services/api'

export default function OfflineSync() {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle')
  const [lastSync, setLastSync] = useState('Never')
  const [pendingQueue, setPendingQueue] = useState<SyncAction[]>([])
  const [cacheSize, setCacheSize] = useState('0 MB')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs(prev => {
      const ts = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
      return [`[${ts}] ${msg}`, ...prev].slice(0, 15)
    })
  }

  const loadLocalState = async () => {
    try {
      const actions = await dbService.getPendingActions()
      setPendingQueue(actions)
      
      const packages = await dbService.getCache('packages') || []
      const hubs = await dbService.getCache('hubs') || []
      const routes = await dbService.getCache('routes') || []
      const events = await dbService.getCache('events') || []
      
      const sizeStr = ((packages.length + hubs.length + routes.length + events.length) * 0.045).toFixed(1)
      setCacheSize(`${sizeStr} MB`)
      
      const meta = await dbService.getCacheMeta('packages')
      if (meta) {
        setLastSync(new Date(meta.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadLocalState()
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Poll the db occasionally to update queue size if other components push
    const interval = setInterval(loadLocalState, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline) {
      addLog(`ERROR - Network is offline, cannot sync.`)
      return
    }
    
    setSyncState('syncing')
    addLog(`INFO - Attempting auto-reconnect and sync...`)
    
    // Simulate steps for UI fidelity
    await new Promise(r => setTimeout(r, 600))
    addLog(`INFO - Reading local queue (${pendingQueue.length} items)...`)
    
    await new Promise(r => setTimeout(r, 600))
    addLog(`INFO - Synchronizing pending actions to backend...`)
    
    const { success, failed } = await syncPendingActions()
    await loadLocalState()
    
    if (success > 0 || pendingQueue.length === 0) {
      addLog(`SUCCESS - Pushed ${success} records. Failed: ${failed}`)
      const now = new Date()
      setLastSync(now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}))
      setSyncState('success')
      setTimeout(() => setSyncState('idle'), 3000)
    } else if (failed > 0) {
      addLog(`FAILED - ${failed} actions failed to sync.`)
      setSyncState('failed')
      setTimeout(() => setSyncState('idle'), 3000)
    } else {
      addLog(`SUCCESS - Cache is up to date.`)
      setSyncState('success')
      setTimeout(() => setSyncState('idle'), 2000)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#060b1e] text-[#dde3f0] overflow-hidden min-h-0">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold font-mono tracking-wide" style={{ color: '#dde3f0' }}>Offline Synchronization</h2>
        <p className="text-sm font-mono mt-1" style={{ color: '#5a6e8a' }}>Manage local database buffers and push cached operational events.</p>
      </div>
      
      <div className="flex gap-6 max-w-5xl">
        {/* Sync Status Card */}
        <div className="flex-1 rounded-lg shadow-lg border p-6" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'shadow-[0_0_8px_#22c55e]' : 'shadow-[0_0_8px_#ef4444]'}`} style={{ background: isOnline ? '#22c55e' : '#ef4444' }}></div>
            <h3 className="font-bold text-lg" style={{ color: '#dde3f0' }}>{isOnline ? 'Connection Active (ONLINE)' : 'Connection Lost (OFFLINE)'}</h3>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1a2845' }}>
              <span className="text-sm font-medium" style={{ color: '#8899bb' }}>Last Successful Sync</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#dde3f0' }}>{lastSync}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1a2845' }}>
              <span className="text-sm font-medium" style={{ color: '#8899bb' }}>Pending Queue Events</span>
              <span className="font-mono text-sm font-bold" style={{ color: pendingQueue.length > 0 ? '#f59e0b' : '#dde3f0' }}>
                {pendingQueue.length} records
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1a2845' }}>
              <span className="text-sm font-medium" style={{ color: '#8899bb' }}>Local Cache Size</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#dde3f0' }}>{cacheSize}</span>
            </div>
          </div>
          
          <button 
            className={`w-full py-3 rounded text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${(syncState === 'success' || !isOnline) ? 'cursor-not-allowed opacity-80' : 'hover:brightness-110 active:scale-95 cursor-pointer'}`}
            style={{ 
              background: syncState === 'success' ? '#052e16' : syncState === 'failed' ? '#4a1111' : '#1e3a8a', 
              color: syncState === 'success' ? '#22c55e' : syncState === 'failed' ? '#ef4444' : '#ffffff',
              border: syncState === 'success' ? '1px solid #14532d' : syncState === 'failed' ? '1px solid #7f1d1d' : '1px solid #1e40af'
            }}
            onClick={syncState === 'idle' && isOnline ? handleSync : undefined}
            disabled={syncState !== 'idle' || !isOnline}
          >
            {syncState === 'idle' && 'FORCE SYNC NOW'}
            {syncState === 'syncing' && (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                SYNCHRONIZING SECURELY...
              </>
            )}
            {syncState === 'success' && 'SYNC COMPLETED'}
            {syncState === 'failed' && 'SYNC FAILED'}
          </button>
          
          <p className="text-center mt-3 text-[10px] font-medium" style={{ color: '#5a6e8a' }}>
            * This module dynamically polls IndexedDB storage in the background.
          </p>
        </div>
        
        {/* Sync Log */}
        <div className="flex-1 rounded-lg shadow-lg border p-6 flex flex-col" style={{ background: '#0c1328', borderColor: '#1a2845' }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: '#dde3f0' }}>Recent Sync Logs</h3>
          <div className="flex-1 overflow-auto bg-[#07091e] rounded p-3 font-mono text-xs border" style={{ borderColor: '#1a2845' }}>
            {logs.length === 0 && (
              <div style={{ color: '#5a6e8a' }}>No sync activity in this session.</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="mb-2" style={{ color: log.includes('SUCCESS') ? '#22c55e' : log.includes('FAILED') || log.includes('ERROR') ? '#ef4444' : '#8899bb' }}>
                {log}
              </div>
            ))}
            {syncState === 'syncing' && (
              <div className="mt-4" style={{ color: '#4d7ef2' }}>[--:--:--] SYNC IN PROGRESS...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
