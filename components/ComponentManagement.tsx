import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Battery, Car } from 'lucide-react';
import { ComponentCard } from './ComponentCard';
import { COMPONENT_TYPES, TIRE_POSITIONS, COMPONENT_STATUS } from '../utils/constants';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Component {
  id: string;
  vehicleId: string;
  componentType: 'tire' | 'battery';
  make: string;
  model: string;
  serialNumber: string;
  position?: string;
  installationDate: string;
  installationMileage: number;
  removalDate?: string;
  removalMileage?: number;
  status: 'active' | 'removed' | 'replaced';
  warrantyMonths?: number;
  purchaseCost: number;
  supplier: string;
  notes: string;
  createdAt: string;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3fe6e872`;

export function ComponentManagement() {
  const [components, setComponents] = useState<Component[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  const [formData, setFormData] = useState({
    vehicleId: '',
    componentType: 'tire',
    make: '',
    model: '',
    serialNumber: '',
    position: '',
    installationDate: '',
    installationMileage: 0,
    removalDate: '',
    removalMileage: 0,
    status: 'active',
    warrantyMonths: 0,
    purchaseCost: 0,
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    fetchComponents();
    fetchVehicles();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${API_BASE}/components`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComponents(data.components || []);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
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
      const response = await fetch(`${API_BASE}/components`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchComponents();
      }
    } catch (error) {
      console.error('Error creating component:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      componentType: 'tire',
      make: '',
      model: '',
      serialNumber: '',
      position: '',
      installationDate: '',
      installationMileage: 0,
      removalDate: '',
      removalMileage: 0,
      status: 'active',
      warrantyMonths: 0,
      purchaseCost: 0,
      supplier: '',
      notes: ''
    });
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getFilteredComponents = (type: 'tire' | 'battery') => {
    let filtered = components.filter(component => component.componentType === type);

    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(component => component.vehicleId === selectedVehicle);
    }

    return filtered.sort((a, b) => new Date(b.installationDate).getTime() - new Date(a.installationDate).getTime());
  };

  const componentForm = (
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
          <Label htmlFor="componentType">Component Type*</Label>
          <Select value={formData.componentType} onValueChange={(value) => setFormData({...formData, componentType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formData.componentType === 'tire' && (
          <div>
            <Label htmlFor="position">Position*</Label>
            <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {TIRE_POSITIONS.map(position => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make*</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
            placeholder="Michelin, Exide, etc."
            required
          />
        </div>
        <div>
          <Label htmlFor="model">Model*</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            placeholder="Model/Part number"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="serialNumber">Serial Number*</Label>
        <Input
          id="serialNumber"
          value={formData.serialNumber}
          onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
          placeholder="Unique identifier"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="installationDate">Installation Date*</Label>
          <Input
            id="installationDate"
            type="date"
            value={formData.installationDate}
            onChange={(e) => setFormData({...formData, installationDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="installationMileage">Installation Mileage (km)*</Label>
          <Input
            id="installationMileage"
            type="number"
            value={formData.installationMileage}
            onChange={(e) => setFormData({...formData, installationMileage: parseInt(e.target.value) || 0})}
            placeholder="45000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status*</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_STATUS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="warrantyMonths">Warranty (months)</Label>
          <Input
            id="warrantyMonths"
            type="number"
            value={formData.warrantyMonths}
            onChange={(e) => setFormData({...formData, warrantyMonths: parseInt(e.target.value) || 0})}
            placeholder="12"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseCost">Purchase Cost (KES)*</Label>
          <Input
            id="purchaseCost"
            type="number"
            step="0.01"
            value={formData.purchaseCost}
            onChange={(e) => setFormData({...formData, purchaseCost: parseFloat(e.target.value) || 0})}
            placeholder="25000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="supplier">Supplier*</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="Supplier name"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional information..."
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
        <Button type="submit">Add Component</Button>
      </div>
    </form>
  );

  const renderComponentList = (type: 'tire' | 'battery') => {
    const filteredComponents = getFilteredComponents(type);
    const Icon = type === 'tire' ? Car : Battery;

    return (
      <div className="space-y-4">
        {filteredComponents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Icon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No {type} records found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComponents.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              vehicle={getVehicleById(component.vehicleId)}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Component Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Component
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Component</DialogTitle>
            </DialogHeader>
            {componentForm}
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
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
      </div>

      <Tabs defaultValue="tires" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tires" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Tires
          </TabsTrigger>
          <TabsTrigger value="batteries" className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Batteries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tires" className="mt-6">
          {renderComponentList('tire')}
        </TabsContent>

        <TabsContent value="batteries" className="mt-6">
          {renderComponentList('battery')}
        </TabsContent>
      </Tabs>
    </div>
  );
}