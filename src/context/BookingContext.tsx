import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Booking {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  problem_type: string;
  description: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  admin_notes: string;
}

// Frontend-friendly interface for creating bookings
export interface BookingInput {
  customerName: string;
  phone: string;
  brand: string;
  model: string;
  problemType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
}

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  addBooking: (b: BookingInput) => Promise<{ success: boolean; bookingId?: string; message?: string }>;
  fetchBookings: () => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status'], notes?: string) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session, isAuthenticated } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get auth header
  const getAuthHeader = useCallback(() => {
    if (!session?.access_token) return null;
    return { Authorization: `Bearer ${session.access_token}` };
  }, [session]);

  // Fetch bookings from database
  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setBookings([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session, API_URL, getAuthHeader]);

  // Fetch bookings when user logs in
  useEffect(() => {
    if (isAuthenticated && session?.access_token) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [isAuthenticated, session?.access_token, fetchBookings]);

  // Add a new booking
  const addBooking = async (input: BookingInput): Promise<{ success: boolean; bookingId?: string; message?: string }> => {
    if (!isAuthenticated || !session?.access_token) {
      return { success: false, message: 'Please login to book a service' };
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchBookings(); // Refresh bookings
        return { success: true, bookingId: data.booking?.id, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to create booking' };
      }
    } catch (err: any) {
      console.error('Add booking error:', err);
      return { success: false, message: err.message || 'Failed to create booking' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update booking status (admin only)
  const updateBookingStatus = async (id: string, status: Booking['status'], notes?: string): Promise<boolean> => {
    if (!isAuthenticated || !session?.access_token) return false;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes: notes })
      });

      if (response.ok) {
        await fetchBookings();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update booking error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete booking
  const deleteBooking = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !session?.access_token) return false;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader() as HeadersInit
      });

      if (response.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete booking error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      isLoading,
      error,
      addBooking,
      fetchBookings,
      updateBookingStatus,
      deleteBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
};
