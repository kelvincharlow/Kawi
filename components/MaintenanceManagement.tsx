import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceType: 'routine' | 'repair' | 'emergency' | 'inspection';
  serviceProvider: string;
  workDescription: string;
  partsReplaced: string[];
  cost: number;
  laborCost: number;
  partsCost: number;
  mileage: number;
  date: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  warrantyInfo?: string;
  notes: string;
  createdAt: string;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3fe6e872`;

export function MaintenanceManagement() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    vehicleId: '',
    maintenanceType: 'routine',
    serviceProvider: '',
    workDescription: '',
    partsReplaced: '',
    cost: 0,
    laborCost: 0,
    partsCost: 0,
    mileage: 0,
    date: '',
    nextServiceDate: '',
    nextServiceMileage: 0,
    status: 'scheduled',
    priority: 'medium',
    warrantyInfo: '',
    notes: ''
  });

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (formData.laborCost && formData.partsCost) {
      setFormData(prev => ({
        ...prev,
        cost: prev.laborCost + prev.partsCost
      }));
    }
  }, [formData.laborCost, formData.partsCost]);

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/maintenance`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceRecords(data.maintenance || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordData = {
        ...formData,
        partsReplaced: formData.partsReplaced.split(',').map(part => part.trim()).filter(part => part)
      };

      const response = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchMaintenanceRecords();
      }
    } catch (error) {
      console.error('Error creating maintenance record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      maintenanceType: 'routine',
      serviceProvider: '',
      workDescription: '',
      partsReplaced: '',
      cost: 0,
      laborCost: 0,
      partsCost: 0,
      mileage: 0,
      date: '',
      nextServiceDate: '',
      nextServiceMileage: 0,
      status: 'scheduled',
      priority: 'medium',
      warrantyInfo: '',
      notes: ''
    });
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getFilteredRecords = () => {
    let filtered = maintenanceRecords;

    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(record => record.vehicleId === selectedVehicle);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case 'routine': return CheckCircle;
      case 'repair': return Wrench;
      case 'emergency': return AlertTriangle;
      case 'inspection': return Calendar;
      default: return Wrench;
    }
  };

  const getCostAnalytics = () => {
    const vehicleCosts: { [key: string]: number } = {};
    
    maintenanceRecords.forEach(record => {
      if (record.status === 'completed') {
        vehicleCosts[record.vehicleId] = (vehicleCosts[record.vehicleId] || 0) + record.cost;
      }
    });

    return Object.entries(vehicleCosts).map(([vehicleId, cost]) => {
      const vehicle = getVehicleById(vehicleId);
      return {
        vehicle: vehicle ? `${vehicle.gkNumber}` : vehicleId,
        cost: cost
      };
    });
  };

  const getUpcomingMaintenance = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return maintenanceRecords.filter(record => 
      record.nextServiceDate && 
      new Date(record.nextServiceDate) <= thirtyDaysFromNow &&
      new Date(record.nextServiceDate) >= today
    );
  };

  const maintenanceForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vehicleId">Vehicle*</Label>
        <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.gkNumber} - {vehicle.make} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maintenanceType">Maintenance Type*</Label>
          <Select value={formData.maintenanceType} onValueChange={(value) => setFormData({...formData, maintenanceType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority*</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="serviceProvider">Service Provider*</Label>
        <Input
          id="serviceProvider"
          value={formData.serviceProvider}
          onChange={(e) => setFormData({...formData, serviceProvider: e.target.value})}
          placeholder="Toyota Service Center"
          required
        />
      </div>

      <div>
        <Label htmlFor="workDescription">Work Description*</Label>
        <Textarea
          id="workDescription"
          value={formData.workDescription}
          onChange={(e) => setFormData({...formData, workDescription: e.target.value})}
          placeholder="Describe the maintenance work to be performed..."
          required
        />
      </div>

      <div>
        <Label htmlFor="partsReplaced">Parts Replaced (comma-separated)</Label>
        <Input
          id="partsReplaced"
          value={formData.partsReplaced}
          onChange={(e) => setFormData({...formData, partsReplaced: e.target.value})}
          placeholder="Oil filter, brake pads, air filter"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="laborCost">Labor Cost (KES)*</Label>
          <Input
            id="laborCost"
            type="number"
            step="0.01"
            value={formData.laborCost}
            onChange={(e) => setFormData({...formData, laborCost: parseFloat(e.target.value) || 0})}
            placeholder="5000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="partsCost">Parts Cost (KES)*</Label>
          <Input
            id="partsCost"
            type="number"
            step="0.01"
            value={formData.partsCost}
            onChange={(e) => setFormData({...formData, partsCost: parseFloat(e.target.value) || 0})}
            placeholder="15000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="cost">Total Cost (KES)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
            placeholder="20000.00"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mileage">Current Mileage (km)*</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
            placeholder="45000"
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Service Date*</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nextServiceDate">Next Service Date</Label>
          <Input
            id="nextServiceDate"
            type="date"
            value={formData.nextServiceDate}
            onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="nextServiceMileage">Next Service Mileage (km)</Label>
          <Input
            id="nextServiceMileage"
            type="number"
            value={formData.nextServiceMileage}
            onChange={(e) => setFormData({...formData, nextServiceMileage: parseInt(e.target.value) || 0})}
            placeholder="50000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status*</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="warrantyInfo">Warranty Information</Label>
        <Input
          id="warrantyInfo"
          value={formData.warrantyInfo}
          onChange={(e) => setFormData({...formData, warrantyInfo: e.target.value})}
          placeholder="6 months or 10,000 km"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional information about the maintenance..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAddDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Add Maintenance Record</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Maintenance Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Maintenance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Maintenance Record</DialogTitle>
            </DialogHeader>
            {maintenanceForm}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.gkNumber} - {vehicle.make} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Maintenance Alert */}
      {getUpcomingMaintenance().length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUpcomingMaintenance().map((record) => {
                const vehicle = getVehicleById(record.vehicleId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-orange-100 rounded">
                    <span className="font-medium text-orange-800">
                      {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : record.vehicleId}
                    </span>
                    <span className="text-sm text-orange-700">
                      Due: {new Date(record.nextServiceDate!).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Costs by Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCostAnalytics()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Cost']} />
              <Bar dataKey="cost" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredRecords().length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No maintenance records found.</p>
              </div>
            ) : (
              getFilteredRecords().map((record) => {
                const vehicle = getVehicleById(record.vehicleId);
                const MaintenanceIcon = getMaintenanceTypeIcon(record.maintenanceType);
                
                return (
                  <div key={record.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <MaintenanceIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : record.vehicleId}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {record.maintenanceType} • {record.serviceProvider}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(record.priority)} text-white`}>
                          {record.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(record.status)} text-white`}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Work Description</p>
                        <p className="font-medium text-sm">{record.workDescription}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          KES {record.cost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mileage</p>
                        <p className="font-medium">{record.mileage.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {record.partsReplaced && record.partsReplaced.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Parts Replaced</p>
                        <div className="flex flex-wrap gap-1">
                          {record.partsReplaced.map((part, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {part}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.nextServiceDate && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        Next service due: {new Date(record.nextServiceDate).toLocaleDateString()}
                        {record.nextServiceMileage && ` at ${record.nextServiceMileage.toLocaleString()} km`}
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}