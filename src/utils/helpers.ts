export const formatPrice = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const problemTypes = [
  'Screen Damage',
  'Battery Issue',
  'Software Problem',
  'Water Damage',
  'Camera Not Working',
  'Charging Issues',
  'Speaker/Mic Problem',
  'Other',
];

export const mobileBrands = [
  'Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Motorola', 'Nothing'
];

export const accessoryTypes = [
  { value: 'case', label: 'Cases & Covers' },
  { value: 'screen_protector', label: 'Screen Protectors' },
  { value: 'charger', label: 'Chargers' },
  { value: 'earphones', label: 'Earphones & Headphones' },
  { value: 'power_bank', label: 'Power Banks' },
  { value: 'cable', label: 'Cables' },
];

export const services = [
  { id: 1, name: 'Screen Repair', icon: 'Smartphone', price: 1500, time: '2-3 hours', description: 'Professional screen replacement for all brands' },
  { id: 2, name: 'Battery Replacement', icon: 'Battery', price: 800, time: '1-2 hours', description: 'Genuine battery replacement with warranty' },
  { id: 3, name: 'Software Update', icon: 'RefreshCw', price: 500, time: '30 mins', description: 'OS updates, bug fixes, and optimization' },
  { id: 4, name: 'Water Damage Repair', icon: 'Droplets', price: 2000, time: '4-6 hours', description: 'Complete water damage assessment and repair' },
  { id: 5, name: 'Camera Repair', icon: 'Camera', price: 1200, time: '2-3 hours', description: 'Front and rear camera module replacement' },
  { id: 6, name: 'Charging Port Repair', icon: 'Plug', price: 700, time: '1 hour', description: 'Charging port cleaning and replacement' },
];
