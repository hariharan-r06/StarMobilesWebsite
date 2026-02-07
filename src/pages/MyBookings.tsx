import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { statusColors, statusLabels } from '@/utils/helpers';
import { Calendar, Phone, Wrench, Hash, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, isLoading, deleteBooking } = useBookings();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const success = await deleteBooking(id);
    if (success) {
      toast.success('Booking cancelled successfully');
    } else {
      toast.error('Failed to cancel booking');
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Track your service requests</p>
        </div>
        <Link to="/book-service" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          New Booking
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && bookings.length === 0 && (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
          <p className="text-muted-foreground mt-4">Loading your bookings...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bookings.length === 0 && (
        <div className="py-20 text-center">
          <Wrench className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <p className="font-heading text-lg font-semibold mt-4">No bookings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Book a service to get started</p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-heading font-semibold text-sm">{b.id.slice(0, 8)}...</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-sm">{b.brand} {b.model} — {b.problem_type}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
                </div>

                {/* Delete button only for pending bookings */}
                {b.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Cancel booking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(b.preferred_date)} at {b.preferred_time}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {b.phone}
                </span>
              </div>

              {b.admin_notes && (
                <p className="mt-2 text-xs text-primary bg-primary/5 rounded-md px-3 py-2">
                  Admin: {b.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
