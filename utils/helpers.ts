export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'inactive': return 'bg-gray-500';
    case 'maintenance': return 'bg-yellow-500';
    case 'retired': return 'bg-red-500';
    case 'suspended': return 'bg-red-500';
    case 'scheduled': return 'bg-blue-500';
    case 'in-progress': return 'bg-yellow-500';
    case 'completed': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    case 'removed': return 'bg-gray-500';
    case 'replaced': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'high': return 'bg-orange-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

export const formatNumber = (num: number) => {
  return num.toLocaleString();
};

export const isDateInPast = (dateString: string) => {
  return new Date(dateString) < new Date();
};

export const isDateInFuture = (dateString: string) => {
  return new Date(dateString) > new Date();
};

export const getDaysUntilDate = (dateString: string) => {
  const target = new Date(dateString);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isWithinDays = (dateString: string, days: number) => {
  const daysUntil = getDaysUntilDate(dateString);
  return daysUntil <= days && daysUntil > 0;
};

export const filterByPeriod = (records: any[], period: string, dateField: string = 'date') => {
  const now = new Date();
  const periodDate = new Date();
  
  switch (period) {
    case 'week':
      periodDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      periodDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      periodDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      periodDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      periodDate.setMonth(now.getMonth() - 1);
  }

  return records.filter(record => new Date(record[dateField]) >= periodDate);
};

export const groupRecordsByMonth = (records: any[], dateField: string = 'date') => {
  const monthlyData: { [key: string]: any } = {};

  records.forEach(record => {
    const date = new Date(record[dateField]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, records: [] };
    }
    
    monthlyData[monthKey].records.push(record);
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

export const calculateAverage = (numbers: number[]) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const calculateTotal = (numbers: number[]) => {
  return numbers.reduce((sum, num) => sum + num, 0);
};