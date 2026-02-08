import React, { useState, useEffect } from 'react';
import { useOrders, ProductOrder } from '@/context/OrderContext';
import { formatPrice } from '@/utils/helpers';
import {
    Search, X, Phone, MapPin, Calendar, Loader2, CheckCircle,
    AlertCircle, Package, IndianRupee, Filter, ArrowRight,
    ChevronDown, MessageSquare, Clock, User, ShoppingBag,
    RefreshCw, TrendingUp, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    pending_verification: 'bg-amber-100 text-amber-700 border-amber-200',
    verified: 'bg-blue-100 text-blue-700 border-blue-200',
    advance_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    processing: 'bg-violet-100 text-violet-700 border-violet-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const statusLabels: Record<string, string> = {
    pending_verification: 'Pending',
    verified: 'Verified',
    advance_paid: 'Paid',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-slate-100 text-slate-700 border-slate-200',
    advance_received: 'bg-amber-100 text-amber-700 border-amber-200',
    fully_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    refunded: 'bg-rose-100 text-rose-700 border-rose-200',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Unpaid',
    advance_received: 'Advance Paid',
    fully_paid: 'Fully Paid',
    refunded: 'Refunded',
};

const ManageOrders = () => {
    const { orders, isLoading, fetchOrders, updateOrderStatus, cancelOrder } = useOrders();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState<ProductOrder | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [updating, setUpdating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchOrders();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const filtered = orders.filter(o => {
        const matchSearch = !search ||
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.product_name.toLowerCase().includes(search.toLowerCase()) ||
            o.phone.includes(search);
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats
    const pendingOrdersCount = orders.filter(o => o.status === 'pending_verification').length;
    const totalSales = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);
    const advanceTotal = orders.filter(o => o.payment_status === 'advance_received' || o.payment_status === 'fully_paid').reduce((sum, o) => sum + o.advance_amount, 0);

    const handleStatusUpdate = async (id: string, status: string, payment_status?: string) => {
        setUpdating(true);
        const success = await updateOrderStatus(id, status, payment_status, noteInput || undefined);
        if (success) {
            toast.success('Order updated successfully');
            setSelected(null);
            setNoteInput('');
            fetchOrders();
        } else {
            toast.error('Failed to update order');
        }
        setUpdating(false);
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        setUpdating(true);
        const success = await cancelOrder(id);
        if (success) {
            toast.success('Order cancelled');
            setSelected(null);
            fetchOrders();
        } else {
            toast.error('Failed to cancel order');
        }
        setUpdating(false);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Inventory Management</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-slate-900">Product Orders</h1>
                        <p className="text-slate-500 mt-1">Manage and track all customer product bookings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Total Orders</span>
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Pending Verification</span>
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{pendingOrdersCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-80">Total Revenue</span>
                            <TrendingUp className="h-5 w-5 opacity-80" />
                        </div>
                        <p className="text-2xl font-bold">{formatPrice(totalSales)}</p>
                        <p className="text-xs opacity-70 mt-1">₹{advanceTotal.toLocaleString()} in advances</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="Search by ID, name, phone, or product..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <Filter className="h-4 w-4 text-slate-400 shrink-0 mr-1" />
                            {['', 'pending_verification', 'verified', 'advance_paid', 'completed', 'cancelled'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {s ? (statusLabels[s] || s) : 'All Orders'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                {isLoading && orders.length === 0 ? (
                    <div className="py-20 text-center">
                        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                        <p className="text-slate-500 mt-4 font-medium">Loading your orders...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <ShoppingBag className="mx-auto h-16 w-16 text-slate-200" />
                        <p className="text-slate-400 mt-4 font-medium">No match found for your filters</p>
                        <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="mt-2 text-primary text-sm font-semibold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-1">
                        {filtered.map(o => (
                            <div
                                key={o.id}
                                className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer overflow-hidden"
                                onClick={() => setSelected(o)}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="text-xs font-bold text-slate-400 tracking-wider">#{o.id.slice(0, 8).toUpperCase()}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColors[o.status]}`}>
                                                {statusLabels[o.status]}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${paymentStatusColors[o.payment_status]}`}>
                                                {paymentStatusLabels[o.payment_status]}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                                <Package className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base">{o.product_name}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <User className="h-3.5 w-3.5 text-slate-400" /> {o.customer_name}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {o.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-900">{formatPrice(o.total_amount)}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter mt-0.5">Adv: {formatPrice(o.advance_amount)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
                                            <Clock className="h-3 w-3" /> {formatDate(o.created_at)}
                                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
                    <div
                        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Order Recovery <span className="text-slate-400 font-normal">#{selected.id.slice(0, 8).toUpperCase()}</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Placed on {formatDate(selected.created_at)}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Status Stepper-like badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${statusColors[selected.status]}`}>
                                    {statusLabels[selected.status]}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${paymentStatusColors[selected.payment_status]}`}>
                                    {paymentStatusLabels[selected.payment_status]}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Side: Customer & Product Info */}
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Details</h3>
                                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white shadow-sm"><User className="h-4 w-4 text-primary" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{selected.customer_name}</p>
                                                    <p className="text-xs text-slate-500">Full Name</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white shadow-sm"><Phone className="h-4 w-4 text-emerald-600" /></div>
                                                <div>
                                                    <a href={`tel:${selected.phone}`} className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">{selected.phone}</a>
                                                    <p className="text-xs text-slate-500">Click to call</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 pt-2">
                                                <div className="p-2 rounded-lg bg-white shadow-sm"><MapPin className="h-4 w-4 text-rose-500" /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{selected.address}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Delivery Address</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Product Summary</h3>
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{selected.product_name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{selected.product_category}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t border-slate-200/50">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Unit Price</span>
                                                    <span className="font-bold text-slate-800">{formatPrice(selected.total_amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Required Advance</span>
                                                    <span className="font-bold text-amber-600">{formatPrice(selected.advance_amount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Side: Notes & Logs */}
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Activity Status</h3>
                                        <div className="space-y-4">
                                            <div className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                                                <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-primary ring-4 ring-white" />
                                                <p className="text-xs font-bold text-slate-800">Order Placed</p>
                                                <p className="text-[10px] text-slate-500">{formatDate(selected.created_at)}</p>
                                            </div>
                                            {selected.verified_at && (
                                                <div className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                                                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                                                    <p className="text-xs font-bold text-slate-800">Verified by Admin</p>
                                                    <p className="text-[10px] text-slate-500">{formatDate(selected.verified_at)}</p>
                                                </div>
                                            )}
                                            {selected.paid_at && (
                                                <div className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                                                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                                                    <p className="text-xs font-bold text-slate-800">Payment Received</p>
                                                    <p className="text-[10px] text-slate-500">{formatDate(selected.paid_at)}</p>
                                                </div>
                                            )}
                                            {selected.completed_at && (
                                                <div className="relative pl-6 last:pb-0">
                                                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                                                    <p className="text-xs font-bold text-slate-800">Fully Delivered</p>
                                                    <p className="text-[10px] text-slate-500">{formatDate(selected.completed_at)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {selected.admin_notes && (
                                        <section>
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Admin Documentation</h3>
                                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                                <p className="text-sm italic text-slate-700 leading-relaxed font-medium">"{selected.admin_notes}"</p>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer (Actions) */}
                        {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Action Update Notes</label>
                                    <textarea
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none min-h-[80px]"
                                        placeholder="Add context for this update (customer called, address updated, etc...)"
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selected.status === 'pending_verification' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'verified')}
                                            disabled={updating}
                                            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Verify Order
                                        </button>
                                    )}

                                    {(selected.status === 'verified' || selected.status === 'pending_verification') && selected.payment_status === 'unpaid' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'advance_paid', 'advance_received')}
                                            disabled={updating}
                                            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <IndianRupee className="h-4 w-4" /> Confirm Advance
                                        </button>
                                    )}

                                    {selected.payment_status === 'advance_received' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'completed', 'fully_paid')}
                                            disabled={updating}
                                            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Set Completed
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleCancel(selected.id)}
                                        disabled={updating}
                                        className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle className="h-4 w-4" /> Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {updating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-[110]">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <p className="text-sm font-bold text-slate-700 uppercase tracking-widest animate-pulse">Syncing Changes...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
