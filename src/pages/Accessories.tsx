import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductsContext';

const Accessories = () => {
  const { products, isLoading, fetchProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'newest'>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ] as const;

  // Fetch products on mount
  useEffect(() => {
    fetchProducts({ category: 'accessory' });
  }, []);

  // Filter accessories from products
  const accessories = useMemo(() => {
    return products.filter(p => p.category === 'accessory');
  }, [products]);

  const filtered = useMemo(() => {
    const filteredProducts = accessories.filter(a => {
      const matchesSearch = !search || `${a.brand} ${a.model}`.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    // Apply sorting
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'popular':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });
  }, [accessories, search, sortBy]);

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

      {/* Search & Sort Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
            placeholder="Search accessories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center justify-between gap-2 w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {sortOptions.find(o => o.value === sortBy)?.label}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 sm:left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 mb-2">
        <p className="text-sm text-gray-500 font-medium">{filtered.length} accessories found</p>
      </div>

      {/* Products Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
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
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-primary text-sm font-semibold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Accessories;
