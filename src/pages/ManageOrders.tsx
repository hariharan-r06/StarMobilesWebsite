import React, { useState, useEffect } from 'react';
import { useOrders, ProductOrder } from '@/context/OrderContext';
import { formatPrice } from '@/utils/helpers';
import { Search, X, Phone, MapPin, Calendar, Loader2, CheckCircle, AlertCircle, Package, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    pending_verification: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    advance_paid: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    pending_verification: 'Pending Verification',
    verified: 'Verified',
    advance_paid: 'Advance Paid',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-gray-100 text-gray-700',
    advance_received: 'bg-green-100 text-green-700',
    fully_paid: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-orange-100 text-orange-700',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Unpaid',
    advance_received: 'Advance Received',
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

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filtered = orders.filter(o => {
        const matchSearch = !search ||
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.product_name.toLowerCase().includes(search.toLowerCase()) ||
            o.phone.includes(search);
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

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
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold">Product Orders</h1>
                    <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
                </div>
                {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Search by ID, name, phone, or product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['', 'pending_verification', 'verified', 'advance_paid', 'completed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
                        >
                            {s ? (statusLabels[s] || s) : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {isLoading && orders.length === 0 && (
                <div className="mt-20 text-center">
                    <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground mt-4">Loading orders...</p>
                </div>
            )}

            {!isLoading && filtered.length === 0 && (
                <div className="mt-20 text-center">
                    <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-4">No orders found</p>
                </div>
            )}

            <div className="mt-6 space-y-3">
                {filtered.map(o => (
                    <div
                        key={o.id}
                        className="rounded-xl border border-border bg-card p-5 card-hover cursor-pointer"
                        onClick={() => setSelected(o)}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-heading font-semibold text-sm">{o.id.slice(0, 8)}...</span>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm font-medium">{o.customer_name}</span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>
                                        {statusLabels[o.status]}
                                    </span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColors[o.payment_status]}`}>
                                        {paymentStatusLabels[o.payment_status]}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm font-medium">{o.product_name}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <IndianRupee className="h-3.5 w-3.5" /> Total: {formatPrice(o.total_amount)} | Advance: {formatPrice(o.advance_amount)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" /> {o.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> {formatDate(o.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(null)} className="absolute right-4 top-4 p-1 text-muted-foreground hover:bg-muted rounded-md">
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="font-heading text-xl font-bold">Order {selected.id.slice(0, 8)}...</h2>
                        <div className="flex gap-2 mt-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selected.status]}`}>
                                {statusLabels[selected.status]}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColors[selected.payment_status]}`}>
                                {paymentStatusLabels[selected.payment_status]}
                            </span>
                        </div>

                        {/* Customer Details */}
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Customer</span>
                                <span className="font-medium">{selected.customer_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Phone</span>
                                <a href={`tel:${selected.phone}`} className="font-medium text-primary hover:underline">{selected.phone}</a>
                            </div>
                            <div className="border-b border-border pb-2">
                                <span className="text-muted-foreground">Address</span>
                                <p className="mt-1 font-medium">{selected.address}</p>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Product</span>
                                <span className="font-medium">{selected.product_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium capitalize">{selected.product_category}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-bold">{formatPrice(selected.total_amount)}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Advance (20%)</span>
                                <span className="font-bold text-primary">{formatPrice(selected.advance_amount)}</span>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="mt-4 text-xs text-muted-foreground space-y-1">
                            <p>Ordered: {formatDate(selected.created_at)}</p>
                            {selected.verified_at && <p>Verified: {formatDate(selected.verified_at)}</p>}
                            {selected.paid_at && <p>Advance Paid: {formatDate(selected.paid_at)}</p>}
                            {selected.completed_at && <p>Completed: {formatDate(selected.completed_at)}</p>}
                        </div>

                        {/* Admin Notes */}
                        {selected.admin_notes && (
                            <div className="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
                                <p className="font-medium text-xs text-primary mb-1">Admin Notes</p>
                                <p>{selected.admin_notes}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                            <div className="mt-6 space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Add Note</label>
                                    <input
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                        placeholder="Add admin note..."
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selected.status === 'pending_verification' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'verified')}
                                            disabled={updating}
                                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Mark Verified
                                        </button>
                                    )}

                                    {(selected.status === 'verified' || selected.status === 'pending_verification') && selected.payment_status === 'unpaid' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'advance_paid', 'advance_received')}
                                            disabled={updating}
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <IndianRupee className="h-4 w-4" /> Advance Received
                                        </button>
                                    )}

                                    {selected.payment_status === 'advance_received' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selected.id, 'completed', 'fully_paid')}
                                            disabled={updating}
                                            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Mark Completed
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleCancel(selected.id)}
                                        disabled={updating}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle className="h-4 w-4" /> Cancel
                                    </button>
                                </div>

                                {updating && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
