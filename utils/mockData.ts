// Mock data for the Fleet Management System
// This provides realistic sample data for demonstration when the server is unavailable
// Now includes localStorage persistence to maintain data between sessions

import { localStorageManager } from './localStorage';

export const shouldUseMockData = (): boolean => {
  // Check if we're explicitly forcing mock data
  const forceMockData = (import.meta as any).env?.VITE_USE_MOCK_DATA === 'true';
  
  console.log('🔍 Mock data check:');
  console.log('- VITE_USE_MOCK_DATA:', (import.meta as any).env?.VITE_USE_MOCK_DATA);
  console.log('- Force mock data:', forceMockData);
  
  if (forceMockData) {
    console.log('🧪 Force using mock data (VITE_USE_MOCK_DATA=true)');
    return true;
  }
  
  // Check environment variables for Supabase configuration
  const hasSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const hasSupabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  console.log('- Has Supabase URL:', !!hasSupabaseUrl);
  console.log('- Has Supabase Key:', !!hasSupabaseKey);
  
  // Use mock data only if no Supabase configuration is available
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('❌ No Supabase configuration found, using mock data');
    return true;
  }
  
  console.log('🔌 Supabase configuration found, attempting database connection');
  return false; // Try to use database first
};

export const mockApiResponse = <T>(data: T, delay: number = 200): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Enhanced driver data with login credentials - default data
const defaultDrivers = [
  {
    id: 'driver-1',
    name: 'John Smith',
    employeeId: 'EMP001',
    licenseNumber: 'DL123456',
    licenseClass: 'B',
    licenseExpiryDate: '2025-12-31',
    phone: '+254 700 123 456',
    email: 'john.smith@energy.go.ke',
    department: 'State Department for Energy',
    status: 'active',
    dateJoined: '2023-01-15',
    notes: 'Experienced driver with clean record',
    username: 'jsmith',
    password: 'driver123',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'driver-2',
    name: 'Mary Wanjiku',
    employeeId: 'EMP002',
    licenseNumber: 'DL654321',
    licenseClass: 'C',
    licenseExpiryDate: '2025-08-15',
    phone: '+254 701 234 567',
    email: 'mary.wanjiku@energy.go.ke',
    department: 'State Department for Energy',
    status: 'active',
    dateJoined: '2023-03-10',
    notes: 'Certified for heavy vehicles',
    username: 'mwanjiku',
    password: 'driver123',
    createdAt: '2023-03-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z'
  },
  {
    id: 'driver-3',
    name: 'Peter Kipchoge',
    employeeId: 'EMP003',
    licenseNumber: 'DL789012',
    licenseClass: 'B',
    licenseExpiryDate: '2025-06-20',
    phone: '+254 702 345 678',
    email: 'peter.kipchoge@energy.go.ke',
    department: 'State Department for Energy',
    status: 'active',
    dateJoined: '2023-06-01',
    notes: 'Specialized in long-distance travel',
    username: 'pkipchoge',
    password: 'driver123',
    createdAt: '2023-06-01T14:20:00Z',
    updatedAt: '2024-01-01T14:20:00Z'
  }
];

// Load drivers from localStorage with default fallback
export const mockDrivers = localStorageManager.loadDrivers(defaultDrivers);

const defaultVehicles = [
  {
    id: 'vehicle-1',
    gkNumber: 'GK 001 A',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    engineNumber: 'ENG123456',
    chassisNumber: 'CHS789012',
    acquisitionDate: '2023-01-15',
    status: 'active',
    department: 'State Department for Energy',
    location: 'Nairobi HQ',
    color: 'White',
    fuelType: 'diesel',
    seatingCapacity: 5,
    equipment: ['Fire extinguisher', 'First aid kit', 'Toolkit', 'Spare tire'],
    notes: 'Primary field work vehicle',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'vehicle-2',
    gkNumber: 'GK 002 B',
    make: 'Mitsubishi',
    model: 'Pajero',
    year: 2022,
    engineNumber: 'ENG789012',
    chassisNumber: 'CHS345678',
    acquisitionDate: '2022-08-20',
    status: 'active',
    department: 'State Department for Energy',
    location: 'Mombasa Office',
    color: 'Silver',
    fuelType: 'diesel',
    seatingCapacity: 7,
    equipment: ['Fire extinguisher', 'First aid kit', 'GPS tracker', 'Emergency kit'],
    notes: 'Coastal region assignments',
    createdAt: '2022-08-20T11:30:00Z',
    updatedAt: '2024-01-10T11:30:00Z'
  },
  {
    id: 'vehicle-3',
    gkNumber: 'GK 003 C',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    engineNumber: 'ENG345678',
    chassisNumber: 'CHS901234',
    acquisitionDate: '2024-02-10',
    status: 'active',
    department: 'State Department for Energy',
    location: 'Kisumu Office',
    color: 'Blue',
    fuelType: 'diesel',
    seatingCapacity: 8,
    equipment: ['Fire extinguisher', 'First aid kit', 'Winch', 'Off-road kit', 'Satellite phone'],
    notes: 'Heavy-duty assignments and remote areas',
    createdAt: '2024-02-10T13:45:00Z',
    updatedAt: '2024-02-10T13:45:00Z'
  }
];

// Load vehicles from localStorage with default fallback
export const mockVehicles = localStorageManager.loadVehicles(defaultVehicles);

const defaultWorkTickets = [
  {
    id: 'ticket-1',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Nakuru Geothermal Plant',
    purpose: 'Routine inspection and data collection',
    fuel_required: 80,
    estimated_distance: 320,
    departure_date: '2024-01-20',
    return_date: '2024-01-21',
    additional_notes: 'Overnight stay required for comprehensive inspection',
    status: 'approved',
    created_at: '2024-01-18T09:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2024-01-18T14:30:00Z',
    updated_at: '2024-01-18T14:30:00Z'
  },
  {
    id: 'ticket-2',
    driver_id: 'driver-2',
    driver_name: 'Mary Wanjiku',
    driver_license: 'DL654321',
    driver_email: 'mary.wanjiku@energy.go.ke',
    vehicle_id: 'vehicle-2',
    vehicle_registration: 'GK 002 B',
    destination: 'Mombasa Port Authority',
    purpose: 'Equipment delivery and coordination meeting',
    fuel_required: 120,
    estimated_distance: 480,
    departure_date: '2024-01-22',
    return_date: '2024-01-23',
    additional_notes: 'Transporting sensitive equipment - extra care required',
    status: 'pending',
    created_at: '2024-01-19T11:15:00Z',
    updated_at: '2024-01-19T11:15:00Z'
  },
  {
    id: 'ticket-3',
    driver_id: 'driver-3',
    driver_name: 'Peter Kipchoge',
    driver_license: 'DL789012',
    driver_email: 'peter.kipchoge@energy.go.ke',
    vehicle_id: 'vehicle-3',
    vehicle_registration: 'GK 003 C',
    destination: 'Eldoret Regional Office',
    purpose: 'Monthly regional meeting and report submission',
    fuel_required: 100,
    estimated_distance: 420,
    departure_date: '2024-01-25',
    return_date: '2024-01-25',
    additional_notes: 'Same day return expected',
    status: 'approved',
    created_at: '2024-01-17T16:20:00Z',
    approved_by: 'System Administrator',
    approved_at: '2024-01-18T08:45:00Z',
    updated_at: '2024-01-18T08:45:00Z'
  },
  {
    id: 'ticket-4',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Kiambu County Office',
    purpose: 'Community outreach and energy consultation',
    fuel_required: 40,
    estimated_distance: 80,
    departure_date: '2024-01-24',
    return_date: '2024-01-24',
    additional_notes: 'Half-day assignment',
    status: 'pending',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  // August 2025 test data for trip management
  {
    id: 'ticket-aug-1',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Nairobi Central Office',
    purpose: 'Monthly department meeting',
    fuel_required: 40,
    estimated_distance: 80,
    departure_date: '2025-08-05',
    return_date: '2025-08-05',
    additional_notes: 'Day trip',
    status: 'approved',
    created_at: '2025-08-04T09:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-08-04T14:30:00Z',
    updated_at: '2025-08-04T14:30:00Z'
  },
  {
    id: 'ticket-aug-2',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Kisumu Renewable Energy Site',
    purpose: 'Site inspection and documentation',
    fuel_required: 100,
    estimated_distance: 400,
    departure_date: '2025-08-12',
    return_date: '2025-08-13',
    additional_notes: 'Overnight trip',
    status: 'approved',
    created_at: '2025-08-10T10:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-08-10T15:00:00Z',
    updated_at: '2025-08-10T15:00:00Z'
  },
  {
    id: 'ticket-aug-3',
    driver_id: 'driver-2',
    driver_name: 'Mary Wanjiku',
    driver_license: 'DL654321',
    driver_email: 'mary.wanjiku@energy.go.ke',
    vehicle_id: 'vehicle-2',
    vehicle_registration: 'GK 002 B',
    destination: 'Eldoret Regional Office',
    purpose: 'Training workshop attendance',
    fuel_required: 80,
    estimated_distance: 320,
    departure_date: '2025-08-15',
    return_date: '2025-08-15',
    additional_notes: 'Workshop on new energy policies',
    status: 'approved',
    created_at: '2025-08-13T08:30:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-08-13T11:00:00Z',
    updated_at: '2025-08-13T11:00:00Z'
  },
  {
    id: 'ticket-aug-4',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Mombasa Port Authority',
    purpose: 'Equipment delivery coordination',
    fuel_required: 120,
    estimated_distance: 480,
    departure_date: '2025-08-18',
    return_date: '2025-08-19',
    additional_notes: 'Current trip - equipment delivery',
    status: 'approved',
    created_at: '2025-08-16T07:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-08-16T10:30:00Z',
    updated_at: '2025-08-16T10:30:00Z'
  },
  // July 2025 test data
  {
    id: 'ticket-jul-1',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Thika Industrial Area',
    purpose: 'Equipment inspection',
    fuel_required: 60,
    estimated_distance: 120,
    departure_date: '2025-07-10',
    return_date: '2025-07-10',
    additional_notes: 'July monthly inspection',
    status: 'approved',
    created_at: '2025-07-08T09:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-07-08T14:30:00Z',
    updated_at: '2025-07-08T14:30:00Z'
  },
  {
    id: 'ticket-jul-2',
    driver_id: 'driver-2',
    driver_name: 'Mary Wanjiku',
    driver_license: 'DL654321',
    driver_email: 'mary.wanjiku@energy.go.ke',
    vehicle_id: 'vehicle-2',
    vehicle_registration: 'GK 002 B',
    destination: 'Kisii Regional Office',
    purpose: 'Staff training coordination',
    fuel_required: 90,
    estimated_distance: 360,
    departure_date: '2025-07-25',
    return_date: '2025-07-25',
    additional_notes: 'Training session coordination',
    status: 'approved',
    created_at: '2025-07-23T08:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-07-23T11:00:00Z',
    updated_at: '2025-07-23T11:00:00Z'
  },
  // September 2025 test data
  {
    id: 'ticket-sep-1',
    driver_id: 'driver-1',
    driver_name: 'John Smith',
    driver_license: 'DL123456',
    driver_email: 'john.smith@energy.go.ke',
    vehicle_id: 'vehicle-1',
    vehicle_registration: 'GK 001 A',
    destination: 'Garissa Solar Farm',
    purpose: 'Solar panel maintenance check',
    fuel_required: 150,
    estimated_distance: 600,
    departure_date: '2025-09-07',
    return_date: '2025-09-08',
    additional_notes: 'Quarterly maintenance check',
    status: 'approved',
    created_at: '2025-09-05T07:00:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-09-05T12:00:00Z',
    updated_at: '2025-09-05T12:00:00Z'
  },
  {
    id: 'ticket-sep-2',
    driver_id: 'driver-2',
    driver_name: 'Mary Wanjiku',
    driver_license: 'DL654321',
    driver_email: 'mary.wanjiku@energy.go.ke',
    vehicle_id: 'vehicle-2',
    vehicle_registration: 'GK 002 B',
    destination: 'Machakos Wind Farm',
    purpose: 'Wind turbine inspection',
    fuel_required: 70,
    estimated_distance: 280,
    departure_date: '2025-09-20',
    return_date: '2025-09-20',
    additional_notes: 'Routine inspection of wind turbines',
    status: 'approved',
    created_at: '2025-09-18T09:30:00Z',
    approved_by: 'System Administrator',
    approved_at: '2025-09-18T13:00:00Z',
    updated_at: '2025-09-18T13:00:00Z'
  }
];

// Load work tickets from localStorage with default fallback
export const mockWorkTickets = localStorageManager.loadWorkTickets(defaultWorkTickets);

const defaultFuelRecords = [
  {
    id: 'fuel-1',
    vehicle_id: 'vehicle-1',
    driver_id: 'driver-1',
    fuel_type: 'diesel',
    quantity: 75.5,
    cost_per_liter: 165.50,
    total_cost: 12495.25,
    odometer_reading: 45230,
    fuel_station: 'Shell Station - Nairobi CBD',
    receipt_number: 'RCP001234',
    date: '2024-01-18',
    notes: 'Pre-trip fueling for Nakuru assignment',
    bulk_account_id: 'bulk-1',
    created_at: '2024-01-18T07:30:00Z',
    updated_at: '2024-01-18T07:30:00Z'
  },
  {
    id: 'fuel-2',
    vehicle_id: 'vehicle-2',
    driver_id: 'driver-2',
    fuel_type: 'diesel',
    quantity: 90.0,
    cost_per_liter: 164.80,
    total_cost: 14832.00,
    odometer_reading: 38750,
    fuel_station: 'Total Station - Mombasa Road',
    receipt_number: 'RCP002145',
    date: '2024-01-19',
    notes: 'Fuel for Mombasa trip',
    bulk_account_id: 'bulk-1',
    created_at: '2024-01-19T08:15:00Z',
    updated_at: '2024-01-19T08:15:00Z'
  },
  {
    id: 'fuel-3',
    vehicle_id: 'vehicle-3',
    driver_id: 'driver-3',
    fuel_type: 'diesel',
    quantity: 85.2,
    cost_per_liter: 166.20,
    total_cost: 14160.24,
    odometer_reading: 22100,
    fuel_station: 'Kenol Station - Nakuru Highway',
    receipt_number: 'RCP003456',
    date: '2024-01-17',
    notes: 'Regular fueling for regional duties',
    bulk_account_id: 'bulk-1',
    created_at: '2024-01-17T15:45:00Z',
    updated_at: '2024-01-17T15:45:00Z'
  }
];

// Load fuel records from localStorage with default fallback
export const mockFuelRecords = localStorageManager.loadFuelRecords(defaultFuelRecords);

export const mockBulkAccounts = [
  {
    id: 'bulk-1',
    account_name: 'Ministry Fleet Account - Shell',
    supplier_name: 'Shell Kenya Limited',
    account_number: 'MEN-SHELL-2024-001',
    current_balance: 750000.00,
    initial_balance: 1000000.00,
    credit_limit: 500000.00,
    status: 'active',
    contact_person: 'James Mwangi',
    contact_phone: '+254 722 345 678',
    contact_email: 'fleet.support@shell.co.ke',
    fuel_types: 'diesel,petrol',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'bulk-2',
    account_name: 'Ministry Fleet Account - Total',
    supplier_name: 'Total Kenya Limited',
    account_number: 'MEN-TOTAL-2024-001',
    current_balance: 425000.00,
    initial_balance: 500000.00,
    credit_limit: 300000.00,
    status: 'active',
    contact_person: 'Sarah Njeru',
    contact_phone: '+254 733 456 789',
    contact_email: 'corporate@total.co.ke',
    fuel_types: 'diesel,petrol',
    created_at: '2024-01-01T11:00:00Z',
    updated_at: '2024-01-19T16:20:00Z'
  }
];

export const mockMaintenanceRecords = [
  {
    id: 'maint-1',
    vehicle_id: 'vehicle-1',
    maintenance_type: 'regular',
    description: 'Routine service - oil change, filter replacement',
    cost: 15500.00,
    service_date: '2024-01-15',
    next_service_date: '2024-04-15',
    service_provider: 'Toyota Kenya Service Center',
    odometer_reading: 45000,
    parts_replaced: ['Engine oil filter', 'Air filter', 'Oil'],
    notes: 'All systems functioning normally',
    status: 'completed',
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T16:30:00Z'
  },
  {
    id: 'maint-2',
    vehicle_id: 'vehicle-2',
    maintenance_type: 'repair',
    description: 'Brake pad replacement and brake system check',
    cost: 22000.00,
    service_date: '2024-01-12',
    next_service_date: '2024-07-12',
    service_provider: 'Mitsubishi Authorized Service',
    odometer_reading: 38500,
    parts_replaced: ['Front brake pads', 'Rear brake pads', 'Brake fluid'],
    notes: 'Brake system fully restored to optimal performance',
    status: 'completed',
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-12T17:45:00Z'
  },
  {
    id: 'maint-3',
    vehicle_id: 'vehicle-3',
    maintenance_type: 'regular',
    description: 'Comprehensive inspection and tire rotation',
    cost: 18750.00,
    service_date: '2024-01-10',
    next_service_date: '2024-04-10',
    service_provider: 'Toyota Kenya Service Center',
    odometer_reading: 22000,
    parts_replaced: ['Cabin filter', 'Transmission fluid'],
    notes: 'Vehicle in excellent condition for heavy-duty use',
    status: 'completed',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-10T15:20:00Z'
  }
];

// Function to calculate dynamic dashboard stats
export const getMockDashboardStats = () => ({
  totalVehicles: mockVehicles.length,
  totalDrivers: mockDrivers.length,
  totalFuelRecords: mockFuelRecords.length,
  totalMaintenanceRecords: mockMaintenanceRecords.length,
  totalWorkTickets: mockWorkTickets.length,
  pendingWorkTickets: mockWorkTickets.filter(ticket => ticket.status === 'pending').length,
  lastUpdated: new Date().toISOString()
});

// Static export for backward compatibility
export const mockDashboardStats = getMockDashboardStats();

// Helper function to get driver-specific data
export const getDriverSpecificData = (driverId: string) => {
  return {
    workTickets: mockWorkTickets.filter(ticket => ticket.driver_id === driverId),
    fuelRecords: mockFuelRecords.filter(record => record.driver_id === driverId),
    driver: mockDrivers.find(driver => driver.id === driverId)
  };
};

// Helper function to authenticate driver
export const authenticateDriver = (username: string, password: string) => {
  return mockDrivers.find(driver => 
    driver.username === username && driver.password === password
  );
};