import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Wrench, CheckCircle, ArrowRight, Loader2,
  ShoppingBag, TrendingUp, Clock, AlertCircle, IndianRupee,
  Phone, Calendar, BarChart3, Activity, Eye, ChevronRight,
  RefreshCw, Bell, Settings
} from 'lucide-react';
import { useBookings } from '@/context/BookingContext';
import { useProducts } from '@/context/ProductsContext';
import { useOrders } from '@/context/OrderContext';
import { statusColors, statusLabels, formatPrice } from '@/utils/helpers';

const orderStatusColors: Record<string, string> = {
  pending_verification: 'bg-amber-100 text-amber-700 border-amber-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  advance_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  processing: 'bg-violet-100 text-violet-700 border-violet-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const orderStatusLabels: Record<string, string> = {
  pending_verification: 'Pending',
  verified: 'Verified',
  advance_paid: 'Paid',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const AdminDashboard = () => {
  const { bookings, isLoading: bookingsLoading, fetchBookings } = useBookings();
  const { products, isLoading: productsLoading, fetchProducts } = useProducts();
  const { orders, isLoading: ordersLoading, fetchOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({});
    fetchOrders();
  }, []);

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProducts({}),
      fetchOrders(),
      fetchBookings()
    ]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Service stats
  const pendingServices = bookings.filter(b => b.status === 'pending').length;
  const completedServices = bookings.filter(b => b.status === 'completed').length;
  const inProgressServices = bookings.filter(b => b.status === 'in_progress').length;

  // Order stats
  const pendingOrders = orders.filter(o => o.status === 'pending_verification').length;
  const verifiedOrders = orders.filter(o => o.status === 'verified').length;
  const advancePaidOrders = orders.filter(o => o.payment_status === 'advance_received').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  // Revenue calculations
  const totalAdvanceReceived = orders
    .filter(o => o.payment_status === 'advance_received' || o.payment_status === 'fully_paid')
    .reduce((sum, o) => sum + o.advance_amount, 0);

  const totalRevenue = orders
    .filter(o => o.payment_status === 'fully_paid')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const isLoading = bookingsLoading || productsLoading || ordersLoading;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500">Star Mobiles Admin Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Inventory</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{products.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total Products</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-orange-50">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Orders</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{orders.length}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">Total Orders</span>
              {pendingOrders > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold">
                  {pendingOrders} new
                </span>
              )}
            </div>
          </div>

          {/* Total Services */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-violet-50">
                <Wrench className="h-5 w-5 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Services</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{bookings.length}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">Service Requests</span>
              {pendingServices > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold">
                  {pendingServices} pending
                </span>
              )}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/20">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-white/80 mt-1">Total Earnings</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-amber-600">{pendingOrders}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-blue-600">{verifiedOrders}</p>
            <p className="text-xs text-slate-500 mt-0.5">Verified</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-emerald-600">{advancePaidOrders}</p>
            <p className="text-xs text-slate-500 mt-0.5">Advance Paid</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-green-600">{completedOrders}</p>
            <p className="text-xs text-slate-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-violet-600">{inProgressServices}</p>
            <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-xl font-bold text-teal-600">{formatPrice(totalAdvanceReceived)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Advance Rcvd</p>
          </div>
        </div>

        {/* Alerts */}
        {(pendingOrders > 0 || pendingServices > 0) && (
          <div className="mb-8 space-y-3">
            {pendingOrders > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Bell className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting verification
                    </p>
                    <p className="text-xs text-amber-600">Call customers to confirm and collect advance payment</p>
                  </div>
                </div>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Review <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            {pendingServices > 0 && (
              <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-violet-100">
                    <Clock className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-800">
                      {pendingServices} service request{pendingServices > 1 ? 's' : ''} pending
                    </p>
                    <p className="text-xs text-violet-600">Review and update the service status</p>
                  </div>
                </div>
                <Link
                  to="/admin/requests"
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Review <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Recent Product Orders</h3>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600 transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {orders.length === 0 && !ordersLoading && (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-slate-200" />
                  <p className="text-sm text-slate-400 mt-3">No orders yet</p>
                </div>
              )}
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">{o.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${orderStatusColors[o.status]}`}>
                          {orderStatusLabels[o.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{o.product_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {o.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTimeAgo(o.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatPrice(o.total_amount)}</p>
                      <p className="text-xs text-orange-600">Adv: {formatPrice(o.advance_amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Quick Actions</h3>
              </div>
              <div className="p-3 space-y-1">
                <Link
                  to="/admin/products"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Manage Products</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-slate-500" />
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors relative">
                    <ShoppingBag className="h-4 w-4 text-orange-600" />
                    {pendingOrders > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingOrders}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">Product Orders</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-slate-500" />
                </Link>
                <Link
                  to="/admin/requests"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors relative">
                    <Wrench className="h-4 w-4 text-violet-600" />
                    {pendingServices > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingServices}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">Service Requests</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-slate-500" />
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <Eye className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">View Store</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-slate-500" />
                </Link>
              </div>
            </div>

            {/* Recent Services */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-violet-600" />
                  <h3 className="font-semibold text-slate-800">Recent Services</h3>
                </div>
                <Link to="/admin/requests" className="text-xs text-slate-400 hover:text-violet-600">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {bookings.length === 0 && !bookingsLoading && (
                  <div className="px-5 py-8 text-center">
                    <Wrench className="mx-auto h-8 w-8 text-slate-200" />
                    <p className="text-xs text-slate-400 mt-2">No requests yet</p>
                  </div>
                )}
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">{b.customer_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[b.status]}`}>
                        {statusLabels[b.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{b.brand} {b.model}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;