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

const ProductCard = ({ id, brand, model, price, image, ram, storage, rating, stock, category, onViewDetails, featured }: ProductCardProps) => {
  const { addItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

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
        className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
      >
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1.5">
          {featured && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/30">
              New
            </span>
          )}
          {stock !== undefined && stock <= 5 && stock > 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">
              Only {stock} left
            </span>
          )}
          {stock === 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Image Area */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {image ? (
            <img
              src={image}
              alt={model}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-slate-200/50 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-300">{brand}</h3>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col">
          {/* Brand */}
          <div className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {brand}
          </div>

          {/* Model Name */}
          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {model}
          </h3>

          {/* Specs & Rating */}
          <div className="flex items-center gap-2 flex-wrap mb-2 sm:mb-3">
            {rating && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-semibold text-amber-700">{rating}</span>
              </div>
            )}
            {(ram || storage) && (
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md">
                {ram}{storage && ` • ${storage}`}
              </span>
            )}
          </div>

          {/* Spacer to push price/buttons to bottom */}
          <div className="flex-1" />

          {/* Price & Actions */}
          <div className="mt-auto">
            {/* Price */}
            <div className="mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl font-bold text-slate-900">{formatPrice(price)}</span>
              {category === 'mobile' && (
                <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5">
                  Book with ₹{Math.round(price * 0.2).toLocaleString()} advance
                </p>
              )}
            </div>

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Book Button */}
              <button
                onClick={handleBook}
                disabled={stock === 0}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Book with 20% Advance"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Book Now</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isLoading || stock === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 sm:w-auto rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                title={isAuthenticated ? 'Add to Cart' : 'Login to add to cart'}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="sm:hidden">Add to Cart</span>
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
