import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, CheckCircle, IndianRupee, ArrowRight } from 'lucide-react';
import { useBookings } from '@/context/BookingContext';
import mobilesData from '@/data/mobiles.json';
import accessoriesData from '@/data/accessories.json';
import { statusColors, statusLabels, formatPrice } from '@/utils/helpers';

const AdminDashboard = () => {
  const { bookings } = useBookings();
  const pending = bookings.filter(b => b.status === 'pending').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const revenue = 245000; // mock

  const stats = [
    { icon: Package, label: 'Total Products', value: mobilesData.length + accessoriesData.length, color: 'text-primary bg-primary/10' },
    { icon: Wrench, label: 'Pending Requests', value: pending, color: 'text-yellow-600 bg-yellow-100' },
    { icon: CheckCircle, label: 'Completed Today', value: completed, color: 'text-accent bg-accent/10' },
    { icon: IndianRupee, label: 'Total Revenue', value: formatPrice(revenue), color: 'text-secondary bg-secondary/10' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-1">Overview of your store</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 card-hover">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-heading text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Recent Service Requests</h3>
            <Link to="/admin/requests" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                <div>
                  <p className="font-medium">{b.customerName} — {b.brand} {b.model}</p>
                  <p className="text-xs text-muted-foreground">{b.problemType}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status]}`}>
                  {statusLabels[b.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/admin/products" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium hover:bg-muted transition-colors">
              <Package className="h-5 w-5 text-primary" /> Manage Products
            </Link>
            <Link to="/admin/requests" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium hover:bg-muted transition-colors">
              <Wrench className="h-5 w-5 text-primary" /> Service Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
