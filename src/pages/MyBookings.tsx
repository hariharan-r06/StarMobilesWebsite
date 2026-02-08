import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { statusColors as statusColorsMap, statusLabels } from '@/utils/helpers';
import {
  Calendar, Phone, Wrench, Hash, Loader2, Trash2,
  ArrowLeft, Clock, MapPin, Smartphone, AlertCircle,
  CheckCircle2, RefreshCw, ChevronRight, Tooltip as TooltipIcon,
  HelpCircle, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, isLoading, deleteBooking } = useBookings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const success = await deleteBooking(id);
    if (success) {
      toast.success('Your service request has been cancelled');
    } else {
      toast.error('Failed to cancel request');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Booking context refresh logic here if applicable
    setTimeout(() => setIsRefreshing(false), 800);
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 text-slate-900">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Link to="/profile" className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900">Repair Tickets</h1>
              <p className="text-slate-500 font-medium">Tracking {bookings.length} service requests for your devices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/book-service" className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary transition-all active:scale-[0.98]">
              Request New Repair
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && bookings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="relative inline-block">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <Wrench className="h-6 w-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-slate-500 mt-6 font-bold uppercase tracking-widest text-xs animate-pulse font-sans">Accessing technician records...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-primary" />
            <div className="p-8 rounded-full bg-slate-50 inline-block mb-6">
              <Wrench className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="font-heading text-2xl font-black text-slate-800">No Active Tickets</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
              Experiencing hardware issues? Book a repair and get your device fixed by our experts.
            </p>
            <Link to="/book-service" className="mt-8 inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] shadow-2xl transition-all">
              Book a Technician <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(b => (
              <div key={b.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all overflow-hidden relative">
                {/* Horizontal status accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${b.status === 'pending' ? 'bg-amber-400' :
                    b.status === 'in_progress' ? 'bg-blue-500' :
                      b.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />

                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Device Icon & Main Info */}
                    <div className="flex gap-6 flex-1 items-start">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                        <Smartphone className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-[10px] font-black text-slate-300 tracking-tighter uppercase font-mono">#{b.id.slice(0, 10).toUpperCase()}</span>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm ${statusColors[b.status] || 'bg-slate-50 text-slate-600'}`}>
                            {statusLabels[b.status as keyof typeof statusLabels] || b.status}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 truncate group-hover:text-primary transition-colors">
                          {b.brand} {b.model}
                        </h3>
                        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <span>Issue: {b.problem_type}</span>
                        </div>
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white transition-colors">
                          <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                            "{b.description || 'No detailed log provided'}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Meta Box */}
                    <div className="w-full lg:w-80 space-y-4">
                      {/* Appointment Time */}
                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 group-hover:bg-primary/10 transition-colors">
                        <div className="p-3 bg-white rounded-xl shadow-sm"><Calendar className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Appointment</p>
                          <p className="text-sm font-bold text-slate-800">{formatDate(b.preferred_date)} @ {b.preferred_time}</p>
                        </div>
                      </div>

                      {/* Contact Info (Simplified for user) */}
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3 group-hover:bg-white transition-colors">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Phone className="h-4 w-4" /></div>
                        <p className="text-xs font-bold text-slate-600">{b.phone}</p>
                      </div>

                      {/* Admin Note / Status Message */}
                      {b.admin_notes ? (
                        <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-100/50 animate-pulse-subtle">
                          <div className="flex gap-3">
                            <MessageCircle className="h-4 w-4 text-emerald-600 mt-1 shrink-0" />
                            <div>
                              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Technician Log</p>
                              <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{b.admin_notes}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-[10px] text-slate-400 font-bold text-center tracking-widest uppercase italic">Awaiting technician feedback</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all text-xs font-black uppercase tracking-widest mt-4"
                          title="Cancel service request"
                        >
                          <Trash2 className="h-4 w-4" /> Cancel Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-black mb-3">Need instant help?</h2>
              <p className="text-slate-400 font-medium max-w-md">Our technical support is available from 10 AM to 9 PM IST. Reach out for any urgent device issues.</p>
            </div>
            <div className="flex gap-4">
              <a href="tel:+911234567890" className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                <Phone className="h-4 w-4" /> Call Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
