import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

// Local storage key for admin profile cache
const PROFILE_CACHE_KEY = 'star_mobiles_profile_cache';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if profile was fetched from backend (reliable source)
  const profileFetchedRef = useRef(false);

  // Get cached profile from localStorage
  const getCachedProfile = (userId: string): UserProfile | null => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.id === userId) {
          return parsed;
        }
      }
    } catch { }
    return null;
  };

  // Cache profile to localStorage
  const cacheProfile = (profileData: UserProfile) => {
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
    } catch { }
  };

  // Clear cached profile
  const clearCachedProfile = () => {
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch { }
  };

  // Create profile from user auth data (fallback when DB fetch fails)
  const createProfileFromUser = useCallback((authUser: SupabaseUser): UserProfile => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    phone: authUser.phone || authUser.user_metadata?.phone || '',
    role: 'user',
    address: ''
  }), []);

  // Fetch profile from backend API (uses admin client, bypasses RLS)
  const fetchProfileFromBackend = useCallback(async (userId: string, accessToken: string): Promise<UserProfile | null> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          console.log('Profile from backend:', data.profile);
          return data.profile as UserProfile;
        }
      }
    } catch (error) {
      console.log('Backend profile fetch error:', error);
    }
    return null;
  }, []);

  // Fetch profile from database directly (fallback)
  const fetchProfileFromDB = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data as UserProfile;
      }
    } catch { }
    return null;
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

          // First check cache for admin profile
          const cachedProfile = getCachedProfile(currentSession.user.id);
          if (cachedProfile) {
            console.log('Using cached profile with role:', cachedProfile.role);
            setProfile(cachedProfile);
            profileFetchedRef.current = true;
          } else {
            // Set fallback profile
            setProfile(createProfileFromUser(currentSession.user));
          }

          // Fetch fresh profile from backend
          const backendProfile = await fetchProfileFromBackend(
            currentSession.user.id,
            currentSession.access_token
          );

          if (mounted && backendProfile) {
            console.log('Setting profile from backend init with role:', backendProfile.role);
            setProfile(backendProfile);
            cacheProfile(backendProfile);
            profileFetchedRef.current = true;
          } else if (mounted && !cachedProfile) {
            // Try direct DB fetch as last resort
            const dbProfile = await fetchProfileFromDB(currentSession.user.id);
            if (dbProfile) {
              setProfile(dbProfile);
              cacheProfile(dbProfile);
            }
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
        clearCachedProfile();
        profileFetchedRef.current = false;
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);

        // Check cache first
        const cachedProfile = getCachedProfile(newSession.user.id);
        if (cachedProfile) {
          setProfile(cachedProfile);
        } else {
          setProfile(createProfileFromUser(newSession.user));
        }
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);

        // On token refresh, re-fetch profile to ensure admin role is preserved
        if (!profileFetchedRef.current) {
          const backendProfile = await fetchProfileFromBackend(
            newSession.user.id,
            newSession.access_token
          );
          if (mounted && backendProfile) {
            setProfile(backendProfile);
            cacheProfile(backendProfile);
            profileFetchedRef.current = true;
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [createProfileFromUser, fetchProfileFromBackend, fetchProfileFromDB]);

  // Login with email - uses backend API to get profile with admin privileges
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
          console.log('Setting profile from backend login with role:', result.profile.role);
          setProfile(result.profile);
          cacheProfile(result.profile);
          profileFetchedRef.current = true;
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

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);

        // Fetch profile from backend
        const backendProfile = await fetchProfileFromBackend(data.user.id, data.session.access_token);
        if (backendProfile) {
          setProfile(backendProfile);
          cacheProfile(backendProfile);
          profileFetchedRef.current = true;
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

      if (result.session && result.user) {
        const newUser = result.user as SupabaseUser;
        setUser(newUser);
        setSession(result.session as Session);

        const newProfile = createProfileFromUser(newUser);
        setProfile(newProfile);
        cacheProfile(newProfile);

        // Sync with Supabase client
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });
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

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);

        const backendProfile = await fetchProfileFromBackend(data.user.id, data.session.access_token);
        if (backendProfile) {
          setProfile(backendProfile);
          cacheProfile(backendProfile);
        } else {
          setProfile(createProfileFromUser(data.user));
        }
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
      clearCachedProfile();
      profileFetchedRef.current = false;

      // Sign out from Supabase
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
      setUser(null);
      setProfile(null);
      setSession(null);
      clearCachedProfile();
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

      // Update local state and cache
      if (profile) {
        const updatedProfile = { ...profile, ...data };
        setProfile(updatedProfile);
        cacheProfile(updatedProfile);
      }
      return { success: true, message: 'Profile updated!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  // Refresh profile from backend
  const refreshProfile = useCallback(async () => {
    if (user && session) {
      const backendProfile = await fetchProfileFromBackend(user.id, session.access_token);
      if (backendProfile) {
        setProfile(backendProfile);
        cacheProfile(backendProfile);
        profileFetchedRef.current = true;
      }
    }
  }, [user, session, fetchProfileFromBackend]);

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
