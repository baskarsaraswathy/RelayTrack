// A lightweight IndexedDB wrapper for offline caching and action queueing

const DB_NAME = 'RelayTrackDB';
const DB_VERSION = 1;

export interface SyncAction {
  id: string;
  type: string;
  payload: any;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'failed';
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        
        // Action queue store
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
      };
    });

    return this.initPromise;
  }

  async setCache(key: string, data: any): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCache(key: string): Promise<any | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('cache', 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getCacheMeta(key: string): Promise<{timestamp: number} | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('cache', 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? {timestamp: request.result.timestamp} : null);
      request.onerror = () => reject(request.error);
    });
  }

  async queueAction(type: string, payload: any): Promise<void> {
    await this.init();
    const action: SyncAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending'
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('queue', 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.put(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<SyncAction[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('queue', 'readonly');
      const store = transaction.objectStore('queue');
      const request = store.getAll();
      request.onsuccess = () => {
        const items: SyncAction[] = request.result || [];
        resolve(items.sort((a, b) => a.createdAt - b.createdAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeAction(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('queue', 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateActionFailed(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('queue', 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result) {
          const action = request.result;
          action.retryCount += 1;
          action.status = 'failed';
          store.put(action);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DatabaseService();
