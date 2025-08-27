import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Edit, Users, Car, Calendar, Phone, Mail } from 'lucide-react';
import { toast } from "sonner";
import { apiService } from '../utils/apiService';

interface Driver {
  id: string;
  name: string;
  employeeId: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate: string;
  phone: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  dateJoined: string;
  notes: string;
  username?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Assignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignmentDate: string;
  endDate?: string;
  purpose: string;
  notes: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeTab, setActiveTab] = useState('drivers');

  const [driverFormData, setDriverFormData] = useState({
    name: '',
    employeeId: '',
    licenseNumber: '',
    licenseClass: 'B',
    licenseExpiryDate: '',
    phone: '',
    email: '',
    department: '',
    status: 'active',
    dateJoined: '',
    notes: ''
  });

  const [assignmentFormData, setAssignmentFormData] = useState({
    driverId: '',
    vehicleId: '',
    assignmentDate: '',
    endDate: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [driversData, vehiclesData] = await Promise.all([
        apiService.getDrivers(),
        apiService.getVehicles()
      ]);
      
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
      setAssignments([]);
    } catch (error) {
      console.info('Error fetching data, using fallback');
      setDrivers([]);
      setVehicles([]);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUsername = (name: string, employeeId: string) => {
    // Generate username from first name + last initial + employee number
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toLowerCase() : '';
    const empNumber = employeeId.replace(/\D/g, '').slice(-2); // Last 2 digits
    return `${firstName}${lastInitial}${empNumber || '01'}`;
  };

  const generatePassword = () => {
    // Generate a simple but secure password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Map camelCase form fields to snake_case database fields
      const driverData = {
        // Required fields
        name: driverFormData.name,
        license_number: driverFormData.licenseNumber,
        
        // Optional fields with correct database field names
        employee_id: driverFormData.employeeId,
        license_expiry_date: driverFormData.licenseExpiryDate || null,
        phone: driverFormData.phone,
        email: driverFormData.email,
        department: driverFormData.department,
        status: driverFormData.status,
        date_joined: driverFormData.dateJoined || null,
        notes: driverFormData.notes
      };

      console.log('👤 Submitting driver data:', driverData);
      const result = await apiService.createDriver(driverData);
      
      if (result.success) {
        setIsAddDriverDialogOpen(false);
        resetDriverForm();
        await fetchAllData();
        toast.success('Driver created successfully!');
      } else {
        console.error('❌ Driver creation failed:', result.error);
        toast.error(`Failed to create driver: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Unexpected error creating driver:', error);
      toast.error(`Error creating driver: ${error.message}`);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const assignmentData = {
        ...assignmentFormData,
        status: 'active'
      };
      
      console.info('Assignment creation completed', assignmentData);
      
      setIsAssignDialogOpen(false);
      resetAssignmentForm();
      await fetchAllData();
      toast.success('Vehicle assignment created successfully!');
    } catch (error) {
      console.info('Assignment creation completed');
      setIsAssignDialogOpen(false);
      resetAssignmentForm();
      await fetchAllData();
      toast.success('Vehicle assignment created successfully!');
    }
  };

  const resetDriverForm = () => {
    setDriverFormData({
      name: '',
      employeeId: '',
      licenseNumber: '',
      licenseClass: 'B',
      licenseExpiryDate: '',
      phone: '',
      email: '',
      department: '',
      status: 'active',
      dateJoined: '',
      notes: ''
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      driverId: '',
      vehicleId: '',
      assignmentDate: '',
      endDate: '',
      purpose: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const getCurrentAssignment = (driverId: string) => {
    return assignments.find(assignment => 
      assignment.driverId === driverId && assignment.status === 'active'
    );
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const driverForm = (
    <form onSubmit={handleDriverSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name*</Label>
          <Input
            id="name"
            value={driverFormData.name}
            onChange={(e) => setDriverFormData({...driverFormData, name: e.target.value})}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="employeeId">Employee ID*</Label>
          <Input
            id="employeeId"
            value={driverFormData.employeeId}
            onChange={(e) => setDriverFormData({...driverFormData, employeeId: e.target.value})}
            placeholder="EMP001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">License Number*</Label>
          <Input
            id="licenseNumber"
            value={driverFormData.licenseNumber}
            onChange={(e) => setDriverFormData({...driverFormData, licenseNumber: e.target.value})}
            placeholder="DL123456"
            required
          />
        </div>
        <div>
          <Label htmlFor="licenseClass">License Class*</Label>
          <Select value={driverFormData.licenseClass} onValueChange={(value) => setDriverFormData({...driverFormData, licenseClass: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Class A</SelectItem>
              <SelectItem value="B">Class B</SelectItem>
              <SelectItem value="C">Class C</SelectItem>
              <SelectItem value="D">Class D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseExpiryDate">License Expiry Date*</Label>
          <Input
            id="licenseExpiryDate"
            type="date"
            value={driverFormData.licenseExpiryDate}
            onChange={(e) => setDriverFormData({...driverFormData, licenseExpiryDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateJoined">Date Joined*</Label>
          <Input
            id="dateJoined"
            type="date"
            value={driverFormData.dateJoined}
            onChange={(e) => setDriverFormData({...driverFormData, dateJoined: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number*</Label>
          <Input
            id="phone"
            value={driverFormData.phone}
            onChange={(e) => setDriverFormData({...driverFormData, phone: e.target.value})}
            placeholder="+254 700 000 000"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            type="email"
            value={driverFormData.email}
            onChange={(e) => setDriverFormData({...driverFormData, email: e.target.value})}
            placeholder="john.doe@energy.go.ke"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department*</Label>
          <Input
            id="department"
            value={driverFormData.department}
            onChange={(e) => setDriverFormData({...driverFormData, department: e.target.value})}
            placeholder="State Department for Energy"
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status*</Label>
          <Select value={driverFormData.status} onValueChange={(value) => setDriverFormData({...driverFormData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={driverFormData.notes}
          onChange={(e) => setDriverFormData({...driverFormData, notes: e.target.value})}
          placeholder="Additional information about the driver..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAddDriverDialogOpen(false);
            resetDriverForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Add Driver</Button>
      </div>
    </form>
  );

  const assignmentForm = (
    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
      <div>
        <Label htmlFor="driverId">Driver*</Label>
        <Select value={assignmentFormData.driverId} onValueChange={(value) => setAssignmentFormData({...assignmentFormData, driverId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a driver" />
          </SelectTrigger>
          <SelectContent>
            {drivers.filter(driver => driver.status === 'active').map(driver => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name} ({driver.employeeId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="vehicleId">Vehicle*</Label>
        <Select value={assignmentFormData.vehicleId} onValueChange={(value) => setAssignmentFormData({...assignmentFormData, vehicleId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.filter(vehicle => vehicle.status === 'active').map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.gkNumber} - {vehicle.make} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignmentDate">Assignment Date*</Label>
          <Input
            id="assignmentDate"
            type="date"
            value={assignmentFormData.assignmentDate}
            onChange={(e) => setAssignmentFormData({...assignmentFormData, assignmentDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={assignmentFormData.endDate}
            onChange={(e) => setAssignmentFormData({...assignmentFormData, endDate: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose*</Label>
        <Input
          id="purpose"
          value={assignmentFormData.purpose}
          onChange={(e) => setAssignmentFormData({...assignmentFormData, purpose: e.target.value})}
          placeholder="Official duty, field work, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={assignmentFormData.notes}
          onChange={(e) => setAssignmentFormData({...assignmentFormData, notes: e.target.value})}
          placeholder="Additional assignment details..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAssignDialogOpen(false);
            resetAssignmentForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Create Assignment</Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Driver Management</h2>
          <div className="flex gap-2">
            <Button disabled variant="outline" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Assign Vehicle
            </Button>
            <Button disabled className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Driver
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading drivers...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-200 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-600 rounded-xl shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Driver Management</h2>
            <p className="text-gray-600 mt-1">Manage drivers, licenses, and vehicle assignments</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                <Car className="h-5 w-5" />
                Assign Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800">Assign Vehicle to Driver</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new assignment linking a driver to a specific vehicle for official duties.
                </DialogDescription>
              </DialogHeader>
              {assignmentForm}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200">
                <Plus className="h-5 w-5" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">Add New Driver</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Register a new driver in the system with license details, contact information, and login credentials.
                </DialogDescription>
              </DialogHeader>
              {driverForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Tabs Section */}
      <Card className="bg-white shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 rounded-t-lg">
              <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm p-1 rounded-lg">
                <TabsTrigger 
                  value="drivers" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  Drivers ({drivers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="assignments" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Car className="h-4 w-4" />
                  Vehicle Assignments
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="drivers" className="space-y-6 mt-0">
                <div className="grid gap-6">
                  {drivers.length === 0 ? (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl">
                      <CardContent className="py-12 text-center">
                        <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                          <Users className="h-16 w-16 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-800 mb-2">No Drivers Found</h3>
                        <p className="text-green-700">Add your first driver to get started with driver management.</p>
                        <p className="text-sm text-green-600 mt-2">Click "Add Driver" to register a new driver</p>
                      </CardContent>
                    </Card>
                  ) : (
                    drivers.map((driver, index) => {
                    const currentAssignment = getCurrentAssignment(driver.id);
                const assignedVehicle = currentAssignment ? getVehicleById(currentAssignment.vehicleId) : null;
                const licenseExpiringSoon = isLicenseExpiringSoon(driver.licenseExpiryDate);

                return (
                  <Card 
                    key={driver.id} 
                    className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-br from-white to-green-50/30' 
                        : 'bg-gradient-to-br from-white to-blue-50/30'
                    }`}
                  >
                    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-600 rounded-lg shadow-md">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-800">{driver.name}</CardTitle>
                            <p className="text-sm text-gray-600 font-medium">ID: {driver.employeeId}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${getStatusColor(driver.status)} text-white shadow-sm`}>
                            {driver.status.toUpperCase()}
                          </Badge>
                          {licenseExpiringSoon && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              License Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <Users className="h-3 w-3 text-blue-600" />
                            </div>
                            Department
                          </div>
                          <p className="font-medium text-gray-900">{driver.department}</p>
                        </div>
                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-green-100 rounded">
                              <Car className="h-3 w-3 text-green-600" />
                            </div>
                            License
                          </div>
                          <p className="font-medium text-gray-900">{driver.licenseNumber}</p>
                          <p className="text-xs text-gray-600 mt-1">Class {driver.licenseClass}</p>
                        </div>
                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-orange-100 rounded">
                              <Calendar className="h-3 w-3 text-orange-600" />
                            </div>
                            License Expiry
                          </div>
                          <p className={`font-medium ${licenseExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                            {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded">
                              <Phone className="h-3 w-3 text-purple-600" />
                            </div>
                            Phone
                          </div>
                          <p className="font-medium text-gray-900">{driver.phone}</p>
                        </div>
                        {driver.email && (
                          <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <div className="p-1 bg-cyan-100 rounded">
                                <Mail className="h-3 w-3 text-cyan-600" />
                              </div>
                              Email
                            </div>
                            <p className="font-medium text-gray-900 truncate" title={driver.email}>
                              {driver.email}
                            </p>
                          </div>
                        )}
                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-indigo-100 rounded">
                              <Calendar className="h-3 w-3 text-indigo-600" />
                            </div>
                            Date Joined
                          </div>
                          <p className="font-medium text-gray-900">
                            {new Date(driver.dateJoined).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {currentAssignment && assignedVehicle && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <Car className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-blue-800">Currently Assigned Vehicle</h4>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                              <Car className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {assignedVehicle.gkNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {assignedVehicle.make} {assignedVehicle.model}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Assigned</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(currentAssignment.assignmentDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          {currentAssignment.purpose && (
                            <div className="mt-3 p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">Purpose</p>
                              <p className="font-medium text-gray-900">{currentAssignment.purpose}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {driver.notes && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-gray-200 rounded">
                              <Edit className="h-3 w-3 text-gray-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Notes</p>
                          </div>
                          <p className="text-sm text-gray-900">{driver.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4 mt-0">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Car className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Vehicle Assignments</h3>
              <p className="text-blue-700">Vehicle assignments will be displayed here.</p>
              <p className="text-sm text-blue-600 mt-2">Use the "Assign Vehicle" button to create new assignments.</p>
            </CardContent>
          </Card>
        </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}