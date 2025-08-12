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
  Edit,
  Eye,
  Trash2,
  LogOut,
  User,
  FileText,
  Clock,
  CheckCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Key,
  AlertTriangle,
  Activity,
  Wifi,
  Database,
  Zap
} from 'lucide-react';
import { VehicleRegistry } from './components/VehicleRegistry';
import { DriverManagement } from './components/DriverManagement';
import { FuelManagement } from './components/FuelManagement';
import { MaintenanceManagement } from './components/MaintenanceManagement';
import { ComponentManagement } from './components/ComponentManagement';
import { TransferManagement } from './components/TransferManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { WorkTicketManagement } from './components/WorkTicketManagement';
import { AuthPage } from './components/AuthPage';
import { ServerDebugPanel } from './components/ServerDebugPanel';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { apiService } from './utils/apiService';

interface DashboardStats {
  totalVehicles: number;
  totalDrivers: number;
  totalFuelRecords: number;
  totalMaintenanceRecords: number;
  totalWorkTickets: number;
  pendingWorkTickets: number;
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

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalDrivers: 0,
    totalFuelRecords: 0,
    totalMaintenanceRecords: 0,
    totalWorkTickets: 0,
    pendingWorkTickets: 0,
    lastUpdated: new Date().toISOString()
  });
  const [driverTickets, setDriverTickets] = useState<DriverWorkTicket[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  useEffect(() => {
    // Check for existing session on app load
    checkAuthSession();
  }, []);

  useEffect(() => {
    if (user) {
      // First test server connection, then fetch data
      testServerConnection().then((isConnected) => {
        if (isConnected) {
          fetchDashboardStats();
          if (isDriver) {
            fetchDriverTickets();
          }
        } else {
          console.log('Server connection failed, skipping data fetch');
        }
      });
    }
  }, [user, isDriver]);

  const checkAuthSession = async () => {
    try {
      // Check if user has a valid session
      const savedUser = localStorage.getItem('fleet_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
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

  const testServerConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      const isConnected = await apiService.testConnection();
      
      if (isConnected) {
        if (apiService.isUsingMockData()) {
          setConnectionStatus('disconnected');
        } else {
          setConnectionStatus('connected');
        }
        return true;
      } else {
        setConnectionStatus('disconnected');
        return true; // Return true because we can still use mock data
      }
    } catch (error) {
      // Silently handle connection test failures
      setConnectionStatus('disconnected');
      return true; // Return true because we can still use mock data
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiService.getDashboardStats();
      setDashboardStats(stats);
      
      // Update connection status based on API service mode
      if (apiService.isUsingMockData()) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      // Gracefully handle stats fetching errors
      console.info('Dashboard stats unavailable, using defaults');
      
      // Set reasonable default stats
      setDashboardStats({
        totalVehicles: 3,
        totalDrivers: 3,
        totalFuelRecords: 3,
        totalMaintenanceRecords: 3,
        totalWorkTickets: 4,
        pendingWorkTickets: 2,
        lastUpdated: new Date().toISOString()
      });
      setConnectionStatus('disconnected');
    }
  };

  // Function to refresh dashboard stats - will be passed to child components
  const refreshDashboardStats = async () => {
    await fetchDashboardStats();
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
      console.info('Driver tickets unavailable, showing empty state');
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
        color: "bg-purple-500",
        badge: dashboardStats.pendingWorkTickets > 0 ? dashboardStats.pendingWorkTickets : null
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
                const isConnected = await testServerConnection();
                if (isConnected) {
                  fetchDashboardStats();
                  if (isDriver) {
                    fetchDriverTickets();
                  }
                }
              }} 
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg border-0 px-6 py-3"
              disabled={connectionStatus === 'testing'}
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Refresh Data'}
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
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm relative">
                      <stat.icon className="h-5 w-5" />
                      {stat.badge && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
                        >
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.badge && (
                    <p className="text-white/80 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {stat.badge} pending approval
                    </p>
                  )}
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
                  {dashboardStats.pendingWorkTickets > 0 && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      {dashboardStats.pendingWorkTickets} pending
                    </Badge>
                  )}
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

        {/* Enhanced System Status Section */}
        <Card className="bg-white shadow-xl border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              System Status
            </CardTitle>
            <p className="text-gray-600 mt-1">Monitor system health and connectivity</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Server Connection Status */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                connectionStatus === 'connected' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                connectionStatus === 'disconnected' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' : 
                'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    connectionStatus === 'connected' ? 'bg-green-100' :
                    connectionStatus === 'disconnected' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    <Wifi className={`h-5 w-5 ${
                      connectionStatus === 'connected' ? 'text-green-600' :
                      connectionStatus === 'disconnected' ? 'text-blue-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {connectionStatus === 'connected' ? 'Connected to Live Server' :
                       connectionStatus === 'disconnected' ? 'Demo Mode - Using Sample Data' :
                       'Testing connection...'}
                    </p>
                    <p className="text-sm text-gray-600">Backend service status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'disconnected' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  {connectionStatus === 'disconnected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const isConnected = await testServerConnection();
                        if (isConnected) {
                          fetchDashboardStats();
                          if (isDriver) {
                            fetchDriverTickets();
                          }
                        }
                      }}
                      className="ml-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                      disabled={connectionStatus === 'testing'}
                    >
                      {connectionStatus === 'testing' ? 'Testing...' : 'Retry'}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Application Status</p>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              {/* Last Updated Status */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Last Updated</p>
                    <p className="text-sm text-gray-600">{new Date(dashboardStats.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Pending Alerts */}
              {dashboardStats.pendingWorkTickets > 0 && (
                <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Pending Approvals</p>
                      <p className="text-sm text-gray-600">
                        {dashboardStats.pendingWorkTickets} work ticket{dashboardStats.pendingWorkTickets > 1 ? 's' : ''} awaiting review
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                    {dashboardStats.pendingWorkTickets}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Fleet Management System Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Admin: {user?.email}</span>
              </div>
              
              {/* Demo Mode Information */}
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-800">Demo Mode Active:</p>
                    <p className="text-blue-700">Using realistic sample data for demonstration</p>
                    <p className="text-blue-700">All features are fully functional with mock data</p>
                    <p className="text-blue-700">Perfect for testing and demonstration purposes</p>
                  </div>
                </div>
              )}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout */}
      <div className="bg-white border-b shadow-sm">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAdmin ? 'bg-blue-600' : 'bg-green-600'}`}>
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {isAdmin ? 'Admin Portal' : 'Driver Portal'} - Fleet Management
                </h1>
                <p className="text-xs text-gray-500">Ministry of Energy and Petroleum</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && dashboardStats.pendingWorkTickets > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('work-tickets')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {dashboardStats.pendingWorkTickets} Pending Tickets
                </Button>
              )}
              
              {isDriver && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('work-tickets')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Request
                </Button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.name || user.email}</span>
                {user.role && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {user.role}
                  </Badge>
                )}
                {isDriver && user.driverId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {user.driverId}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Admin Navigation */}
          {isAdmin && (
            <TabsList className="grid w-full grid-cols-9 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="work-tickets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Work Tickets
                {dashboardStats.pendingWorkTickets > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {dashboardStats.pendingWorkTickets}
                  </Badge>
                )}
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
      
      {/* Debug Panel - only show for admins or in development */}
      {(isAdmin || process.env.NODE_ENV === 'development') && (
        <ServerDebugPanel apiBase={API_BASE} />
      )}
      
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
    </div>
  );
}