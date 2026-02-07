import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts, Product } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { mobileBrands, formatPrice } from '@/utils/helpers';
import LoginModal from '@/components/LoginModal';
import { toast } from 'sonner';

const Mobiles = () => {
  const { products, isLoading, error } = useProducts();
  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Phones' | 'Accessories'>('All');
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const filtered = useMemo(() => {
    return products.filter(item => {
      // Category Filter
      let matchCategory = true;
      if (activeCategory === 'Phones') matchCategory = item.category === 'mobile';
      if (activeCategory === 'Accessories') matchCategory = item.category === 'accessory';

      // Search Filter
      const matchesSearch = !search || `${item.brand} ${item.model}`.toLowerCase().includes(search.toLowerCase());

      // Brand Filter
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);

      // Price Filter
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchCategory && matchesSearch && matchesBrand && matchesPrice;
    });
  }, [products, activeCategory, search, selectedBrands, priceRange]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const handleModalAddToCart = async () => {
    if (!selectedProduct) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const success = await addItem({
      productId: selectedProduct.id,
      category: selectedProduct.category,
      name: `${selectedProduct.brand} ${selectedProduct.model}`,
      price: selectedProduct.price,
      image: selectedProduct.image
    });

    if (success) {
      toast.success(`${selectedProduct.brand} ${selectedProduct.model} added to cart`);
      setSelectedProduct(null);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand));
    return Array.from(brands).sort();
  }, [products]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Browse our collection of phones and accessories</p>
        </div>

        {/* Search Bar (Full Width) */}
        <div className="relative mb-8 max-w-4xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-shadow shadow-sm"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">

            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Category</h3>
              <div className="space-y-1">
                {['All Products', 'Phones', 'Accessories'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat === 'All Products' ? 'All' : cat as any)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(activeCategory === 'All' && cat === 'All Products') ||
                        activeCategory === cat
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Brands</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {availableBrands.map(brand => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Price Range</h3>
              <div className="px-1">
                <input
                  type="range"
                  min={0}
                  max={160000}
                  step={5000}
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

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 font-medium">
                {isLoading ? 'Loading...' : `${filtered.length} products found`}
              </p>

              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Most Popular <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-20">
                <Loader2 className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 mt-4">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-red-200">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="text-gray-400 text-sm mt-1">Please check your database connection</p>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    brand={item.brand}
                    model={item.model}
                    price={item.price}
                    image={item.image}
                    ram={item.ram}
                    storage={item.storage}
                    rating={item.rating}
                    category={item.category}
                    featured={item.featured}
                    onViewDetails={() => setSelectedProduct(item)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No products found matching your criteria</p>
                <button onClick={() => { setSearch(''); setSelectedBrands([]); setPriceRange([0, 160000]); }} className="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-6 top-6 z-10 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="bg-gray-50 p-10 flex items-center justify-center">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.model} className="max-h-64 object-contain" />
                  ) : (
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-gray-200">{selectedProduct.brand}</h3>
                      <p className="text-gray-300 mt-2">{selectedProduct.model}</p>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                      {selectedProduct.brand}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.model}</h2>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl font-bold text-gray-900">{formatPrice(selectedProduct.price)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(Math.round(selectedProduct.price * 1.1))}</span>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded ml-2">10% OFF</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {Object.entries(selectedProduct.specs || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-900 text-right">{val}</span>
                      </div>
                    ))}
                    {selectedProduct.ram && (
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-500">Configuration</span>
                        <span className="font-medium text-gray-900">{selectedProduct.ram} / {selectedProduct.storage}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleModalAddToCart}
                    disabled={cartLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      </div>
    </div>
  );
};

export default Mobiles;
