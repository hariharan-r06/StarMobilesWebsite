import React, { useState, useRef } from 'react';
import { X, Eye, EyeOff, Phone, Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'phone-login' | 'forgot-password';

const LoginModal = ({ open, onClose }: LoginModalProps) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmitting = useRef(false); // Ref to immediately block duplicate submissions
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const { login, loginWithPhone, signup, forgotPassword } = useAuth();

    if (!open) return null;

    const resetForm = () => {
        setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setShowPassword(false);
    };

    const handleClose = () => {
        resetForm();
        setMode('login');
        setLoginMethod('email');
        onClose();
    };

    // Email Login
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting.current || isLoading) return;

        isSubmitting.current = true;
        setIsLoading(true);

        try {
            const res = await login(form.email, form.password);
            if (res.success) {
                toast.success(res.message);
                resetForm();
                handleClose();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            isSubmitting.current = false;
            setIsLoading(false);
        }
    };

    // Phone Login
    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting.current || isLoading) return;

        if (form.phone.length !== 10) {
            toast.error('Enter a valid 10-digit phone number');
            return;
        }

        isSubmitting.current = true;
        setIsLoading(true);

        try {
            const res = await loginWithPhone(form.phone, form.password);
            if (res.success) {
                toast.success(res.message);
                resetForm();
                handleClose();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            isSubmitting.current = false;
            setIsLoading(false);
        }
    };

    // Signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission using ref (immediate check)
        if (isSubmitting.current || isLoading) return;

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (!form.email && !form.phone) {
            toast.error('Email or phone number is required');
            return;
        }
        if (form.phone && form.phone.length !== 10) {
            toast.error('Enter a valid 10-digit phone number');
            return;
        }

        isSubmitting.current = true;
        setIsLoading(true);

        try {
            const res = await signup({
                name: form.name,
                email: form.email || undefined,
                phone: form.phone || undefined,
                password: form.password
            });

            if (res.success) {
                toast.success(res.message);
                resetForm(); // Clear form data
                // Auto-close if user is logged in, otherwise switch to login
                if (res.message.includes('successfully')) {
                    handleClose();
                } else {
                    setMode('login');
                }
            } else if (res.message) {
                // Only show error if there's a message (skip for silent abort errors)
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            isSubmitting.current = false;
            setIsLoading(false);
        }
    };

    // Forgot Password
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        if (!form.email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const res = await forgotPassword(form.email);
            if (res.success) {
                toast.success(res.message);
                resetForm();
                setMode('login');
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const renderHeader = () => {
        const headers: Record<AuthMode, { title: string; subtitle: string }> = {
            'login': { title: 'Welcome Back!', subtitle: 'Login to your Star Mobiles account' },
            'signup': { title: 'Create Account', subtitle: 'Sign up for a new account' },
            'phone-login': { title: 'Phone Login', subtitle: 'Login with your phone number' },
            'forgot-password': { title: 'Forgot Password?', subtitle: 'Enter your email to reset password' }
        };

        return (
            <div className="mb-8 text-center">
                {mode !== 'login' && (
                    <button
                        onClick={() => { setMode('login'); resetForm(); }}
                        className="absolute left-4 top-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    {mode === 'forgot-password' ? (
                        <KeyRound className="h-8 w-8 text-white" />
                    ) : (
                        <img src="/logo.png" alt="Star Mobiles" className="h-10 w-10 object-contain" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{headers[mode].title}</h2>
                <p className="mt-2 text-sm text-gray-500">{headers[mode].subtitle}</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
            <div
                className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {renderHeader()}

                {/* Login Form */}
                {mode === 'login' && (
                    <>
                        {/* Login Method Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setLoginMethod('email')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Mail className="h-4 w-4" /> Email
                            </button>
                            <button
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Phone className="h-4 w-4" /> Phone
                            </button>
                        </div>

                        <form onSubmit={loginMethod === 'email' ? handleEmailLogin : handlePhoneLogin} className="space-y-4">
                            {loginMethod === 'email' ? (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                                    <input
                                        className={inputClass}
                                        placeholder="Enter your email"
                                        type="email"
                                        required
                                        disabled={isLoading}
                                        value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center px-4 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200">+91</span>
                                        <input
                                            className={inputClass}
                                            placeholder="10-digit phone number"
                                            type="tel"
                                            maxLength={10}
                                            required
                                            disabled={isLoading}
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
                                <div className="relative">
                                    <input
                                        className={inputClass}
                                        placeholder="Enter your password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        disabled={isLoading}
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {loginMethod === 'email' && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('forgot-password'); resetForm(); }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Login
                            </button>
                        </form>
                    </>
                )}

                {/* Signup Form */}
                {mode === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name *</label>
                            <input
                                className={inputClass}
                                placeholder="Enter your full name"
                                required
                                disabled={isLoading}
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                            <input
                                className={inputClass}
                                placeholder="Enter your email"
                                type="email"
                                disabled={isLoading}
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
                            <div className="flex gap-2">
                                <span className="flex items-center px-4 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200">+91</span>
                                <input
                                    className={inputClass}
                                    placeholder="10-digit phone number"
                                    type="tel"
                                    maxLength={10}
                                    disabled={isLoading}
                                    value={form.phone}
                                    onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email or phone number is required</p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Password *</label>
                            <div className="relative">
                                <input
                                    className={inputClass}
                                    placeholder="Min 6 characters"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    disabled={isLoading}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm Password *</label>
                            <input
                                className={inputClass}
                                placeholder="Re-enter your password"
                                type="password"
                                required
                                disabled={isLoading}
                                value={form.confirmPassword}
                                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Account
                        </button>
                    </form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                            <input
                                className={inputClass}
                                placeholder="Enter your registered email"
                                type="email"
                                required
                                disabled={isLoading}
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            />
                            <p className="text-xs text-gray-400 mt-2">We'll send you a link to reset your password</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </button>
                    </form>
                )}

                {/* Footer Links */}
                {mode !== 'forgot-password' && (
                    <p className="mt-6 text-center text-sm text-gray-500">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); resetForm(); }}
                            className="font-bold text-blue-600 hover:text-blue-700"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
