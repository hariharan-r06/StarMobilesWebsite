import React, { useState } from 'react';
import { X, Loader2, Phone, MapPin, User, ShoppingBag, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { formatPrice } from '@/utils/helpers';
import { toast } from 'sonner';

interface Product {
    id: string;
    model: string;
    brand: string;
    price: number;
    image?: string;
    category: string;
}

interface BookProductModalProps {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

const BookProductModal = ({ open, onClose, product }: BookProductModalProps) => {
    const { user, profile, isAuthenticated } = useAuth();
    const { createOrder, isLoading } = useOrders();

    const [form, setForm] = useState({
        customer_name: profile?.name || user?.user_metadata?.name || '',
        phone: profile?.phone || '',
        address: ''
    });

    if (!open || !product) return null;

    const advanceAmount = Math.round(product.price * 0.2);
    const remainingAmount = product.price - advanceAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to place an order');
            return;
        }

        if (!form.customer_name || !form.phone || !form.address) {
            toast.error('Please fill all fields');
            return;
        }

        if (form.phone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        const result = await createOrder({
            product_id: product.id,
            product_name: `${product.brand} ${product.model}`,
            product_category: product.category,
            product_price: product.price,
            quantity: 1,
            customer_name: form.customer_name,
            phone: form.phone,
            address: form.address
        });

        if (result.success) {
            toast.success(result.message || 'Order placed successfully!');
            onClose();
            setForm({ customer_name: '', phone: '', address: '' });
        } else {
            toast.error(result.message || 'Failed to place order');
        }
    };

    const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Product Info */}
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border">
                    {product.image ? (
                        <img src={product.image} alt={product.model} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    <div>
                        <h2 className="font-heading text-xl font-bold">{product.brand} {product.model}</h2>
                        <p className="text-2xl font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                        <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
                    </div>
                </div>

                {/* Advance Payment Info */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-sm">Booking with 20% Advance</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pay <span className="font-bold text-primary">{formatPrice(advanceAmount)}</span> advance via GPay after our verification call.
                                Remaining <span className="font-bold">{formatPrice(remainingAmount)}</span> on delivery.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <User className="h-4 w-4" /> Full Name *
                        </label>
                        <input
                            className={inputClass}
                            placeholder="Enter your full name"
                            required
                            value={form.customer_name}
                            onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone Number *
                        </label>
                        <div className="flex gap-2">
                            <span className="flex items-center px-3 bg-muted rounded-lg text-sm font-medium">+91</span>
                            <input
                                className={inputClass}
                                placeholder="10-digit phone number"
                                type="tel"
                                maxLength={10}
                                required
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">We'll call this number to verify your order</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Delivery Address *
                        </label>
                        <textarea
                            className={`${inputClass} min-h-[80px] resize-none`}
                            placeholder="Enter your complete address with pincode"
                            required
                            value={form.address}
                            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Product Price</span>
                            <span className="font-medium">{formatPrice(product.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Advance (20%)</span>
                            <span className="font-bold text-primary">{formatPrice(advanceAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-border pt-2">
                            <span className="text-muted-foreground">Balance on Delivery</span>
                            <span className="font-medium">{formatPrice(remainingAmount)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? 'Placing Order...' : 'Confirm Booking'}
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                        By confirming, you agree to pay 20% advance after verification call
                    </p>
                </form>
            </div>
        </div>
    );
};

export default BookProductModal;
