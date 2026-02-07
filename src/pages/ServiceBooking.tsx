import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { useProducts } from '@/context/ProductsContext';
import { mobileBrands, problemTypes } from '@/utils/helpers';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ServiceBooking = () => {
  const { user, profile } = useAuth();
  const { addBooking, isLoading } = useBookings();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brand: '',
    model: '',
    problemType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    phone: profile?.phone || user?.phone || ''
  });

  // Get models from database products
  const models = products
    .filter(p => p.brand === form.brand && p.category === 'mobile')
    .map(p => p.model);

  // Get unique brands from products
  const availableBrands = [...new Set(products.filter(p => p.category === 'mobile').map(p => p.brand))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }
    if (form.description.length > 500) {
      toast.error('Description too long (max 500 chars)');
      return;
    }

    const result = await addBooking({
      customerName: profile?.name || user.user_metadata?.name || 'Customer',
      phone: form.phone,
      brand: form.brand,
      model: form.model,
      problemType: form.problemType,
      description: form.description,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
    });

    if (result.success) {
      toast.success(`Service booked! Booking ID: ${result.bookingId}`);
      navigate('/my-bookings');
    } else {
      toast.error(result.message || 'Failed to create booking');
    }
  };

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold">Book a Service</h1>
      <p className="text-muted-foreground mt-1">Fill in the details and we'll get your phone fixed</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mobile Brand *</label>
            <select
              className={selectClass}
              required
              value={form.brand}
              onChange={e => setForm(p => ({ ...p, brand: e.target.value, model: '' }))}
            >
              <option value="">Select brand</option>
              {(availableBrands.length > 0 ? availableBrands : mobileBrands).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mobile Model *</label>
            <select
              className={selectClass}
              required
              value={form.model}
              onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
            >
              <option value="">Select model</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Problem Type *</label>
          <select
            className={selectClass}
            required
            value={form.problemType}
            onChange={e => setForm(p => ({ ...p, problemType: e.target.value }))}
          >
            <option value="">Select problem</option>
            {problemTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description *</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            required
            maxLength={500}
            placeholder="Describe the issue..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Preferred Date *</label>
            <input
              type="date"
              className={inputClass}
              required
              min={new Date().toISOString().split('T')[0]}
              value={form.preferredDate}
              onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Preferred Time *</label>
            <input
              type="time"
              className={inputClass}
              required
              value={form.preferredTime}
              onChange={e => setForm(p => ({ ...p, preferredTime: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Contact Number *</label>
          <input
            type="tel"
            className={inputClass}
            required
            maxLength={10}
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </form>
    </div>
  );
};

export default ServiceBooking;
