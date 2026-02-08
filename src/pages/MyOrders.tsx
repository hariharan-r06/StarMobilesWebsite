import React, { useEffect } from 'react';
import { useOrders, ProductOrder } from '@/context/OrderContext';
import { formatPrice } from '@/utils/helpers';
import {
    Package, Loader2, Phone, MapPin, Calendar,
    ShoppingBag, ChevronRight, Clock, CheckCircle2,
    AlertCircle, IndianRupee, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
    pending_verification: 'bg-amber-100 text-amber-700 border-amber-200',
    verified: 'bg-blue-100 text-blue-700 border-blue-200',
    advance_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    processing: 'bg-violet-100 text-violet-700 border-violet-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const statusLabels: Record<string, string> = {
    pending_verification: 'Verifying',
    verified: 'Waiting Payment',
    advance_paid: 'Processing',
    processing: 'In Transit',
    completed: 'Delivered',
    cancelled: 'Cancelled',
};

const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-slate-100 text-slate-700',
    advance_received: 'bg-amber-100 text-amber-700',
    fully_paid: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-rose-100 text-rose-700',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Unpaid',
    advance_received: 'Advance Received',
    fully_paid: 'Fully Paid',
    refunded: 'Refunded',
};

const MyOrders = () => {
    const { orders, isLoading, fetchOrders } = useOrders();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto px-4 py-8">
                {/* User Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">Purchase History</h1>
                            <p className="text-slate-500 font-medium">Tracking {orders.length} active and past orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchOrders()}
                            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link to="/mobiles" className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Shop More
                        </Link>
                    </div>
                </div>

                {isLoading && orders.length === 0 ? (
                    <div className="py-20 text-center">
                        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                        <p className="text-slate-500 mt-4 font-medium italic">Fetching your order history...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <ShoppingBag className="mx-auto h-20 w-20 text-slate-100" />
                        <h3 className="mt-6 font-heading text-2xl font-bold text-slate-800">No Orders Found</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            It looks like you haven't placed any orders yet. Explore our latest mobiles and accessories!
                        </p>
                        <Link to="/mobiles" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-xl">
                            Start Shopping <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map(order => (
                            <div key={order.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all overflow-hidden">
                                {/* Order ID & Status Header */}
                                <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Order #</p>
                                            <p className="font-mono text-sm font-bold text-slate-700">{order.id.slice(0, 12).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Product Info Block */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-6">
                                                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                                                    <Smartphone className="h-10 w-10 text-slate-300" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{order.product_name}</h3>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        {order.product_category} <span className="text-slate-200">•</span> Quantity: {order.quantity}
                                                    </p>
                                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="p-3 bg-slate-50 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                                            <p className="font-black text-slate-900">{formatPrice(order.total_amount)}</p>
                                                        </div>
                                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Advance (20%)</p>
                                                            <p className="font-black text-amber-600">{formatPrice(order.advance_amount)}</p>
                                                        </div>
                                                        <div className="sm:col-span-2 p-3 bg-blue-50/50 rounded-2xl flex items-center gap-3">
                                                            <Calendar className="h-4 w-4 text-blue-500" />
                                                            <div>
                                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ordered On</p>
                                                                <p className="text-xs font-bold text-slate-700">{formatDate(order.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tracking & Assistance Block */}
                                        <div className="lg:w-80 space-y-4">
                                            {/* Smart Assistance Message */}
                                            <div className={`p-5 rounded-2xl border-2 shadow-sm ${order.status === 'pending_verification' ? 'bg-amber-50/50 border-amber-100' :
                                                    order.status === 'verified' && order.payment_status === 'unpaid' ? 'bg-blue-50/50 border-blue-100' :
                                                        'bg-emerald-50/50 border-emerald-100'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    {order.status === 'pending_verification' ? (
                                                        <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                                                    ) : order.status === 'verified' && order.payment_status === 'unpaid' ? (
                                                        <IndianRupee className="h-5 w-5 text-blue-500 shrink-0" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className={`text-xs font-black uppercase tracking-wider mb-1 ${order.status === 'pending_verification' ? 'text-amber-700' :
                                                                order.status === 'verified' ? 'text-blue-700' : 'text-emerald-700'
                                                            }`}>
                                                            {order.status === 'pending_verification' ? 'Next: Verification' :
                                                                order.status === 'verified' ? 'Next: Payment' : 'Status: Secured'}
                                                        </p>
                                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                                            {order.status === 'pending_verification' ? 'Stay alert! Our experts will call you within 15 mins to verify your order.' :
                                                                order.status === 'verified' && order.payment_status === 'unpaid' ? `Please pay ${formatPrice(order.advance_amount)} to confirm and finalize this order.` :
                                                                    'Your advance payment is confirmed. Hardware is being allocated for your delivery.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Detail Summary */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group-hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-white"><MapPin className="h-4 w-4 text-slate-400" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping to</p>
                                                        <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{order.address}</p>
                                                    </div>
                                                </div>
                                                <Phone className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
