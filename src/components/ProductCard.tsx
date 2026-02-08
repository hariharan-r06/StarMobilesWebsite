import React, { useState } from 'react';
import { Star, ShoppingCart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/utils/helpers';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import BookProductModal from './BookProductModal';

interface ProductCardProps {
  id: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
  ram?: string;
  storage?: string;
  rating?: number;
  stock?: number;
  category: 'mobile' | 'accessory';
  onViewDetails?: () => void;
  onBook?: () => void;
  featured?: boolean;
}

const ProductCard = ({ id, brand, model, price, image, ram, storage, rating, category, onViewDetails, featured }: ProductCardProps) => {
  const { addItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If not authenticated, show login modal
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Add to cart
    const success = await addItem({
      productId: id,
      category,
      name: `${brand} ${model}`,
      price,
      image
    });

    if (success) {
      toast.success(`${brand} ${model} added to cart`);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setShowBookModal(true);
  };

  return (
    <>
      <div
        onClick={onViewDetails}
        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/20">
            New
          </div>
        )}

        {/* Image Area */}
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-8 transition-transform duration-500 group-hover:scale-105">
          {image ? (
            <img src={image} alt={model} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold text-gray-300">{brand}</h3>
              <p className="text-sm text-gray-400 mt-1">No Image</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {brand}
          </div>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {model}
          </h3>

          {rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-600">{rating} (120)</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-lg font-bold text-gray-900 block">{formatPrice(price)}</span>
              {(ram || storage) && (
                <span className="text-xs text-gray-500 font-medium">
                  {ram} {storage && `/ ${storage}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Book Button */}
              <button
                onClick={handleBook}
                className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                title="Book with 20% Advance"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Book
              </button>

              {/* Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                title={isAuthenticated ? 'Add to Cart' : 'Login to add to cart'}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Book Product Modal */}
      <BookProductModal
        open={showBookModal}
        onClose={() => setShowBookModal(false)}
        product={{ id, brand, model, price, image, category }}
      />
    </>
  );
};

export default ProductCard;

