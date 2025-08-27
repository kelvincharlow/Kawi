import { useState, useEffect, useMemo } from 'react';
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
  
  // Export selection states
  const [selectedReportType, setSelectedReportType] = useState<string>('complete');
  const [selectedExportFormat, setSelectedExportFormat] = useState<string>('pdf');

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
      
      // Enhanced debug logging
      console.log('=== REPORTS & ANALYTICS DATA LOADED ===');
      console.log('Vehicles loaded:', vehiclesData?.length || 0, vehiclesData);
      console.log('Fuel records loaded:', fuelData?.length || 0, fuelData);
      console.log('Maintenance records loaded:', maintenanceData?.length || 0, maintenanceData);
      console.log('Work Tickets loaded:', workTicketsData?.length || 0);
      console.log('Drivers loaded:', driversData?.length || 0);
      
      // Log sample records to check structure
      if (fuelData && fuelData.length > 0) {
        console.log('Sample fuel record:', fuelData[0]);
      }
      if (maintenanceData && maintenanceData.length > 0) {
        console.log('Sample maintenance record:', maintenanceData[0]);
      }
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

  // Memoize filtered data for better performance
  const filteredData = useMemo(() => {
    let filteredFuel = filterByPeriod(fuelRecords, selectedPeriod);
    let filteredMaintenance = filterByPeriod(maintenanceRecords, selectedPeriod);
    let filteredTransfers = filterByPeriod(transfers, selectedPeriod, 'transferDate');
    
    // Filter drivers by their joining date
    let filteredDrivers = filterByPeriod(drivers, selectedPeriod, 'dateJoined');
    
    // Filter vehicles by their acquisition date
    let filteredVehicles = filterByPeriod(vehicles, selectedPeriod, 'acquisitionDate');

    console.log('=== FILTERING DATA ===');
    console.log('Selected period:', selectedPeriod);
    console.log('Selected vehicle:', selectedVehicle);
    console.log('Total fuel records:', fuelRecords.length);
    console.log('Filtered fuel records (by period):', filteredFuel.length);
    console.log('Total maintenance records:', maintenanceRecords.length);
    console.log('Filtered maintenance records (by period):', filteredMaintenance.length);
    console.log('Total drivers:', drivers.length);
    console.log('Filtered drivers (by period):', filteredDrivers.length);
    console.log('Total vehicles:', vehicles.length);
    console.log('Filtered vehicles (by period):', filteredVehicles.length);

    if (selectedVehicle !== 'all') {
      // Handle both camelCase and snake_case field names for vehicleId
      filteredFuel = filteredFuel.filter(record => 
        (record.vehicleId === selectedVehicle) || (record.vehicle_id === selectedVehicle)
      );
      filteredMaintenance = filteredMaintenance.filter(record => 
        (record.vehicleId === selectedVehicle) || (record.vehicle_id === selectedVehicle)
      );
      filteredTransfers = filteredTransfers.filter(record => 
        (record.vehicleId === selectedVehicle) || (record.vehicle_id === selectedVehicle)
      );
      
      // For vehicles, if a specific vehicle is selected, only show that vehicle
      filteredVehicles = filteredVehicles.filter(vehicle => vehicle.id === selectedVehicle);
      
      console.log('Filtered fuel records (by vehicle):', filteredFuel.length);
      console.log('Filtered maintenance records (by vehicle):', filteredMaintenance.length);
      console.log('Filtered vehicles (by vehicle selection):', filteredVehicles.length);
    }

    const result = {
      fuel: filteredFuel,
      maintenance: filteredMaintenance,
      transfers: filteredTransfers,
      drivers: filteredDrivers,
      vehicles: filteredVehicles
    };
    
    console.log('Final filtered data:', result);
    return result;
  }, [fuelRecords, maintenanceRecords, transfers, drivers, vehicles, selectedPeriod, selectedVehicle]);

  const getFilteredData = () => filteredData;

  const calculateKPIs = () => {
    const { fuel, maintenance } = filteredData;
    
    // Debug logging to help identify issues
    console.log('Calculating KPIs with data:', {
      fuelRecords: fuel.length,
      maintenanceRecords: maintenance.length,
      sampleFuel: fuel[0],
      sampleMaintenance: maintenance[0]
    });
    
    // Calculate totals with proper null/undefined handling and field name variations
    const totalFuelCost = fuel.reduce((sum, record) => {
      // Handle both camelCase and snake_case field names
      const cost = Number(record?.totalCost || record?.total_cost) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    
    const totalMaintenanceCost = maintenance.reduce((sum, record) => {
      // Only count completed maintenance records for consistency with MaintenanceManagement component
      if (record.status !== 'completed') return sum;
      const cost = Number(record?.cost) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    
    const totalFuelLiters = fuel.reduce((sum, record) => {
      // Handle both camelCase and snake_case field names
      const amount = Number(record?.fuelAmount || record?.quantity) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const avgFuelPrice = totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 0;

    const result = {
      totalFuelCost: isNaN(totalFuelCost) ? 0 : totalFuelCost,
      totalMaintenanceCost: isNaN(totalMaintenanceCost) ? 0 : totalMaintenanceCost,
      totalFuelLiters: isNaN(totalFuelLiters) ? 0 : totalFuelLiters,
      avgFuelPrice: isNaN(avgFuelPrice) ? 0 : avgFuelPrice,
      totalOperationalCost: isNaN(totalFuelCost + totalMaintenanceCost) ? 0 : totalFuelCost + totalMaintenanceCost
    };

    console.log('Calculated KPIs:', result);
    return result;
  };

  const getFuelEfficiencyData = () => {
    const { fuel } = filteredData;
    const vehicleEfficiency: { [key: string]: { fuel: number, mileage: number } } = {};

    fuel.forEach(record => {
      // Handle both camelCase and snake_case field names
      const vehicleId = record?.vehicleId || record?.vehicle_id;
      if (!vehicleId) return; // Skip records without vehicleId
      
      if (!vehicleEfficiency[vehicleId]) {
        vehicleEfficiency[vehicleId] = { fuel: 0, mileage: 0 };
      }
      
      const fuelAmount = Number(record?.fuelAmount || record?.quantity) || 0;
      const mileage = Number(record?.mileage || record?.odometer_reading) || 0;
      
      vehicleEfficiency[vehicleId].fuel += isNaN(fuelAmount) ? 0 : fuelAmount;
      vehicleEfficiency[vehicleId].mileage += isNaN(mileage) ? 0 : mileage;
    });

    return Object.entries(vehicleEfficiency).map(([vehicleId, data]) => {
      const vehicle = getVehicleById(vehicleId);
      const efficiency = data.fuel > 0 ? data.mileage / data.fuel : 0;
      
      return {
        vehicle: vehicle ? vehicle.gkNumber : vehicleId,
        efficiency: isNaN(efficiency) ? 0 : efficiency,
        fuel: data.fuel,
        mileage: data.mileage
      };
    });
  };

  const getMaintenanceCostData = () => {
    const { maintenance } = filteredData;
    const vehicleCosts: { [key: string]: number } = {};

    maintenance.forEach(record => {
      // Handle both camelCase and snake_case field names
      const vehicleId = record?.vehicleId || record?.vehicle_id;
      if (!vehicleId || record.status !== 'completed') return;
      
      const cost = Number(record?.cost) || 0;
      if (isNaN(cost)) return;
      
      vehicleCosts[vehicleId] = (vehicleCosts[vehicleId] || 0) + cost;
    });

    return Object.entries(vehicleCosts).map(([vehicleId, cost]) => {
      const vehicle = getVehicleById(vehicleId);
      return {
        vehicle: vehicle ? vehicle.gkNumber : vehicleId,
        cost: isNaN(cost) ? 0 : cost
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
    const { fuel, maintenance } = filteredData;
    const monthlyData: { [key: string]: { fuel: number, maintenance: number } } = {};

    fuel.forEach(record => {
      if (!record?.date) return;
      
      try {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) monthlyData[month] = { fuel: 0, maintenance: 0 };
        
        // Handle both camelCase and snake_case field names
        const cost = Number(record?.totalCost || record?.total_cost) || 0;
        if (!isNaN(cost)) {
          monthlyData[month].fuel += cost;
        }
      } catch (error) {
        console.warn('Invalid date in fuel record:', record.date);
      }
    });

    maintenance.forEach(record => {
      if (!record?.date) return;
      
      try {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) monthlyData[month] = { fuel: 0, maintenance: 0 };
        
        const cost = Number(record?.cost) || 0;
        if (!isNaN(cost)) {
          monthlyData[month].maintenance += cost;
        }
      } catch (error) {
        console.warn('Invalid date in maintenance record:', record.date);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      fuel: isNaN(data.fuel) ? 0 : data.fuel,
      maintenance: isNaN(data.maintenance) ? 0 : data.maintenance,
      total: isNaN(data.fuel + data.maintenance) ? 0 : data.fuel + data.maintenance
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
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
    const { fuel, maintenance, transfers } = filteredData;
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
        totalVehicles: filteredData.vehicles.length,
        activeVehicles: filteredData.vehicles.filter(v => v.status === 'active').length,
        maintenanceVehicles: filteredData.vehicles.filter(v => v.status === 'maintenance').length,
        totalFuelCost: kpis.totalFuelCost,
        totalMaintenanceCost: kpis.totalMaintenanceCost,
        totalOperationalCost: kpis.totalOperationalCost,
        totalFuelLiters: kpis.totalFuelLiters,
        avgFuelPrice: kpis.avgFuelPrice,
        fuelRecords: fuel.length,
        maintenanceRecords: maintenance.length,
        transfers: transfers.length
      },
      vehicles: filteredData.vehicles.map(vehicle => ({
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
      drivers: filteredData.drivers.map(driver => ({
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

  // Generate PDF content based on report type
  const generatePDFContent = (reportData: any, reportType: string, reportTitle: string) => {
    const baseHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .subtitle { color: #6b7280; font-size: 14px; }
          .section { margin: 30px 0; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
          .card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background: #f9fafb; }
          .card h3 { margin: 0 0 15px 0; color: #1f2937; font-size: 16px; }
          .value { font-weight: bold; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary-stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
          .stat-label { color: #6b7280; font-size: 14px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🚗 Digital Fleet Management System</div>
          <div class="subtitle">${reportTitle}</div>
          <div class="subtitle">Generated on: ${getCurrentDateFormatted()}</div>
          <div class="subtitle">Period: ${TIME_PERIODS[selectedPeriod]} | Vehicle: ${selectedVehicle === 'all' ? 'All Vehicles' : selectedVehicle}</div>
        </div>`;

    let content = '';

    switch (reportType) {
      case 'summary':
        content = `
          <div class="section">
            <h2>Executive Summary</h2>
            <div class="summary-stats">
              <div class="stat">
                <div class="stat-value">${reportData.summary.totalVehicles}</div>
                <div class="stat-label">Total Vehicles</div>
              </div>
              <div class="stat">
                <div class="stat-value">${formatCurrency(reportData.summary.totalOperationalCost)}</div>
                <div class="stat-label">Total Operational Cost</div>
              </div>
              <div class="stat">
                <div class="stat-value">${formatNumber(reportData.summary.totalFuelLiters)} L</div>
                <div class="stat-label">Total Fuel Consumed</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.summary.fuelRecords + reportData.summary.maintenanceRecords}</div>
                <div class="stat-label">Total Records</div>
              </div>
            </div>
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
          </div>`;
        break;

      case 'vehicles':
        content = `
          <div class="section">
            <h2>Vehicle Registry</h2>
            <table>
              <thead>
                <tr>
                  <th>GK Number</th>
                  <th>Make & Model</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Mileage</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.vehicles.map(vehicle => `
                  <tr>
                    <td>${vehicle.gkNumber}</td>
                    <td>${vehicle.make} ${vehicle.model}</td>
                    <td>${vehicle.year}</td>
                    <td>${vehicle.status}</td>
                    <td>${vehicle.department}</td>
                    <td>${formatNumber(vehicle.mileage || 0)} km</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
        break;

      case 'fuel':
        content = `
          <div class="section">
            <h2>Fuel Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Amount (L)</th>
                  <th>Cost</th>
                  <th>Price/L</th>
                  <th>Odometer</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.fuel.map(record => `
                  <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.vehicleId}</td>
                    <td>${formatNumber(record.fuelAmount || record.quantity)} L</td>
                    <td>${formatCurrency(record.totalCost || record.total_cost || 0)}</td>
                    <td>KES ${((record.totalCost || record.total_cost || 0) / (record.fuelAmount || record.quantity || 1)).toFixed(2)}</td>
                    <td>${formatNumber(record.odometer || 0)} km</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
        break;

      case 'maintenance':
        content = `
          <div class="section">
            <h2>Maintenance Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.maintenance.map(record => `
                  <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.vehicleId || record.vehicle_id}</td>
                    <td>${record.type}</td>
                    <td>${record.description}</td>
                    <td>${formatCurrency(record.cost || 0)}</td>
                    <td>${record.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
        break;

      case 'drivers':
        content = `
          <div class="section">
            <h2>Driver Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>License Number</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Assigned Vehicle</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.drivers.map(driver => `
                  <tr>
                    <td>${driver.name}</td>
                    <td>${driver.licenseNumber}</td>
                    <td>${driver.phone}</td>
                    <td>${driver.department}</td>
                    <td>${driver.status}</td>
                    <td>${driver.assignedVehicle || 'None'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
        break;

      case 'analytics':
        content = `
          <div class="section">
            <h2>Analytics Data</h2>
            <div class="grid">
              <div class="card">
                <h3>Key Performance Indicators</h3>
                <div>Total Operational Cost: <span class="value">${formatCurrency(reportData.summary.totalOperationalCost)}</span></div>
                <div>Average Fuel Price: <span class="value">KES ${reportData.summary.avgFuelPrice.toFixed(2)}/L</span></div>
                <div>Total Fuel Consumed: <span class="value">${formatNumber(reportData.summary.totalFuelLiters)} L</span></div>
                <div>Total Records: <span class="value">${reportData.summary.fuelRecords + reportData.summary.maintenanceRecords}</span></div>
              </div>
              <div class="card">
                <h3>Operational Breakdown</h3>
                <div>Fuel Costs: <span class="value">${formatCurrency(reportData.summary.totalFuelCost)}</span></div>
                <div>Maintenance Costs: <span class="value">${formatCurrency(reportData.summary.totalMaintenanceCost)}</span></div>
                <div>Cost per Vehicle: <span class="value">${formatCurrency(reportData.summary.totalOperationalCost / Math.max(reportData.summary.totalVehicles, 1))}</span></div>
              </div>
            </div>
          </div>`;
        break;

      default: // 'complete'
        content = `
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
                  <th>Price/L</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.fuel.slice(0, 10).map(record => `
                  <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.vehicleId}</td>
                    <td>${formatNumber(record.fuelAmount || record.quantity)} L</td>
                    <td>${formatCurrency(record.totalCost || record.total_cost || 0)}</td>
                    <td>KES ${((record.totalCost || record.total_cost || 0) / (record.fuelAmount || record.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Recent Maintenance Records (Top 10)</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.maintenance.slice(0, 10).map(record => `
                  <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.vehicleId || record.vehicle_id}</td>
                    <td>${record.type}</td>
                    <td>${formatCurrency(record.cost || 0)}</td>
                    <td>${record.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
    }

    return baseHTML + content + `
        </body>
      </html>`;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = generateReportData();
      const selectedType = reportTypes.find(type => type.value === selectedReportType);
      const reportTitle = selectedType ? selectedType.label : 'Fleet Management Report';
      
      // Generate PDF content based on selected report type
      const htmlContent = generatePDFContent(reportData, selectedReportType, reportTitle);

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

  // Unified export function based on user selections
  const handleExport = async () => {
    if (!selectedReportType || !selectedExportFormat) {
      alert('Please select both report type and export format');
      return;
    }

    setIsExporting(true);
    
    try {
      switch (selectedExportFormat) {
        case 'csv':
          await exportToCSV(selectedReportType);
          break;
        case 'json':
          await exportToJSON();
          break;
        case 'pdf':
          await exportToPDF();
          break;
        default:
          console.error('Unknown export format:', selectedExportFormat);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Report type options
  const reportTypes = [
    { value: 'complete', label: 'Complete Report', icon: FileText },
    { value: 'summary', label: 'Summary Report', icon: FileSpreadsheet },
    { value: 'vehicles', label: 'Vehicle Registry', icon: Car },
    { value: 'drivers', label: 'Driver Records', icon: Users },
    { value: 'fuel', label: 'Fuel Records', icon: Fuel },
    { value: 'maintenance', label: 'Maintenance Records', icon: Wrench },
    { value: 'analytics', label: 'Analytics Data', icon: TrendingUp }
  ];

  // Export format options
  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: FileImage },
    { value: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet },
    { value: 'json', label: 'JSON Data', icon: FileText }
  ];

  // Recalculate KPIs whenever filters change
  const kpis = useMemo(() => {
    return calculateKPIs();
  }, [filteredData]);

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
          
          {/* Export Report Controls */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700">Export:</span>
            
            {/* Report Type Selection */}
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {/* Format Selection */}
            <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {format.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {/* Download Button */}
            <Button 
              onClick={handleExport}
              disabled={isExporting || !selectedReportType || !selectedExportFormat}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
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

      {/* Summary Report */}
      <div className="w-full">
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
                      <span className="font-bold text-indigo-700 text-lg">{filteredData.fuel.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Maintenance Records:</span>
                      <span className="font-bold text-orange-700 text-lg">{filteredData.maintenance.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Transfers:</span>
                      <span className="font-bold text-teal-700 text-lg">{filteredData.transfers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Analytics Charts - Moved to Bottom */}
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
    </div>
  );
}
