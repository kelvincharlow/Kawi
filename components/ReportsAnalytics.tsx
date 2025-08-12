import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Fuel, Car, Users, FileText, FileSpreadsheet, FileImage, Loader2, ChevronDown, Wrench } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, filterByPeriod } from '../utils/helpers';
import { TIME_PERIODS } from '../utils/constants';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3fe6e872`;

export function ReportsAnalytics() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelRecords, setFuelRecords] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [vehiclesRes, fuelRes, maintenanceRes, componentsRes, transfersRes, driversRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE}/fuel-records`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE}/maintenance`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE}/components`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE}/transfers`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE}/drivers`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      const [vehiclesData, fuelData, maintenanceData, componentsData, transfersData, driversData] = await Promise.all([
        vehiclesRes.json(),
        fuelRes.json(),
        maintenanceRes.json(),
        componentsRes.json(),
        transfersRes.json(),
        driversRes.json()
      ]);

      setVehicles(vehiclesData.vehicles || []);
      setFuelRecords(fuelData.records || []);
      setMaintenanceRecords(maintenanceData.maintenance || []);
      setComponents(componentsData.components || []);
      setTransfers(transfersData.transfers || []);
      setDrivers(driversData.drivers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set mock data for demo purposes
      setVehicles([]);
      setFuelRecords([]);
      setMaintenanceRecords([]);
      setComponents([]);
      setTransfers([]);
      setDrivers([]);
    }
  };

  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getFilteredData = () => {
    let filteredFuel = filterByPeriod(fuelRecords, selectedPeriod);
    let filteredMaintenance = filterByPeriod(maintenanceRecords, selectedPeriod);
    let filteredTransfers = filterByPeriod(transfers, selectedPeriod, 'transferDate');

    if (selectedVehicle !== 'all') {
      filteredFuel = filteredFuel.filter(record => record.vehicleId === selectedVehicle);
      filteredMaintenance = filteredMaintenance.filter(record => record.vehicleId === selectedVehicle);
      filteredTransfers = filteredTransfers.filter(record => record.vehicleId === selectedVehicle);
    }

    return {
      fuel: filteredFuel,
      maintenance: filteredMaintenance,
      transfers: filteredTransfers
    };
  };

  const calculateKPIs = () => {
    const { fuel, maintenance } = getFilteredData();
    
    const totalFuelCost = fuel.reduce((sum, record) => sum + record.totalCost, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, record) => sum + record.cost, 0);
    const totalFuelLiters = fuel.reduce((sum, record) => sum + record.fuelAmount, 0);
    const avgFuelPrice = totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 0;

    return {
      totalFuelCost,
      totalMaintenanceCost,
      totalFuelLiters,
      avgFuelPrice,
      totalOperationalCost: totalFuelCost + totalMaintenanceCost
    };
  };

  const getFuelEfficiencyData = () => {
    const { fuel } = getFilteredData();
    const vehicleEfficiency: { [key: string]: { fuel: number, mileage: number } } = {};

    fuel.forEach(record => {
      if (!vehicleEfficiency[record.vehicleId]) {
        vehicleEfficiency[record.vehicleId] = { fuel: 0, mileage: 0 };
      }
      vehicleEfficiency[record.vehicleId].fuel += record.fuelAmount;
      vehicleEfficiency[record.vehicleId].mileage += record.mileage || 0;
    });

    return Object.entries(vehicleEfficiency).map(([vehicleId, data]) => {
      const vehicle = getVehicleById(vehicleId);
      return {
        vehicle: vehicle ? vehicle.gkNumber : vehicleId,
        efficiency: data.mileage > 0 ? data.mileage / data.fuel : 0,
        fuel: data.fuel,
        mileage: data.mileage
      };
    });
  };

  const getMaintenanceCostData = () => {
    const { maintenance } = getFilteredData();
    const vehicleCosts: { [key: string]: number } = {};

    maintenance.forEach(record => {
      if (record.status === 'completed') {
        vehicleCosts[record.vehicleId] = (vehicleCosts[record.vehicleId] || 0) + record.cost;
      }
    });

    return Object.entries(vehicleCosts).map(([vehicleId, cost]) => {
      const vehicle = getVehicleById(vehicleId);
      return {
        vehicle: vehicle ? vehicle.gkNumber : vehicleId,
        cost: cost
      };
    });
  };

  const getVehicleStatusDistribution = () => {
    const statusCount: { [key: string]: number } = {};
    
    vehicles.forEach(vehicle => {
      statusCount[vehicle.status] = (statusCount[vehicle.status] || 0) + 1;
    });

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];
    
    return Object.entries(statusCount).map(([status, count], index) => ({
      name: status,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const getMonthlyTrends = () => {
    const { fuel, maintenance } = getFilteredData();
    const monthlyData: { [key: string]: { fuel: number, maintenance: number } } = {};

    fuel.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = { fuel: 0, maintenance: 0 };
      monthlyData[month].fuel += record.totalCost;
    });

    maintenance.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = { fuel: 0, maintenance: 0 };
      monthlyData[month].maintenance += record.cost;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      fuel: data.fuel,
      maintenance: data.maintenance,
      total: data.fuel + data.maintenance
    }));
  };

  // Export utility functions
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReportData = () => {
    const { fuel, maintenance, transfers } = getFilteredData();
    const kpis = calculateKPIs();
    
    return {
      metadata: {
        reportType: 'Fleet Management Report',
        generatedAt: new Date().toISOString(),
        period: selectedPeriod,
        vehicle: selectedVehicle === 'all' ? 'All Vehicles' : vehicles.find(v => v.id === selectedVehicle)?.gkNumber,
        generatedBy: 'Fleet Management System',
        department: 'Ministry of Energy and Petroleum - State Department for Energy'
      },
      summary: {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
        totalFuelCost: kpis.totalFuelCost,
        totalMaintenanceCost: kpis.totalMaintenanceCost,
        totalOperationalCost: kpis.totalOperationalCost,
        totalFuelLiters: kpis.totalFuelLiters,
        avgFuelPrice: kpis.avgFuelPrice,
        fuelRecords: fuel.length,
        maintenanceRecords: maintenance.length,
        transfers: transfers.length
      },
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        gkNumber: vehicle.gkNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        engineNumber: vehicle.engineNumber,
        chassisNumber: vehicle.chassisNumber,
        status: vehicle.status,
        fuelType: vehicle.fuelType,
        capacity: vehicle.capacity,
        department: vehicle.department,
        createdAt: vehicle.createdAt
      })),
      drivers: drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass,
        phoneNumber: driver.phoneNumber,
        department: driver.department,
        status: driver.status,
        createdAt: driver.createdAt
      })),
      fuelRecords: fuel.map(record => ({
        id: record.id,
        vehicleId: record.vehicleId,
        vehicle: getVehicleById(record.vehicleId)?.gkNumber || record.vehicleId,
        date: record.date,
        fuelStation: record.fuelStation,
        fuelAmount: record.fuelAmount,
        unitPrice: record.unitPrice,
        totalCost: record.totalCost,
        mileage: record.mileage,
        receiptNumber: record.receiptNumber
      })),
      maintenanceRecords: maintenance.map(record => ({
        id: record.id,
        vehicleId: record.vehicleId,
        vehicle: getVehicleById(record.vehicleId)?.gkNumber || record.vehicleId,
        date: record.date,
        type: record.type,
        description: record.description,
        cost: record.cost,
        vendor: record.vendor,
        status: record.status,
        nextServiceDate: record.nextServiceDate
      })),
      transfers: transfers.map(transfer => ({
        id: transfer.id,
        vehicleId: transfer.vehicleId,
        vehicle: getVehicleById(transfer.vehicleId)?.gkNumber || transfer.vehicleId,
        transferDate: transfer.transferDate,
        fromDepartment: transfer.fromDepartment,
        toDepartment: transfer.toDepartment,
        reason: transfer.reason,
        approvedBy: transfer.approvedBy,
        status: transfer.status
      })),
      analytics: {
        fuelEfficiency: getFuelEfficiencyData(),
        maintenanceCosts: getMaintenanceCostData(),
        monthlyTrends: getMonthlyTrends(),
        vehicleStatus: getVehicleStatusDistribution()
      }
    };
  };

  const exportToCSV = async (reportType: string) => {
    setIsExporting(true);
    try {
      const reportData = generateReportData();
      let csvContent = '';
      let filename = '';

      switch (reportType) {
        case 'summary':
          const summaryData = [reportData.summary];
          csvContent = convertToCSV(summaryData, Object.keys(reportData.summary));
          filename = `fleet-summary-${formatDate(new Date())}.csv`;
          break;

        case 'vehicles':
          csvContent = convertToCSV(reportData.vehicles, Object.keys(reportData.vehicles[0] || {}));
          filename = `vehicle-registry-${formatDate(new Date())}.csv`;
          break;

        case 'fuel':
          csvContent = convertToCSV(reportData.fuelRecords, Object.keys(reportData.fuelRecords[0] || {}));
          filename = `fuel-records-${formatDate(new Date())}.csv`;
          break;

        case 'maintenance':
          csvContent = convertToCSV(reportData.maintenanceRecords, Object.keys(reportData.maintenanceRecords[0] || {}));
          filename = `maintenance-records-${formatDate(new Date())}.csv`;
          break;

        case 'drivers':
          csvContent = convertToCSV(reportData.drivers, Object.keys(reportData.drivers[0] || {}));
          filename = `driver-records-${formatDate(new Date())}.csv`;
          break;

        case 'analytics':
          const analyticsData = [
            ...reportData.analytics.fuelEfficiency.map(item => ({ ...item, type: 'fuel_efficiency' })),
            ...reportData.analytics.maintenanceCosts.map(item => ({ ...item, type: 'maintenance_cost' })),
            ...reportData.analytics.monthlyTrends.map(item => ({ ...item, type: 'monthly_trend' }))
          ];
          csvContent = convertToCSV(analyticsData, ['type', 'vehicle', 'efficiency', 'fuel', 'mileage', 'cost', 'month', 'maintenance', 'total']);
          filename = `analytics-report-${formatDate(new Date())}.csv`;
          break;

        default:
          // Complete report
          const completeData = [
            { section: 'Summary', ...reportData.summary },
            ...reportData.vehicles.map(v => ({ section: 'Vehicles', ...v })),
            ...reportData.fuelRecords.map(f => ({ section: 'Fuel', ...f })),
            ...reportData.maintenanceRecords.map(m => ({ section: 'Maintenance', ...m }))
          ];
          csvContent = convertToCSV(completeData, ['section', 'id', 'name', 'gkNumber', 'date', 'cost', 'status']);
          filename = `complete-fleet-report-${formatDate(new Date())}.csv`;
      }

      downloadFile(csvContent, filename, 'text/csv');
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const reportData = generateReportData();
      const jsonContent = JSON.stringify(reportData, null, 2);
      const filename = `fleet-report-${formatDate(new Date())}.json`;
      downloadFile(jsonContent, filename, 'application/json');
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = generateReportData();
      
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Fleet Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
            .subtitle { color: #666; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
            .card h3 { margin: 0 0 10px 0; color: #374151; }
            .value { font-size: 24px; font-weight: bold; color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Fleet Management System</div>
            <div class="subtitle">Ministry of Energy and Petroleum - State Department for Energy</div>
            <div class="subtitle">Generated on: ${formatDate(new Date())}</div>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="grid">
              <div class="card">
                <h3>Fleet Overview</h3>
                <div>Total Vehicles: <span class="value">${reportData.summary.totalVehicles}</span></div>
                <div>Active: ${reportData.summary.activeVehicles}</div>
                <div>In Maintenance: ${reportData.summary.maintenanceVehicles}</div>
              </div>
              <div class="card">
                <h3>Operational Costs</h3>
                <div>Total: <span class="value">${formatCurrency(reportData.summary.totalOperationalCost)}</span></div>
                <div>Fuel: ${formatCurrency(reportData.summary.totalFuelCost)}</div>
                <div>Maintenance: ${formatCurrency(reportData.summary.totalMaintenanceCost)}</div>
              </div>
              <div class="card">
                <h3>Fuel Consumption</h3>
                <div>Total: <span class="value">${formatNumber(reportData.summary.totalFuelLiters)} L</span></div>
                <div>Avg Price: KES ${reportData.summary.avgFuelPrice.toFixed(2)}/L</div>
                <div>Records: ${reportData.summary.fuelRecords}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Vehicle Registry (Top 10)</h2>
            <table>
              <thead>
                <tr>
                  <th>GK Number</th>
                  <th>Make & Model</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.vehicles.slice(0, 10).map(vehicle => `
                  <tr>
                    <td>${vehicle.gkNumber}</td>
                    <td>${vehicle.make} ${vehicle.model}</td>
                    <td>${vehicle.year}</td>
                    <td>${vehicle.status}</td>
                    <td>${vehicle.department}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Recent Fuel Records (Top 10)</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Amount (L)</th>
                  <th>Cost</th>
                  <th>Station</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.fuelRecords.slice(0, 10).map(record => `
                  <tr>
                    <td>${formatDate(new Date(record.date))}</td>
                    <td>${record.vehicle}</td>
                    <td>${record.fuelAmount}</td>
                    <td>${formatCurrency(record.totalCost)}</td>
                    <td>${record.fuelStation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the Fleet Management System.</p>
            <p>For questions or concerns, please contact the Fleet Management Department.</p>
          </div>
        </body>
        </html>
      `;

      // Convert HTML to PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      printWindow!.document.write(htmlContent);
      printWindow!.document.close();
      printWindow!.print();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export Report
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => exportToCSV('complete')}>
                <FileText className="h-4 w-4 mr-2" />
                Complete Report (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('summary')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Summary Report (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('vehicles')}>
                <Car className="h-4 w-4 mr-2" />
                Vehicle Registry (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('drivers')}>
                <Users className="h-4 w-4 mr-2" />
                Driver Records (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('fuel')}>
                <Fuel className="h-4 w-4 mr-2" />
                Fuel Records (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('maintenance')}>
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance Records (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('analytics')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics Data (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                <FileText className="h-4 w-4 mr-2" />
                Raw Data (JSON)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileImage className="h-4 w-4 mr-2" />
                PDF Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={fetchAllData} variant="secondary" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIODS.map(period => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Fuel Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalFuelCost)}</div>
            <p className="text-sm text-gray-600">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Maintenance Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalMaintenanceCost)}</div>
            <p className="text-sm text-gray-600">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Fuel Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpis.totalFuelLiters)} L</div>
            <p className="text-sm text-gray-600">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Fuel Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {kpis.avgFuelPrice.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Per liter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyTrends()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="fuel" stroke="#3b82f6" name="Fuel" />
                <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" name="Maintenance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getVehicleStatusDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getVehicleStatusDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getFuelEfficiencyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#10b981" name="km/L" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Costs by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMaintenanceCostData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="cost" fill="#f59e0b" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fleet Summary Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Fleet Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Vehicles:</span>
                      <span className="font-medium">{vehicles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Vehicles:</span>
                      <span className="font-medium">{vehicles.filter(v => v.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Maintenance:</span>
                      <span className="font-medium">{vehicles.filter(v => v.status === 'maintenance').length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Operational Costs</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Fuel:</span>
                      <span className="font-medium">{formatCurrency(kpis.totalFuelCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Maintenance:</span>
                      <span className="font-medium">{formatCurrency(kpis.totalMaintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grand Total:</span>
                      <span className="font-medium">{formatCurrency(kpis.totalOperationalCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fuel Records:</span>
                      <span className="font-medium">{getFilteredData().fuel.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maintenance Records:</span>
                      <span className="font-medium">{getFilteredData().maintenance.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transfers:</span>
                      <span className="font-medium">{getFilteredData().transfers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={() => exportToCSV('summary')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Quick Summary (CSV)
              </Button>
              <Button 
                onClick={exportToPDF} 
                variant="outline" 
                className="w-full justify-start"
                disabled={isExporting}
              >
                <FileImage className="h-4 w-4 mr-2" />
                Executive Report (PDF)
              </Button>
              <Button 
                onClick={() => exportToCSV('complete')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={isExporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Complete Data (CSV)
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Report Contents</h5>
              <div className="space-y-1 text-xs text-gray-600">
                <div>✓ Vehicle registry and status</div>
                <div>✓ Fuel consumption records</div>
                <div>✓ Maintenance logs and costs</div>
                <div>✓ Driver information</div>
                <div>✓ Transfer history</div>
                <div>✓ Performance analytics</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Export Formats</h5>
              <div className="space-y-1 text-xs text-gray-600">
                <div>📊 CSV - For spreadsheet analysis</div>
                <div>📄 PDF - For presentations</div>
                <div>💾 JSON - For data integration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}