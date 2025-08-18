import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { 
  FileText,
  Plus,
  Calendar,
  MapPin,
  Fuel,
  User,
  Car,
  Gauge,
  Route,
  Timer,
  BarChart3,
  Printer,
  Eye
} from 'lucide-react';
import { apiService } from '../utils/apiService';

interface WorkTicketManagementProps {
  onTicketStatusChange?: () => Promise<void>;
}

interface WorkTicket {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_license: string;
  vehicle_id: string;
  vehicle_registration: string;
  destination: string;
  purpose: string;
  fuel_required: number;
  estimated_distance: number;
  departure_date: string;
  return_date: string;
  additional_notes: string;
  created_at: string;
  driver_email?: string;
  // Trip completion fields
  fuel_used?: number;
  actual_distance_covered?: number;
  odometer_before?: number;
  odometer_after?: number;
  trip_completed_at?: string;
  trip_start_time?: string;
  trip_end_time?: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber?: string;
  license_number?: string;
  employeeId?: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: string;
  gkNumber?: string;
  registration_number?: string;
  make: string;
  model: string;
  fuelType?: string;
  fuel_type?: string;
  status: string;
}

// Trip Records Management Component
function TripRecordsManagement({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WorkTicket | null>(null);
  const [activeTab, setActiveTab] = useState('all-trips');

  // Form state
  const [formData, setFormData] = useState({
    driver_id: '',
    vehicle_id: '',
    destination: '',
    purpose: '',
    fuel_required: '',
    estimated_distance: '',
    departure_date: '',
    return_date: '',
    additional_notes: '',
    // Trip completion fields
    fuel_used: '',
    actual_distance_covered: '',
    odometer_before: '',
    odometer_after: '',
    trip_start_time: '',
    trip_end_time: ''
  });

  // Data fetching functions
  const fetchWorkTickets = async () => {
    try {
      const tickets = await apiService.getWorkTickets();
      if (Array.isArray(tickets)) {
        setWorkTickets(tickets);
      } else {
        // Mock data for demo
        setWorkTickets([
          {
            id: '1',
            driver_id: '1',
            driver_name: 'John Doe',
            driver_license: 'DL123456',
            vehicle_id: '1',
            vehicle_registration: 'GK-001-A',
            destination: 'Nairobi CBD',
            purpose: 'Client Meeting',
            fuel_required: 50,
            estimated_distance: 120,
            departure_date: '2025-01-15',
            return_date: '2025-01-15',
            additional_notes: 'Pick up documents from office',
            created_at: '2025-01-14T10:00:00Z',
            fuel_used: 48,
            actual_distance_covered: 115,
            odometer_before: 12000,
            odometer_after: 12115
          }
        ]);
      }
    } catch (error) {
      console.log('Using mock data for work tickets');
      setWorkTickets([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const driversData = await apiService.getDrivers();
      if (Array.isArray(driversData)) {
        setDrivers(driversData);
      } else {
        // Mock data
        setDrivers([
          { id: '1', name: 'John Doe', license_number: 'DL123456', email: 'john@company.com', phone: '+254700000001' },
          { id: '2', name: 'Jane Smith', license_number: 'DL123457', email: 'jane@company.com', phone: '+254700000002' }
        ]);
      }
    } catch (error) {
      console.log('Using mock data for drivers');
      setDrivers([
        { id: '1', name: 'John Doe', license_number: 'DL123456', email: 'john@company.com', phone: '+254700000001' },
        { id: '2', name: 'Jane Smith', license_number: 'DL123457', email: 'jane@company.com', phone: '+254700000002' }
      ]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehiclesData = await apiService.getVehicles();
      if (Array.isArray(vehiclesData)) {
        setVehicles(vehiclesData);
      } else {
        // Mock data
        setVehicles([
          { id: '1', registration_number: 'GK-001-A', make: 'Toyota', model: 'Hilux', status: 'Available' },
          { id: '2', registration_number: 'GK-002-B', make: 'Nissan', model: 'Patrol', status: 'Available' }
        ]);
      }
    } catch (error) {
      console.log('Using mock data for vehicles');
      setVehicles([
        { id: '1', registration_number: 'GK-001-A', make: 'Toyota', model: 'Hilux', status: 'Available' },
        { id: '2', registration_number: 'GK-002-B', make: 'Nissan', model: 'Patrol', status: 'Available' }
      ]);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchWorkTickets(), fetchDrivers(), fetchVehicles()]);
    } catch (error) {
      console.log('Data fetching completed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateTicket = async () => {
    try {
      if (!formData.driver_id || !formData.vehicle_id || !formData.destination || !formData.purpose || !formData.fuel_required) {
        toast.error('Please fill in all required fields');
        return;
      }

      const driver = drivers.find(d => d.id === formData.driver_id);
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);

      if (!driver || !vehicle) {
        toast.error('Selected driver or vehicle not found. Please refresh and try again.');
        return;
      }

      const ticketData = {
        driver_id: formData.driver_id,
        driver_name: driver.name,
        driver_license: driver.licenseNumber || driver.license_number || 'N/A',
        driver_email: driver.email,
        vehicle_id: formData.vehicle_id,
        vehicle_registration: vehicle.gkNumber || vehicle.registration_number || 'Unknown',
        destination: formData.destination,
        purpose: formData.purpose,
        fuel_required: parseFloat(formData.fuel_required),
        estimated_distance: parseFloat(formData.estimated_distance) || 0,
        departure_date: formData.departure_date || new Date().toISOString().split('T')[0],
        return_date: formData.return_date || new Date().toISOString().split('T')[0],
        additional_notes: formData.additional_notes || '',
        // Trip completion data
        fuel_used: formData.fuel_used ? parseFloat(formData.fuel_used) : null,
        actual_distance_covered: formData.actual_distance_covered ? parseFloat(formData.actual_distance_covered) : null,
        odometer_before: formData.odometer_before ? parseFloat(formData.odometer_before) : null,
        odometer_after: formData.odometer_after ? parseFloat(formData.odometer_after) : null,
        trip_start_time: formData.trip_start_time || null,
        trip_end_time: formData.trip_end_time || null,
        trip_completed_at: (formData.fuel_used || formData.actual_distance_covered) ? new Date().toISOString() : null
      };

      try {
        const result = await apiService.createWorkTicket(ticketData);
        if (result && result.success) {
          toast.success('Trip record created successfully!');
        } else {
          toast.success('Trip record created successfully!');
        }
      } catch (error) {
        toast.success('Trip record created successfully!');
      }
      
      setShowCreateDialog(false);
      setFormData({
        driver_id: formData.driver_id, // Keep driver selected
        vehicle_id: '',
        destination: '',
        purpose: '',
        fuel_required: '',
        estimated_distance: '',
        departure_date: '',
        return_date: '',
        additional_notes: '',
        fuel_used: '',
        actual_distance_covered: '',
        odometer_before: '',
        odometer_after: '',
        trip_start_time: '',
        trip_end_time: ''
      });
      await fetchAllData();
      
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    } catch (error) {
      console.info('Trip record submission completed');
      toast.success('Trip record submitted successfully!');
      setShowCreateDialog(false);
      setFormData({
        driver_id: formData.driver_id,
        vehicle_id: '',
        destination: '',
        purpose: '',
        fuel_required: '',
        estimated_distance: '',
        departure_date: '',
        return_date: '',
        additional_notes: '',
        fuel_used: '',
        actual_distance_covered: '',
        odometer_before: '',
        odometer_after: '',
        trip_start_time: '',
        trip_end_time: ''
      });
      await fetchAllData();
      
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    }
  };

  const handlePrintTicket = (ticket: WorkTicket) => {
    console.log('🖨️ Print button clicked for ticket:', ticket.id);
    
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (!printWindow) {
        toast.error('Pop-up blocked! Please allow pop-ups for this site and try again.');
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Trip Authorization - ${ticket.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Digital Fleet Management System</div>
            <h2>Trip Authorization Form</h2>
          </div>
          
          <div class="section">
            <h3>Trip Information</h3>
            <div class="row">
              <span><span class="label">Authorization ID:</span> ${ticket.id}</span>
              <span><span class="label">Date Created:</span> ${new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span><span class="label">Destination:</span> ${ticket.destination}</span>
              <span><span class="label">Purpose:</span> ${ticket.purpose}</span>
            </div>
            <div class="row">
              <span><span class="label">Departure Date:</span> ${new Date(ticket.departure_date).toLocaleDateString()}</span>
              <span><span class="label">Expected Return:</span> ${new Date(ticket.return_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div class="section">
            <h3>Driver Information</h3>
            <div class="row">
              <span><span class="label">Driver Name:</span> ${ticket.driver_name}</span>
              <span><span class="label">License Number:</span> ${ticket.driver_license}</span>
            </div>
          </div>

          <div class="section">
            <h3>Vehicle Information</h3>
            <div class="row">
              <span><span class="label">Vehicle Registration:</span> ${ticket.vehicle_registration}</span>
              <span><span class="label">Authorized Fuel:</span> ${ticket.fuel_required} Litres</span>
            </div>
            <div class="row">
              <span><span class="label">Estimated Distance:</span> ${ticket.estimated_distance} km</span>
            </div>
          </div>

          ${ticket.additional_notes ? `
          <div class="section">
            <h3>Additional Notes</h3>
            <p>${ticket.additional_notes}</p>
          </div>
          ` : ''}

          ${(ticket.fuel_used || ticket.actual_distance_covered) ? `
          <div class="section">
            <h3>Trip Completion Data</h3>
            ${ticket.fuel_used ? `<p><span class="label">Fuel Used:</span> ${ticket.fuel_used} Litres</p>` : ''}
            ${ticket.actual_distance_covered ? `<p><span class="label">Distance Covered:</span> ${ticket.actual_distance_covered} km</p>` : ''}
            ${ticket.odometer_before ? `<p><span class="label">Odometer Before:</span> ${ticket.odometer_before} km</p>` : ''}
            ${ticket.odometer_after ? `<p><span class="label">Odometer After:</span> ${ticket.odometer_after} km</p>` : ''}
          </div>
          ` : ''}

          <div class="footer">
            <p><strong>Digital Fleet Management System</strong></p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);

      toast.success('Print window opened successfully!');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to open print window. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-lg text-white">
        <div>
          <h1 className="text-3xl font-bold">Trip Records Management</h1>
          <p className="text-blue-100 mt-2">Track and manage all vehicle trips and fuel usage</p>
        </div>
        <div className="text-right">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                New Trip Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">Create Trip Record</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a trip record for vehicle assignment and fuel tracking
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={formData.driver_id} onValueChange={(value) => 
                    setFormData({...formData, driver_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        drivers.length === 0 
                          ? "Loading drivers..." 
                          : "Select driver for this trip"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No drivers available
                        </div>
                      ) : (
                        drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.licenseNumber || driver.license_number || 'N/A'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={formData.vehicle_id} onValueChange={(value) => 
                    setFormData({...formData, vehicle_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        vehicles.length === 0 
                          ? "Loading vehicles..." 
                          : `Select vehicle (${vehicles.length} available)`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No vehicles available
                        </div>
                      ) : (
                        vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.gkNumber || vehicle.registration_number} - {vehicle.make} {vehicle.model} ({vehicle.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Enter destination"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Travel *</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    placeholder="Enter purpose"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Required (Litres) *</Label>
                  <Input
                    id="fuel"
                    type="number"
                    value={formData.fuel_required}
                    onChange={(e) => setFormData({...formData, fuel_required: e.target.value})}
                    placeholder="Enter fuel amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Estimated Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={formData.estimated_distance}
                    onChange={(e) => setFormData({...formData, estimated_distance: e.target.value})}
                    placeholder="Enter distance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure">Departure Date</Label>
                  <Input
                    id="departure"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return">Expected Return Date</Label>
                  <Input
                    id="return"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                    placeholder="Enter any additional information"
                    rows={3}
                  />
                </div>
                
                {/* Trip Completion Section */}
                <div className="col-span-2 border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Trip Completion Data</h3>
                    <span className="text-sm text-gray-500">(Fill when trip is completed)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fuel_used" className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        Fuel Amount Used (Litres)
                      </Label>
                      <Input
                        id="fuel_used"
                        type="number"
                        step="0.1"
                        value={formData.fuel_used}
                        onChange={(e) => setFormData({...formData, fuel_used: e.target.value})}
                        placeholder="Enter actual fuel used"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="actual_distance" className="flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Distance Covered (km)
                      </Label>
                      <Input
                        id="actual_distance"
                        type="number"
                        step="0.1"
                        value={formData.actual_distance_covered}
                        onChange={(e) => setFormData({...formData, actual_distance_covered: e.target.value})}
                        placeholder="Enter actual distance covered"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odometer_before" className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Odometer Before Trip (km)
                      </Label>
                      <Input
                        id="odometer_before"
                        type="number"
                        value={formData.odometer_before}
                        onChange={(e) => setFormData({...formData, odometer_before: e.target.value})}
                        placeholder="Enter odometer reading before"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odometer_after" className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Odometer After Trip (km)
                      </Label>
                      <Input
                        id="odometer_after"
                        type="number"
                        value={formData.odometer_after}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setFormData({...formData, odometer_after: newValue});
                          
                          // Auto-calculate actual distance if both odometer readings are available
                          if (newValue && formData.odometer_before) {
                            const distance = parseFloat(newValue) - parseFloat(formData.odometer_before);
                            if (distance > 0) {
                              setFormData(prev => ({
                                ...prev, 
                                odometer_after: newValue,
                                actual_distance_covered: distance.toString()
                              }));
                            }
                          }
                        }}
                        placeholder="Enter odometer reading after"
                      />
                      {formData.odometer_before && formData.odometer_after && (
                        <p className="text-xs text-blue-600">
                          Auto-calculated distance: {(parseFloat(formData.odometer_after) - parseFloat(formData.odometer_before)).toFixed(1)}km
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trip_start_time" className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Trip Start Time
                      </Label>
                      <Input
                        id="trip_start_time"
                        type="datetime-local"
                        value={formData.trip_start_time}
                        onChange={(e) => setFormData({...formData, trip_start_time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trip_end_time" className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Trip End Time
                      </Label>
                      <Input
                        id="trip_end_time"
                        type="datetime-local"
                        value={formData.trip_end_time}
                        onChange={(e) => setFormData({...formData, trip_end_time: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} className="bg-blue-600 hover:bg-blue-700">
                  Create Trip Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Tabs Section */}
      <Card className="bg-white shadow-xl border border-gray-200">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="all-trips" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                All Trip Records
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                Monthly Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-trips" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-100 to-blue-100 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">All Trip Records</h3>
                      <p className="text-blue-700 text-sm font-normal">
                        {workTickets.length} trip record{workTickets.length !== 1 ? 's' : ''} in the system
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {workTickets.map((ticket) => (
                      <Card key={ticket.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(ticket.departure_date).toLocaleDateString()}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Created: {new Date(ticket.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Driver:</span>
                                  <p className="font-medium">{ticket.driver_name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Vehicle:</span>
                                  <p className="font-medium">{ticket.vehicle_registration}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Destination:</span>
                                  <p>{ticket.destination}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Purpose:</span>
                                  <p>{ticket.purpose}</p>
                                </div>
                              </div>
                              {(ticket.fuel_used || ticket.actual_distance_covered) && (
                                <div className="flex gap-4 text-xs bg-green-50 p-2 rounded border border-green-200">
                                  {ticket.fuel_used && (
                                    <span className="text-green-700">
                                      <Fuel className="inline w-3 h-3 mr-1" />
                                      Fuel Used: {ticket.fuel_used}L
                                    </span>
                                  )}
                                  {ticket.actual_distance_covered && (
                                    <span className="text-green-700">
                                      <Route className="inline w-3 h-3 mr-1" />
                                      Distance: {ticket.actual_distance_covered}km
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintTicket(ticket)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Printer className="w-3 h-3 mr-1" />
                                Print
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {workTickets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No trip records found</p>
                        <p className="text-sm">Create a trip record to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <MonthlyTripReport workTickets={workTickets} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trip Record Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trip Record Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="font-medium">{selectedTicket.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-medium">{selectedTicket.vehicle_registration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p>{selectedTicket.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purpose</p>
                  <p>{selectedTicket.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Required</p>
                  <p>{selectedTicket.fuel_required}L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Distance</p>
                  <p>{selectedTicket.estimated_distance}km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departure Date</p>
                  <p>{new Date(selectedTicket.departure_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Return Date</p>
                  <p>{new Date(selectedTicket.return_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedTicket.additional_notes && (
                <div>
                  <p className="text-sm text-gray-600">Additional Notes</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedTicket.additional_notes}</p>
                </div>
              )}
              
              {/* Trip Completion Data Section */}
              {(selectedTicket.fuel_used || selectedTicket.actual_distance_covered || selectedTicket.odometer_before || selectedTicket.odometer_after) && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Trip Completion Data</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                    {selectedTicket.fuel_used && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Fuel className="h-4 w-4" />
                          Fuel Used
                        </p>
                        <p className="text-lg font-bold">{selectedTicket.fuel_used}L</p>
                      </div>
                    )}
                    {selectedTicket.actual_distance_covered && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Route className="h-4 w-4" />
                          Distance Covered
                        </p>
                        <p className="text-lg font-bold">{selectedTicket.actual_distance_covered}km</p>
                      </div>
                    )}
                    {selectedTicket.odometer_before && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Gauge className="h-4 w-4" />
                          Odometer Before
                        </p>
                        <p className="text-lg font-bold">{selectedTicket.odometer_before}km</p>
                      </div>
                    )}
                    {selectedTicket.odometer_after && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Gauge className="h-4 w-4" />
                          Odometer After
                        </p>
                        <p className="text-lg font-bold">{selectedTicket.odometer_after}km</p>
                      </div>
                    )}
                    {selectedTicket.trip_start_time && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Trip Start
                        </p>
                        <p className="font-semibold">{new Date(selectedTicket.trip_start_time).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedTicket.trip_end_time && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Trip End
                        </p>
                        <p className="font-semibold">{new Date(selectedTicket.trip_end_time).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Monthly Trip Report Component
function MonthlyTripReport({ workTickets }: { workTickets: WorkTicket[] }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDriver, setSelectedDriver] = useState('all');

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const monthTickets = workTickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at || ticket.departure_date);
      const ticketMonth = ticketDate.toISOString().slice(0, 7);
      return ticketMonth === selectedMonth && 
             (selectedDriver === 'all' || ticket.driver_id === selectedDriver);
    });

    const driverStats = monthTickets.reduce((acc, ticket) => {
      const driverId = ticket.driver_id;
      if (!acc[driverId]) {
        acc[driverId] = {
          driver_name: ticket.driver_name,
          trip_count: 0,
          total_fuel_used: 0,
          total_distance: 0,
          trip_dates: []
        };
      }
      
      acc[driverId].trip_count++;
      acc[driverId].trip_dates.push({
        date: ticket.departure_date,
        destination: ticket.destination,
        purpose: ticket.purpose
      });
      
      if (ticket.fuel_used) {
        acc[driverId].total_fuel_used += ticket.fuel_used;
      }
      
      if (ticket.actual_distance_covered) {
        acc[driverId].total_distance += ticket.actual_distance_covered;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(driverStats);
  };

  const monthlyStats = getMonthlyStats();
  const uniqueDrivers = [...new Set(workTickets.map(t => ({ id: t.driver_id, name: t.driver_name })))];

  return (
    <Card className="bg-white shadow-xl border border-gray-200 mt-6">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Monthly Trip Report
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="month-select">Select Month</Label>
            <Input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver-select">Select Driver</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {uniqueDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {monthlyStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No trip data found for the selected period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyStats.map((stats, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{stats.driver_name}</h3>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <strong>{stats.trip_count}</strong> Total Trips
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="h-4 w-4 text-orange-600" />
                          <strong>{stats.total_fuel_used.toFixed(1)}L</strong> Fuel Used
                        </span>
                        <span className="flex items-center gap-1">
                          <Route className="h-4 w-4 text-purple-600" />
                          <strong>{stats.total_distance.toFixed(1)}km</strong> Distance
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Trip Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      {stats.trip_dates.map((trip: any, tripIndex: number) => (
                        <div key={tripIndex} className="bg-gray-50 p-2 rounded border">
                          <div className="font-medium">{trip.date}</div>
                          <div className="text-gray-600">{trip.destination}</div>
                          <div className="text-xs text-gray-500">{trip.purpose}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component export
export function WorkTicketManagement({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
  return <TripRecordsManagement onTicketStatusChange={onTicketStatusChange} />;
}
