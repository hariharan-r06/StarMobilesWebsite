import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Lock, Loader2, Save, Edit, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, profile, isAuthenticated, updateProfile, changePassword, logout, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const hasRefreshed = useRef(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh profile on mount - run only once
  useEffect(() => {
    if (isAuthenticated && !hasRefreshed.current) {
      hasRefreshed.current = true;
      refreshProfile().catch(err => {
        console.error('Failed to refresh profile:', err);
      });
    }
  }, [isAuthenticated, refreshProfile]);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    } else if (user) {
      // Fallback if profile is missing but user exists
      setForm(prev => ({
        ...prev,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.phone || user.user_metadata?.phone || ''
      }));
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateProfile(form);
      if (res.success) {
        setEditing(false);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword('', passwordForm.newPassword);
      if (res.success) {
        setChangingPassword(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      // Force full page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed";

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please login to view your profile</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Get display data from profile or user
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayPhone = profile?.phone || user?.phone || '';
  const displayRole = profile?.role || 'user';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-3xl font-bold text-white">
            {displayName.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-gray-500 mt-1">{displayEmail}</p>
        {displayRole === 'admin' && (
          <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" /> Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={!editing || isLoading}
              className={inputClass}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4" /> Email Address
            </label>
            <input
              type="email"
              value={form.email}
              disabled
              className={inputClass}
              placeholder="Email"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" /> Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              disabled={!editing || isLoading}
              className={inputClass}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" /> Address
            </label>
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              disabled={!editing || isLoading}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Enter your address"
            />
          </div>

          {editing && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          {!changingPassword ? (
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Lock className="h-4 w-4" /> Change Password
            </button>
          ) : (
            <button
              onClick={() => setChangingPassword(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {changingPassword && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                disabled={isLoading}
                className={inputClass}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={isLoading}
                className={inputClass}
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
              Update Password
            </button>
          </div>
        )}

        {!changingPassword && (
          <p className="text-sm text-gray-500">Click "Change Password" to update your password.</p>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
};

export default Profile;
