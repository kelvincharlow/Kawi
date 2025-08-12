export const MAINTENANCE_TYPES = [
  { value: 'routine', label: 'Routine Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inspection', label: 'Inspection' }
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
] as const;

export const VEHICLE_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' }
] as const;

export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' }
] as const;

export const RECORD_TYPES = [
  { value: 'fuel-in', label: 'Fuel In' },
  { value: 'fuel-out', label: 'Fuel Out' }
] as const;

export const COMPONENT_TYPES = [
  { value: 'tire', label: 'Tire' },
  { value: 'battery', label: 'Battery' }
] as const;

export const TIRE_POSITIONS = [
  { value: 'front-left', label: 'Front Left' },
  { value: 'front-right', label: 'Front Right' },
  { value: 'rear-left', label: 'Rear Left' },
  { value: 'rear-right', label: 'Rear Right' },
  { value: 'spare', label: 'Spare' }
] as const;

export const COMPONENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'removed', label: 'Removed' },
  { value: 'replaced', label: 'Replaced' }
] as const;

export const DRIVER_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
] as const;

export const LICENSE_CLASSES = [
  { value: 'A', label: 'Class A' },
  { value: 'B', label: 'Class B' },
  { value: 'C', label: 'Class C' },
  { value: 'D', label: 'Class D' }
] as const;

export const MAINTENANCE_STATUS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
] as const;

export const ASSIGNMENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
] as const;

export const TIME_PERIODS = [
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'Last Year' }
] as const;