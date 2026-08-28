import { Hub, Route, Package, ActivityEvent } from '../App'
import { dbService, SyncAction } from './db'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003/api'

// Helper to convert backend hub IDs (integers) to frontend strings (e.g. "1")
// And to scale coordinates for the SVG map
// Coordinate transform: lon 70-85 → x 30-670, lat 8-33 → y 20-490
// x = (lon - 70) / 15 * 640 + 30
// y = (33 - lat) / 25 * 470 + 20
export const transformCoordinates = (lat: number, lon: number) => {
  const x = ((lon - 70) / 15) * 640 + 30
  const y = ((33 - lat) / 25) * 470 + 20
  return { x, y }
}

export async function fetchHubs(): Promise<Hub[]> {
  try {
    const res = await fetch(`${API_BASE}/hubs`)
    if (!res.ok) throw new Error('Failed to fetch hubs')
    const data = await res.json()
    
    const hubs = data.map((h: any) => {
      const { x, y } = transformCoordinates(h.lat, h.lng)
      return {
        id: String(h.id),
        name: h.name,
        x,
        y,
        packagesCount: 0,
        status: 'active'
      }
    })
    await dbService.setCache('hubs', hubs);
    return hubs;
  } catch (err) {
    const cached = await dbService.getCache('hubs');
    if (cached) return cached;
    throw err;
  }
}

export async function fetchRoutes(): Promise<Route[]> {
  try {
    const res = await fetch(`${API_BASE}/routes`)
    if (!res.ok) throw new Error('Failed to fetch routes')
    const data = await res.json()
    
    const routes = data.map((r: any) => ({
      id: String(r.id),
      fromId: String(r.source_hub_id),
      toId: String(r.destination_hub_id),
      status: r.traffic_level === 'HIGH' ? 'congested' : 'normal',
      activePackages: 0
    }))
    await dbService.setCache('routes', routes);
    return routes;
  } catch (err) {
    const cached = await dbService.getCache('routes');
    if (cached) return cached;
    throw err;
  }
}

export async function fetchPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${API_BASE}/packages`)
    if (!res.ok) throw new Error('Failed to fetch packages')
    const data = await res.json()
    
    const packages = data.map((p: any) => {
      // Deterministic Progress calculation based on tracking number hash and current hour
      const hash = p.tracking_number.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const hour = new Date().getHours();
      // Cycle from 10% to 90% deterministically over the day
      const progress = 0.1 + ((hash + hour) % 80) / 100;
      
      let delayReason = p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL' ? 'Flagged by system' : undefined;
      
      if (p.eta && p.deadline) {
        const etaDate = new Date(p.eta);
        const deadlineDate = new Date(p.deadline);
        if (etaDate > deadlineDate) {
          const delayMins = Math.floor((etaDate.getTime() - deadlineDate.getTime()) / 60000);
          delayReason = `+ ${delayMins} min delay`;
        }
      }

      return {
        id: p.tracking_number,
        fromId: String(p.origin_hub_id),
        toId: String(p.destination_hub_id),
        status: p.status === 'IN_TRANSIT' ? 'normal' : (p.status.toLowerCase() as any),
        progress: progress,
        eta: p.eta ? new Date(p.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
        deadline: p.deadline ? new Date(p.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
        riskLevel: p.risk_level,
        delayReason: delayReason,
        weight: '5.0 kg',
        type: 'Standard'
      }
    })
    await dbService.setCache('packages', packages);
    return packages;
  } catch (err) {
    const cached = await dbService.getCache('packages');
    if (cached) return cached;
    throw err;
  }
}

export async function fetchActivityEvents(): Promise<ActivityEvent[]> {
  try {
    const [incidentsRes, rfidRes] = await Promise.all([
      fetch(`${API_BASE}/incidents`),
      fetch(`${API_BASE}/rfid-events`)
    ])
    
    if (!incidentsRes.ok || !rfidRes.ok) throw new Error('Failed to fetch activity events')
    
    const incidentsData = await incidentsRes.json()
    const rfidData = await rfidRes.json()
    
    const events: ActivityEvent[] = []
    
    incidentsData.forEach((inc: any) => {
      events.push({
        id: `inc-${inc.id}`,
        timestamp: inc.created_at,
        type: 'incident',
        message: `${inc.type}: ${inc.description}`,
        location: `Route ${inc.route_id}`
      })
    })
    
    rfidData.forEach((rfid: any) => {
      events.push({
        id: `rfid-${rfid.id}`,
        timestamp: rfid.timestamp || rfid.created_at,
        type: 'rfid',
        packageId: rfid.package_id ? String(rfid.package_id) : undefined,
        message: `RFID Scan: ${rfid.event_type}`,
        location: `Hub ${rfid.hub_id}`
      })
    })
    
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    const formatted = events.map(e => ({
      ...e,
      timestamp: new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
    }))
    
    await dbService.setCache('events', formatted);
    return formatted;
  } catch (err) {
    const cached = await dbService.getCache('events');
    if (cached) return cached;
    throw err;
  }
}

export interface RoutePlan {
  tracking_number: string;
  original_route_risk: string;
  recommended_path: number[];
  recommended_path_names: string[];
  reason: string;
}

export async function fetchRoutePlan(trackingNumber: string): Promise<RoutePlan | null> {
  try {
    const res = await fetch(`${API_BASE}/packages/${trackingNumber}/route-planner`)
    if (!res.ok) return null;
    const plan = await res.json();
    await dbService.setCache(`route-plan-${trackingNumber}`, plan);
    return plan;
  } catch (err) {
    return await dbService.getCache(`route-plan-${trackingNumber}`);
  }
}

export async function processSyncAction(action: SyncAction): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sync/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncPendingActions(): Promise<{success: number, failed: number}> {
  let successCount = 0;
  let failedCount = 0;
  try {
    const actions = await dbService.getPendingActions();
    for (const action of actions) {
      if (action.status === 'pending' || action.retryCount < 5) {
        const success = await processSyncAction(action);
        if (success) {
          await dbService.removeAction(action.id);
          successCount++;
        } else {
          await dbService.updateActionFailed(action.id);
          failedCount++;
        }
      }
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
  return { success: successCount, failed: failedCount };
}

export async function queueDispatchAction(trackingNumber: string, recommendedPath: number[]): Promise<void> {
  await dbService.queueAction('dispatch_route', { trackingNumber, recommendedPath });
  if (navigator.onLine) {
    await syncPendingActions();
  }
}
