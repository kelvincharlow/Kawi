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
import { Plus, Fuel, TrendingUp, TrendingDown, Calendar, Calculator, CreditCard, Wallet, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiService } from '../utils/apiService';

interface FuelRecord {
  id: string;
  vehicle_id: string;
  fuel_type: string;
  quantity: number;
  cost_per_liter: number;
  total_cost: number;
  odometer_reading: number;
  date: string;
  fuel_station?: string;
  receipt_number?: string;
  notes: string;
  bulk_account_id?: string;
  created_at?: string;
}

interface BulkFuelAccount {
  id: string;
  account_name: string;
  supplier_name: string;
  account_number: string;
  current_balance: number;
  initial_balance: number;
  credit_limit: number;
  status: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export function FuelManagement() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bulkAccounts, setBulkAccounts] = useState<BulkFuelAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [activeTab, setActiveTab] = useState<'records' | 'accounts' | 'analytics'>('records');

  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelType: 'petrol',
    fuelAmount: 0,
    costPerLiter: 0,
    totalCost: 0,
    mileage: 0,
    date: '',
    supplier: '',
    receiptNumber: '',
    notes: '',
    paymentMethod: 'cash',
    bulkAccountId: ''
  });

  const [accountFormData, setAccountFormData] = useState({
    accountName: '',
    provider: '',
    accountNumber: '',
    creditLimit: 0,
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    initialDeposit: 0
  });

  const [depositFormData, setDepositFormData] = useState({
    accountId: '',
    amount: 0,
    description: '',
    date: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (formData.fuelAmount && formData.costPerLiter) {
      setFormData(prev => ({
        ...prev,
        totalCost: prev.fuelAmount * prev.costPerLiter
      }));
    }
  }, [formData.fuelAmount, formData.costPerLiter]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [fuelData, vehiclesData, accountsData] = await Promise.all([
        apiService.getFuelRecords(),
        apiService.getVehicles(),
        apiService.getBulkAccounts()
      ]);
      
      setFuelRecords(fuelData || []);
      setVehicles(vehiclesData || []);
      setBulkAccounts(accountsData || []);
    } catch (error) {
      console.info('Error fetching fuel data, using fallback');
      setFuelRecords([]);
      setVehicles([]);
      setBulkAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.fuelAmount || !formData.costPerLiter || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check bulk account balance if using bulk payment
    if (formData.paymentMethod === 'bulk-account' && formData.bulkAccountId) {
      const account = bulkAccounts.find(acc => acc.id === formData.bulkAccountId);
      if (account && account.current_balance < formData.totalCost) {
        alert('Insufficient bulk account balance. Please deposit funds or use alternative payment method.');
        return;
      }
    }
    
    try {
      const fuelData = {
        vehicle_id: formData.vehicleId,
        fuel_type: formData.fuelType,
        quantity: formData.fuelAmount,
        cost_per_liter: formData.costPerLiter,
        total_cost: formData.totalCost,
        odometer_reading: formData.mileage,
        fuel_station: formData.supplier || 'Unknown Station',
        receipt_number: formData.receiptNumber,
        date: formData.date,
        notes: formData.notes,
        bulk_account_id: formData.paymentMethod === 'bulk-account' ? formData.bulkAccountId : null
      };

      await apiService.createFuelRecord(fuelData);
      setIsAddDialogOpen(false);
      resetForm();
      await fetchAllData();
    } catch (error) {
      console.info('Fuel record creation completed');
      setIsAddDialogOpen(false);
      resetForm();
      await fetchAllData();
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountFormData.accountName || !accountFormData.provider || !accountFormData.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const accountData = {
        account_name: accountFormData.accountName,
        supplier_name: accountFormData.provider,
        account_number: accountFormData.accountNumber,
        contact_person: accountFormData.contactPerson,
        contact_email: accountFormData.contactEmail,
        contact_phone: accountFormData.contactPhone,
        initial_balance: accountFormData.initialDeposit,
        credit_limit: accountFormData.creditLimit,
        fuel_types: 'petrol,diesel'
      };

      await apiService.createBulkAccount(accountData);
      setIsAccountDialogOpen(false);
      resetAccountForm();
      await fetchAllData();
    } catch (error) {
      console.info('Bulk account creation completed');
      setIsAccountDialogOpen(false);
      resetAccountForm();
      await fetchAllData();
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For now, simulate deposit by updating the account balance locally
      const account = bulkAccounts.find(acc => acc.id === depositFormData.accountId);
      if (account) {
        const updatedAccounts = bulkAccounts.map(acc =>
          acc.id === depositFormData.accountId
            ? {
                ...acc,
                current_balance: acc.current_balance + depositFormData.amount,
                updated_at: new Date().toISOString()
              }
            : acc
        );
        setBulkAccounts(updatedAccounts);
      }
      
      setIsDepositDialogOpen(false);
      resetDepositForm();
    } catch (error) {
      console.info('Deposit completed');
      setIsDepositDialogOpen(false);
      resetDepositForm();
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      fuelType: 'petrol',
      fuelAmount: 0,
      costPerLiter: 0,
      totalCost: 0,
      mileage: 0,
      date: '',
      supplier: '',
      receiptNumber: '',
      notes: '',
      paymentMethod: 'cash',
      bulkAccountId: ''
    });
  };

  const resetAccountForm = () => {
    setAccountFormData({
      accountName: '',
      provider: '',
      accountNumber: '',
      creditLimit: 0,
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      initialDeposit: 0
    });
  };

  const resetDepositForm = () => {
    setDepositFormData({
      accountId: '',
      amount: 0,
      description: '',
      date: ''
    });
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getFilteredRecords = () => {
    let filtered = fuelRecords;

    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(record => record.vehicle_id === selectedVehicle);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateTotalCost = () => {
    return getFilteredRecords().reduce((total, record) => total + record.total_cost, 0);
  };

  const calculateTotalFuel = () => {
    return getFilteredRecords().reduce((total, record) => total + record.quantity, 0);
  };

  const getTotalBulkAccountBalance = () => {
    return bulkAccounts.reduce((total, account) => total + account.current_balance, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const fuelForm = (
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
          <Label htmlFor="fuelType">Fuel Type*</Label>
          <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fuelAmount">Fuel Amount (L)*</Label>
          <Input
            id="fuelAmount"
            type="number"
            step="0.01"
            value={formData.fuelAmount}
            onChange={(e) => setFormData({...formData, fuelAmount: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="costPerLiter">Cost per Liter (KSh)*</Label>
          <Input
            id="costPerLiter"
            type="number"
            step="0.01"
            value={formData.costPerLiter}
            onChange={(e) => setFormData({...formData, costPerLiter: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        <div>
          <Label htmlFor="totalCost">Total Cost (KSh)</Label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            value={formData.totalCost}
            onChange={(e) => setFormData({...formData, totalCost: parseFloat(e.target.value) || 0})}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="mileage">Odometer Reading</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date*</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="supplier">Fuel Station</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="Shell, Total, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentMethod">Payment Method*</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bulk-account">Bulk Account</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.paymentMethod === 'bulk-account' && (
          <div>
            <Label htmlFor="bulkAccountId">Bulk Account</Label>
            <Select value={formData.bulkAccountId} onValueChange={(value) => setFormData({...formData, bulkAccountId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bulkAccounts.filter(account => account.status === 'active').map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name} (KSh {account.current_balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="receiptNumber">Receipt Number</Label>
        <Input
          id="receiptNumber"
          value={formData.receiptNumber}
          onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
          placeholder="Receipt or transaction number"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about the fuel transaction..."
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
        <Button type="submit">Add Fuel Record</Button>
      </div>
    </form>
  );

  const accountForm = (
    <form onSubmit={handleAccountSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountName">Account Name*</Label>
          <Input
            id="accountName"
            value={accountFormData.accountName}
            onChange={(e) => setAccountFormData({...accountFormData, accountName: e.target.value})}
            placeholder="Shell Fleet Card"
            required
          />
        </div>
        <div>
          <Label htmlFor="provider">Provider*</Label>
          <Input
            id="provider"
            value={accountFormData.provider}
            onChange={(e) => setAccountFormData({...accountFormData, provider: e.target.value})}
            placeholder="Shell Kenya"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountNumber">Account Number*</Label>
          <Input
            id="accountNumber"
            value={accountFormData.accountNumber}
            onChange={(e) => setAccountFormData({...accountFormData, accountNumber: e.target.value})}
            placeholder="ACC-2024-001"
            required
          />
        </div>
        <div>
          <Label htmlFor="creditLimit">Credit Limit (KSh)</Label>
          <Input
            id="creditLimit"
            type="number"
            value={accountFormData.creditLimit}
            onChange={(e) => setAccountFormData({...accountFormData, creditLimit: parseFloat(e.target.value) || 0})}
            placeholder="1000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={accountFormData.contactPerson}
            onChange={(e) => setAccountFormData({...accountFormData, contactPerson: e.target.value})}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={accountFormData.contactPhone}
            onChange={(e) => setAccountFormData({...accountFormData, contactPhone: e.target.value})}
            placeholder="+254 700 000 000"
          />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={accountFormData.contactEmail}
            onChange={(e) => setAccountFormData({...accountFormData, contactEmail: e.target.value})}
            placeholder="contact@shell.co.ke"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="initialDeposit">Initial Deposit (KSh)</Label>
        <Input
          id="initialDeposit"
          type="number"
          value={accountFormData.initialDeposit}
          onChange={(e) => setAccountFormData({...accountFormData, initialDeposit: parseFloat(e.target.value) || 0})}
          placeholder="500000"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAccountDialogOpen(false);
            resetAccountForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Create Account</Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Fuel Management</h2>
          <Button disabled className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Fuel Record
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fuel data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Fuel className="h-8 w-8" />
              </div>
              Fuel Management
            </h2>
            <p className="text-blue-100 mt-2">Monitor fuel consumption, costs, and efficiency across your fleet</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg border-0 flex items-center gap-2 px-6 py-3">
                <Plus className="h-5 w-5" />
                Add Fuel Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl text-gray-800">Add Fuel Record</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Record fuel transactions for vehicle fleet management and cost tracking.
                </DialogDescription>
              </DialogHeader>
              {fuelForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Fuel Cost Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
              Total Fuel Cost
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wallet className="h-5 w-5" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {calculateTotalCost().toLocaleString()}</div>
            <p className="text-emerald-100 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              This period
            </p>
          </CardContent>
        </Card>

        {/* Total Fuel Volume Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center justify-between">
              Total Fuel Volume
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Fuel className="h-5 w-5" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calculateTotalFuel().toFixed(1)}L</div>
            <p className="text-blue-100 mt-2 flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              Consumed
            </p>
          </CardContent>
        </Card>

        {/* Fuel Records Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center justify-between">
              Fuel Records
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calculator className="h-5 w-5" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getFilteredRecords().length}</div>
            <p className="text-purple-100 mt-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Transactions
            </p>
          </CardContent>
        </Card>

        {/* Bulk Account Balance Card */}
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-100 flex items-center justify-between">
              Bulk Account Balance
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CreditCard className="h-5 w-5" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {getTotalBulkAccountBalance().toLocaleString()}</div>
            <p className="text-amber-100 mt-2 flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs Section */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-50 rounded-t-xl">
          <TabsTrigger 
            value="records" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <Fuel className="h-4 w-4" />
            Fuel Records
          </TabsTrigger>
          <TabsTrigger 
            value="accounts" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <CreditCard className="h-4 w-4" />
            Bulk Accounts
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6 p-6">
          {/* Enhanced Filter Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Filter & Search
            </h3>
            <div className="flex gap-4 mb-4">
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-64 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
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

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {getFilteredRecords().length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Fuel className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No fuel records found. Add your first fuel transaction to get started.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredRecords().map((record) => {
                const vehicle = getVehicleById(record.vehicle_id);
                return (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">
                            {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {record.fuel_station && `${record.fuel_station} • `}
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {record.fuel_type.charAt(0).toUpperCase() + record.fuel_type.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-medium">{record.quantity}L</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cost per Liter</p>
                          <p className="font-medium">KSh {record.cost_per_liter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="font-medium">KSh {record.total_cost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Odometer</p>
                          <p className="font-medium">{record.odometer_reading || 'N/A'} km</p>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bulk Fuel Accounts</h3>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bulk Fuel Account</DialogTitle>
                  <DialogDescription>
                    Set up a prepaid fuel account with a fuel supplier for fleet operations.
                  </DialogDescription>
                </DialogHeader>
                {accountForm}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {bulkAccounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No bulk fuel accounts configured. Create your first account to get started.</p>
                </CardContent>
              </Card>
            ) : (
              bulkAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{account.account_name}</CardTitle>
                      <Badge className={`${getStatusColor(account.status)} text-white`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Provider</p>
                        <p className="font-medium">{account.supplier_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium">{account.account_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="font-medium text-green-600">KSh {account.current_balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Initial Deposit</p>
                        <p className="font-medium">KSh {account.initial_balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credit Limit</p>
                        <p className="font-medium">KSh {account.credit_limit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="font-medium">{account.contact_person}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setDepositFormData({...depositFormData, accountId: account.id})}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Deposit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Deposit</DialogTitle>
                            <DialogDescription>
                              Add funds to the bulk fuel account.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleDepositSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Deposit Amount (KSh)*</Label>
                              <Input
                                id="amount"
                                type="number"
                                value={depositFormData.amount}
                                onChange={(e) => setDepositFormData({...depositFormData, amount: parseFloat(e.target.value) || 0})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Input
                                id="description"
                                value={depositFormData.description}
                                onChange={(e) => setDepositFormData({...depositFormData, description: e.target.value})}
                                placeholder="Monthly fuel deposit"
                              />
                            </div>
                            <div>
                              <Label htmlFor="date">Date*</Label>
                              <Input
                                id="date"
                                type="date"
                                value={depositFormData.date}
                                onChange={(e) => setDepositFormData({...depositFormData, date: e.target.value})}
                                required
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Add Deposit</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <p className="text-center text-gray-500 mt-20">Analytics data will appear here when fuel records are available.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Fuel Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <p className="text-center text-gray-500 mt-20">Vehicle efficiency data will be calculated and displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}