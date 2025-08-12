import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, ArrowRightLeft, Calendar, MapPin } from 'lucide-react';
import { formatDate, formatNumber } from '../utils/helpers';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Transfer {
  id: string;
  vehicleId: string;
  fromDepartment: string;
  toDepartment: string;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  mileage: number;
  authorizedBy: string;
  receivedBy: string;
  reason: string;
  notes: string;
  createdAt: string;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3fe6e872`;

export function TransferManagement() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  const [formData, setFormData] = useState({
    vehicleId: '',
    fromDepartment: '',
    toDepartment: '',
    fromLocation: '',
    toLocation: '',
    transferDate: '',
    mileage: 0,
    authorizedBy: '',
    receivedBy: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchTransfers();
    fetchVehicles();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await fetch(`${API_BASE}/transfers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
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
      const response = await fetch(`${API_BASE}/transfers`, {
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
        fetchTransfers();
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      fromDepartment: '',
      toDepartment: '',
      fromLocation: '',
      toLocation: '',
      transferDate: '',
      mileage: 0,
      authorizedBy: '',
      receivedBy: '',
      reason: '',
      notes: ''
    });
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getFilteredTransfers = () => {
    let filtered = transfers;

    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(transfer => transfer.vehicleId === selectedVehicle);
    }

    return filtered.sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());
  };

  const transferForm = (
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
          <Label htmlFor="fromDepartment">From Department*</Label>
          <Input
            id="fromDepartment"
            value={formData.fromDepartment}
            onChange={(e) => setFormData({...formData, fromDepartment: e.target.value})}
            placeholder="State Department for Energy"
            required
          />
        </div>
        <div>
          <Label htmlFor="toDepartment">To Department*</Label>
          <Input
            id="toDepartment"
            value={formData.toDepartment}
            onChange={(e) => setFormData({...formData, toDepartment: e.target.value})}
            placeholder="Regional Office"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fromLocation">From Location*</Label>
          <Input
            id="fromLocation"
            value={formData.fromLocation}
            onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
            placeholder="Nairobi HQ"
            required
          />
        </div>
        <div>
          <Label htmlFor="toLocation">To Location*</Label>
          <Input
            id="toLocation"
            value={formData.toLocation}
            onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
            placeholder="Mombasa Office"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="transferDate">Transfer Date*</Label>
          <Input
            id="transferDate"
            type="date"
            value={formData.transferDate}
            onChange={(e) => setFormData({...formData, transferDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="mileage">Mileage at Transfer (km)*</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
            placeholder="45000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorizedBy">Authorized By*</Label>
          <Input
            id="authorizedBy"
            value={formData.authorizedBy}
            onChange={(e) => setFormData({...formData, authorizedBy: e.target.value})}
            placeholder="John Doe - Director"
            required
          />
        </div>
        <div>
          <Label htmlFor="receivedBy">Received By*</Label>
          <Input
            id="receivedBy"
            value={formData.receivedBy}
            onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
            placeholder="Jane Smith - Regional Manager"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Transfer*</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          placeholder="Operational requirements, relocation, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional transfer details..."
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
        <Button type="submit">Record Transfer</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vehicle Transfer Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Vehicle Transfer</DialogTitle>
            </DialogHeader>
            {transferForm}
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

      <div className="space-y-4">
        {getFilteredTransfers().length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No vehicle transfers found.</p>
            </CardContent>
          </Card>
        ) : (
          getFilteredTransfers().map((transfer) => {
            const vehicle = getVehicleById(transfer.vehicleId);
            
            return (
              <Card key={transfer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : transfer.vehicleId}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {transfer.fromDepartment} → {transfer.toDepartment}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">
                      Transfer Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">From Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {transfer.fromLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {transfer.toLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transfer Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transfer.transferDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-medium">{formatNumber(transfer.mileage)} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Authorized By</p>
                      <p className="font-medium">{transfer.authorizedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Received By</p>
                      <p className="font-medium">{transfer.receivedBy}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Reason for Transfer</p>
                    <p className="text-sm text-blue-700">{transfer.reason}</p>
                  </div>

                  {transfer.notes && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm">{transfer.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}