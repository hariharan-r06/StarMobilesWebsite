import React, { useEffect } from 'react';
import { useOrders, ProductOrder } from '@/context/OrderContext';
import { formatPrice } from '@/utils/helpers';
import { Package, Loader2, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';

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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-orange-100">
                    <ShoppingBag className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="font-heading text-3xl font-bold">My Product Orders</h1>
                    <p className="text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {isLoading && orders.length === 0 && (
                <div className="text-center py-20">
                    <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground mt-4">Loading your orders...</p>
                </div>
            )}

            {!isLoading && orders.length === 0 && (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                    <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-heading text-xl font-semibold">No Orders Yet</h3>
                    <p className="text-muted-foreground mt-2">
                        Browse our products and place your first order!
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                            <div>
                                <p className="text-xs text-muted-foreground">Order ID</p>
                                <p className="font-mono text-sm font-medium">{order.id.slice(0, 8)}...</p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                                    {statusLabels[order.status]}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColors[order.payment_status]}`}>
                                    {paymentStatusLabels[order.payment_status]}
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="py-4 border-b border-border">
                            <h3 className="font-semibold text-lg">{order.product_name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{order.product_category}</p>
                        </div>

                        {/* Amount Details */}
                        <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-border">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                <p className="font-bold text-lg">{formatPrice(order.total_amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Advance (20%)</p>
                                <p className="font-bold text-lg text-orange-600">{formatPrice(order.advance_amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Quantity</p>
                                <p className="font-bold">{order.quantity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Ordered On</p>
                                <p className="text-sm">{formatDate(order.created_at)}</p>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {order.status === 'pending_verification' && (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-yellow-800">⏳ Waiting for Verification</p>
                                <p className="text-yellow-700 mt-1">Our team will call you shortly to verify your order at <strong>{order.phone}</strong></p>
                            </div>
                        )}

                        {order.status === 'verified' && order.payment_status === 'unpaid' && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-blue-800">✓ Verified - Pay Advance</p>
                                <p className="text-blue-700 mt-1">Please pay <strong>{formatPrice(order.advance_amount)}</strong> via GPay to confirm your order.</p>
                            </div>
                        )}

                        {order.status === 'advance_paid' && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-green-800">✓ Advance Paid - Processing</p>
                                <p className="text-green-700 mt-1">Your order is being processed. We'll contact you for delivery.</p>
                            </div>
                        )}

                        {order.status === 'completed' && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-emerald-800">✓ Order Completed</p>
                                <p className="text-emerald-700 mt-1">Thank you for your purchase!</p>
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                                <p className="font-medium text-red-800">✗ Order Cancelled</p>
                                {order.payment_status === 'refunded' && (
                                    <p className="text-red-700 mt-1">Your advance has been refunded.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
