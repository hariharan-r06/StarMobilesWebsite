import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, LogOut, Package, Wrench, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoginModal from './LoginModal';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/mobiles', label: 'Mobiles' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white md:bg-card/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Mobile hamburger (Left Side) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-4 rounded-md p-2 text-foreground/70 hover:bg-muted md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-auto md:mr-0">
            <img src="/logo.png" alt="Star Mobiles" className="h-16 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative text-base font-medium transition-colors hover:text-primary ${isActive(link.to) ? 'text-primary' : 'text-foreground/70'
                  }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ease-out ${isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative rounded-md p-2 text-foreground/70 hover:bg-muted hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {profile?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:inline">{profile?.name?.split(' ')[0] || 'User'}</span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg animate-scale-in">
                      {isAdmin ? (
                        <>
                          <Link to="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <Link to="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <Package className="h-4 w-4" /> Admin Dashboard
                          </Link>
                          <Link to="/admin/products" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <Package className="h-4 w-4" /> Manage Products
                          </Link>
                          <Link to="/admin/requests" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <Wrench className="h-4 w-4" /> Service Requests
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <Link to="/my-bookings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <Wrench className="h-4 w-4" /> My Bookings
                          </Link>
                          <Link to="/book-service" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                            <Wrench className="h-4 w-4" /> Book Service
                          </Link>
                        </>
                      )}
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={async () => {
                          setProfileOpen(false);
                          await logout();
                          window.location.href = '/';
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Menu Sidebar (Slide-in from Left) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-3 text-base font-medium transition-colors ${isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
