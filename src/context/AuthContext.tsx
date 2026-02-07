import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  address: string;
}

interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithPhone: (phone: string, password: string) => Promise<AuthResult>;
  signup: (data: { name: string; email?: string; phone?: string; password: string }) => Promise<AuthResult>;
  sendOtp: (phone: string) => Promise<AuthResult>;
  verifyOtp: (phone: string, otp: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create profile from user auth data (fallback when DB fetch fails)
  const createProfileFromUser = useCallback((authUser: SupabaseUser): UserProfile => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    phone: authUser.phone || authUser.user_metadata?.phone || '',
    role: 'user',
    address: ''
  }), []);

  // Fetch profile from database with timeout
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('Fetching profile for userId:', userId);
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Race between fetch and timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      console.log('Profile fetch result:', { data, error: error?.message });

      if (error || !data) {
        console.log('Profile fetch failed:', error?.message || 'No data');
        return null;
      }
      return data as UserProfile;
    } catch (error: any) {
      console.log('fetchProfile error:', error?.message || 'Unknown error');
      return null;
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (mounted && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Set fallback profile immediately
          setProfile(createProfileFromUser(currentSession.user));
          // Fetch real profile in background
          const dbProfile = await fetchProfile(currentSession.user.id);
          if (mounted && dbProfile) {
            setProfile(dbProfile);
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth event:', event);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setProfile(createProfileFromUser(newSession.user));
        // Fetch profile in background
        fetchProfile(newSession.user.id).then(dbProfile => {
          if (mounted && dbProfile) setProfile(dbProfile);
        });
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [createProfileFromUser, fetchProfile]);

  // Login with email - uses backend API to get profile with admin privileges
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // Use backend API which uses admin client to bypass RLS
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.error || 'Login failed' };
      }

      console.log('Login result from backend:', result);

      if (result.session && result.user) {
        // Set session in Supabase client
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });

        setUser(result.user);
        setSession(result.session);

        // Use profile from backend (fetched with admin privileges)
        if (result.profile) {
          console.log('Setting profile from backend with role:', result.profile.role);
          setProfile(result.profile);
        } else {
          console.log('No profile from backend, using fallback');
          setProfile(createProfileFromUser(result.user));
        }
      }

      return { success: true, message: result.message || 'Login successful!' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Login with phone
  const loginWithPhone = async (phone: string, password: string): Promise<AuthResult> => {
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.signInWithPassword({ phone: formattedPhone, password });
      if (error) return { success: false, message: error.message };

      if (data.user) {
        setUser(data.user);
        setSession(data.session);

        // Fetch profile and WAIT for it (important for admin role)
        const dbProfile = await fetchProfile(data.user.id);
        if (dbProfile) {
          setProfile(dbProfile);
        } else {
          setProfile(createProfileFromUser(data.user));
        }
      }
      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Signup
  const signup = async (signupData: { name: string; email?: string; phone?: string; password: string }): Promise<AuthResult> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email || '',
          phone: signupData.phone || '',
          password: signupData.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.error || 'Signup failed' };
      }

      // Set session if we got one
      if (result.session && result.user) {
        const newUser = result.user as SupabaseUser;
        setUser(newUser);
        setSession(result.session as Session);
        setProfile(createProfileFromUser(newUser));

        // Sync with Supabase client in background
        supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        }).then(() => {
          fetchProfile(newUser.id).then(dbProfile => {
            if (dbProfile) setProfile(dbProfile);
          });
        }).catch(() => { });
      }

      return { success: true, message: result.message || 'Account created!' };
    } catch (error: any) {
      if (error?.name === 'AbortError') return { success: false, message: '' };
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  // Send OTP
  const sendOtp = async (phone: string): Promise<AuthResult> => {
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'OTP sent!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to send OTP' };
    }
  };

  // Verify OTP
  const verifyOtp = async (phone: string, otp: string): Promise<AuthResult> => {
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
      if (error) return { success: false, message: error.message };

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setProfile(createProfileFromUser(data.user));
        fetchProfile(data.user.id).then(dbProfile => {
          if (dbProfile) setProfile(dbProfile);
        });
      }
      return { success: true, message: 'Verified!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Verification failed' };
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Reset email sent!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed' };
    }
  };

  // Reset password
  const resetPassword = async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Reset failed' };
    }
  };

  // Change password
  const changePassword = async (_: string, newPassword: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password changed!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Change failed' };
    }
  };

  // LOGOUT - Clear everything completely
  const logout = async () => {
    try {
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);

      // Sign out from Supabase (clears cookies and localStorage)
      await supabase.auth.signOut({ scope: 'global' });

      // Force clear ALL Supabase localStorage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

    } catch (error) {
      console.error('Logout error:', error);
      // Even if signOut fails, clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  // Update profile in database
  const updateProfile = async (data: Partial<UserProfile>): Promise<AuthResult> => {
    if (!user) return { success: false, message: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) return { success: false, message: error.message };

      // Update local state immediately
      if (profile) {
        setProfile({ ...profile, ...data });
      }
      return { success: true, message: 'Profile updated!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  // Refresh profile from database
  const refreshProfile = useCallback(async () => {
    if (user) {
      const dbProfile = await fetchProfile(user.id);
      if (dbProfile) {
        setProfile(dbProfile);
      } else {
        // If DB fetch fails, use fallback
        setProfile(createProfileFromUser(user));
      }
    }
  }, [user, fetchProfile, createProfileFromUser]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!session,
    isAdmin: profile?.role === 'admin',
    isLoading,
    login,
    loginWithPhone,
    signup,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
