import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { 
  Car, 
  Users, 
  Fuel, 
  Wrench, 
  Battery, 
  ArrowRightLeft,
  BarChart3,
  Plus,
  LogOut,
  User,
  FileText,
  CheckCircle,
  Calendar,
  Key,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { VehicleRegistry } from './components/VehicleRegistry';
import { DriverManagement } from './components/DriverManagement';
import { FuelManagement } from './components/FuelManagement';
import { MaintenanceManagement } from './components/MaintenanceManagement';
import { MaintenanceManagementSimple } from './components/MaintenanceManagementSimple';
import { ComponentManagement } from './components/ComponentManagement';
import { TransferManagement } from './components/TransferManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { WorkTicketManagement } from './components/WorkTicketManagement';
import { AuthPage } from './components/AuthPage';
// Debug components - most were removed as they don't exist
import { ServerDebugPanel } from './components/ServerDebugPanel';
// import { ConnectionDebugPanel } from './components/ConnectionDebugPanel';
// import { SimpleTest } from './components/SimpleTest';
import { ResponsiveLayout, ResponsiveContainer } from './components/ui/responsive-layout';
import { apiService } from './utils/apiService';
import { logger, performance as perfMonitor } from './utils/optimization';

interface DashboardStats {
  totalVehicles: number;
  totalDrivers: number;
  totalFuelRecords: number;
  totalMaintenanceRecords: number;
  totalWorkTickets: number;
  lastUpdated: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  driverId?: string;
}

interface DriverWorkTicket {
  id: string;
  destination: string;
  purpose: string;
  fuel_required: number;
  status: string;
  created_at: string;
  approved_at?: string;
  vehicle_registration?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('checking');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalDrivers: 0,
    totalFuelRecords: 0,
    totalMaintenanceRecords: 0,
    totalWorkTickets: 0,
    lastUpdated: new Date().toISOString()
  });
  const [driverTickets, setDriverTickets] = useState<DriverWorkTicket[]>([]);

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  useEffect(() => {
    // Check for existing session on app load
    checkAuthSession();
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      console.log('🔍 Checking database connection...');
      await apiService.waitForInitialization();
      
      if (apiService.isUsingMockData()) {
        setDbStatus('mock');
        console.log('🧪 Using mock data');
      } else {
        setDbStatus('live');
        console.log('🔄 Using live database');
      }
    } catch (error) {
      setDbStatus('error');
      console.error('❌ Database check failed:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch data when user is available
      fetchDashboardStats();
      if (isDriver) {
        fetchDriverTickets();
      }
    }
  }, [user, isDriver]);

  // Refresh dashboard stats when switching to work tickets tab
  useEffect(() => {
    if (activeTab === 'work-tickets' && user) {
      logger.log('Switching to work tickets tab, refreshing stats...');
      refreshDashboardStats();
    }
  }, [activeTab, user]);

  const checkAuthSession = async () => {
    try {
      // Check if user has a valid session
      const savedUser = localStorage.getItem('fleet_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      logger.error('Error checking auth session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fleet_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fleet_user');
    setActiveTab('dashboard');
  };

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      // Gracefully handle stats fetching errors
      logger.info('Dashboard stats unavailable, calculating from available data');
      
      try {
        // Calculate real stats from available data
        const [vehiclesData, driversData, fuelData, maintenanceData, workTicketsData] = await Promise.all([
          apiService.getVehicles().catch(() => []),
          apiService.getDrivers().catch(() => []),
          apiService.getFuelRecords().catch(() => []),
          apiService.getMaintenanceRecords().catch(() => []),
          apiService.getWorkTickets().catch(() => [])
        ]);
        
        setDashboardStats({
          totalVehicles: (vehiclesData || []).length,
          totalDrivers: (driversData || []).length,
          totalFuelRecords: (fuelData || []).length,
          totalMaintenanceRecords: (maintenanceData || []).length,
          totalWorkTickets: (workTicketsData || []).length,
          lastUpdated: new Date().toISOString()
        });
      } catch (fallbackError) {
        // Last resort fallback
        setDashboardStats({
          totalVehicles: 3,
          totalDrivers: 3,
          totalFuelRecords: 3,
          totalMaintenanceRecords: 3,
          totalWorkTickets: 4,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  };

  // Function to refresh dashboard stats - will be passed to child components
  const refreshDashboardStats = async () => {
    logger.log('Refreshing dashboard stats...');
    await fetchDashboardStats();
    logger.log('Dashboard stats refreshed');
  };

  const fetchDriverTickets = async () => {
    try {
      const allTickets = await apiService.getWorkTickets();
      
      // Filter tickets for current driver using driver ID
      const userTickets = (allTickets || []).filter((ticket: any) => {
        // Primary filter: match by driver ID if available
        if (user?.driverId && ticket.driver_id === user.driverId) {
          return true;
        }
        
        // Fallback filters for backward compatibility
        const matchesName = ticket.driver_name === user?.name;
        const matchesEmail = ticket.driver_email === user?.email;
        const nameIncludesEmailPrefix = user?.email && ticket.driver_name?.toLowerCase().includes(user.email.split('@')[0].toLowerCase());
        
        return matchesName || matchesEmail || nameIncludesEmailPrefix;
      });
      
      setDriverTickets(userTickets);
    } catch (error) {
      // Gracefully handle ticket fetching errors
      logger.info('Driver tickets unavailable, showing empty state');
      setDriverTickets([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Admin Dashboard
  const renderAdminDashboard = () => {
    const statCards = [
      {
        title: "Total Vehicles",
        value: dashboardStats.totalVehicles,
        icon: Car,
        color: "bg-blue-500"
      },
      {
        title: "Total Drivers",
        value: dashboardStats.totalDrivers,
        icon: Users,
        color: "bg-green-500"
      },
      {
        title: "Work Tickets",
        value: dashboardStats.totalWorkTickets,
        icon: FileText,
        color: "bg-purple-500"
      },
      {
        title: "Fuel Records",
        value: dashboardStats.totalFuelRecords,
        icon: Fuel,
        color: "bg-yellow-500"
      },
      {
        title: "Maintenance Records",
        value: dashboardStats.totalMaintenanceRecords,
        icon: Wrench,
        color: "bg-red-500"
      }
    ];

    return (
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-blue-100 mt-2 text-lg">Ministry of Energy and Petroleum - Fleet Management System</p>
              <p className="text-blue-200 mt-1 text-sm">Complete oversight and control of your vehicle fleet</p>
            </div>
            <Button 
              onClick={async () => {
                fetchDashboardStats();
                if (isDriver) {
                  fetchDriverTickets();
                }
              }} 
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg border-0 px-6 py-3"
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat, index) => {
            const gradients = [
              'bg-gradient-to-br from-blue-500 to-cyan-600',
              'bg-gradient-to-br from-emerald-500 to-teal-600', 
              'bg-gradient-to-br from-purple-500 to-pink-600',
              'bg-gradient-to-br from-amber-500 to-orange-600',
              'bg-gradient-to-br from-red-500 to-rose-600'
            ];
            
            return (
              <Card key={index} className={`${gradients[index % gradients.length]} text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-white/90 flex items-center justify-between">
                    {stat.title}
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Quick Actions Section */}
        <Card className="bg-white shadow-xl border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <p className="text-gray-600 mt-1">Access key features with one click</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
                onClick={() => setActiveTab('work-tickets')}
              >
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">Work Tickets</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                onClick={() => setActiveTab('vehicles')}
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold">Vehicle Registry</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                onClick={() => setActiveTab('drivers')}
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-semibold">Driver Management</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                onClick={() => setActiveTab('fuel')}
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Fuel className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-semibold">Fuel Management</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                onClick={() => setActiveTab('maintenance')}
              >
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div className="font-semibold">Maintenance Log</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200"
                onClick={() => setActiveTab('components')}
              >
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Battery className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="font-semibold">Component Tracking</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200"
                onClick={() => setActiveTab('transfers')}
              >
                <div className="p-2 bg-teal-100 rounded-lg">
                  <ArrowRightLeft className="h-6 w-6 text-teal-600" />
                </div>
                <div className="font-semibold">Vehicle Transfers</div>
              </Button>
              <Button 
                variant="outline" 
                className="h-28 flex-col gap-3 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
                onClick={() => setActiveTab('reports')}
              >
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="font-semibold">Reports & Analytics</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Driver Dashboard
  const renderDriverDashboard = () => {
    const myTickets = driverTickets;
    const pendingTickets = myTickets.filter(t => t.status === 'pending');
    const approvedTickets = myTickets.filter(t => t.status === 'approved');
    const recentTickets = myTickets.slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Enhanced Driver Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <User className="h-8 w-8" />
                </div>
                Driver Dashboard
              </h1>
              <p className="text-green-100 mt-2 text-lg">Welcome back, {user?.name || user?.email}</p>
              <p className="text-green-200 flex items-center gap-2 mt-1">
                <Key className="h-4 w-4" />
                Personal Driver Portal - ID: {user?.driverId || user?.id}
              </p>
            </div>
            <Button 
              onClick={() => setActiveTab('work-tickets')} 
              className="bg-white text-green-600 hover:bg-green-50 shadow-lg border-0 px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Work Ticket
            </Button>
          </div>
        </div>

        {/* Enhanced Driver Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-100 flex items-center justify-between">
                My Work Tickets
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myTickets.length}</div>
              <p className="text-purple-100 mt-2">Total requests submitted</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-100 flex items-center justify-between">
                Pending Approval
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm relative">
                  <Clock className="h-5 w-5" />
                  {pendingTickets.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
                    >
                      {pendingTickets.length}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTickets.length}</div>
              <p className="text-amber-100 mt-2">Awaiting admin approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
                Approved Tickets
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedTickets.length}</div>
              <p className="text-emerald-100 mt-2">Ready for use</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Work Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(ticket.status)}
                        <span className="text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{ticket.destination}</p>
                      <p className="text-xs text-gray-600">{ticket.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{ticket.fuel_required}L</p>
                      <p className="text-xs text-gray-500">Fuel</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No work tickets yet</p>
                    <p className="text-sm">Submit your first work ticket request</p>
                  </div>
                )}
              </div>
              {recentTickets.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('work-tickets')}
                  >
                    View All Tickets
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start h-12"
                  onClick={() => setActiveTab('work-tickets')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Work Ticket Request
                </Button>
                
                {approvedTickets.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => setActiveTab('work-tickets')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Approved Authorizations ({approvedTickets.length})
                  </Button>
                )}
                
                {pendingTickets.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                    onClick={() => setActiveTab('work-tickets')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Check Pending Requests ({pendingTickets.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Driver Portal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Personal Portal:</strong> This is your individual driver portal with access only to your data
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Work Tickets:</strong> Submit requests for vehicle assignments and fuel authorization
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Authorization Process:</strong> All requests require admin approval before fuel collection
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Fuel Collection:</strong> Present approved authorization at petrol station
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Driver ID:</strong> {user?.driverId || user?.id} | <strong>Email:</strong> {user?.email}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Fleet Management System...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show main application if user is authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Modern Header */}
      <div className="bg-white border-b shadow-lg backdrop-blur-sm bg-white/95">
        {/* Header background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 pointer-events-none"></div>
        <div className="relative w-full px-4 lg:px-6 py-4 lg:py-5">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between">
            {/* Mobile - Enhanced Logo and system info */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shadow-lg ${isAdmin ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600'} ring-2 ring-white/20`}>
                <Car className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isAdmin ? 'Admin Portal' : 'Driver Portal'}
                </h1>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-medium">Fleet Management</span>
                  <div className={`w-1 h-1 rounded-full ${
                    dbStatus === 'live' ? 'bg-green-400' : 
                    dbStatus === 'mock' ? 'bg-yellow-400' : 
                    'bg-gray-400'
                  }`}></div>
                  <span className={`font-medium ${
                    dbStatus === 'live' ? 'text-green-600' : 
                    dbStatus === 'mock' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {dbStatus === 'live' ? 'Live DB' : 
                     dbStatus === 'mock' ? 'Mock Data' : 
                     'Checking...'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Mobile - Enhanced User info and logout */}
            <div className="flex items-center gap-2">
              {/* Mobile user avatar with glow effect */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${isAdmin ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 ring-2 ring-blue-200' : 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 ring-2 ring-green-200'}`}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              
              {/* Mobile logout button with enhanced styling */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 border-gray-200 hover:shadow-md"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile - Enhanced Quick actions row */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
            {/* Mobile new request with gradient */}
            {isDriver && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('work-tickets')}
                className="text-blue-600 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-medium flex-1 transition-all duration-200 hover:shadow-md"
              >
                <Plus className="h-3 w-3 mr-1" />
                New Request
              </Button>
            )}
          </div>

          {/* Enhanced Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left side - Enhanced Logo and system info */}
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl shadow-xl ${isAdmin ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600'} ring-4 ring-white/30 hover:scale-105 transition-transform duration-200`}>
                <Car className="h-7 w-7 text-white drop-shadow-lg" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {isAdmin ? 'Administrator Portal' : 'Driver Portal'}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold">Fleet Management System</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${
                      dbStatus === 'live' ? 'bg-green-400' :
                      dbStatus === 'mock' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className={`font-medium text-xs ${
                      dbStatus === 'live' ? 'text-green-600' :
                      dbStatus === 'mock' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {dbStatus === 'live' ? 'LIVE DB' :
                       dbStatus === 'mock' ? 'MOCK DATA' :
                       'CONNECTING...'}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="hidden lg:inline font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Ministry of Energy and Petroleum</span>
                  <span className="lg:hidden font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Ministry of Energy</span>
                </div>
              </div>
            </div>
            
            {/* Center - Enhanced Quick actions and notifications */}
            <div className="flex items-center gap-4">
              {/* Driver quick actions with enhanced styling */}
              {isDriver && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('work-tickets')}
                  className="text-blue-600 border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 ring-1 ring-blue-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              )}
              
              {/* Time and date display */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-mono text-blue-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Enhanced User info and logout */}
            <div className="flex items-center gap-4">
              {/* Enhanced User Profile Section */}
              <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${isAdmin ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 ring-2 ring-blue-200' : 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 ring-2 ring-green-200'} hover:scale-105 transition-transform duration-200`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-bold shadow-sm ${isAdmin ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200' : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'}`}
                    >
                      {isAdmin ? 'Administrator' : 'Driver'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="hidden xl:inline font-medium">{user.email}</span>
                    <span className="xl:hidden font-medium">{user.email.split('@')[0]}</span>
                    {isDriver && user.driverId && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-blue-600">ID: {user.driverId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 border-gray-300 shadow-md hover:shadow-lg font-semibold px-4 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Admin Navigation */}
          {isAdmin && (
            <>
              {/* Mobile Admin Navigation - Scrollable horizontal */}
              <div className="block md:hidden mb-6">
                <TabsList className="flex w-full overflow-x-auto p-1 space-x-1">
                  <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <BarChart3 className="h-3 w-3" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="work-tickets" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <FileText className="h-3 w-3" />
                    Tickets
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <Car className="h-3 w-3" />
                    Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="drivers" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <Users className="h-3 w-3" />
                    Drivers
                  </TabsTrigger>
                  <TabsTrigger value="fuel" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <Fuel className="h-3 w-3" />
                    Fuel
                  </TabsTrigger>
                  <TabsTrigger value="maintenance" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <Wrench className="h-3 w-3" />
                    Maintenance
                  </TabsTrigger>
                  <TabsTrigger value="components" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <Battery className="h-3 w-3" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger value="transfers" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <ArrowRightLeft className="h-3 w-3" />
                    Transfers
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-1 text-xs px-3 py-2 whitespace-nowrap">
                    <BarChart3 className="h-3 w-3" />
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop Admin Navigation - Full grid */}
              <div className="hidden md:block mb-8">
                <TabsList className="grid w-full grid-cols-9">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="work-tickets" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Work Tickets
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="drivers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Drivers
                  </TabsTrigger>
                  <TabsTrigger value="fuel" className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Fuel
                  </TabsTrigger>
                  <TabsTrigger value="maintenance" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance
                  </TabsTrigger>
                  <TabsTrigger value="components" className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger value="transfers" className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfers
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>
            </>
          )}

          {/* Driver Navigation */}
          {isDriver && (
            <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="work-tickets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Work Tickets
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="dashboard">
            {isAdmin ? renderAdminDashboard() : renderDriverDashboard()}
          </TabsContent>

          <TabsContent value="work-tickets">
            <WorkTicketManagement onTicketStatusChange={refreshDashboardStats} />
          </TabsContent>

          {/* Admin-only tabs */}
          {isAdmin && (
            <>
              <TabsContent value="vehicles">
                <VehicleRegistry />
              </TabsContent>

              <TabsContent value="drivers">
                <DriverManagement />
              </TabsContent>

              <TabsContent value="fuel">
                <FuelManagement />
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceManagement />
              </TabsContent>

              <TabsContent value="components">
                <ComponentManagement />
              </TabsContent>

              <TabsContent value="transfers">
                <TransferManagement />
              </TabsContent>

              <TabsContent value="reports">
                <ReportsAnalytics />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      
      {/* Demo Mode Indicator */}
      {apiService.isUsingMockData() && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Demo Mode - Using Sample Data</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Development diagnostic tools removed - components don't exist */}
      {/* All debug components have been cleaned up for production */}
      
      {/* Maintenance components removed - using MaintenanceManagement in main UI */}
    </div>
  );
}