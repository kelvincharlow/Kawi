# Digital Fleet Management System - Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Features & Modules](#features--modules)
4. [User Roles](#user-roles)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Installation & Setup](#installation--setup)
8. [Configuration](#configuration)
9. [User Guide](#user-guide)
10. [Developer Guide](#developer-guide)
11. [Troubleshooting](#troubleshooting)
12. [Security](#security)

---

## System Overview

The **Digital Fleet Management System** is a comprehensive web-based application designed for government and organizational fleet management. It provides tools for vehicle tracking, driver management, fuel monitoring, maintenance scheduling, and administrative oversight.

### Key Characteristics
- **Technology Stack**: React 18.3.1 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL) with Edge Functions
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Authentication**: Multi-role user system
- **Deployment**: Production-ready with intelligent fallback systems

### Business Value
- **Cost Reduction**: Optimize fuel consumption and maintenance costs
- **Compliance**: Track government vehicle usage and reporting
- **Efficiency**: Streamline work ticket approvals and vehicle assignments
- **Transparency**: Complete audit trail for all fleet operations

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Database      │
│   React App     │◄──►│   Supabase       │◄──►│   PostgreSQL    │
│   (Port 5173+)  │    │   Edge Functions │    │   Tables        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Local Storage   │    │   API Gateway    │    │   File Storage  │
│ (Mock Data)     │    │   CORS Headers   │    │   (Future)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture
```
src/
├── components/           # React Components
│   ├── ui/              # shadcn/ui base components
│   ├── AuthPage.tsx     # Authentication
│   ├── DriverManagement.tsx
│   ├── VehicleRegistry.tsx
│   ├── FuelManagement.tsx
│   ├── MaintenanceManagement.tsx
│   ├── WorkTicketManagement.tsx
│   ├── TransferManagement.tsx
│   ├── ReportsAnalytics.tsx
│   └── ServerDebugPanel.tsx
├── utils/               # Utilities & Services
│   ├── apiService.ts    # API communication
│   ├── mockData.ts      # Sample data
│   ├── localStorage.ts  # Data persistence
│   ├── helpers.ts       # Utility functions
│   └── constants.ts     # System constants
├── supabase/           # Database Functions
│   └── functions/
│       └── server/
│           ├── index.tsx    # Main API handler
│           └── kv_store.tsx # Key-value storage
└── styles/             # Global styles
```

---

## Features & Modules

### 1. Dashboard
- **Real-time Statistics**: Vehicle count, driver status, fuel consumption
- **Quick Actions**: Access to all major functions
- **Status Indicators**: System health and connection status
- **Role-based Views**: Different dashboards for Admin vs Driver users

### 2. Vehicle Registry
**Core Features:**
- Vehicle registration and management
- Complete vehicle profiles (make, model, year, etc.)
- Status tracking (active, maintenance, retired)
- Department assignment
- Insurance and service tracking

**Data Fields:**
- Registration Number (GK format)
- Make, Model, Year
- Engine Details (size, number)
- Chassis Number
- Purchase Information
- Current Mileage
- Insurance Expiry
- Service Schedule

### 3. Driver Management
**Core Features:**
- Driver registration and profiles
- License management and tracking
- Department assignments
- Status management (active, suspended)
- Authentication credentials

**Data Fields:**
- Personal Information
- License Details (number, class, expiry)
- Contact Information
- Emergency Contacts
- Employment Details
- Medical Certificate Status

### 4. Fuel Management
**Core Features:**
- Fuel transaction recording
- Bulk account management
- Credit limit tracking
- Supplier relationships
- Cost analysis and reporting

**Bulk Accounts:**
- Account setup with suppliers
- Credit limit management
- Balance tracking
- Automatic deductions
- Deposit management

### 5. Maintenance Management
**Core Features:**
- Service scheduling
- Maintenance record keeping
- Cost tracking
- Service provider management
- Parts replacement tracking

**Maintenance Types:**
- Regular service
- Repairs
- Emergency maintenance
- Inspections

### 6. Work Ticket System
**Core Features:**
- Travel request submission
- Approval workflow
- Fuel allocation
- Trip tracking
- Return reporting

**Workflow:**
1. Driver submits request
2. Admin review and approval
3. Fuel allocation
4. Trip execution
5. Return and reporting

### 7. Transfer Management
**Core Features:**
- Asset transfer between departments
- Transfer approval workflow
- Asset tracking
- Transfer history

### 8. Reports & Analytics
**Core Features:**
- Comprehensive reporting
- Data export (CSV, JSON, PDF)
- Analytics dashboards
- Cost analysis
- Usage patterns

**Report Types:**
- Fleet summary
- Fuel consumption
- Maintenance costs
- Driver activity
- Department usage

---

## User Roles

### Administrator Role
**Permissions:**
- Full system access
- User management
- Vehicle registration
- Work ticket approval
- Financial oversight
- System configuration

**Default Login:**
- Username: `admin`
- Password: `admin123`

### Driver Role
**Permissions:**
- Submit work tickets
- View personal fuel records
- Update trip information
- Access assigned vehicle details

**Sample Driver Logins:**
- Username: `jsmith`, Password: `driver123`
- Username: `mwanjiku`, Password: `driver123`
- Username: `pkipchoge`, Password: `driver123`

---

## Database Schema

### Core Tables

#### vehicles
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  engine_size VARCHAR(20),
  color VARCHAR(30),
  chassis_number VARCHAR(50),
  engine_number VARCHAR(50),
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  current_mileage INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  department VARCHAR(100),
  assigned_driver_id UUID REFERENCES drivers(id),
  insurance_expiry DATE,
  last_service_date DATE,
  next_service_due DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### drivers
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_class VARCHAR(10),
  license_expiry DATE,
  date_of_birth DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  employment_date DATE,
  department VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  medical_certificate_expiry DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### fuel_records
```sql
CREATE TABLE fuel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  cost_per_liter DECIMAL(8,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  odometer_reading INTEGER,
  fuel_station VARCHAR(100),
  receipt_number VARCHAR(50),
  date DATE NOT NULL,
  notes TEXT,
  bulk_account_id UUID REFERENCES bulk_fuel_accounts(id),
  work_ticket_id UUID REFERENCES work_tickets(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### bulk_fuel_accounts
```sql
CREATE TABLE bulk_fuel_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name VARCHAR(100) NOT NULL,
  supplier_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  contact_person VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  initial_balance DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  fuel_types VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### work_tickets
```sql
CREATE TABLE work_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  driver_license VARCHAR(50) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
  vehicle_registration VARCHAR(20) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  purpose TEXT NOT NULL,
  fuel_required DECIMAL(8,2),
  estimated_distance DECIMAL(8,2),
  departure_date DATE,
  return_date DATE,
  additional_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(100),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### maintenance_records
```sql
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  service_provider VARCHAR(100) NOT NULL,
  service_date DATE NOT NULL,
  next_service_date DATE,
  mileage INTEGER,
  parts_replaced TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Documentation

### Base URL
- **Production**: `https://dftwstjxrxwszkufggom.supabase.co/functions/v1/server`
- **Development**: Uses mock data with localStorage persistence

### Authentication
All API requests require Bearer token authentication:
```
Authorization: Bearer {supabase_anon_key}
```

### Core Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

#### Vehicles
```http
GET /vehicles          # List all vehicles
POST /vehicles         # Create new vehicle
PUT /vehicles/{id}     # Update vehicle
DELETE /vehicles/{id}  # Delete vehicle
```

#### Drivers
```http
GET /drivers           # List all drivers
POST /drivers          # Create new driver
PUT /drivers/{id}      # Update driver
DELETE /drivers/{id}   # Delete driver
```

#### Fuel Records
```http
GET /fuel-records      # List all fuel records
POST /fuel-records     # Create new fuel record
```

#### Work Tickets
```http
GET /work-tickets              # List all work tickets
POST /work-tickets             # Create new work ticket
POST /work-tickets/{id}/approve # Approve work ticket
POST /work-tickets/{id}/reject  # Reject work ticket
```

#### Bulk Accounts
```http
GET /bulk-accounts     # List all bulk accounts
POST /bulk-accounts    # Create new bulk account
PUT /bulk-accounts/{id} # Update bulk account
DELETE /bulk-accounts/{id} # Delete bulk account
```

### Request/Response Examples

#### Create Vehicle
```http
POST /vehicles
Content-Type: application/json

{
  "registration_number": "GK 004 D",
  "make": "Toyota",
  "model": "Hilux",
  "year": 2024,
  "fuel_type": "diesel",
  "engine_size": "2.4L",
  "color": "White",
  "department": "State Department for Energy"
}
```

#### Create Work Ticket
```http
POST /work-tickets
Content-Type: application/json

{
  "driver_id": "driver-1",
  "driver_name": "John Smith",
  "driver_license": "DL123456",
  "vehicle_id": "vehicle-1",
  "vehicle_registration": "GK 001 A",
  "destination": "Nakuru Office",
  "purpose": "Monthly inspection",
  "fuel_required": 80,
  "estimated_distance": 320,
  "departure_date": "2024-01-25",
  "return_date": "2024-01-25"
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser
- Supabase account (for production)

### Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd "Digital Fleet System (Copy)"
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://dftwstjxrxwszkufggom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access Application**
- Open browser to `http://localhost:5173`
- Login with admin credentials: `admin` / `admin123`

### Production Deployment

1. **Build for Production**
```bash
npm run build
```

2. **Deploy Edge Functions**
```bash
npx supabase functions deploy server
```

3. **Configure Database**
```sql
-- Run database migrations
-- Set up RLS policies
-- Configure authentication
```

---

## Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Development Settings
NODE_ENV=development
VITE_APP_TITLE=Digital Fleet Management System
```

### System Constants
Located in `utils/constants.ts`:
```typescript
export const TIME_PERIODS = {
  week: 'Last 7 days',
  month: 'Last 30 days',
  quarter: 'Last 3 months',
  year: 'Last 12 months'
};

export const FUEL_TYPES = ['petrol', 'diesel', 'hybrid'];
export const VEHICLE_STATUS = ['active', 'maintenance', 'retired'];
export const DRIVER_STATUS = ['active', 'suspended', 'retired'];
```

### Mock Data Configuration
The system includes comprehensive mock data for development and demo purposes:
- 3 sample vehicles with realistic data
- 3 sample drivers with login credentials
- Sample fuel records, maintenance records, and work tickets
- Bulk fuel accounts with credit limits

---

## User Guide

### Getting Started

1. **Login**
   - Access the application URL
   - Enter credentials (admin/admin123 for admin access)
   - Navigate using the main dashboard

2. **Dashboard Overview**
   - View system statistics
   - Monitor connection status
   - Access quick actions
   - Check pending work tickets

### Common Tasks

#### Adding a New Vehicle
1. Navigate to "Vehicle Registry"
2. Click "Add Vehicle"
3. Fill in required information:
   - Registration number (GK format)
   - Make, model, year
   - Engine details
   - Department assignment
4. Save the vehicle record

#### Managing Fuel Records
1. Go to "Fuel Management"
2. Select "Add Fuel Record"
3. Choose vehicle and payment method
4. Enter fuel details:
   - Fuel type and quantity
   - Cost per liter
   - Supplier information
   - Receipt number
5. Submit the record

#### Processing Work Tickets
1. Access "Work Tickets" tab
2. Review pending requests
3. For each ticket:
   - Review details
   - Check fuel requirements
   - Approve or reject with comments
4. Approved tickets move to active status

#### Generating Reports
1. Navigate to "Reports & Analytics"
2. Select report type:
   - Fleet summary
   - Fuel consumption
   - Maintenance costs
   - Driver activity
3. Choose date range and filters
4. Export in desired format (CSV, JSON, PDF)

### Driver Interface

Drivers have a simplified interface focusing on:
- Submitting work ticket requests
- Viewing personal fuel records
- Updating trip information
- Accessing vehicle assignments

---

## Developer Guide

### Project Structure
```
├── components/          # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── *.tsx           # Feature components
├── utils/              # Utilities and services
├── supabase/           # Database functions
├── styles/             # Global styles
└── public/             # Static assets
```

### Development Workflow

1. **Feature Development**
   - Create feature branch
   - Develop components with TypeScript
   - Test with mock data
   - Add proper error handling

2. **Testing Strategy**
   - Component testing with mock data
   - API testing with Supabase functions
   - User acceptance testing
   - Performance testing

3. **Code Standards**
   - TypeScript strict mode
   - ESLint configuration
   - Prettier formatting
   - Component naming conventions

### Adding New Features

#### Creating a New Component
```typescript
// components/NewFeature.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface NewFeatureProps {
  // Define props interface
}

export function NewFeature({ }: NewFeatureProps) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data on component mount
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Feature</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Feature content */}
      </CardContent>
    </Card>
  );
}
```

#### Adding API Endpoints
```typescript
// utils/apiService.ts
async getNewData() {
  const response = await this.makeRequest<any>('new-endpoint');
  return response.success ? response.data : mockNewData;
}
```

#### Database Migration
```sql
-- Create new table
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;
```

### Performance Optimization

1. **Code Splitting**
   - Use dynamic imports for large components
   - Implement lazy loading

2. **State Management**
   - Minimize re-renders
   - Use useCallback and useMemo appropriately

3. **API Optimization**
   - Implement request caching
   - Use pagination for large datasets

---

## Troubleshooting

### Common Issues

#### 1. Connection Issues
**Problem**: "Server connection failed" message
**Solution**:
- Check internet connection
- Verify Supabase project status
- Use "Retry" button in connection indicator
- System falls back to mock data automatically

#### 2. Build Errors
**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit
```

#### 3. UI Component Issues
**Problem**: Missing or broken UI components
**Solution**:
- Verify shadcn/ui components are installed
- Check import paths
- Rebuild with latest dependencies

#### 4. Data Persistence Issues
**Problem**: Data not saving between sessions
**Solution**:
- Check localStorage is enabled
- Clear browser storage if corrupted
- Verify mock data configuration

### Debug Tools

#### Server Debug Panel
The system includes a built-in debug panel:
- Access via blue "Debug Server" button
- Tests all API endpoints
- Shows connection status
- Displays response details

#### Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API requests
- **Application**: Inspect localStorage data
- **Sources**: Debug component state

### Log Analysis
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Check API service logs
console.log('API Service using mock data:', apiService.isUsingMockData());
```

---

## Security

### Authentication
- **Session Management**: localStorage-based sessions
- **Password Requirements**: Default development passwords
- **Role-based Access**: Admin vs Driver permissions

### Data Protection
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS protection

### Production Security Checklist
- [ ] Change default passwords
- [ ] Enable HTTPS
- [ ] Configure proper CORS headers
- [ ] Set up proper RLS policies
- [ ] Enable audit logging
- [ ] Regular security updates

### Database Security
```sql
-- Row Level Security policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vehicles" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify vehicles" ON vehicles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

---

## Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Monitor system performance and logs
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update documentation
- **Annually**: Comprehensive security audit

### Backup Strategy
- **Database**: Automated Supabase backups
- **Code**: Git repository with regular commits
- **Configuration**: Environment variable documentation

### Support Contacts
- **System Administrator**: Configure as needed
- **Developer Support**: Reference this documentation
- **Database Issues**: Supabase support portal

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-20 | Initial release with core functionality |
| 1.1.0 | 2024-01-25 | Added reports and analytics |
| 1.2.0 | 2024-02-01 | Enhanced work ticket system |
| 1.3.0 | 2024-02-10 | Bulk fuel account management |

---

*Last Updated: January 2024*
*Document Version: 1.0*
