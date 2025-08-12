import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Car, User, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../utils/apiService';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  driverId?: string;
}

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Admin login form
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });

  // Driver login form  
  const [driverForm, setDriverForm] = useState({
    username: '',
    password: ''
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Demo admin credentials
      if (adminForm.email === 'admin@energy.go.ke' && adminForm.password === 'admin123') {
        const adminUser: User = {
          id: 'admin-1',
          email: adminForm.email,
          role: 'admin',
          name: 'System Administrator'
        };
        onAuthSuccess(adminUser);
      } else {
        setError('Invalid admin credentials. Use admin@energy.go.ke / admin123');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get all drivers to check credentials
      const drivers = await apiService.getDrivers();
      
      // Find driver with matching credentials
      const driver = drivers.find((d: any) => 
        d.username === driverForm.username && d.password === driverForm.password
      );

      if (driver) {
        const driverUser: User = {
          id: driver.id,
          email: driver.email,
          role: 'driver',
          name: driver.name,
          driverId: driver.id
        };
        onAuthSuccess(driverUser);
      } else {
        setError('Invalid driver credentials. Please contact your administrator.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'jsmith', password: 'driver123', name: 'John Smith' },
    { username: 'mwanjiku', password: 'driver123', name: 'Mary Wanjiku' },
    { username: 'pkipchoge', password: 'driver123', name: 'Peter Kipchoge' }
  ];

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Car className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Fleet Management System</h1>
            <div className="space-y-1">
              <p className="text-gray-600 font-medium">Ministry of Energy and Petroleum</p>
              <p className="text-gray-500 text-sm">State Department for Energy</p>
            </div>
          </div>
        </div>

        {/* Enhanced Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">Choose your portal to continue</p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Administrator
                </TabsTrigger>
                <TabsTrigger 
                  value="driver" 
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Driver
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Admin Login */}
              <TabsContent value="admin" className="space-y-5">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 shadow-sm">
                    Administrator Portal
                  </Badge>
                  <p className="text-blue-700 mt-3 text-sm font-medium">
                    Full system access and management
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      placeholder="admin@energy.go.ke"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In as Administrator'}
                  </Button>
                </form>

                {/* Enhanced Demo credentials */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Demo Credentials
                  </p>
                  <div className="text-sm text-blue-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email:</span>
                      <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">admin@energy.go.ke</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Password:</span>
                      <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">admin123</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Driver Login */}
              <TabsContent value="driver" className="space-y-5">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 shadow-sm">
                    Driver Portal
                  </Badge>
                  <p className="text-green-700 mt-3 text-sm font-medium">
                    Personal work ticket management
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleDriverLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="driver-username" className="text-gray-700">Username</Label>
                    <Input
                      id="driver-username"
                      type="text"
                      value={driverForm.username}
                      onChange={(e) => setDriverForm({...driverForm, username: e.target.value})}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver-password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="driver-password"
                        type={showPassword ? "text" : "password"}
                        value={driverForm.password}
                        onChange={(e) => setDriverForm({...driverForm, password: e.target.value})}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In as Driver'}
                  </Button>
                </form>

                {/* Enhanced Demo credentials */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Demo Driver Credentials
                  </p>
                  <div className="space-y-3">
                    {demoCredentials.map((cred, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="font-medium text-green-800 mb-2">{cred.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-green-600 font-medium">Username</span>
                            <span className="font-mono bg-green-100 px-2 py-1 rounded mt-1">{cred.username}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-green-600 font-medium">Password</span>
                            <span className="font-mono bg-green-100 px-2 py-1 rounded mt-1">{cred.password}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Simple Footer */}
        <div className="text-center text-gray-500 space-y-1">
          <p className="text-sm">© 2024 Ministry of Energy and Petroleum</p>
          <p className="text-xs">Digital Fleet Management System</p>
        </div>
      </div>
    </div>
  );
}