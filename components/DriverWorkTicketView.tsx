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
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Eye,
  MapPin,
  Fuel,
  Car,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface Driver {
  id: string;
  name: string;
  license_number: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  fuel_type: string;
  status: string;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export function DriverWorkTicketView() {
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WorkTicket | null>(null);
  const [activeTab, setActiveTab] = useState('my-requests');

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
    additional_notes: ''
  });

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('fleet_user') || '{}');

  useEffect(() => {
    fetchMyWorkTickets();
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchMyWorkTickets = async () => {
    try {
      console.log('Fetching work tickets for user:', currentUser);
      const response = await fetch(`${API_BASE}/work-tickets`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('All work tickets received:', data.tickets);
        
        // Filter tickets for current driver using multiple criteria
        const myTickets = (data.tickets || []).filter((ticket: WorkTicket) => {
          const matchesName = ticket.driver_name === currentUser.name;
          const matchesId = ticket.driver_id === currentUser.id;
          const matchesEmail = ticket.driver_name?.toLowerCase().includes(currentUser.email?.split('@')[0]?.toLowerCase() || '');
          
          // Also try to match by email prefix in driver name
          const userEmailPrefix = currentUser.email?.split('@')[0]?.toLowerCase();
          const nameIncludesEmailPrefix = userEmailPrefix && ticket.driver_name?.toLowerCase().includes(userEmailPrefix);
          
          return matchesName || matchesId || matchesEmail || nameIncludesEmailPrefix;
        });
        
        setWorkTickets(myTickets);
      } else {
        console.error('Failed to fetch work tickets:', response.status);
      }
    } catch (error) {
      console.error('Error fetching work tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE}/drivers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
        
        // Auto-select current driver if found
        const currentDriver = (data.drivers || []).find((d: Driver) => 
          d.email === currentUser.email || 
          d.name === currentUser.name ||
          d.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
          d.name?.toLowerCase() === currentUser.name?.toLowerCase()
        );
        
        console.log('Looking for driver match:', {
          currentUser: currentUser,
          drivers: data.drivers,
          foundDriver: currentDriver
        });
        
        if (currentDriver) {
          console.log('Auto-selecting driver:', currentDriver);
          setFormData(prev => ({ ...prev, driver_id: currentDriver.id }));
        } else {
          console.log('No matching driver found for current user');
        }
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
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
        const allVehicles = data.vehicles || [];
        const availableVehicles = allVehicles.filter((v: Vehicle) => 
          v.status === 'Available' || v.status === 'available' || v.status === 'AVAILABLE'
        );
        
        if (availableVehicles.length === 0 && allVehicles.length > 0) {
          setVehicles(allVehicles);
          toast.info('Showing all vehicles - some may not be available');
        } else {
          setVehicles(availableVehicles);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      console.log('Form data before validation:', formData);
      
      if (!formData.driver_id || !formData.vehicle_id || !formData.destination || !formData.purpose || !formData.fuel_required) {
        toast.error('Please fill in all required fields');
        console.log('Validation failed:', {
          driver_id: formData.driver_id,
          vehicle_id: formData.vehicle_id,
          destination: formData.destination,
          purpose: formData.purpose,
          fuel_required: formData.fuel_required
        });
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
        driver_license: driver.license_number,
        vehicle_id: formData.vehicle_id,
        vehicle_registration: vehicle.registration_number,
        destination: formData.destination,
        purpose: formData.purpose,
        fuel_required: parseFloat(formData.fuel_required),
        estimated_distance: parseFloat(formData.estimated_distance) || 0,
        departure_date: formData.departure_date || new Date().toISOString().split('T')[0],
        return_date: formData.return_date || new Date().toISOString().split('T')[0],
        additional_notes: formData.additional_notes || ''
      };

      console.log('Sending ticket data:', ticketData);

      const response = await fetch(`${API_BASE}/work-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        toast.success('Work ticket submitted successfully! Waiting for admin approval.');
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
        fetchMyWorkTickets();
      } else {
        console.error('Server error:', responseData);
        toast.error(`Failed to create work ticket: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating work ticket:', error);
      toast.error(`Network error: ${error.message}`);
    }
  };

  const handlePrintTicket = (ticket: WorkTicket) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Work Ticket Authorization - ${ticket.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; }
            .authorization { background: #f0f8ff; padding: 15px; border: 2px solid #0066cc; margin: 20px 0; }
            .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MINISTRY OF ENERGY AND PETROLEUM</h1>
            <h2>State Department for Energy</h2>
            <h3>VEHICLE WORK TICKET AUTHORIZATION</h3>
          </div>
          
          <div class="section">
            <span class="label">Ticket ID:</span> ${ticket.id}<br>
            <span class="label">Issue Date:</span> ${new Date(ticket.created_at).toLocaleDateString()}<br>
            <span class="label">Authorization Date:</span> ${new Date(ticket.approved_at || '').toLocaleDateString()}
          </div>

          <div class="section">
            <h3>Driver Information</h3>
            <span class="label">Name:</span> ${ticket.driver_name}<br>
            <span class="label">License Number:</span> ${ticket.driver_license}
          </div>

          <div class="section">
            <h3>Vehicle Information</h3>
            <span class="label">Registration:</span> ${ticket.vehicle_registration}
          </div>

          <div class="section">
            <h3>Trip Details</h3>
            <span class="label">Destination:</span> ${ticket.destination}<br>
            <span class="label">Purpose:</span> ${ticket.purpose}<br>
            <span class="label">Departure Date:</span> ${new Date(ticket.departure_date).toLocaleDateString()}<br>
            <span class="label">Expected Return:</span> ${new Date(ticket.return_date).toLocaleDateString()}<br>
            <span class="label">Estimated Distance:</span> ${ticket.estimated_distance} km
          </div>

          <div class="authorization">
            <h3>FUEL AUTHORIZATION</h3>
            <p><span class="label">Authorized Fuel Quantity:</span> <strong>${ticket.fuel_required} Litres</strong></p>
            <p>This authorization permits the above driver to receive the specified fuel quantity for official government business.</p>
          </div>

          <div class="section">
            <span class="label">Additional Notes:</span><br>
            ${ticket.additional_notes || 'None'}
          </div>

          <div class="footer">
            <p><span class="label">Approved By:</span> ${ticket.approved_by}</p>
            <p><span class="label">Digital Authorization System</span> - Ministry of Energy and Petroleum</p>
            <p style="font-size: 12px;">This is a computer-generated authorization document.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingTickets = workTickets.filter(t => t.status === 'pending');
  const approvedTickets = workTickets.filter(t => t.status === 'approved');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>My Work Tickets</h1>
          <p className="text-gray-600">Submit requests for vehicle assignments and fuel authorization</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMyWorkTickets();
              fetchDrivers();
              fetchVehicles();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Work Ticket Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Work Ticket Request</DialogTitle>
                <DialogDescription>
                  Request vehicle assignment and fuel authorization for official business
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={formData.driver_id} onValueChange={(value) => 
                    setFormData({...formData, driver_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.license_number}
                        </SelectItem>
                      ))}
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
                          ? "No vehicles available" 
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
                            {vehicle.registration_number} - {vehicle.make} {vehicle.model}
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
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-requests">All My Requests</TabsTrigger>
          <TabsTrigger value="pending">
            Pending {pendingTickets.length > 0 && `(${pendingTickets.length})`}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved {approvedTickets.length > 0 && `(${approvedTickets.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Work Ticket Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fuel (L)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{ticket.destination}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.purpose}</TableCell>
                      <TableCell>{ticket.vehicle_registration}</TableCell>
                      <TableCell>{ticket.fuel_required}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {ticket.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrintTicket(ticket)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {workTickets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No work tickets submitted yet</p>
                  <p className="text-sm">Click "New Work Ticket Request" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Approval ({pendingTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pendingTickets.map((ticket) => (
                  <Card key={ticket.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Awaiting Approval
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Submitted: {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Destination:</span>
                              <p className="font-medium">{ticket.destination}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Vehicle:</span>
                              <p className="font-medium">{ticket.vehicle_registration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Purpose:</span>
                              <p className="font-medium">{ticket.purpose}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Fuel Requested:</span>
                              <p className="font-medium">{ticket.fuel_required}L</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending requests</p>
                    <p className="text-sm">All your requests have been processed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Authorizations ({approvedTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {approvedTickets.map((ticket) => (
                  <Card key={ticket.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              AUTHORIZED
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Approved: {new Date(ticket.approved_at || '').toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Destination:</span>
                              <p className="font-medium">{ticket.destination}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Vehicle:</span>
                              <p className="font-medium">{ticket.vehicle_registration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Purpose:</span>
                              <p className="font-medium">{ticket.purpose}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Authorized Fuel:</span>
                              <p className="font-medium text-green-600">{ticket.fuel_required}L</p>
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-sm text-green-800">
                              <strong>Ready for fuel collection:</strong> Present this authorization at the petrol station
                            </p>
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
                            Print Authorization
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {approvedTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved authorizations yet</p>
                    <p className="text-sm">Submit work ticket requests to get fuel authorizations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Ticket Details</DialogTitle>
            <DialogDescription>
              Request #{selectedTicket?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedTicket.status)}
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(selectedTicket.created_at).toLocaleString()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label>Trip Information</Label>
                    <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                      <p><strong>Destination:</strong> {selectedTicket.destination}</p>
                      <p><strong>Purpose:</strong> {selectedTicket.purpose}</p>
                      <p><strong>Vehicle:</strong> {selectedTicket.vehicle_registration}</p>
                      <p><strong>Fuel Required:</strong> {selectedTicket.fuel_required}L</p>
                      <p><strong>Estimated Distance:</strong> {selectedTicket.estimated_distance}km</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedTicket.additional_notes && (
                <div>
                  <Label>Additional Notes</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedTicket.additional_notes}</p>
                </div>
              )}
              
              {selectedTicket.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">AUTHORIZATION APPROVED</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Approved by:</strong> {selectedTicket.approved_by}</p>
                    <p><strong>Approved on:</strong> {new Date(selectedTicket.approved_at || '').toLocaleString()}</p>
                    <p><strong>Instructions:</strong> Present this authorization at the petrol station to collect {selectedTicket.fuel_required}L of fuel</p>
                  </div>
                </div>
              )}
              
              {selectedTicket.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Request Rejected</span>
                  </div>
                  <div className="text-sm text-red-700">
                    <p><strong>Reason:</strong> {selectedTicket.rejection_reason}</p>
                    <p className="mt-2">You may submit a new request with the required corrections.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedTicket?.status === 'approved' && (
              <Button 
                onClick={() => handlePrintTicket(selectedTicket)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Authorization
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}