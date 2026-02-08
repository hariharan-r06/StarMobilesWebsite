import React, { useState } from 'react';
import { useBookings, Booking } from '@/context/BookingContext';
import { statusColors as statusColorsMap, statusLabels } from '@/utils/helpers';
import {
  Search, X, Calendar, Phone, Loader2, Wrench,
  Clock, User, Smartphone, AlertCircle, CheckCircle2,
  RefreshCw, Filter, ArrowRight, MessageSquare, Briefcase, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const ServiceRequests = () => {
  const { bookings, updateBookingStatus, isLoading, fetchBookings } = useBookings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = bookings.filter(b => {
    const customerName = b.customer_name || '';
    const matchSearch = !search ||
      (b.id || '').toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      (b.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.model || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setIsRefreshing(false);
  };

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    const success = await updateBookingStatus(id, status);
    if (success) {
      toast.success(`Status updated to ${statusLabels[status as keyof typeof statusLabels] || status}`);
      if (selected && selected.id === id) {
        setSelected({ ...selected, status });
      }
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
      toast.success('Note attached to record');
      setSelected(null);
    } else {
      toast.error('Failed to add note');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;
  const completedToday = bookings.filter(b => b.status === 'completed').length; // Simplified for UI

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Service Center</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Repair Requests</h1>
            <p className="text-slate-500 mt-1">Track and manage mobile repair and service bookings</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Wait List</span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 font-bold text-xs">PENDING</div>
            </div>
            <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
            <p className="text-xs text-slate-400 mt-1">Customers waiting for pickup/start</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">In Workshop</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 font-bold text-xs">WORKING</div>
            </div>
            <p className="text-3xl font-black text-slate-900">{inProgressCount}</p>
            <p className="text-xs text-slate-400 mt-1">Currently being repaired</p>
          </div>
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 shadow-lg shadow-primary/20 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-80">Cycle Completed</span>
              <CheckCircle2 className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-black">{bookings.filter(b => b.status === 'completed').length}</p>
            <p className="text-xs opacity-70 mt-1">Total repairs resolved successfully</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all"
              placeholder="Search by ID, customer name, device..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['', 'pending', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === s
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {s ? (statusLabels[s as keyof typeof statusLabels] || s) : 'All Requests'}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Listing */}
        {isLoading && bookings.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">Fetching workshop data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Briefcase className="h-16 w-16 text-slate-200 mx-auto" />
            <p className="text-slate-400 mt-4 font-medium">No service records found for current filters</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(b => (
              <div
                key={b.id}
                className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelected(b)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                      <Smartphone className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-300 tracking-tighter uppercase mr-1">#{b.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[b.status as keyof typeof statusLabels] || b.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{b.brand} {b.model}</h3>
                      <p className="text-xs text-rose-500 font-semibold mt-0.5">{b.problem_type}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 md:gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {b.customer_name}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(b.preferred_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {b.preferred_time}
                      </span>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div
            className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Service Ticket</h2>
                  <p className="text-xs text-slate-500 font-medium">Ref: {(selected.id || '').toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2.5 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Overall Status Selector */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Update Ticket Status</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={e => handleStatusChange(selected.id, e.target.value as Booking['status'])}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Workshop</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                {/* Left: Info */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer Profile</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><User className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{selected.customer_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">Client Name</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Phone className="h-4 w-4" /></div>
                        <div>
                          <a href={`tel:${selected.phone}`} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">{selected.phone}</a>
                          <p className="text-[10px] font-bold text-slate-400">Primary Contact</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Device Identity</h3>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Model</span>
                        <span className="font-bold text-slate-900">{selected.brand} {selected.model}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Issue</span>
                        <span className="font-black text-rose-600">{selected.problem_type}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right: Notes & Extra */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scheduled Slot</h3>
                    <div className="p-4 rounded-2xl border-2 border-primary/10 bg-primary/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-slate-900">{formatDate(selected.preferred_date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-slate-900">{selected.preferred_time}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Problem Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl italic font-medium">
                      "{selected.description || 'No detailed description provided'}"
                    </p>
                  </section>
                </div>
              </div>

              {selected.admin_notes && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Technical Log</h3>
                  <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 font-mono text-[11px] leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><MessageSquare className="h-10 w-10 text-white" /></div>
                    <div className="relative z-10">{selected.admin_notes}</div>
                  </div>
                </section>
              )}
            </div>

            {/* Modal Footer (Notes) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Append To Log</label>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none min-h-[50px]"
                    placeholder="Add repair progress, parts required, etc..."
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => handleAddNote(selected.id)}
                disabled={isLoading || !noteInput.trim()}
                className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black text-white hover:bg-primary transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Plus className="h-4 w-4" />}
                Save Technical Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
