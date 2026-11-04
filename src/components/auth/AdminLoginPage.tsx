import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ButtonSpinner } from '../common/AdminLoading';
import { api, setToken } from '../../lib/api';

interface AdminLoginPageProps {
  onLoginSuccess: (admin: { phone: string; email: string; name: string; role: string }) => void;
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await api<{
        token: string;
        isAdmin: boolean;
        user: { phone?: string; email?: string; name?: string; role?: string };
      }>('/auth/admin/login', {
        method: 'POST',
        json: { email: email.trim(), password },
      });

      if (!data.isAdmin) {
        setError('Access denied: account does not have administrator privileges.');
        return;
      }

      setToken(data.token);
      onLoginSuccess({
        phone: data.user.phone || '9999999999',
        email: data.user.email || email.trim(),
        name: data.user.name || 'Ride Bhai Admin',
        role: data.user.role || 'super_admin',
      });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#F3EEE4] lg:grid lg:grid-cols-2 lg:overflow-hidden font-sans">
      {/* Left side: ONLY BIG LOGO */}
      <aside className="relative hidden overflow-hidden bg-[#1C1C1C] px-10 py-10 text-white lg:flex lg:h-screen lg:flex-col lg:items-center lg:justify-center">
        {/* Subtle orange ambient glow */}
        <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-[#F15A24]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-[#F15A24]/15 blur-3xl" />

        <div className="relative flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6 drop-shadow-2xl">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="admin-big-pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF8A00" />
                  <stop offset="100%" stopColor="#E8380D" />
                </linearGradient>
              </defs>
              <path
                d="M50 2C24.59 2 4 22.59 4 48c0 31.8 41.5 67.2 43.3 68.7a4.2 4.2 0 0 0 5.4 0C54.5 115.2 96 79.8 96 48 96 22.59 75.41 2 50 2z"
                fill="url(#admin-big-pin-grad)"
              />
              <g transform="translate(24, 25) scale(0.52)">
                <path
                  d="M85.4 34.6L74.8 14.2C72.7 10.3 68.6 8 64.2 8H35.8c-4.4 0-8.5 2.3-10.6 6.2L14.6 34.6C8.5 36.8 4 42.6 4 49.5V76c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6v-4h56v4c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6V49.5c0-6.9-4.5-12.7-10.6-14.9z"
                  fill="#FAF6EE"
                />
                <path
                  d="M26.2 32l6.7-14.8c1.1-2.4 3.4-3.9 6-3.9h22.2c2.6 0 4.9 1.5 6 3.9L73.8 32H26.2z"
                  fill="url(#admin-big-pin-grad)"
                />
                <circle cx="23" cy="52" r="5.5" fill="#FFE3A8" />
                <circle cx="77" cy="52" r="5.5" fill="#FFE3A8" />
                <rect x="36" y="52" width="28" height="3.5" rx="1.75" fill="url(#admin-big-pin-grad)" />
              </g>
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white font-display">
            <span className="text-[#F15A24]">Ride</span>bhai
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-white/50 font-bold">
            Admin Console
          </p>
        </div>
      </aside>

      {/* Right side: SIMPLE EMAIL & PASSWORD LOGIN */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10 lg:h-screen lg:overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Mobile-only header logo */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Logo size="md" />
            <span className="rounded-full bg-[#F15A24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F15A24]">
              Admin
            </span>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#E8E0D0] bg-white shadow-[0_24px_60px_rgba(28,28,28,0.08)]">
            <div className="border-b border-[#F0EAE0] px-7 py-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0EB] border border-[#FFD8CB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F15A24]">
                  <Shield size={12} />
                  Secure Admin Login
                </span>
              </div>
              <h2 className="mt-4 text-[26px] font-black tracking-tight text-[#1C1C1C]">
                Sign In
              </h2>
              <p className="mt-1 text-xs text-[#6B6560]">
                Enter your admin email and password to access the panel.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-7 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478] mb-1.5">
                  Admin Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#8C8479] pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="admin@ridebhai.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E8E0D0] text-sm font-bold text-[#1C1C1C] placeholder:text-[#8C8479] focus:bg-white focus:border-[#F15A24] focus:ring-4 focus:ring-[#F15A24]/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478] mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#8C8479] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E8E0D0] text-sm font-bold text-[#1C1C1C] placeholder:text-[#8C8479] focus:bg-white focus:border-[#F15A24] focus:ring-4 focus:ring-[#F15A24]/10 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-[#8C8479] hover:text-[#1C1C1C] transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] to-[#FF7A45] text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(241,90,36,0.28)] hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ButtonSpinner />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
