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
  Award,
  Building,
  MapPin
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

// Travel Agency Views
import { AgencyVerificationQueue } from './components/admin/AgencyVerificationQueue';
import { AllAgenciesView } from './components/admin/AllAgenciesView';
import { AgencyTourPostsManager } from './components/admin/AgencyTourPostsManager';
import { AgencyPackageManager } from './components/admin/AgencyPackageManager';

export type AdminTab =
  | 'dashboard'
  | 'all-bookings'
  | 'all-drivers'
  | 'all-users'
  | 'all-vehicles'
  | 'kyc-queue'
  | 'agency-kyc-queue'
  | 'all-agencies'
  | 'agency-tour-posts'
  | 'agency-packages'
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
  const { drivers, bookings, disputes, agencies, agencyTripPosts, resetDemoData } = useAppStore();

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

  const pendingDriverKycCount = drivers.filter((d) => d.status === 'pending_verification').length;
  const pendingAgencyKycCount = agencies.filter((a) => a.status === 'pending_verification').length;
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
      title: 'Travel Agency Operations',
      items: [
        {
          id: 'agency-kyc-queue' as AdminTab,
          label: 'Agency KYC Queue',
          icon: ShieldCheck,
          badge: pendingAgencyKycCount,
          badgeColor: 'bg-[#F15A24] text-white',
        },
        { id: 'all-agencies' as AdminTab, label: 'All Travel Agencies', icon: Building, badge: agencies.length },
        { id: 'agency-tour-posts' as AdminTab, label: 'Tour Booking Leads', icon: MapPin, badge: agencyTripPosts.length },
        { id: 'agency-packages' as AdminTab, label: 'Agency Posting Plans', icon: PackageCheck },
      ],
    },
    {
      title: 'Driver KYC & Boost',
      items: [
        {
          id: 'kyc-queue' as AdminTab,
          label: 'Driver KYC Queue',
          icon: ShieldCheck,
          badge: pendingDriverKycCount,
          badgeColor: 'bg-[#F15A24] text-white',
        },
        { id: 'boost-packages' as AdminTab, label: 'Driver Boost Packages', icon: PackageCheck },
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
        return 'Registered Vehicle Fleet';
      case 'agency-kyc-queue':
        return 'Travel Agency KYC Verification Queue';
      case 'all-agencies':
        return 'Partner Travel Agencies';
      case 'agency-tour-posts':
        return 'Agency Tour Booking Leads Marketplace';
      case 'agency-packages':
        return 'Travel Agency Posting Packages';
      case 'kyc-queue':
        return 'Driver KYC Verification Queue';
      case 'boost-packages':
        return 'Driver Boost Packages & Active Statuses';
      case 'settle-payments':
        return 'Payment Settlement & Driver Payouts';
      case 'payment-history':
        return 'Platform Transaction Log';
      case 'support-tickets':
        return 'Support Tickets & Grievances';
      case 'refund-list':
        return 'Passenger Refund Queue';
      default:
        return 'Operations Dashboard';
    }
  };

  return (
    <div className="h-screen bg-[#F4F1EA] text-[#1C1C1C] flex font-sans selection:bg-[#F15A24] selection:text-white overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1C1C1C] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 h-screen lg:static lg:h-screen lg:translate-x-0 flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo size="sm" showTagline={false} variant="light" />
            <span className="px-2 py-0.5 bg-[#F15A24] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md">
              Operations
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-extrabold tracking-wider text-white/40 uppercase">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active-press ${
                      isActive
                        ? 'bg-[#F15A24] text-white shadow-md font-extrabold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF7A45]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-white text-[#F15A24]' : 'bg-white/10 text-white/80')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBE5D8] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs gap-4 flex-shrink-0">
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
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-[10px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Live Console</span>
            </div>

            <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl px-3 py-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-[#FFD8CB]">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-[#1C1C1C] leading-tight">{adminUser.name}</p>
                <p className="text-[10px] text-[#6B6B6B] font-mono leading-tight">{adminUser.email}</p>
              </div>
            </div>

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

        {/* Dynamic Page Content - Independent Scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#EBE5D8] shadow-card">
            {activeTab === 'dashboard' && <AdminDashboard onSwitchRole={() => {}} />}
            {activeTab === 'all-bookings' && <AllBookingsView />}
            {activeTab === 'all-drivers' && <AllDriversView />}
            {activeTab === 'all-users' && <AllUsersView />}
            {activeTab === 'all-vehicles' && <AllVehiclesView />}
            {activeTab === 'agency-kyc-queue' && <AgencyVerificationQueue />}
            {activeTab === 'all-agencies' && <AllAgenciesView />}
            {activeTab === 'agency-tour-posts' && <AgencyTourPostsManager />}
            {activeTab === 'agency-packages' && <AgencyPackageManager />}
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

          <footer className="bg-white rounded-2xl border border-[#EBE5D8] py-4 text-center text-xs text-[#6B6B6B]">
            <span>Ride Bhai Operations Console v2.0 • Authorized Personnel Only</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
