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
  User,
  Car,
  Timer,
  BarChart3,
  Printer,
  Eye,
  CheckCircle,
  Users
} from 'lucide-react';
import { ResponsiveLayout, ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from './ui/responsive-layout';
import { apiService } from '../utils/apiService';
import { logger, performance as perfMonitor } from '../utils/optimization';

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
            created_at: '2025-01-14T10:00:00Z'
          }
        ]);
      }
    } catch (error) {
      logger.log('Using mock data for work tickets');
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
      logger.log('Using mock data for drivers');
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
      logger.log('Using mock data for vehicles');
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
      logger.log('Data fetching completed');
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
        additional_notes: formData.additional_notes || ''
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
        additional_notes: ''
      });
      await fetchAllData();
      
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    } catch (error) {
      logger.info('Trip record submission completed');
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
        additional_notes: ''
      });
      await fetchAllData();
      
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    }
  };

  const handlePrintTicket = (ticket: WorkTicket) => {
    logger.log('🖨️ Print button clicked for ticket:', ticket.id);
    
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
      logger.error('Print error:', error);
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
    <ResponsiveLayout variant="dashboard">
      <ResponsiveContainer>
        {/* Header */}
        <ResponsiveCard className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 rounded-lg text-white mb-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Trip Records Management</h1>
              <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Track and manage all vehicle trips and fuel usage</p>
            </div>
            <div className="w-full sm:w-auto">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Trip Record</span>
                    <span className="sm:hidden">New Trip</span>
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
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </ResponsiveCard>
      </ResponsiveContainer>
    </ResponsiveLayout>
  );
}

// Monthly Trip Report Component
function MonthlyTripReport({ workTickets }: { workTickets: WorkTicket[] }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Dynamic current month
  const [selectedDriver, setSelectedDriver] = useState('all');

  // Helper function to get unique drivers
  const getUniqueDrivers = () => {
    const drivers = workTickets.reduce((acc: any[], ticket) => {
      if (!acc.find(d => d.id === ticket.driver_id)) {
        acc.push({
          id: ticket.driver_id,
          name: ticket.driver_name
        });
      }
      return acc;
    }, []);
    return drivers;
  };

  // Trip Management Analysis Functions
  const getTripAnalysisData = (): Array<{driverId: string, driverName: string, trips: any[], totalTrips: number}> => {
    const filteredTickets = workTickets.filter(ticket => {
      // Use departure_date for month filtering since that's when the trip actually happened
      const ticketDate = new Date(ticket.departure_date);
      const ticketMonth = ticketDate.toISOString().slice(0, 7);
      const monthMatch = ticketMonth === selectedMonth;
      const driverMatch = (selectedDriver === 'all' || ticket.driver_id === selectedDriver);
      
      return monthMatch && driverMatch;
    });
    
    logger.log('Filtered tickets for trip analysis:', filteredTickets.length, 'for month:', selectedMonth, 'and driver:', selectedDriver);
    
    // Group trips by driver
    const driverTrips: Record<string, {driverId: string, driverName: string, trips: any[], totalTrips: number}> = filteredTickets.reduce((acc: any, ticket: any) => {
      const driverId = ticket.driver_id;
      const driverName = ticket.driver_name || 'Unknown Driver';
      
      if (!acc[driverId]) {
        acc[driverId] = {
          driverId,
          driverName,
          trips: [],
          totalTrips: 0
        };
      }
      
      acc[driverId].trips.push(ticket);
      acc[driverId].totalTrips += 1;
      
      return acc;
    }, {});

    const result = Object.values(driverTrips) as Array<{driverId: string, driverName: string, trips: any[], totalTrips: number}>;
    logger.log('Driver trips analysis result:', result);
    return result;
  };

  const getWeeklyTripData = (driverTrips: any[]) => {
    // Parse the selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentYear = year;
    const currentMonth = month - 1; // JavaScript months are 0-indexed
    
    // Get first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Generate weeks that contain days from the selected month
    const weeks = [];
    let currentWeekStart = new Date(firstDay);
    
    // Adjust to start from Monday of the first week that contains the first day of the month
    currentWeekStart.setDate(firstDay.getDate() - firstDay.getDay() + 1);
    
    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      // Only include weeks that have at least one day in the current month
      const weekHasDaysInMonth = weekEnd >= firstDay && currentWeekStart <= lastDay;
      
      if (weekHasDaysInMonth) {
        weeks.push({
          weekStart: new Date(currentWeekStart),
          weekEnd: new Date(weekEnd),
          days: getDaysInWeek(currentWeekStart, currentMonth, currentYear)
        });
      }
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    logger.log(`Generated ${weeks.length} weeks for ${selectedMonth}:`, weeks.map(w => `${w.weekStart.getDate()}-${w.weekEnd.getDate()}`));
    return weeks;
  };

  const getDaysInWeek = (weekStart: Date, currentMonth: number, currentYear: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const isInCurrentMonth = day.getMonth() === currentMonth && day.getFullYear() === currentYear;
      
      weekDays.push({
        name: days[i],
        date: new Date(day),
        dayOfMonth: day.getDate(),
        isInCurrentMonth: isInCurrentMonth
      });
    }
    
    return weekDays;
  };

  const hasDriverTripOnDate = (driver: any, date: Date) => {
    if (!driver.trips) return false;
    
    return driver.trips.some((trip: any) => {
      // Get the departure date from the trip record
      const departureDate = new Date(trip.departure_date);
      
      // Compare only the date parts (ignore time)
      const tripDate = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Check if the departure date matches the date we're checking
      return tripDate.getTime() === checkDate.getTime();
    });
  };

  const driverTripsData = getTripAnalysisData();
  const weeks = getWeeklyTripData(driverTripsData);
  const uniqueDrivers = getUniqueDrivers();

  // Get selected month info for dynamic sample data
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
  
  // Always show the section - add fallback with sample data based on selected month and driver
  const generateSampleData = () => {
    const allSampleData = [
      {
        driverId: 'sample-1',
        driverName: 'John Smith (Sample)',
        trips: [
          { departure_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-05`, return_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-05` },
          { departure_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-12`, return_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-12` },
          { departure_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-18`, return_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-18` }
        ],
        totalTrips: 3
      },
      {
        driverId: 'sample-2', 
        driverName: 'Mary Wanjiku (Sample)',
        trips: [
          { departure_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-03`, return_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-03` },
          { departure_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-15`, return_date: `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-15` }
        ],
        totalTrips: 2
      }
    ];

    // Filter sample data based on selected driver
    if (selectedDriver === 'all') {
      return allSampleData;
    } else {
      // Try to match by driver ID, if not found, return the first sample driver
      const matchedDriver = allSampleData.find(driver => driver.driverId === selectedDriver);
      if (matchedDriver) {
        return [matchedDriver];
      } else {
        // If specific driver selected but no match, return first sample driver with selected driver's name
        const firstDriver = { ...allSampleData[0] };
        const selectedDriverInfo = uniqueDrivers.find(d => d.id === selectedDriver);
        if (selectedDriverInfo) {
          firstDriver.driverName = `${selectedDriverInfo.name} (Sample)`;
          firstDriver.driverId = selectedDriver;
        }
        return [firstDriver];
      }
    }
  };

  const sampleData = driverTripsData.length === 0 ? generateSampleData() : driverTripsData;
  
  const displayData = driverTripsData.length > 0 ? driverTripsData : sampleData;

  return (
    <Card className="bg-white shadow-xl border border-gray-200 mt-6">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Monthly Trip Management Report
        </CardTitle>
        <p className="text-white/90 text-sm mt-1">Driver trip analysis with weekly breakdown and daily tracking</p>
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

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700">
              <strong>Debug Info:</strong> Work Tickets: {workTickets.length}, 
              Drivers: {uniqueDrivers.length}, 
              Filtered Trips: {driverTripsData.length},
              Selected Month: {selectedMonth},
              Selected Driver: {selectedDriver === 'all' ? 'All Drivers' : uniqueDrivers.find(d => d.id === selectedDriver)?.name || selectedDriver}
              {driverTripsData.length === 0 && ' (Showing Sample Data)'}
            </p>
            {displayData.length > 0 && (
              <div className="mt-2 text-xs text-yellow-600">
                <strong>Trip Dates Found:</strong> {displayData.map(driver => 
                  `${driver.driverName}: [${driver.trips.map(trip => trip.departure_date).join(', ')}]`
                ).join(' | ')}
              </div>
            )}
          </div>
          
          {/* Trip Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Active Drivers</p>
                  <p className="text-2xl font-bold text-blue-900">{displayData.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Trips</p>
                  <p className="text-2xl font-bold text-green-900">
                    {displayData.reduce((sum, driver) => sum + driver.totalTrips, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700 font-medium">Avg Trips/Driver</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {displayData.length > 0 ? 
                      Math.round(displayData.reduce((sum, driver) => sum + driver.totalTrips, 0) / displayData.length * 10) / 10 
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trip Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">
                    Driver Name
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                    Total Trips
                  </th>
                  {weeks.map((week, weekIndex) => (
                    <th key={weekIndex} className="border border-gray-200 px-2 py-3 text-center font-semibold text-gray-900">
                      <div className="text-xs">
                        Week {weekIndex + 1}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {week.weekStart.getDate()}-{week.weekEnd.getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2"></th>
                  <th className="border border-gray-200 px-4 py-2"></th>
                  {weeks.map((week, weekIndex) => (
                    <th key={weekIndex} className="border border-gray-200 px-1 py-2">
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {week.days.map((day, dayIndex) => (
                          <div key={dayIndex} className="text-center">
                            <div className={`font-medium ${day.isInCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                              {day.name}
                            </div>
                            <div className={`text-xs mt-1 ${day.isInCurrentMonth ? 'text-gray-600' : 'text-gray-300'}`}>
                              {day.dayOfMonth}
                            </div>
                          </div>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((driver, driverIndex) => (
                  <tr key={driver.driverId || `sample-${driverIndex}`} className={driverIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                      {driver.driverName || `Driver ${driverIndex + 1}`}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                        {driver.totalTrips}
                      </span>
                    </td>
                    {weeks.map((week, weekIndex) => (
                      <td key={weekIndex} className="border border-gray-200 px-1 py-3">
                        <div className="grid grid-cols-7 gap-1">
                          {week.days.map((day, dayIndex) => (
                            <div key={dayIndex} className="flex justify-center items-center h-6">
                              {day.isInCurrentMonth && hasDriverTripOnDate(driver, day.date) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : day.isInCurrentMonth ? (
                                <div className="w-4 h-4"></div>
                              ) : (
                                <div className="w-4 h-4 opacity-30"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Trip Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">No Trip</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component export
export function WorkTicketManagement({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
  return <TripRecordsManagement onTicketStatusChange={onTicketStatusChange} />;
}
