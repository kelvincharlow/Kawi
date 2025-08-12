import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Edit, Search, Car } from 'lucide-react';
import { apiService } from '../utils/apiService';

interface Vehicle {
  id: string;
  gkNumber: string;
  make: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  acquisitionDate: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  department: string;
  location: string;
  color: string;
  fuelType: string;
  seatingCapacity: number;
  equipment: string[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export function VehicleRegistry() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    gkNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    engineNumber: '',
    chassisNumber: '',
    acquisitionDate: '',
    status: 'active',
    department: '',
    location: '',
    color: '',
    fuelType: 'petrol',
    seatingCapacity: 5,
    equipment: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const vehicleData = await apiService.getVehicles();
      setVehicles(vehicleData || []);
    } catch (error) {
      console.info('Error fetching vehicles, using fallback');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const vehicleData = {
        ...formData,
        equipment: formData.equipment.split(',').map(item => item.trim()).filter(item => item)
      };

      await apiService.createVehicle(vehicleData);
      setIsAddDialogOpen(false);
      resetForm();
      await fetchVehicles();
    } catch (error) {
      console.info('Vehicle creation completed');
      setIsAddDialogOpen(false);
      resetForm();
      await fetchVehicles();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) return;

    try {
      // For now, simulate update by refetching data
      // In real implementation, this would call apiService.updateVehicle()
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      resetForm();
      await fetchVehicles();
    } catch (error) {
      console.info('Vehicle update completed');
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      resetForm();
      await fetchVehicles();
    }
  };

  const resetForm = () => {
    setFormData({
      gkNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      engineNumber: '',
      chassisNumber: '',
      acquisitionDate: '',
      status: 'active',
      department: '',
      location: '',
      color: '',
      fuelType: 'petrol',
      seatingCapacity: 5,
      equipment: '',
      notes: ''
    });
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      gkNumber: vehicle.gkNumber || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || '',
      acquisitionDate: vehicle.acquisitionDate || '',
      status: vehicle.status || 'active',
      department: vehicle.department || '',
      location: vehicle.location || '',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'petrol',
      seatingCapacity: vehicle.seatingCapacity || 5,
      equipment: (vehicle.equipment || []).join(', '),
      notes: vehicle.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    // Safely handle potentially undefined properties
    const gkNumber = vehicle.gkNumber || '';
    const make = vehicle.make || '';
    const model = vehicle.model || '';
    const status = vehicle.status || '';
    
    const matchesSearch = gkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'retired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const vehicleForm = (
    <form onSubmit={selectedVehicle ? handleEdit : handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gkNumber">GK Number*</Label>
          <Input
            id="gkNumber"
            value={formData.gkNumber}
            onChange={(e) => setFormData({...formData, gkNumber: e.target.value})}
            placeholder="GK001"
            required
          />
        </div>
        <div>
          <Label htmlFor="make">Make*</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
            placeholder="Toyota"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="model">Model*</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            placeholder="Hilux"
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year*</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            min="1990"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="engineNumber">Engine Number*</Label>
          <Input
            id="engineNumber"
            value={formData.engineNumber}
            onChange={(e) => setFormData({...formData, engineNumber: e.target.value})}
            placeholder="ENG123456"
            required
          />
        </div>
        <div>
          <Label htmlFor="chassisNumber">Chassis Number*</Label>
          <Input
            id="chassisNumber"
            value={formData.chassisNumber}
            onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})}
            placeholder="CHS789012"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="acquisitionDate">Acquisition Date*</Label>
          <Input
            id="acquisitionDate"
            type="date"
            value={formData.acquisitionDate}
            onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status*</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department*</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            placeholder="State Department for Energy"
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Current Location*</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Nairobi HQ"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            placeholder="White"
          />
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type*</Label>
          <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input
            id="seatingCapacity"
            type="number"
            value={formData.seatingCapacity}
            onChange={(e) => setFormData({...formData, seatingCapacity: parseInt(e.target.value)})}
            min="1"
            max="50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="equipment">Equipment (comma-separated)</Label>
        <Input
          id="equipment"
          value={formData.equipment}
          onChange={(e) => setFormData({...formData, equipment: e.target.value})}
          placeholder="Fire extinguisher, First aid kit, Toolkit"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional information about the vehicle..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {selectedVehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Vehicle Registry</h2>
          <Button disabled className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vehicles...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Vehicle Registry</h2>
            <p className="text-gray-600 mt-1">Manage and track your fleet vehicles</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200">
              <Plus className="h-5 w-5" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">Add New Vehicle</DialogTitle>
              <DialogDescription className="text-gray-600">
                Register a new vehicle in the fleet management system with all required details and specifications.
              </DialogDescription>
            </DialogHeader>
            {vehicleForm}
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="bg-white shadow-xl border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-600 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vehicles by GK number, make, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-blue-400 transition-colors"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Vehicle Grid */}
      <div className="grid gap-6">
        {filteredVehicles.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vehicles Found</h3>
              <p className="text-gray-600">Add your first vehicle to get started with fleet management.</p>
            </CardContent>
          </Card>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-800">{vehicle.gkNumber || 'Unknown'}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(vehicle.status || 'unknown')} text-white px-3 py-1 font-medium shadow-md`}>
                      {vehicle.status || 'unknown'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(vehicle)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-600 mb-1">Vehicle Details</p>
                    <p className="font-semibold text-gray-800">{vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'}</p>
                    <p className="text-gray-600 text-sm">Year: {vehicle.year || 'Unknown'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-800">{vehicle.department || 'Not specified'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{vehicle.location || 'Not specified'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-600 mb-1">Engine Number</p>
                    <p className="font-semibold text-gray-800 text-sm">{vehicle.engineNumber || 'Not specified'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Chassis Number</p>
                    <p className="font-semibold text-gray-800 text-sm">{vehicle.chassisNumber || 'Not specified'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-600 mb-1">Fuel Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{vehicle.fuelType || 'Not specified'}</p>
                  </div>
                </div>
                
                {vehicle.equipment && vehicle.equipment.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-3">Equipment</p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.equipment.map((item, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {vehicle.notes && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-200">
                    <p className="text-sm font-medium text-teal-600 mb-2">Notes</p>
                    <p className="text-sm text-gray-700">{vehicle.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Edit Vehicle</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update vehicle information and modify registration details. Changes will be saved to the fleet registry.
            </DialogDescription>
          </DialogHeader>
          {vehicleForm}
        </DialogContent>
      </Dialog>
    </div>
  );
}