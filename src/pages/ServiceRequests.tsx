import React, { useState } from 'react';
import { useBookings, Booking } from '@/context/BookingContext';
import { statusColors, statusLabels } from '@/utils/helpers';
import { Search, X, Calendar, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ServiceRequests = () => {
  const { bookings, updateBookingStatus, isLoading } = useBookings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const filtered = bookings.filter(b => {
    const customerName = b.customer_name || '';
    const matchSearch = !search ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    const success = await updateBookingStatus(id, status);
    if (success) {
      toast.success(`Status updated to ${statusLabels[status] || status}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (id: string) => {
    if (!noteInput.trim()) return;
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const success = await updateBookingStatus(id, booking.status, noteInput);
    if (success) {
      setNoteInput('');
      toast.success('Note added');
      setSelected(null);
    } else {
      toast.error('Failed to add note');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground mt-1">{bookings.length} total requests</p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search by ID or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
            >
              {s ? (statusLabels[s as keyof typeof statusLabels] || s) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && bookings.length === 0 && (
        <div className="mt-20 text-center">
          <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground mt-4">Loading service requests...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">No service requests found</p>
        </div>
      )}

      {/* Requests List */}
      <div className="mt-6 space-y-3">
        {filtered.map(b => (
          <div
            key={b.id}
            className="rounded-xl border border-border bg-card p-5 card-hover cursor-pointer"
            onClick={() => setSelected(b)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-semibold text-sm">{b.id.slice(0, 8)}...</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm font-medium">{b.customer_name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[b.status] || b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm">{b.brand} {b.model} — {b.problem_type}</p>
              </div>
              <select
                value={b.status}
                onChange={e => { e.stopPropagation(); handleStatusChange(b.id, e.target.value as Booking['status']); }}
                onClick={e => e.stopPropagation()}
                className="rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(b.preferred_date)} at {b.preferred_time}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {b.phone}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 p-1 text-muted-foreground hover:bg-muted rounded-md">
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-xl font-bold">Booking {selected.id.slice(0, 8)}...</h2>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[selected.status] || 'bg-gray-100 text-gray-700'}`}>
              {statusLabels[selected.status] || selected.status}
            </span>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{selected.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{selected.phone}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium">{selected.brand} {selected.model}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Problem</span>
                <span className="font-medium">{selected.problem_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1">{selected.description}</p>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Preferred Date</span>
                <span className="font-medium">{formatDate(selected.preferred_date)} at {selected.preferred_time}</span>
              </div>
            </div>

            {selected.admin_notes && (
              <div className="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
                <p className="font-medium text-xs text-primary mb-1">Admin Notes</p>
                <p>{selected.admin_notes}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm font-medium mb-1.5 block">Add Note</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                />
                <button
                  onClick={() => handleAddNote(selected.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
