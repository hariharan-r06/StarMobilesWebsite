import React, { useState, useEffect } from 'react';
import { X, Loader2, Phone, MapPin, User, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        customer_name: '',
        phone: '',
        address: ''
    });

    // Pre-fill form with user data when modal opens
    useEffect(() => {
        if (open && profile) {
            setForm({
                customer_name: profile?.name || user?.user_metadata?.name || '',
                phone: profile?.phone || '',
                address: ''
            });
        }
    }, [open, profile, user]);

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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
                    {/* Mobile drag indicator */}
                    <div className="flex justify-center mb-3 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-slate-300" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Book Product</h2>
                                <p className="text-xs sm:text-sm text-slate-500">Pay 20% advance to reserve</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)] overscroll-contain">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

                        {/* Product Card */}
                        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.model}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-white p-1"
                                />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 uppercase font-medium">{product.brand}</p>
                                <h3 className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-2">{product.model}</h3>
                                <p className="text-lg sm:text-xl font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                            </div>
                        </div>

                        {/* Payment Info Banner */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 sm:p-4">
                            <div className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-emerald-800 text-sm sm:text-base">How it works</p>
                                    <ol className="text-[11px] sm:text-xs text-emerald-700 mt-1 space-y-0.5 list-decimal list-inside">
                                        <li>Submit this form to book</li>
                                        <li>We'll call to verify your order</li>
                                        <li>Pay <span className="font-bold">{formatPrice(advanceAmount)}</span> via GPay</li>
                                        <li>Pay remaining on delivery</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                    Full Name
                                </label>
                                <input
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Enter your full name"
                                    required
                                    value={form.customer_name}
                                    onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                    Phone Number
                                </label>
                                <div className="flex">
                                    <span className="flex items-center px-3 sm:px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm font-medium text-slate-600">
                                        +91
                                    </span>
                                    <input
                                        className="flex-1 rounded-r-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="10-digit mobile number"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                        value={form.phone}
                                        onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                    />
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 ml-1">We'll call this number to verify</p>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                    Delivery Address
                                </label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[70px] sm:min-h-[80px]"
                                    placeholder="House/Flat, Street, Area, City, Pincode"
                                    required
                                    value={form.address}
                                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Product Price</span>
                                    <span className="font-medium text-slate-700">{formatPrice(product.price)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Advance Payment (20%)</span>
                                    <span className="font-bold text-orange-600">{formatPrice(advanceAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                                    <span className="text-slate-500">Balance on Delivery</span>
                                    <span className="font-medium text-slate-700">{formatPrice(remainingAmount)}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Placing Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-5 w-5" />
                                        <span>Confirm Booking • {formatPrice(advanceAmount)} Advance</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] sm:text-xs text-center text-slate-400 pb-2">
                                By confirming, you agree to pay 20% advance after verification call
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookProductModal;
