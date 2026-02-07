import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/helpers';
import { Trash2, Plus, Minus, ShoppingBag, Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoginModal from '@/components/LoginModal';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, isLoading, requiresAuth } = useCart();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const navigate = useNavigate();

  // If not authenticated, show login prompt
  if (!isAuthenticated || requiresAuth) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <LogIn className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="font-heading text-2xl font-bold mt-4">Please login to view your cart</h2>
        <p className="text-muted-foreground mt-1">Your cart items are saved to your account</p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Login / Sign Up
        </button>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    );
  }

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
        <h2 className="font-heading text-xl font-semibold mt-4">Loading your cart...</h2>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="font-heading text-2xl font-bold mt-4">Your cart is empty</h2>
        <p className="text-muted-foreground mt-1">Browse our products and add something!</p>
        <Link to="/mobiles" className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          Shop Now
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    toast.info('Checkout coming soon!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-primary">{item.name.split(' ')[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold truncate">{item.name}</p>
                <p className="price-text font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isLoading}
                  className="rounded-md border border-border p-1 hover:bg-muted disabled:opacity-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isLoading}
                  className="rounded-md border border-border p-1 hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                disabled={isLoading}
                className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 h-fit">
          <h3 className="font-heading font-semibold">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-accent">FREE</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="price-text font-heading font-bold text-lg">{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Checkout
          </button>
          <button
            onClick={() => clearCart()}
            disabled={isLoading}
            className="mt-2 w-full rounded-lg border border-destructive py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
