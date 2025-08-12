// Local storage utilities for data persistence
// This ensures that records added to the system persist between sessions

const STORAGE_KEYS = {
  VEHICLES: 'fleet_vehicles',
  DRIVERS: 'fleet_drivers',
  WORK_TICKETS: 'fleet_work_tickets',
  FUEL_RECORDS: 'fleet_fuel_records',
  BULK_ACCOUNTS: 'fleet_bulk_accounts',
  MAINTENANCE_RECORDS: 'fleet_maintenance_records',
  DASHBOARD_STATS: 'fleet_dashboard_stats',
  DATA_VERSION: 'fleet_data_version'
};

const CURRENT_DATA_VERSION = '1.0';

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  private constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Check if we need to reset data due to version change
    const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    if (storedVersion !== CURRENT_DATA_VERSION) {
      this.clearAllData();
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
    }
  }

  // Generic methods for saving and loading data
  saveData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
    }
  }

  loadData<T>(key: string, defaultData: T[]): T[] {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
    }
    return defaultData;
  }

  // Specific methods for each data type
  saveVehicles(vehicles: any[]): void {
    this.saveData(STORAGE_KEYS.VEHICLES, vehicles);
  }

  loadVehicles(defaultVehicles: any[]): any[] {
    return this.loadData(STORAGE_KEYS.VEHICLES, defaultVehicles);
  }

  saveDrivers(drivers: any[]): void {
    this.saveData(STORAGE_KEYS.DRIVERS, drivers);
  }

  loadDrivers(defaultDrivers: any[]): any[] {
    return this.loadData(STORAGE_KEYS.DRIVERS, defaultDrivers);
  }

  saveWorkTickets(tickets: any[]): void {
    this.saveData(STORAGE_KEYS.WORK_TICKETS, tickets);
  }

  loadWorkTickets(defaultTickets: any[]): any[] {
    return this.loadData(STORAGE_KEYS.WORK_TICKETS, defaultTickets);
  }

  saveFuelRecords(records: any[]): void {
    this.saveData(STORAGE_KEYS.FUEL_RECORDS, records);
  }

  loadFuelRecords(defaultRecords: any[]): any[] {
    return this.loadData(STORAGE_KEYS.FUEL_RECORDS, defaultRecords);
  }

  saveBulkAccounts(accounts: any[]): void {
    this.saveData(STORAGE_KEYS.BULK_ACCOUNTS, accounts);
  }

  loadBulkAccounts(defaultAccounts: any[]): any[] {
    return this.loadData(STORAGE_KEYS.BULK_ACCOUNTS, defaultAccounts);
  }

  saveMaintenanceRecords(records: any[]): void {
    this.saveData(STORAGE_KEYS.MAINTENANCE_RECORDS, records);
  }

  loadMaintenanceRecords(defaultRecords: any[]): any[] {
    return this.loadData(STORAGE_KEYS.MAINTENANCE_RECORDS, defaultRecords);
  }

  saveDashboardStats(stats: any): void {
    this.saveData(STORAGE_KEYS.DASHBOARD_STATS, [stats]);
  }

  loadDashboardStats(defaultStats: any): any {
    const loaded = this.loadData(STORAGE_KEYS.DASHBOARD_STATS, [defaultStats]);
    return loaded[0] || defaultStats;
  }

  // Utility methods
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (key !== STORAGE_KEYS.DATA_VERSION) {
        const stored = localStorage.getItem(key);
        if (stored) {
          data[name] = JSON.parse(stored);
        }
      }
    });
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(data).forEach(([name, value]) => {
        const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
        if (key && key !== STORAGE_KEYS.DATA_VERSION) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const localStorageManager = LocalStorageManager.getInstance();
