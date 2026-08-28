import { useState, useEffect } from 'react'
import TopNav from './components/TopNav'
import KPICards from './components/KPICards'
import LiveMap from './components/LiveMap'
import RiskAlertsPanel from './components/RiskAlertsPanel'
import RoutePlanner from './components/RoutePlanner'
import ActivityFeed from './components/ActivityFeed'
import LiveShipments from './components/LiveShipments'
import RiskMonitor from './components/RiskMonitor'
import LegacyFeed from './components/LegacyFeed'
import OfflineSync from './components/OfflineSync'
import Settings from './components/Settings'
import { fetchHubs, fetchRoutes, fetchPackages, fetchActivityEvents, syncPendingActions } from './services/api'

export type PackageStatus = 'normal' | 'at-risk' | 'delayed' | 'rerouted' | 'delivered'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Hub {
  id: string
  name: string
  x: number
  y: number
  packagesCount: number
  status: 'active' | 'congested' | 'offline'
}

export interface Route {
  id: string
  fromId: string
  toId: string
  status: 'normal' | 'congested' | 'blocked'
  activePackages: number
}

export interface Package {
  id: string
  fromId: string
  toId: string
  status: PackageStatus
  progress: number
  eta: string
  deadline: string
  riskLevel: RiskLevel
  delayReason?: string
  weight: string
  type: string
}

export interface ActivityEvent {
  id: string
  timestamp: string
  type: 'arrival' | 'departure' | 'incident' | 'reroute' | 'rfid' | 'offline' | 'sync'
  packageId?: string
  message: string
  location: string
}

export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('command-center')

  const [hubs, setHubs] = useState<Hub[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [events, setEvents] = useState<ActivityEvent[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      await syncPendingActions();
      await loadData();
      setIsSyncing(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    try {
      const [hubsData, routesData, packagesData, eventsData] = await Promise.all([
        fetchHubs(),
        fetchRoutes(),
        fetchPackages(),
        fetchActivityEvents()
      ])

      // Compute activePackages for routes and packagesCount for hubs
      const hubsMap = new Map(hubsData.map(h => [h.id, { ...h, packagesCount: 0 }]))
      const routesMap = new Map(routesData.map(r => [`${r.fromId}-${r.toId}`, { ...r, activePackages: 0 }]))

      packagesData.forEach(p => {
        const hub = hubsMap.get(p.fromId)
        if (hub) hub.packagesCount++
        
        const routeKey = `${p.fromId}-${p.toId}`
        const route = routesMap.get(routeKey)
        if (route) route.activePackages++
      })

      setHubs(Array.from(hubsMap.values()))
      setRoutes(Array.from(routesMap.values()))
      setPackages(packagesData)
      setEvents(eventsData)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Failed to fetch live data from the server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Poll every 10 seconds for simulated live data
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const kpi = {
    total: packages.length,
    inTransit: packages.filter(p => p.status === 'normal' || p.status === 'rerouted').length,
    atRisk: packages.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length,
    delayed: packages.filter(p => p.status === 'delayed').length,
    delivered: packages.filter(p => p.status === 'delivered').length,
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'command-center':
      case 'route-planner':
        return (
          <main className="flex-1 overflow-hidden flex flex-col min-h-0">
            <KPICards kpi={kpi} />
            <div className="flex-1 overflow-hidden flex gap-2 px-3 pb-2 pt-1 min-h-0">
              <LiveMap
                hubs={hubs}
                routes={routes}
                packages={packages}
                selectedPackageId={selectedPackageId}
                onSelectPackage={setSelectedPackageId}
              />
              {activeTab === 'route-planner' ? (
                <RoutePlanner
                  packages={packages}
                  hubs={hubs}
                  selectedPackageId={selectedPackageId}
                />
              ) : (
                <RiskAlertsPanel
                  packages={packages}
                  hubs={hubs}
                  selectedPackageId={selectedPackageId}
                  onSelectPackage={setSelectedPackageId}
                />
              )}
            </div>
            <ActivityFeed events={events} />
          </main>
        )
      case 'live-shipments':
        return <LiveShipments packages={packages} hubs={hubs} selectedPackageId={selectedPackageId} onSelectPackage={setSelectedPackageId} onNavigate={setActiveTab} />
      case 'risk-monitor':
        return <RiskMonitor packages={packages} hubs={hubs} />
      case 'legacy-feed':
        return <LegacyFeed events={events} />
      case 'offline-sync':
        return <OfflineSync />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#060b1e] text-[#dde3f0] font-sans">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {!isOnline && (
        <div className="bg-[#4a1111] text-[#ef4444] text-xs font-bold text-center py-1.5 border-b border-[#7f1d1d] flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          OFFLINE — SHOWING CACHED DATA
        </div>
      )}
      {isSyncing && (
        <div className="bg-[#1e3060] text-[#4d7ef2] text-xs font-bold text-center py-1.5 border-b border-[#2a3a5a] flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-[#4d7ef2]/30 border-t-[#4d7ef2] rounded-full animate-spin"></span>
          CONNECTIVITY RESTORED — SYNCHRONIZING QUEUE...
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl animate-pulse text-[#4d7ef2]">Loading live logistics data...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl text-red-500 bg-red-500/10 p-6 rounded border border-red-500/20">{error}</div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  )
}
