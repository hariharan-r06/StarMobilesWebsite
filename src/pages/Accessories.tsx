import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, ChevronDown, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { formatPrice } from '@/utils/helpers';

const Accessories = () => {
  const { products, isLoading, fetchProducts, error } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
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
    fetchProducts();
  }, []);

  const accessories = useMemo(() => {
    return products.filter(p => p.category === 'accessory');
  }, [products]);

  const filtered = useMemo(() => {
    const filteredProducts = accessories.filter(item => {
      // Search Filter
      const matchesSearch = !search || `${item.brand} ${item.model}`.toLowerCase().includes(search.toLowerCase());

      // Brand Filter
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);

      // Price Filter
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchesSearch && matchesBrand && matchesPrice;
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
  }, [accessories, search, selectedBrands, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const availableBrands = useMemo(() => {
    const brands = new Set(accessories.map(p => p.brand));
    return Array.from(brands).sort();
  }, [accessories]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accessories</h1>
          <p className="text-gray-500 mt-1">Enhance your device with our premium accessories</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-4xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            placeholder="Search accessories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Brands */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Brands</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                {availableBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
                {availableBrands.length === 0 && <p className="text-xs text-gray-400 italic">No brands found</p>}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Price Range</h3>
              <div className="px-1">
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={500}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 font-medium">
                {isLoading ? 'Loading...' : `${filtered.length} products found`}
              </p>

              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {sortOptions.find(o => o.value === sortBy)?.label}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-red-200">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No results found matching your criteria</p>
                <button onClick={() => { setSearch(''); setSelectedBrands([]); setPriceRange([0, 50000]); }} className="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Accessories;
