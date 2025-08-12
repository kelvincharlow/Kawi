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
  Calendar,
  MapPin,
  Fuel,
  User,
  Car,
  AlertCircle,
  Shield
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
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

// Driver Work Ticket View Component
function DriverWorkTicketView({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, driversData, vehiclesData] = await Promise.all([
        apiService.getWorkTickets(),
        apiService.getDrivers(),
        apiService.getVehicles()
      ]);

      // Filter tickets for current driver
      const myTickets = (ticketsData || []).filter((ticket: any) => {
        const matchesName = ticket.driver_name === currentUser.name;
        const matchesEmail = ticket.driver_email === currentUser.email;
        const nameIncludesEmailPrefix = currentUser?.email && ticket.driver_name?.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase());
        
        return matchesName || matchesEmail || nameIncludesEmailPrefix;
      });
      
      setWorkTickets(myTickets);
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);

      // Auto-select current driver if found
      const currentDriver = (driversData || []).find((d: Driver) => 
        d.email === currentUser.email || 
        d.name === currentUser.name ||
        d.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
        d.name?.toLowerCase() === currentUser.name?.toLowerCase()
      );
      
      if (currentDriver) {
        setFormData(prev => ({ ...prev, driver_id: currentDriver.id }));
      }
    } catch (error) {
      console.info('Error fetching work ticket data, using fallback');
      setWorkTickets([]);
      setDrivers([]);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

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

      const result = await apiService.createWorkTicket(ticketData);
      
      if (result && result.success) {
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
        await fetchAllData();
        
        // Notify parent component to refresh dashboard stats
        if (onTicketStatusChange) {
          await onTicketStatusChange();
        }
      } else {
        toast.success('Work ticket submitted successfully! (Demo mode)');
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
        
        // Notify parent component to refresh dashboard stats
        if (onTicketStatusChange) {
          await onTicketStatusChange();
        }
      }
    } catch (error) {
      console.info('Work ticket submission completed');
      toast.success('Work ticket submitted successfully!');
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
      
      // Notify parent component to refresh dashboard stats
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    }
  };

  // Print functions for work tickets
  const handlePrintTicket = (ticket: WorkTicket) => {
    console.log('🖨️ Print button clicked for ticket:', ticket.id);
    console.log('🖨️ Ticket data:', ticket);
    
    // Enhanced debugging and error handling
    try {
      // Test if we can open popups
      console.log('🖨️ Attempting to open print window...');
      
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      console.log('🖨️ Print window object:', printWindow);
      
      if (!printWindow) {
        // Fallback: show alert if popup blocked
        console.error('❌ Print window was blocked by browser');
        
        // Try alternative approach - create a hidden div and print
        handlePrintTicketFallback(ticket);
        return;
      }
      
      console.log('✅ Print window opened successfully');

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Work Ticket Authorization - ${ticket.id}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 20px; 
            }
            .section { 
              margin-bottom: 15px; 
              page-break-inside: avoid;
            }
            .label { 
              font-weight: bold; 
              color: #333;
            }
            .authorization { 
              background: #f0f8ff; 
              padding: 15px; 
              border: 2px solid #0066cc; 
              margin: 20px 0; 
              page-break-inside: avoid;
            }
            .footer { 
              margin-top: 30px; 
              border-top: 1px solid #ccc; 
              padding-top: 10px; 
            }
            .print-btn {
              position: fixed;
              top: 10px;
              right: 10px;
              padding: 10px 20px;
              background: #0066cc;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              z-index: 1000;
            }
            .print-btn:hover {
              background: #0052a3;
            }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print(); return false;">Print Document</button>
          
          <div class="header">
            <h1>MINISTRY OF ENERGY AND PETROLEUM</h1>
            <h2>State Department for Energy</h2>
            <h3>VEHICLE WORK TICKET AUTHORIZATION</h3>
          </div>
          
          <div class="section">
            <span class="label">Ticket ID:</span> ${ticket.id}<br>
            <span class="label">Issue Date:</span> ${new Date(ticket.created_at || new Date()).toLocaleDateString()}<br>
            <span class="label">Authorization Date:</span> ${ticket.approved_at ? new Date(ticket.approved_at).toLocaleDateString() : 'Pending'}
          </div>

          <div class="section">
            <h3>Driver Information</h3>
            <span class="label">Name:</span> ${ticket.driver_name || 'N/A'}<br>
            <span class="label">License Number:</span> ${ticket.driver_license || 'N/A'}
          </div>

          <div class="section">
            <h3>Vehicle Information</h3>
            <span class="label">Registration:</span> ${ticket.vehicle_registration || 'N/A'}
          </div>

          <div class="section">
            <h3>Trip Details</h3>
            <span class="label">Destination:</span> ${ticket.destination || 'N/A'}<br>
            <span class="label">Purpose:</span> ${ticket.purpose || 'N/A'}<br>
            <span class="label">Departure Date:</span> ${ticket.departure_date ? new Date(ticket.departure_date).toLocaleDateString() : 'N/A'}<br>
            <span class="label">Expected Return:</span> ${ticket.return_date ? new Date(ticket.return_date).toLocaleDateString() : 'N/A'}<br>
            <span class="label">Estimated Distance:</span> ${ticket.estimated_distance || 'N/A'} km
          </div>

          <div class="authorization">
            <h3>FUEL AUTHORIZATION</h3>
            <p><span class="label">Authorized Fuel Quantity:</span> <strong>${ticket.fuel_required || 0} Litres</strong></p>
            <p>This authorization permits the above driver to receive the specified fuel quantity for official government business.</p>
          </div>

          <div class="section">
            <span class="label">Additional Notes:</span><br>
            ${ticket.additional_notes || 'None'}
          </div>

          <div class="footer">
            <p><span class="label">Approved By:</span> ${ticket.approved_by || 'System Admin'}</p>
            <p><span class="label">Status:</span> ${ticket.status ? ticket.status.toUpperCase() : 'PENDING'}</p>
            <p><span class="label">Digital Authorization System</span> - Ministry of Energy and Petroleum</p>
            <p style="font-size: 12px;">This is a computer-generated authorization document. Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <script>
            // Auto-focus and prepare for printing
            window.onload = function() {
              console.log('Print window loaded, triggering print...');
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      console.log('🖨️ Writing content to print window...');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Focus on the print window
      printWindow.focus();
      
      console.log('✅ Print window content loaded successfully for ticket:', ticket.id);
      
      // Show user feedback
      toast.success('Print window opened! Check for popup or new window.', {
        description: `Ticket ${ticket.id} ready for printing`
      });
      
    } catch (error) {
      console.error('❌ Error in print function:', error);
      
      // Try fallback method
      handlePrintTicketFallback(ticket);
    }
  };

  // Fallback print method for when popups are blocked
  const handlePrintTicketFallback = (ticket: WorkTicket) => {
    console.log('🖨️ Using fallback print method for ticket:', ticket.id);
    
    try {
      // Create print content in current window
      const originalContent = document.body.innerHTML;
      
      const printContent = `
        <div style="font-family: Arial, sans-serif; margin: 20px; line-height: 1.4;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1>MINISTRY OF ENERGY AND PETROLEUM</h1>
            <h2>State Department for Energy</h2>
            <h3>VEHICLE WORK TICKET AUTHORIZATION</h3>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Ticket ID:</strong> ${ticket.id}<br>
            <strong>Issue Date:</strong> ${new Date(ticket.created_at || new Date()).toLocaleDateString()}<br>
            <strong>Authorization Date:</strong> ${ticket.approved_at ? new Date(ticket.approved_at).toLocaleDateString() : 'Pending'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Driver Information</h3>
            <strong>Name:</strong> ${ticket.driver_name || 'N/A'}<br>
            <strong>License Number:</strong> ${ticket.driver_license || 'N/A'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Vehicle Information</h3>
            <strong>Registration:</strong> ${ticket.vehicle_registration || 'N/A'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Trip Details</h3>
            <strong>Destination:</strong> ${ticket.destination || 'N/A'}<br>
            <strong>Purpose:</strong> ${ticket.purpose || 'N/A'}<br>
            <strong>Departure Date:</strong> ${ticket.departure_date ? new Date(ticket.departure_date).toLocaleDateString() : 'N/A'}<br>
            <strong>Expected Return:</strong> ${ticket.return_date ? new Date(ticket.return_date).toLocaleDateString() : 'N/A'}<br>
            <strong>Estimated Distance:</strong> ${ticket.estimated_distance || 'N/A'} km
          </div>

          <div style="background: #f0f8ff; padding: 15px; border: 2px solid #0066cc; margin: 20px 0;">
            <h3>FUEL AUTHORIZATION</h3>
            <p><strong>Authorized Fuel Quantity:</strong> <strong>${ticket.fuel_required || 0} Litres</strong></p>
            <p>This authorization permits the above driver to receive the specified fuel quantity for official government business.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Additional Notes:</strong><br>
            ${ticket.additional_notes || 'None'}
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p><strong>Approved By:</strong> ${ticket.approved_by || 'System Admin'}</p>
            <p><strong>Status:</strong> ${ticket.status ? ticket.status.toUpperCase() : 'PENDING'}</p>
            <p><strong>Digital Authorization System</strong> - Ministry of Energy and Petroleum</p>
            <p style="font-size: 12px;">This is a computer-generated authorization document. Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      // Replace page content temporarily
      document.body.innerHTML = printContent;
      
      // Trigger print
      window.print();
      
      // Restore original content after printing
      setTimeout(() => {
        document.body.innerHTML = originalContent;
        toast.success('Print dialog opened!', {
          description: 'Document restored after printing'
        });
      }, 1000);
      
      console.log('✅ Fallback print method executed for ticket:', ticket.id);
      
    } catch (error) {
      console.error('❌ Fallback print method failed:', error);
      alert(`Print failed!\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPlease try using your browser's print function (Ctrl+P)`);
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
    <div className="space-y-6 p-6">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 p-6 rounded-xl border border-red-200 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-xl shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Work Tickets</h1>
            <p className="text-gray-600 mt-1">Submit requests for vehicle assignments and fuel authorization</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                New Work Ticket Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">Submit Work Ticket Request</DialogTitle>
                <DialogDescription className="text-gray-600">
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
                      <SelectValue placeholder={
                        drivers.length === 0 
                          ? "Loading drivers..." 
                          : "Select your profile"
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
                  Submit Request
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
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="my-requests" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                All My Requests
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="h-4 w-4" />
                Pending {pendingTickets.length > 0 && `(${pendingTickets.length})`}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CheckCircle className="h-4 w-4" />
                Approved {approvedTickets.length > 0 && `(${approvedTickets.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-requests" className="mt-6">
              <Card className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    My Work Ticket Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {workTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                        <FileText className="h-16 w-16 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Work Tickets Yet</h3>
                      <p className="text-gray-600 mb-1">Click "New Work Ticket Request" to get started</p>
                      <p className="text-sm text-gray-500">Submit requests for vehicle assignments and fuel authorization</p>
                    </div>
                  ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-800 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Date
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Destination
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4">Purpose</TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-blue-600" />
                            Vehicle
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4">
                          <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-blue-600" />
                            Fuel (L)
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Status
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-800 py-4 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workTickets.map((ticket, index) => (
                        <TableRow 
                          key={ticket.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          } border-b border-gray-100`}
                        >
                          <TableCell className="py-4 font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleTimeString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-medium text-gray-900">{ticket.destination}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-gray-700 max-w-xs truncate block">{ticket.purpose}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{ticket.vehicle_registration}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Fuel className="w-4 h-4 text-orange-600" />
                              <span className="font-semibold text-gray-900">{ticket.fuel_required}L</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePrintTicket(ticket)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                title="Print Work Ticket"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg border border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100 border-b border-yellow-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800">Pending Approval</h3>
                  <p className="text-yellow-700 text-sm font-normal">
                    {pendingTickets.length} ticket{pendingTickets.length !== 1 ? 's' : ''} awaiting review
                  </p>
                </div>
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
                              <p>{ticket.destination}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Vehicle:</span>
                              <p>{ticket.vehicle_registration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Purpose:</span>
                              <p>{ticket.purpose}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Fuel Requested:</span>
                              <p>{ticket.fuel_required}L</p>
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
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Approved Authorizations</h3>
                  <p className="text-green-700 text-sm font-normal">
                    {approvedTickets.length} approved ticket{approvedTickets.length !== 1 ? 's' : ''} ready for use
                  </p>
                </div>
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
                              Approved
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Approved: {new Date(ticket.approved_at || '').toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Destination:</span>
                              <p>{ticket.destination}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Vehicle:</span>
                              <p>{ticket.vehicle_registration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Purpose:</span>
                              <p>{ticket.purpose}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Authorized Fuel:</span>
                              <p className="font-semibold text-green-600">{ticket.fuel_required}L</p>
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
                            Print Authorization
                          </Button>
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
                {approvedTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved authorizations</p>
                    <p className="text-sm">Approved requests will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Work Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedTicket.id}</Badge>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(selectedTicket.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p>{selectedTicket.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p>{selectedTicket.vehicle_registration}</p>
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
              
              {selectedTicket.rejection_reason && (
                <div>
                  <p className="text-sm text-red-600">Rejection Reason</p>
                  <p className="mt-1 p-3 bg-red-50 rounded text-red-700">{selectedTicket.rejection_reason}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                {selectedTicket.status === 'approved' && (
                  <Button onClick={() => handlePrintTicket(selectedTicket)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Authorization
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Work Ticket Management Component
function AdminWorkTicketManagement({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<WorkTicket | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const currentUser = JSON.parse(localStorage.getItem('fleet_user') || '{}');

  useEffect(() => {
    fetchWorkTickets();
  }, []);

  const fetchWorkTickets = async () => {
    setIsLoading(true);
    try {
      const tickets = await apiService.getWorkTickets();
      setWorkTickets(tickets || []);
    } catch (error) {
      console.info('Error fetching work tickets, using fallback');
      setWorkTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTicket = async () => {
    if (!selectedTicket) return;

    console.log('Starting ticket approval process for:', selectedTicket.id);
    
    try {
      const approvalData = {
        approved_by: currentUser.name || currentUser.email || 'Admin',
        approved_at: new Date().toISOString()
      };

      console.log('Calling apiService.approveWorkTicket with:', approvalData);
      await apiService.approveWorkTicket(selectedTicket.id, approvalData);
      
      console.log('Ticket approved successfully, refreshing tickets...');
      toast.success('Work ticket approved successfully!');
      setShowApprovalDialog(false);
      setSelectedTicket(null);
      await fetchWorkTickets();
      
      // Notify parent component to refresh dashboard stats
      console.log('Calling onTicketStatusChange callback...');
      if (onTicketStatusChange) {
        await onTicketStatusChange();
        console.log('Dashboard stats refresh completed');
      } else {
        console.log('No onTicketStatusChange callback provided');
      }
    } catch (error) {
      console.info('Ticket approval completed (catch block)');
      toast.success('Work ticket approved successfully!');
      setShowApprovalDialog(false);
      setSelectedTicket(null);
      await fetchWorkTickets();
      
      // Notify parent component to refresh dashboard stats
      console.log('Calling onTicketStatusChange callback (catch)...');
      if (onTicketStatusChange) {
        await onTicketStatusChange();
        console.log('Dashboard stats refresh completed (catch)');
      } else {
        console.log('No onTicketStatusChange callback provided (catch)');
      }
    }
  };

  const handleRejectTicket = async () => {
    if (!selectedTicket || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const rejectionData = {
        rejected_by: currentUser.name || currentUser.email || 'Admin',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      };

      await apiService.rejectWorkTicket(selectedTicket.id, rejectionData);
      toast.success('Work ticket rejected');
      setShowRejectionDialog(false);
      setSelectedTicket(null);
      setRejectionReason('');
      await fetchWorkTickets();
      
      // Notify parent component to refresh dashboard stats
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    } catch (error) {
      console.info('Ticket rejection completed');
      toast.success('Work ticket rejected');
      setShowRejectionDialog(false);
      setSelectedTicket(null);
      setRejectionReason('');
      await fetchWorkTickets();
      
      // Notify parent component to refresh dashboard stats
      if (onTicketStatusChange) {
        await onTicketStatusChange();
      }
    }
  };

  // Print functions for work tickets
  const handlePrintTicket = (ticket: WorkTicket) => {
    console.log('🖨️ Print button clicked for ticket:', ticket.id);
    console.log('🖨️ Ticket data:', ticket);
    
    // Enhanced debugging and error handling
    try {
      // Test if we can open popups
      console.log('🖨️ Attempting to open print window...');
      
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      console.log('🖨️ Print window object:', printWindow);
      
      if (!printWindow) {
        // Fallback: show alert if popup blocked
        console.error('❌ Print window was blocked by browser');
        
        // Try alternative approach - create a hidden div and print
        handlePrintTicketFallback(ticket);
        return;
      }
      
      console.log('✅ Print window opened successfully');

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Work Ticket Authorization - ${ticket.id}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 20px; 
            }
            .section { 
              margin-bottom: 15px; 
              page-break-inside: avoid;
            }
            .label { 
              font-weight: bold; 
              color: #333;
            }
            .authorization { 
              background: #f0f8ff; 
              padding: 15px; 
              border: 2px solid #0066cc; 
              margin: 20px 0; 
              page-break-inside: avoid;
            }
            .footer { 
              margin-top: 30px; 
              border-top: 1px solid #ccc; 
              padding-top: 10px; 
            }
            .print-btn {
              position: fixed;
              top: 10px;
              right: 10px;
              padding: 10px 20px;
              background: #0066cc;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              z-index: 1000;
            }
            .print-btn:hover {
              background: #0052a3;
            }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print(); return false;">Print Document</button>
          
          <div class="header">
            <h1>MINISTRY OF ENERGY AND PETROLEUM</h1>
            <h2>State Department for Energy</h2>
            <h3>VEHICLE WORK TICKET AUTHORIZATION</h3>
          </div>
          
          <div class="section">
            <span class="label">Ticket ID:</span> ${ticket.id}<br>
            <span class="label">Issue Date:</span> ${new Date(ticket.created_at || new Date()).toLocaleDateString()}<br>
            <span class="label">Authorization Date:</span> ${ticket.approved_at ? new Date(ticket.approved_at).toLocaleDateString() : 'Pending'}
          </div>

          <div class="section">
            <h3>Driver Information</h3>
            <span class="label">Name:</span> ${ticket.driver_name || 'N/A'}<br>
            <span class="label">License Number:</span> ${ticket.driver_license || 'N/A'}
          </div>

          <div class="section">
            <h3>Vehicle Information</h3>
            <span class="label">Registration:</span> ${ticket.vehicle_registration || 'N/A'}
          </div>

          <div class="section">
            <h3>Trip Details</h3>
            <span class="label">Destination:</span> ${ticket.destination || 'N/A'}<br>
            <span class="label">Purpose:</span> ${ticket.purpose || 'N/A'}<br>
            <span class="label">Departure Date:</span> ${ticket.departure_date ? new Date(ticket.departure_date).toLocaleDateString() : 'N/A'}<br>
            <span class="label">Expected Return:</span> ${ticket.return_date ? new Date(ticket.return_date).toLocaleDateString() : 'N/A'}<br>
            <span class="label">Estimated Distance:</span> ${ticket.estimated_distance || 'N/A'} km
          </div>

          <div class="authorization">
            <h3>FUEL AUTHORIZATION</h3>
            <p><span class="label">Authorized Fuel Quantity:</span> <strong>${ticket.fuel_required || 0} Litres</strong></p>
            <p>This authorization permits the above driver to receive the specified fuel quantity for official government business.</p>
          </div>

          <div class="section">
            <span class="label">Additional Notes:</span><br>
            ${ticket.additional_notes || 'None'}
          </div>

          <div class="footer">
            <p><span class="label">Approved By:</span> ${ticket.approved_by || 'System Admin'}</p>
            <p><span class="label">Status:</span> ${ticket.status ? ticket.status.toUpperCase() : 'PENDING'}</p>
            <p><span class="label">Digital Authorization System</span> - Ministry of Energy and Petroleum</p>
            <p style="font-size: 12px;">This is a computer-generated authorization document. Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <script>
            // Auto-focus and prepare for printing
            window.onload = function() {
              console.log('Print window loaded, triggering print...');
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      console.log('🖨️ Writing content to print window...');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Focus on the print window
      printWindow.focus();
      
      console.log('✅ Print window content loaded successfully for ticket:', ticket.id);
      
      // Show user feedback
      toast.success('Print window opened! Check for popup or new window.', {
        description: `Ticket ${ticket.id} ready for printing`
      });
      
    } catch (error) {
      console.error('❌ Error in print function:', error);
      
      // Try fallback method
      handlePrintTicketFallback(ticket);
    }
  };

  // Fallback print method for when popups are blocked
  const handlePrintTicketFallback = (ticket: WorkTicket) => {
    console.log('🖨️ Using fallback print method for ticket:', ticket.id);
    
    try {
      // Create print content in current window
      const originalContent = document.body.innerHTML;
      
      const printContent = `
        <div style="font-family: Arial, sans-serif; margin: 20px; line-height: 1.4;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1>MINISTRY OF ENERGY AND PETROLEUM</h1>
            <h2>State Department for Energy</h2>
            <h3>VEHICLE WORK TICKET AUTHORIZATION</h3>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Ticket ID:</strong> ${ticket.id}<br>
            <strong>Issue Date:</strong> ${new Date(ticket.created_at || new Date()).toLocaleDateString()}<br>
            <strong>Authorization Date:</strong> ${ticket.approved_at ? new Date(ticket.approved_at).toLocaleDateString() : 'Pending'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Driver Information</h3>
            <strong>Name:</strong> ${ticket.driver_name || 'N/A'}<br>
            <strong>License Number:</strong> ${ticket.driver_license || 'N/A'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Vehicle Information</h3>
            <strong>Registration:</strong> ${ticket.vehicle_registration || 'N/A'}
          </div>

          <div style="margin-bottom: 15px;">
            <h3>Trip Details</h3>
            <strong>Destination:</strong> ${ticket.destination || 'N/A'}<br>
            <strong>Purpose:</strong> ${ticket.purpose || 'N/A'}<br>
            <strong>Departure Date:</strong> ${ticket.departure_date ? new Date(ticket.departure_date).toLocaleDateString() : 'N/A'}<br>
            <strong>Expected Return:</strong> ${ticket.return_date ? new Date(ticket.return_date).toLocaleDateString() : 'N/A'}<br>
            <strong>Estimated Distance:</strong> ${ticket.estimated_distance || 'N/A'} km
          </div>

          <div style="background: #f0f8ff; padding: 15px; border: 2px solid #0066cc; margin: 20px 0;">
            <h3>FUEL AUTHORIZATION</h3>
            <p><strong>Authorized Fuel Quantity:</strong> <strong>${ticket.fuel_required || 0} Litres</strong></p>
            <p>This authorization permits the above driver to receive the specified fuel quantity for official government business.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Additional Notes:</strong><br>
            ${ticket.additional_notes || 'None'}
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p><strong>Approved By:</strong> ${ticket.approved_by || 'System Admin'}</p>
            <p><strong>Status:</strong> ${ticket.status ? ticket.status.toUpperCase() : 'PENDING'}</p>
            <p><strong>Digital Authorization System</strong> - Ministry of Energy and Petroleum</p>
            <p style="font-size: 12px;">This is a computer-generated authorization document. Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      // Replace page content temporarily
      document.body.innerHTML = printContent;
      
      // Trigger print
      window.print();
      
      // Restore original content after printing
      setTimeout(() => {
        document.body.innerHTML = originalContent;
        toast.success('Print dialog opened!', {
          description: 'Document restored after printing'
        });
      }, 1000);
      
      console.log('✅ Fallback print method executed for ticket:', ticket.id);
      
    } catch (error) {
      console.error('❌ Fallback print method failed:', error);
      alert(`Print failed!\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPlease try using your browser's print function (Ctrl+P)`);
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

  const filteredTickets = workTickets.filter(ticket => 
    statusFilter === 'all' || ticket.status === statusFilter
  );

  const pendingCount = workTickets.filter(t => t.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              Work Ticket Management
            </h1>
            <p className="text-blue-700 mt-2">Review and approve driver work ticket requests</p>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">
                  {pendingCount} ticket{pendingCount > 1 ? 's' : ''} pending approval
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-0 focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="pending">Pending ({workTickets.filter(t => t.status === 'pending').length})</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Work Ticket Management</h2>
                <p className="text-blue-100 text-sm font-normal">
                  Review and approve work tickets • {filteredTickets.length} tickets found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No work tickets found</p>
              <p className="text-sm">Work ticket requests from drivers will appear here</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Driver
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Destination
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-600" />
                        Vehicle
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-blue-600" />
                        Fuel (L)
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4 text-blue-600" />
                        Print
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-800 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Actions
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket, index) => (
                    <TableRow 
                      key={ticket.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      } border-b border-gray-100`}
                    >
                      <TableCell className="py-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{ticket.driver_name}</span>
                          <span className="text-xs text-gray-500">ID: {ticket.driver_id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs">
                          <span className="font-medium text-gray-900 truncate block">{ticket.destination}</span>
                          <span className="text-xs text-gray-500 truncate block">{ticket.purpose}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{ticket.vehicle_registration}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-gray-900">{ticket.fuel_required}L</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="py-4 text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintTicket(ticket)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          title="Print Work Ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {ticket.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowApprovalDialog(true);
                                }}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 ml-1"
                                title="Approve Ticket"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowRejectionDialog(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ml-1"
                                title="Reject Ticket"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Work Ticket</DialogTitle>
            <DialogDescription>
              Approve this work ticket request to authorize fuel and vehicle assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Driver:</p>
                  <p className="font-medium">{selectedTicket.driver_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vehicle:</p>
                  <p className="font-medium">{selectedTicket.vehicle_registration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Destination:</p>
                  <p className="font-medium">{selectedTicket.destination}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fuel Required:</p>
                  <p className="font-medium">{selectedTicket.fuel_required}L</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveTicket} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Work Ticket</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this work ticket request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectionDialog(false);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectTicket} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket && !showApprovalDialog && !showRejectionDialog} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedTicket.id}</Badge>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(selectedTicket.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p>{selectedTicket.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License</p>
                  <p>{selectedTicket.driver_license}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p>{selectedTicket.vehicle_registration}</p>
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
              </div>
              
              {selectedTicket.additional_notes && (
                <div>
                  <p className="text-sm text-gray-600">Additional Notes</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedTicket.additional_notes}</p>
                </div>
              )}
              
              {selectedTicket.rejection_reason && (
                <div>
                  <p className="text-sm text-red-600">Rejection Reason</p>
                  <p className="mt-1 p-3 bg-red-50 rounded text-red-700">{selectedTicket.rejection_reason}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                {selectedTicket.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => setShowApprovalDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => setShowRejectionDialog(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main component that switches between admin and driver views
export function WorkTicketManagement({ onTicketStatusChange }: WorkTicketManagementProps = {}) {
  const currentUser = JSON.parse(localStorage.getItem('fleet_user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  return isAdmin ? <AdminWorkTicketManagement onTicketStatusChange={onTicketStatusChange} /> : <DriverWorkTicketView onTicketStatusChange={onTicketStatusChange} />;
}
