import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  category: 'mobile' | 'accessory';
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  requiresAuth: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, session, isAuthenticated } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get auth header
  const getAuthHeader = useCallback(() => {
    if (!session?.access_token) return null;
    return { Authorization: `Bearer ${session.access_token}` };
  }, [session]);

  // Fetch cart from database
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform DB items to CartItem format
        const cartItems: CartItem[] = (data.items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          category: item.product?.category || 'mobile',
          name: item.product ? `${item.product.brand} ${item.product.model}` : 'Unknown Product',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.image
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session, API_URL, getAuthHeader]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated && session?.access_token) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, session?.access_token, fetchCart]);

  // Add item to cart (requires auth)
  const addItem = async (item: Omit<CartItem, 'quantity' | 'id'>): Promise<boolean> => {
    if (!isAuthenticated || !session?.access_token) {
      return false; // Signal that auth is required
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: item.productId, quantity: 1 })
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add to cart error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id: string) => {
    if (!isAuthenticated || !session?.access_token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader() as HeadersInit
      });

      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated || !session?.access_token) return;

    if (quantity <= 0) {
      return removeItem(id);
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
      }
    } catch (error) {
      console.error('Update cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated || !session?.access_token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: getAuthHeader() as HeadersInit
      });

      if (response.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
      isLoading,
      requiresAuth: !isAuthenticated
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
