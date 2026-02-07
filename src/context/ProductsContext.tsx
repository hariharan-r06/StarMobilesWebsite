import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Product {
    id: string;
    brand: string;
    model: string;
    price: number;
    category: 'mobile' | 'accessory';
    ram?: string;
    storage?: string;
    specs?: Record<string, any>;
    rating?: number;
    stock?: number;
    featured?: boolean;
    image?: string;
    created_at?: string;
}

interface ProductsContextType {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: (filters?: ProductFilters) => Promise<void>;
    getProductById: (id: string) => Product | undefined;
}

interface ProductFilters {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchProducts = useCallback(async (filters?: ProductFilters) => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.category) params.set('category', filters.category);
            if (filters?.brand) params.set('brand', filters.brand);
            if (filters?.minPrice) params.set('minPrice', filters.minPrice.toString());
            if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
            if (filters?.featured) params.set('featured', 'true');

            const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data.products || []);
        } catch (err: any) {
            console.error('Fetch products error:', err);
            setError(err.message || 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    const getProductById = useCallback((id: string): Product | undefined => {
        return products.find(p => p.id === id);
    }, [products]);

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <ProductsContext.Provider value={{
            products,
            isLoading,
            error,
            fetchProducts,
            getProductById
        }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
    return ctx;
};
