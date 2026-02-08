import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { accessoryTypes } from '@/utils/helpers';

const Accessories = () => {
  const { products, isLoading, fetchProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch products on mount
  useEffect(() => {
    fetchProducts({ category: 'accessory' });
  }, []);

  // Filter accessories from products
  const accessories = useMemo(() => {
    return products.filter(p => p.category === 'accessory');
  }, [products]);

  const filtered = useMemo(() => {
    return accessories.filter(a => {
      const matchesSearch = !search || `${a.brand} ${a.model}`.toLowerCase().includes(search.toLowerCase());
      // Note: type field may not exist in database - skip type filter if not present
      return matchesSearch;
    });
  }, [accessories, search, selectedType]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Accessories</h1>
      <p className="text-muted-foreground mt-1">Cases, chargers, earphones & more</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search accessories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
        {filtered.map(a => (
          <ProductCard
            key={a.id}
            id={a.id}
            brand={a.brand}
            model={a.model}
            price={a.price}
            rating={a.rating || 0}
            category="accessory"
            image={a.image}
            stock={a.stock}
            featured={a.featured}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-heading text-lg text-muted-foreground">No accessories found</p>
        </div>
      )}
    </div>
  );
};

export default Accessories;
