import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Fuel, Car, Users, FileText, FileSpreadsheet, FileImage, Loader2, ChevronDown, Wrench, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, filterByPeriod } from '../utils/helpers';
import { TIME_PERIODS } from '../utils/constants';
import { apiService } from '../utils/apiService';

// Helper function to format current date
const getCurrentDateFormatted = () => formatDate(new Date().toISOString());

export function ReportsAnalytics() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelRecords, setFuelRecords] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [workTickets, setWorkTickets] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [vehiclesData, fuelData, maintenanceData, workTicketsData, driversData] = await Promise.all([
        apiService.getVehicles(),
        apiService.getFuelRecords(),
        apiService.getMaintenanceRecords(),
        apiService.getWorkTickets(),
        apiService.getDrivers()
      ]);

      setVehicles(vehiclesData || []);
      setFuelRecords(fuelData || []);
      setMaintenanceRecords(maintenanceData || []);
      setWorkTickets(workTicketsData || []);
      setDrivers(driversData || []);
      setTransfers([]); // For now, set empty transfers as it's not in apiService
      
      // Debug logging
      console.log('Work Tickets loaded:', workTicketsData?.length || 0);
      console.log('Drivers loaded:', driversData?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays as fallback
      setVehicles([]);
      setFuelRecords([]);
      setMaintenanceRecords([]);
      setWorkTickets([]);
      setDrivers([]);
      setTransfers([]);
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
          filename = `fleet-summary-${getCurrentDateFormatted()}.csv`;
          break;

        case 'vehicles':
          csvContent = convertToCSV(reportData.vehicles, Object.keys(reportData.vehicles[0] || {}));
          filename = `vehicle-registry-${getCurrentDateFormatted()}.csv`;
          break;

        case 'fuel':
          csvContent = convertToCSV(reportData.fuelRecords, Object.keys(reportData.fuelRecords[0] || {}));
          filename = `fuel-records-${getCurrentDateFormatted()}.csv`;
          break;

        case 'maintenance':
          csvContent = convertToCSV(reportData.maintenanceRecords, Object.keys(reportData.maintenanceRecords[0] || {}));
          filename = `maintenance-records-${getCurrentDateFormatted()}.csv`;
          break;

        case 'drivers':
          csvContent = convertToCSV(reportData.drivers, Object.keys(reportData.drivers[0] || {}));
          filename = `driver-records-${getCurrentDateFormatted()}.csv`;
          break;

        case 'analytics':
          const analyticsData = [
            ...reportData.analytics.fuelEfficiency.map(item => ({ ...item, type: 'fuel_efficiency' })),
            ...reportData.analytics.maintenanceCosts.map(item => ({ ...item, type: 'maintenance_cost' })),
            ...reportData.analytics.monthlyTrends.map(item => ({ ...item, type: 'monthly_trend' }))
          ];
          csvContent = convertToCSV(analyticsData, ['type', 'vehicle', 'efficiency', 'fuel', 'mileage', 'cost', 'month', 'maintenance', 'total']);
          filename = `analytics-report-${getCurrentDateFormatted()}.csv`;
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
          filename = `complete-fleet-report-${getCurrentDateFormatted()}.csv`;
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
      const filename = `fleet-report-${getCurrentDateFormatted()}.json`;
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
            <div class="subtitle">Generated on: ${getCurrentDateFormatted()}</div>
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
                    <td>${formatDate(record.date)}</td>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600 mt-1">Comprehensive fleet performance insights and data export</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchAllData} 
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
          >
            Refresh Data
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200" 
                disabled={isExporting}
              >
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
        </div>
      </div>

      {/* Filters Section */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors">
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
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vehicle Filter</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors">
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
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              Total Fuel Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{formatCurrency(kpis.totalFuelCost)}</div>
            <p className="text-xs text-blue-600 mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
              Maintenance Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{formatCurrency(kpis.totalMaintenanceCost)}</div>
            <p className="text-xs text-amber-600 mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Fuel className="h-4 w-4 text-green-600" />
              </div>
              Fuel Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{formatNumber(kpis.totalFuelLiters)} L</div>
            <p className="text-xs text-green-600 mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              Avg Fuel Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">KES {kpis.avgFuelPrice.toFixed(2)}</div>
            <p className="text-xs text-purple-600 mt-1">Per liter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="bg-blue-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Monthly Cost Trends</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Fuel and maintenance expenses over time
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getMonthlyTrends()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="fuel" stroke="#3b82f6" name="Fuel" strokeWidth={3} />
                <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" name="Maintenance" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="bg-green-100 p-2 rounded-full">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Vehicle Status Distribution</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Current fleet status overview
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={getVehicleStatusDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getVehicleStatusDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Fuel className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Fuel Efficiency by Vehicle</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Kilometers per liter performance
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getFuelEfficiencyData()}>
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
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="efficiency" 
                  fill="url(#efficiencyGradient)" 
                  name="km/L" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="bg-amber-100 p-2 rounded-full">
                <Wrench className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Maintenance Costs by Vehicle</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Total maintenance expenses per vehicle
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getMaintenanceCostData()}>
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
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="cost" 
                  fill="url(#maintenanceGradient)" 
                  name="Cost" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="bg-gray-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <span className="text-xl font-bold">Fleet Summary Report</span>
                  <p className="text-sm text-gray-600 font-normal mt-1">
                    Comprehensive overview of fleet operations
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-500" />
                    Fleet Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Total Vehicles:</span>
                      <span className="font-bold text-blue-700 text-lg">{vehicles.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Active Vehicles:</span>
                      <span className="font-bold text-green-700 text-lg">{vehicles.filter(v => v.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">In Maintenance:</span>
                      <span className="font-bold text-amber-700 text-lg">{vehicles.filter(v => v.status === 'maintenance').length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Operational Costs
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Total Fuel:</span>
                      <span className="font-bold text-blue-700">{formatCurrency(kpis.totalFuelCost)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Total Maintenance:</span>
                      <span className="font-bold text-amber-700">{formatCurrency(kpis.totalMaintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <span className="text-sm text-gray-700 font-medium">Grand Total:</span>
                      <span className="font-bold text-purple-700 text-lg">{formatCurrency(kpis.totalOperationalCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Fuel Records:</span>
                      <span className="font-bold text-indigo-700 text-lg">{getFilteredData().fuel.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Maintenance Records:</span>
                      <span className="font-bold text-orange-700 text-lg">{getFilteredData().maintenance.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Transfers:</span>
                      <span className="font-bold text-teal-700 text-lg">{getFilteredData().transfers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="bg-green-100 p-2 rounded-full">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Export Options</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Download reports in various formats
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Button 
                onClick={() => exportToCSV('summary')} 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Quick Summary (CSV)
              </Button>
              <Button 
                onClick={exportToPDF} 
                variant="outline" 
                className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                disabled={isExporting}
              >
                <FileImage className="h-4 w-4 mr-2" />
                Executive Report (PDF)
              </Button>
              <Button 
                onClick={() => exportToCSV('complete')} 
                variant="outline" 
                className="w-full justify-start hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                disabled={isExporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Complete Data (CSV)
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Report Contents
              </h5>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Vehicle registry and status
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Fuel consumption records
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Maintenance logs and costs
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Driver information
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Transfer history
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-green-500">✓</span>
                  Performance analytics
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Formats
              </h5>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <span>📊</span>
                  CSV - For spreadsheet analysis
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <span>📄</span>
                  PDF - For presentations
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <span>💾</span>
                  JSON - For data integration
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
