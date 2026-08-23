import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  CreditCard,
  FileText,
  LifeBuoy,
  RotateCcw,
  Lock,
  LogOut,
  RefreshCw,
  User,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Logo } from './components/common/Logo';
import { useAppStore } from './store/useAppStore';
import { AdminLoginPage } from './components/auth/AdminLoginPage';

// View Pages
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AllBookingsView } from './components/admin/AllBookingsView';
import { AllDriversView } from './components/admin/AllDriversView';
import { AllUsersView } from './components/admin/AllUsersView';
import { AllVehiclesView } from './components/admin/AllVehiclesView';
import { DriverVerificationQueue } from './components/admin/DriverVerificationQueue';
import { PackageManager } from './components/admin/PackageManager';
import { DriverBoostStatusList } from './components/admin/DriverBoostStatusList';
import { SettlePaymentsView } from './components/admin/SettlePaymentsView';
import { PaymentHistoryView } from './components/admin/PaymentHistoryView';
import { SupportTicketsView } from './components/admin/SupportTicketsView';
import { RefundListView } from './components/admin/RefundListView';

export type AdminTab =
  | 'dashboard'
  | 'all-bookings'
  | 'all-drivers'
  | 'all-users'
  | 'all-vehicles'
  | 'kyc-queue'
  | 'boost-packages'
  | 'settle-payments'
  | 'payment-history'
  | 'support-tickets'
  | 'refund-list';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('ridebhai_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { drivers, bookings, disputes, resetDemoData } = useAppStore();

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('ridebhai_admin_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('ridebhai_admin_session');
  };

  // If not logged in, render the secure Admin Login Page in Website Theme
  if (!adminUser) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingKycCount = drivers.filter((d) => d.status === 'pending_verification').length;
  const openDisputesCount = disputes.filter((d) => d.status === 'open').length;

  const menuSections = [
    {
      title: 'Core Platform',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'all-bookings' as AdminTab, label: 'All Bookings', icon: CalendarCheck, badge: bookings.length },
        { id: 'all-drivers' as AdminTab, label: 'All Drivers', icon: Car, badge: drivers.length },
        { id: 'all-users' as AdminTab, label: 'All Users', icon: Users },
        { id: 'all-vehicles' as AdminTab, label: 'All Vehicles', icon: Sparkles },
      ],
    },
    {
      title: 'Verification & Monetization',
      items: [
        {
          id: 'kyc-queue' as AdminTab,
          label: 'KYC Queue',
          icon: ShieldCheck,
          badge: pendingKycCount,
          badgeColor: 'bg-[#F15A24] text-white',
        },
        { id: 'boost-packages' as AdminTab, label: 'Boost Packages', icon: PackageCheck },
      ],
    },
    {
      title: 'Finance & Payments',
      items: [
        {
          id: 'settle-payments' as AdminTab,
          label: 'Settle Up Payments',
          icon: CreditCard,
          badge: '3 Pending',
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        { id: 'payment-history' as AdminTab, label: 'All Payment History', icon: FileText },
        {
          id: 'refund-list' as AdminTab,
          label: 'Refund List',
          icon: RotateCcw,
          badge: '2 Open',
          badgeColor: 'bg-rose-100 text-rose-700',
        },
      ],
    },
    {
      title: 'Customer Support',
      items: [
        {
          id: 'support-tickets' as AdminTab,
          label: 'All Tickets',
          icon: LifeBuoy,
          badge: openDisputesCount || 2,
          badgeColor: 'bg-red-500 text-white',
        },
      ],
    },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Platform Analytics & KPIs';
      case 'all-bookings':
        return 'All Ride Bookings';
      case 'all-drivers':
        return 'All Driver Partners';
      case 'all-users':
        return 'All Passenger Riders';
      case 'all-vehicles':
        return 'Fleet & Registered Vehicles';
      case 'kyc-queue':
        return 'Driver KYC Verification Queue';
      case 'boost-packages':
        return 'Monetization Boost Packages';
      case 'settle-payments':
        return 'Settle Up Driver Payouts';
      case 'payment-history':
        return 'Complete Payment History';
      case 'support-tickets':
        return 'Support & Helpdesk Tickets';
      case 'refund-list':
        return 'Passenger Refund Records';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1C1C1C] flex font-sans selection:bg-[#F15A24] selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#EBE5D8] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-[#F2ECE1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="md" showTagline={false} />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-[#FAF6EE] text-[#6B6B6B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Sections Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
                  {sec.title}
                </p>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between active-press ${
                          isActive
                            ? 'bg-gradient-to-r from-[#F15A24] to-[#FF7A45] text-white shadow-md'
                            : 'text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#FAF6EE]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B6B6B]'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-[#FAF6EE] text-[#6B6B6B] border border-[#EBE5D8]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Admin User Footer Box */}
          <div className="p-4 border-t border-[#F2ECE1] bg-[#FAF6EE]/60 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center font-extrabold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-extrabold text-[#1C1C1C] truncate">{adminUser.name}</p>
                <p className="text-[10px] text-[#6B6B6B] truncate font-mono">{adminUser.email}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset entire demo state to initial seed data?')) {
                    resetDemoData();
                  }
                }}
                className="flex-1 py-1.5 bg-white hover:bg-[#FAF6EE] text-[#6B6B6B] hover:text-[#1C1C1C] text-[11px] font-bold rounded-xl border border-[#EBE5D8] flex items-center justify-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-extrabold rounded-xl border border-red-200 flex items-center justify-center gap-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* MAIN VIEWPORT AREA (Pushed by fixed sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBE5D8] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FAF6EE] text-[#1C1C1C] border border-[#EBE5D8] flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-extrabold text-[#1C1C1C] font-display truncate">
                {getPageTitle()}
              </h1>
              <p className="text-[11px] text-[#6B6B6B] hidden sm:block truncate">
                Ride Bhai Regional Control & Compliance Desk
              </p>
            </div>
          </div>

          {/* Right Navbar Admin User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Indicator */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-[10px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Live Console</span>
            </div>

            {/* Admin User Info Pill */}
            <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl px-3 py-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-[#FFD8CB]">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-[#1C1C1C] leading-tight">{adminUser.name}</p>
                <p className="text-[10px] text-[#6B6B6B] font-mono leading-tight">{adminUser.email}</p>
              </div>
            </div>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset entire demo state to initial seed data?')) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              className="py-2 px-3.5 bg-white hover:bg-[#FAF6EE] text-[#1C1C1C] text-xs font-extrabold rounded-2xl border border-[#EBE5D8] flex items-center gap-1.5 shadow-xs transition-all active-press"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6B6B6B]" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-3.5 bg-[#FFF0EB] hover:bg-[#ffe0d6] text-[#D64545] text-xs font-extrabold rounded-2xl border border-[#FFD8CB] flex items-center gap-1.5 shadow-2xs transition-all active-press"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D64545]" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#EBE5D8] shadow-card">
            {activeTab === 'dashboard' && <AdminDashboard onSwitchRole={() => {}} />}
            {activeTab === 'all-bookings' && <AllBookingsView />}
            {activeTab === 'all-drivers' && <AllDriversView />}
            {activeTab === 'all-users' && <AllUsersView />}
            {activeTab === 'all-vehicles' && <AllVehiclesView />}
            {activeTab === 'kyc-queue' && <DriverVerificationQueue />}
            {activeTab === 'boost-packages' && (
              <div className="space-y-8">
                <PackageManager />
                <div className="pt-6 border-t border-[#F2ECE1]">
                  <DriverBoostStatusList />
                </div>
              </div>
            )}
            {activeTab === 'settle-payments' && <SettlePaymentsView />}
            {activeTab === 'payment-history' && <PaymentHistoryView />}
            {activeTab === 'support-tickets' && <SupportTicketsView />}
            {activeTab === 'refund-list' && <RefundListView />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#EBE5D8] py-4 text-center text-xs text-[#6B6B6B]">
          <span>Ride Bhai Operations Console v2.0 • Authorized Personnel Only</span>
        </footer>
      </div>
    </div>
  );
}
