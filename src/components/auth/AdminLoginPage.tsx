import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Car
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface AdminLoginPageProps {
  onLoginSuccess: (adminUser: { email: string; name: string; role: string }) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@ridebhai.com');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (
        (email === 'admin@ridebhai.com' && password === 'Admin@2026') ||
        (email.includes('@') && password.length >= 6)
      ) {
        setIsLoading(false);
        onLoginSuccess({
          email,
          name: 'Super Admin',
          role: 'Platform Administrator',
        });
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid admin credentials. Use the Demo Credentials below.');
      }
    }, 500);
  };

  const handleFillDemo = () => {
    setEmail('admin@ridebhai.com');
    setPassword('Admin@2026');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6EE] via-[#FFF5F0] to-[#FAF6EE] text-[#1C1C1C] flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-[#F15A24] selection:text-white">
      {/* Soft decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F15A24]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#00A86B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card Container with Website Theme */}
      <div className="w-full max-w-md bg-white border border-[#EBE5D8] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-scale-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-1.5 bg-[#FAF6EE] rounded-2xl mb-1 border border-[#EBE5D8]">
            <Logo size="md" showTagline={false} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] border border-[#FFD8CB] text-[#F15A24] text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Operations & KYC Console</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1C1C1C] font-display">
              Admin Portal Access
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Secure sign-in for driver verification, boost packages & dispute management.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
              Admin Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#6B6B6B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ridebhai.com"
                className="w-full text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] pl-10 pr-3.5 py-3.5 rounded-2xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1.5">
              Admin Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#6B6B6B]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] pl-10 pr-10 py-3.5 rounded-2xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Security status */}
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#FAF6EE] border-[#EBE5D8] text-[#F15A24] focus:ring-0 accent-[#F15A24]"
              />
              <span className="font-bold text-[#1C1C1C]">Remember session</span>
            </label>
            <span className="text-[11px] text-[#00A86B] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              256-Bit SSL Secured
            </span>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#F15A24] to-[#FF7A45] hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active-press disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper Box (Website Style) */}
        <div className="p-4 bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#F15A24] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Demo Access
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-extrabold bg-[#F15A24] text-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-all active-press"
            >
              Auto Fill
            </button>
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            Email: <code className="text-[#1C1C1C] font-bold font-mono">admin@ridebhai.com</code> | Password: <code className="text-[#1C1C1C] font-bold font-mono">Admin@2026</code>
          </p>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#6B6B6B] border-t border-[#F2ECE1] pt-4">
          <span>Authorized Regional Operations & Support Staff Only</span>
        </div>
      </div>
    </div>
  );
};
