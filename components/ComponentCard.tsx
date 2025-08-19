import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Battery, Car, Calendar, DollarSign, Edit } from 'lucide-react';
import { getStatusColor, formatDate, formatCurrency, formatNumber, isWithinDays, getDaysUntilDate } from '../utils/helpers';

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

interface ComponentCardProps {
  component: Component;
  vehicle: any;
  onEdit?: (component: Component) => void;
}

export function ComponentCard({ component, vehicle, onEdit }: ComponentCardProps) {
  const Icon = component.componentType === 'tire' ? Car : Battery;
  
  const getWarrantyExpiryDate = () => {
    if (!component.warrantyMonths) return null;
    const installationDate = new Date(component.installationDate);
    const expiryDate = new Date(installationDate);
    expiryDate.setMonth(expiryDate.getMonth() + component.warrantyMonths);
    return expiryDate;
  };

  const warrantyExpiryDate = getWarrantyExpiryDate();
  const isWarrantyValid = warrantyExpiryDate && new Date() <= warrantyExpiryDate;
  const isWarrantyExpiringSoon = warrantyExpiryDate && isWithinDays(warrantyExpiryDate.toISOString(), 30);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {component.make} {component.model}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {vehicle ? `${vehicle.gkNumber} - ${vehicle.make} ${vehicle.model}` : component.vehicleId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(component.status)} text-white`}>
              {component.status}
            </Badge>
            {isWarrantyValid && !isWarrantyExpiringSoon && (
              <Badge className="bg-green-500 text-white">
                Under Warranty
              </Badge>
            )}
            {isWarrantyExpiringSoon && (
              <Badge className="bg-orange-500 text-white">
                Warranty Expiring Soon
              </Badge>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(component)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Serial Number</p>
            <p className="font-medium">{component.serialNumber}</p>
          </div>
          {component.position && (
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium capitalize">{component.position.replace('-', ' ')}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Installation Date</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(component.installationDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Installation Mileage</p>
            <p className="font-medium">{formatNumber(component.installationMileage)} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purchase Cost</p>
            <p className="font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(component.purchaseCost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Supplier</p>
            <p className="font-medium">{component.supplier}</p>
          </div>
        </div>

        {component.removalDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-1">Removal Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Removal Date</p>
                <p className="text-sm">{formatDate(component.removalDate)}</p>
              </div>
              {component.removalMileage && (
                <div>
                  <p className="text-xs text-gray-600">Removal Mileage</p>
                  <p className="text-sm">{formatNumber(component.removalMileage)} km</p>
                </div>
              )}
            </div>
          </div>
        )}

        {warrantyExpiryDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Warranty Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-600">Warranty Period</p>
                <p className="text-sm">{component.warrantyMonths} months</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Expires</p>
                <p className="text-sm">{formatDate(warrantyExpiryDate.toISOString())}</p>
              </div>
            </div>
            {isWarrantyExpiringSoon && (
              <p className="text-xs text-orange-600 mt-2">
                Expires in {getDaysUntilDate(warrantyExpiryDate.toISOString())} days
              </p>
            )}
          </div>
        )}

        {component.notes && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="text-sm">{component.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
