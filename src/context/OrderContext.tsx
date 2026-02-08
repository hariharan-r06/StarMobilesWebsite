import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface ProductOrder {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    product_category: string;
    product_price: number;
    quantity: number;
    total_amount: number;
    advance_amount: number;
    customer_name: string;
    phone: string;
    address: string;
    status: 'pending_verification' | 'verified' | 'advance_paid' | 'processing' | 'completed' | 'cancelled';
    payment_status: 'unpaid' | 'advance_received' | 'fully_paid' | 'refunded';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    verified_at: string | null;
    paid_at: string | null;
    completed_at: string | null;
}

export interface OrderInput {
    product_id: string;
    product_name: string;
    product_category: string;
    product_price: number;
    quantity?: number;
    customer_name: string;
    phone: string;
    address: string;
}

interface OrderContextType {
    orders: ProductOrder[];
    isLoading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    createOrder: (order: OrderInput) => Promise<{ success: boolean; order?: ProductOrder; message?: string }>;
    updateOrderStatus: (id: string, status: string, payment_status?: string, admin_notes?: string) => Promise<boolean>;
    cancelOrder: (id: string) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<ProductOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { session, isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated || !session?.access_token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                const err = await response.json();
                setError(err.error || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, isAuthenticated, session?.access_token]);

    const createOrder = async (orderInput: OrderInput): Promise<{ success: boolean; order?: ProductOrder; message?: string }> => {
        if (!isAuthenticated || !session?.access_token) {
            return { success: false, message: 'Please login to place an order' };
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(orderInput)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOrders(prev => [data.order, ...prev]);
                return { success: true, order: data.order, message: data.message };
            } else {
                return { success: false, message: data.error || 'Failed to create order' };
            }
        } catch (err) {
            console.error('Error creating order:', err);
            return { success: false, message: 'Failed to create order' };
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (
        id: string,
        status: string,
        payment_status?: string,
        admin_notes?: string
    ): Promise<boolean> => {
        if (!session?.access_token) return false;

        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status, payment_status, admin_notes })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOrders(prev => prev.map(o => o.id === id ? data.order : o));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error updating order:', err);
            return false;
        }
    };

    const cancelOrder = async (id: string): Promise<boolean> => {
        if (!session?.access_token) return false;

        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error cancelling order:', err);
            return false;
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            isLoading,
            error,
            fetchOrders,
            createOrder,
            updateOrderStatus,
            cancelOrder
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
