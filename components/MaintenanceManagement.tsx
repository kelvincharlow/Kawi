import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle, Search, FileText, Download, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../utils/apiService';

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

export function MaintenanceManagement() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

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
      const data = await apiService.getMaintenanceRecords();
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await apiService.getVehicles();
      setVehicles(data || []);
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

      await apiService.createMaintenanceRecord(recordData);
      setIsAddDialogOpen(false);
      resetForm();
      fetchMaintenanceRecords();
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

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(record => record.priority === selectedPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const vehicle = getVehicleById(record.vehicleId);
        const vehicleText = vehicle ? `${vehicle.gkNumber} ${vehicle.make} ${vehicle.model}` : '';
        
        return (
          record.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.partsReplaced.some(part => part.toLowerCase().includes(searchTerm.toLowerCase())) ||
          record.notes.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
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

  const getMaintenanceStats = () => {
    const totalRecords = maintenanceRecords.length;
    const completedRecords = maintenanceRecords.filter(r => r.status === 'completed').length;
    const inProgressRecords = maintenanceRecords.filter(r => r.status === 'in-progress').length;
    const totalCost = maintenanceRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.cost, 0);
    
    return {
      totalRecords,
      completedRecords,
      inProgressRecords,
      totalCost,
      averageCost: completedRecords > 0 ? totalCost / completedRecords : 0
    };
  };

  const exportMaintenanceData = () => {
    const csvContent = [
      ['Date', 'Vehicle', 'Type', 'Provider', 'Description', 'Cost', 'Status', 'Priority'].join(','),
      ...getFilteredRecords().map(record => {
        const vehicle = getVehicleById(record.vehicleId);
        const vehicleName = vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : record.vehicleId;
        return [
          record.date,
          vehicleName,
          record.maintenanceType,
          record.serviceProvider,
          `"${record.workDescription}"`,
          record.cost,
          record.status,
          record.priority
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const maintenanceForm = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="vehicleId" className="text-gray-700 font-medium">Vehicle*</Label>
        <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
          <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAddDialogOpen(false);
            resetForm();
          }}
          className="hover:bg-gray-100 transition-colors"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Add Maintenance Record
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Maintenance Management</h2>
            <p className="text-gray-600 mt-1">Track and manage your fleet maintenance operations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={exportMaintenanceData}
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                Add Maintenance Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">Add Maintenance Record</DialogTitle>
              </DialogHeader>
              {maintenanceForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(() => {
          const stats = getMaintenanceStats();
          return (
            <>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
                      <p className="text-xs text-blue-600 mt-1">All maintenance entries</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-green-700">{stats.completedRecords}</p>
                      <p className="text-xs text-green-600 mt-1">Finished services</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                      <p className="text-3xl font-bold text-amber-700">{stats.inProgressRecords}</p>
                      <p className="text-xs text-amber-600 mt-1">Active maintenance</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Wrench className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Cost</p>
                      <p className="text-3xl font-bold text-purple-700">KES {stats.totalCost.toLocaleString()}</p>
                      <p className="text-xs text-purple-600 mt-1">Total expenses</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          );
        })()}
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search maintenance records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors"
              />
            </div>
            
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                <SelectValue placeholder="All Vehicles" />
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
              <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedVehicle('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              className="hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Maintenance Alert */}
      {getUpcomingMaintenance().length > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <span className="text-lg font-bold">Upcoming Maintenance</span>
                <p className="text-sm text-orange-700 font-normal mt-1">
                  {getUpcomingMaintenance().length} vehicle(s) require maintenance within 30 days
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingMaintenance().map((record) => {
                const vehicle = getVehicleById(record.vehicleId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Car className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-orange-900">
                          {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : record.vehicleId}
                        </span>
                        <p className="text-sm text-orange-700">{record.workDescription}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-orange-800">
                        Due: {new Date(record.nextServiceDate!).toLocaleDateString()}
                      </span>
                      <p className="text-xs text-orange-600">
                        {Math.ceil((new Date(record.nextServiceDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Analytics Chart */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl font-bold">Maintenance Costs by Vehicle</span>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Total maintenance expenses across your fleet
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getCostAnalytics()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="vehicle" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value) => [`KES ${value.toLocaleString()}`, 'Cost']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="cost" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="bg-gray-100 p-2 rounded-full">
              <Wrench className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <span className="text-xl font-bold">Maintenance Records</span>
              <p className="text-sm text-gray-600 font-normal mt-1">
                {getFilteredRecords().length} record(s) found
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {getFilteredRecords().length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Wrench className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No maintenance records found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              getFilteredRecords().map((record) => {
                const vehicle = getVehicleById(record.vehicleId);
                const MaintenanceIcon = getMaintenanceTypeIcon(record.maintenanceType);
                
                return (
                  <div key={record.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <MaintenanceIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : record.vehicleId}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize flex items-center gap-2 mt-1">
                            <span className="font-medium">{record.maintenanceType}</span>
                            <span className="text-gray-400">•</span>
                            <span>{record.serviceProvider}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getPriorityColor(record.priority)} text-white px-3 py-1 text-xs font-medium`}>
                          {record.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(record.status)} text-white px-3 py-1 text-xs font-medium`}>
                          {record.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Work Description</p>
                        <p className="font-medium text-sm text-gray-900">{record.workDescription}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Cost</p>
                        <p className="font-bold text-lg flex items-center gap-1 text-green-700">
                          <DollarSign className="h-4 w-4" />
                          KES {record.cost.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Mileage</p>
                        <p className="font-medium text-lg text-gray-900">{record.mileage.toLocaleString()} km</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Date</p>
                        <p className="font-medium text-sm flex items-center gap-1 text-gray-900">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {record.partsReplaced && record.partsReplaced.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Parts Replaced</p>
                        <div className="flex flex-wrap gap-2">
                          {record.partsReplaced.map((part, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                              {part}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.nextServiceDate && (
                      <div className="mb-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Next service due: {new Date(record.nextServiceDate).toLocaleDateString()}
                            {record.nextServiceMileage && ` at ${record.nextServiceMileage.toLocaleString()} km`}
                          </p>
                        </div>
                      </div>
                    )}

                    {record.notes && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Notes</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{record.notes}</p>
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