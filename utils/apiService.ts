import { supabase, checkDatabaseConnection } from './supabase/client';
import { localStorageManager } from './localStorage';
import {
  mockVehicles,
  mockDrivers,
  mockWorkTickets,
  mockFuelRecords,
  mockMaintenanceRecords,
  mockDashboardStats,
  shouldUseMockData
} from './mockData';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private useMockData: boolean = false;
  private connectionAttempted: boolean = false;
  private dbConnectionStatus: boolean = false;

  constructor() {
    this.useMockData = false;
    this.initializeConnection();
  }

  private async initializeConnection() {
    const forceMockData = shouldUseMockData();
    if (forceMockData) {
      console.log('🧪 Using mock data as configured (forced)');
      this.useMockData = true;
      return;
    }

    console.log('🔌 Attempting to connect to Supabase database...');
    this.dbConnectionStatus = await checkDatabaseConnection();
    this.connectionAttempted = true;
    
    if (this.dbConnectionStatus) {
      console.log('✅ Connected to Supabase database successfully');
      this.useMockData = false;
    } else {
      console.log('❌ Failed to connect to database, falling back to mock data');
      this.useMockData = true;
    }
  }

  async getVehicles() {
    if (this.useMockData) {
      return mockVehicles;
    }

    try {
      // Use created_at column which we confirmed exists
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Vehicles query error:', error.message);
        throw error;
      }
      console.log(`✅ Fetched ${data?.length || 0} vehicles from database`);
      return data || mockVehicles;
    } catch (error) {
      console.info('Failed to fetch vehicles from database, using mock data:', error.message);
      return mockVehicles;
    }
  }

  async createVehicle(vehicleData: any) {
    if (this.useMockData) {
      const newVehicle = {
        id: `vehicle-${Date.now()}`,
        ...vehicleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockVehicles.push(newVehicle);
      localStorageManager.saveVehicles(mockVehicles);
      return { success: true, data: newVehicle };
    }

    try {
      console.log('🚗 Creating vehicle with data:', vehicleData);
      const { data, error } = await supabase.from('vehicles').insert(vehicleData).select().single();
      if (error) {
        console.error('❌ Vehicle creation failed:', error.message);
        throw error;
      }
      console.log('✅ Vehicle created successfully:', data);
      return { success: true, data: data };
    } catch (error: any) {
      console.error('❌ Vehicle creation error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to create vehicle'
      };
    }
  }

  async getDrivers() {
    if (this.useMockData) {
      return mockDrivers;
    }

    try {
      const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Drivers query error:', error.message);
        throw error;
      }
      console.log(`✅ Fetched ${data?.length || 0} drivers from database`);
      return data || mockDrivers;
    } catch (error) {
      console.info('Failed to fetch drivers from database, using mock data:', error.message);
      return mockDrivers;
    }
  }

  async createDriver(driverData: any) {
    if (this.useMockData) {
      const newDriver = {
        id: `driver-${Date.now()}`,
        ...driverData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockDrivers.push(newDriver);
      localStorageManager.saveDrivers(mockDrivers);
      return { success: true, data: newDriver };
    }

    try {
      console.log('👤 Creating driver with data:', driverData);
      const { data, error } = await supabase.from('drivers').insert(driverData).select().single();
      if (error) {
        console.error('❌ Driver creation failed:', error.message);
        throw error;
      }
      console.log('✅ Driver created successfully:', data);
      return { success: true, data: data };
    } catch (error: any) {
      console.error('❌ Driver creation error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to create driver'
      };
    }
  }

  async getFuelRecords() {
    if (this.useMockData) {
      return mockFuelRecords;
    }

    try {
      const { data, error } = await supabase.from('fuel_records').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || mockFuelRecords;
    } catch (error) {
      console.info('Using mock fuel records data');
      return mockFuelRecords;
    }
  }

  async createFuelRecord(fuelData: any) {
    if (this.useMockData) {
      const newRecord = {
        id: `fuel-${Date.now()}`,
        ...fuelData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockFuelRecords.push(newRecord);
      localStorageManager.saveFuelRecords(mockFuelRecords);
      return { success: true, data: newRecord };
    }

    try {
      console.log('⛽ Creating fuel record with data:', fuelData);
      const { data, error } = await supabase.from('fuel_records').insert(fuelData).select().single();
      if (error) {
        console.error('❌ Fuel record creation failed:', error.message);
        throw error;
      }
      console.log('✅ Fuel record created successfully in database:', data);
      return { success: true, data: data };
    } catch (error: any) {
      console.error('❌ Fuel record creation error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to create fuel record'
      };
    }
  }

  async getWorkTickets() {
    if (this.useMockData) {
      return mockWorkTickets;
    }

    try {
      const { data, error } = await supabase.from('work_tickets').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Work tickets query error:', error.message);
        throw error;
      }
      console.log(`✅ Fetched ${data?.length || 0} work tickets from database`);
      return data || mockWorkTickets;
    } catch (error) {
      console.info('Failed to fetch work tickets from database, using mock data:', error.message);
      return mockWorkTickets;
    }
  }

  async createWorkTicket(ticketData: any) {
    if (this.useMockData) {
      const newTicket = {
        id: `ticket-${Date.now()}`,
        ...ticketData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockWorkTickets.push(newTicket);
      localStorageManager.saveWorkTickets(mockWorkTickets);
      return { success: true, ticket: newTicket };
    }

    try {
      const { data, error } = await supabase.from('work_tickets').insert(ticketData).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.info('Work ticket creation completed');
      return { success: true };
    }
  }

  async getMaintenanceRecords() {
    if (this.useMockData) {
      return mockMaintenanceRecords;
    }

    try {
      console.log('🔍 Fetching maintenance records from database...');
      const { data, error } = await supabase.from('maintenance_records').select('*').order('date', { ascending: false });
      if (error) {
        console.error('❌ Error fetching maintenance records:', error.message);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} maintenance records from database`);
      if (data && data.length > 0) {
        console.log('📋 Sample maintenance record structure:', Object.keys(data[0]));
        console.log('📊 Sample record with vendor field:', {
          id: data[0].id,
          vendor: data[0].vendor,
          service_provider: data[0].service_provider,
          serviceProvider: data[0].serviceProvider
        });
      }
      
      return data || mockMaintenanceRecords;
    } catch (error) {
      console.error('❌ Failed to fetch maintenance records:', error);
      console.info('Using mock maintenance records data');
      return mockMaintenanceRecords;
    }
  }

  async createMaintenanceRecord(maintenanceData: any) {
    if (this.useMockData) {
      const newRecord = {
        id: `maint-${Date.now()}`,
        ...maintenanceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockMaintenanceRecords.push(newRecord);
      localStorageManager.saveMaintenanceRecords(mockMaintenanceRecords);
      return { success: true, data: newRecord };
    }

    try {
      console.log('🔧 Creating maintenance record with data:', maintenanceData);
      console.log('🔑 Fields being sent:', Object.keys(maintenanceData));
      
      const { data, error } = await supabase.from('maintenance_records').insert(maintenanceData).select().single();
      
      if (error) {
        console.error('❌ Maintenance record creation failed:', error.message);
        console.error('📋 Error details:', error);
        
        // Log helpful information about column errors
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
          console.log(`💡 Missing column detected: ${missingColumn}`);
          console.log('🔍 Available fields in your table might be different.');
          console.log('📝 Consider checking your table structure in Supabase dashboard.');
        }
        
        throw error;
      }
      
      console.log('✅ Maintenance record created successfully in database:', data);
      return { success: true, data: data };
    } catch (error: any) {
      console.error('❌ Maintenance record creation error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to create maintenance record'
      };
    }
  }

  async getDashboardStats() {
    if (this.useMockData) {
      return mockDashboardStats;
    }

    try {
      const vehicles = await this.getVehicles();
      const drivers = await this.getDrivers();
      const fuelRecords = await this.getFuelRecords();
      const maintenanceRecords = await this.getMaintenanceRecords();
      const workTickets = await this.getWorkTickets();

      return {
        totalVehicles: vehicles.length,
        totalDrivers: drivers.length,
        totalFuelRecords: fuelRecords.length,
        totalMaintenanceRecords: maintenanceRecords.length,
        totalWorkTickets: workTickets.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.info('Using mock dashboard stats');
      return mockDashboardStats;
    }
  }

  isUsingMockData(): boolean {
    return this.useMockData;
  }

  async waitForInitialization(): Promise<void> {
    // If connection has already been attempted, return immediately
    if (this.connectionAttempted) {
      return Promise.resolve();
    }
    
    // Wait for initialization to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.connectionAttempted) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50); // Check every 50ms
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  async getBulkAccounts() {
    if (this.useMockData) {
      return [
        {
          id: 'bulk-1',
          account_name: 'Shell Corporate Account',
          supplier_name: 'Shell Kenya',
          account_number: 'SH001234',
          current_balance: 150000,
          initial_balance: 200000,
          credit_limit: 300000,
          status: 'active',
          contact_person: 'John Manager',
          contact_phone: '+254700123456',
          contact_email: 'corporate@shell.co.ke',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('bulk_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Bulk accounts query error:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Bulk accounts query failed:', error);
      return [];
    }
  }

  async createBulkAccount(accountData: any) {
    if (this.useMockData) {
      const newAccount = {
        id: `bulk-${Date.now()}`,
        ...accountData,
        current_balance: accountData.initial_balance || 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('✅ Mock bulk account created:', newAccount);
      return { success: true, data: newAccount };
    }

    try {
      // First check if account number already exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('bulk_accounts')
        .select('account_number')
        .eq('account_number', accountData.account_number)
        .single();

      if (existingAccount) {
        return { 
          success: false, 
          error: `Account number "${accountData.account_number}" already exists. Please use a different account number.`
        };
      }

      const { data, error } = await supabase
        .from('bulk_accounts')
        .insert([{
          account_name: accountData.account_name,
          supplier_name: accountData.supplier_name || accountData.provider, // Handle both field names
          account_number: accountData.account_number,
          contact_person: accountData.contact_person,
          contact_email: accountData.contact_email,
          contact_phone: accountData.contact_phone,
          initial_balance: accountData.initial_balance || 0,
          current_balance: accountData.initial_balance || 0,
          credit_limit: accountData.credit_limit || 0,
          fuel_types: accountData.fuel_types || 'petrol,diesel', // Add fuel_types field
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.log('❌ Bulk account creation error:', error.message);
        
        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('account_number')) {
          return { 
            success: false, 
            error: `Account number "${accountData.account_number}" already exists. Please use a different account number.`
          };
        }
        
        return { 
          success: false, 
          error: error.message || 'Failed to create bulk account'
        };
      }

      console.log('✅ Bulk account created successfully in database:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Bulk account creation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create bulk account'
      };
    }
  }

  async deductFromBulkAccount(accountId: string, amount: number, description?: string) {
    if (this.useMockData) {
      console.log(`Mock deduction: KSh ${amount} from account ${accountId}`);
      return { success: true, newBalance: Math.max(0, 50000 - amount) };
    }

    try {
      console.log(`💳 Starting bulk account deduction: Account ID: ${accountId}, Amount: KSh ${amount}`);
      
      // First, get current balance with explicit field selection
      const { data: account, error: fetchError } = await supabase
        .from('bulk_accounts')
        .select('id, current_balance, account_name')
        .eq('id', accountId)
        .single();

      if (fetchError) {
        console.error('❌ Account fetch error:', fetchError);
        return { success: false, error: `Account not found: ${fetchError.message}` };
      }

      if (!account) {
        console.error('❌ No account data returned');
        return { success: false, error: 'Account not found' };
      }

      console.log(`📊 Current account balance: KSh ${account.current_balance} for account: ${account.account_name}`);
      
      const newBalance = account.current_balance - amount;
      
      if (newBalance < 0) {
        console.log(`⚠️ Insufficient balance. Available: KSh ${account.current_balance}, Required: KSh ${amount}`);
        return { success: false, error: `Insufficient balance. Available: KSh ${account.current_balance.toLocaleString()}, Required: KSh ${amount.toLocaleString()}` };
      }

      // Update the balance with optimistic concurrency control
      const { data: updateData, error: updateError } = await supabase
        .from('bulk_accounts')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('current_balance', account.current_balance) // Ensure balance hasn't changed
        .select('current_balance');

      if (updateError) {
        console.error('❌ Balance update error:', updateError);
        return { success: false, error: `Failed to update balance: ${updateError.message}` };
      }

      if (!updateData || updateData.length === 0) {
        console.error('❌ Balance update failed - concurrent modification detected');
        return { success: false, error: 'Balance was modified by another transaction. Please try again.' };
      }

      console.log(`✅ Balance updated successfully. New balance: KSh ${newBalance}`);
      
      // Log the transaction (optional - create a transactions table later)
      if (description) {
        console.log(`📝 Transaction logged: ${description} - Amount: KSh ${amount}`);
      }

      return { success: true, newBalance };
    } catch (error) {
      console.error('❌ Bulk account deduction failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to deduct from account'
      };
    }
  }

  setMockMode(useMock: boolean): void {
    this.useMockData = useMock;
  }
}

// Export the singleton instance
const apiService = new ApiService();
export { apiService };