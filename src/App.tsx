import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  MapPin,
  Phone,
  Lock,
  LogOut,
  User,
  Users,
  Radio,
  CreditCard,
  Sparkles,
  MessageCircle,
  Settings,
  FileText,
  Menu,
  X,
  IdCard,
  Tags,
} from 'lucide-react';
import { Logo } from './components/common/Logo';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { AdminOpsHome } from './components/admin/AdminOpsHome';
import { InquiriesDesk } from './components/admin/InquiriesDesk';
import { AdminChatsView } from './components/admin/AdminChatsView';
import { AllCarListingsView } from './components/admin/AllCarListingsView';
import { AgencyTourPostsManager } from './components/admin/AgencyTourPostsManager';
import { AllUsersView } from './components/admin/AllUsersView';
import { AllDriversView } from './components/admin/AllDriversView';
import { AllVehiclesView } from './components/admin/AllVehiclesView';
import { CarCatalogView } from './components/admin/CarCatalogView';
import { KycDesk, type KycKind } from './components/admin/KycDesk';
import { AllPaymentsView, PlansCatalogView } from './components/admin/PlansPaymentsView';
import { AdminProfileSettings } from './components/admin/AdminProfileSettings';
import { LegalPagesView } from './components/admin/LegalPagesView';
import { api, getToken, setToken } from './lib/api';
import type { AdminTab } from './lib/tabs';
import { SessionSplash } from './components/common/AdminLoading';

export type { AdminTab };

interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

export function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [kycKind, setKycKind] = useState<KycKind>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const boot = async () => {
      if (!getToken()) {
        setChecking(false);
        return;
      }
      try {
        const me = await api<{ user: any; isAdmin?: boolean }>('/auth/me');
        if (!me.isAdmin) {
          setToken(null);
          setChecking(false);
          return;
        }
        setAdminUser({
          id: me.user?.id,
          name: me.user?.name || 'Ride Bhai Admin',
          email: me.user?.email || 'admin@ridebhai.in',
          phone: me.user?.phone,
          role: 'Platform Administrator',
        });
      } catch {
        setToken(null);
      } finally {
        setChecking(false);
      }
    };
    boot();
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.removeItem('ridebhai_admin_session');
  };

  const handleLogout = () => {
    setAdminUser(null);
    setToken(null);
    localStorage.removeItem('ridebhai_admin_session');
  };

  if (checking) {
    return <SessionSplash />;
  }

  if (!adminUser) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const menu: { id: AdminTab; label: string; icon: typeof Car }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kyc', label: 'KYC', icon: ShieldCheck },
    { id: 'users-verified', label: 'All users verified', icon: Users },
    { id: 'drivers-verified', label: 'All driver verified', icon: IdCard },
    { id: 'cars-verified', label: 'All cars verified', icon: Car },
    { id: 'car-catalog', label: 'Car catalog', icon: Tags },
    { id: 'live-cars', label: 'Live cars', icon: Radio },
    { id: 'agency-tour-posts', label: 'All tours', icon: MapPin },
    { id: 'deals', label: 'Inquiries', icon: Phone },
    { id: 'chats', label: 'Direct chats', icon: MessageCircle },
    { id: 'plans', label: 'Plans', icon: Sparkles },
    { id: 'payments', label: 'Payment', icon: CreditCard },
    { id: 'legal', label: 'Website', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const titles: Record<AdminTab, string> = {
    dashboard: 'Operations dashboard',
    kyc: 'KYC',
    'users-verified': 'All users verified',
    'drivers-verified': 'All driver verified',
    'cars-verified': 'All cars verified',
    'car-catalog': 'Car catalog',
    'live-cars': 'Live cars',
    'agency-tour-posts': 'All tours',
    deals: 'Inquiries',
    chats: 'Direct chats',
    plans: 'Plans',
    payments: 'Payment',
    legal: 'Website content',
    settings: 'Settings',
  };

  return (
    <div className="h-screen bg-[#F4F1EA] text-[#1C1C1C] flex font-sans overflow-hidden">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1C1C1C] text-white flex flex-col border-r border-white/10 h-screen lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showTagline={false} variant="light" />
            <span className="px-2 py-0.5 bg-[#F15A24] text-white font-extrabold text-[9px] uppercase rounded-md">
              Live
            </span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                  isActive ? 'bg-[#F15A24] text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 bg-white/95 border-b border-[#EBE5D8] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FAF6EE] border border-[#EBE5D8]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-extrabold truncate">{titles[activeTab]}</h1>
              <p className="text-[11px] text-[#6B6B6B] hidden sm:block">
                {activeTab === 'dashboard'
                  ? 'Charts for KYC, listings, inquiries, chats and payments'
                  : 'Users, KYC, vehicles, live cars and tours'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-[10px] font-extrabold">
              <Lock className="w-3 h-3" /> Live console
            </div>
            <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl px-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-extrabold leading-tight">{adminUser.name}</p>
                <p className="text-[10px] text-[#6B6B6B]">{adminUser.phone || adminUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-3.5 bg-[#FFF0EB] text-[#D64545] text-xs font-extrabold rounded-2xl border border-[#FFD8CB] flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'dashboard' ? (
            <AdminOpsHome
              onOpen={(tab, kind) => {
                if (kind) setKycKind(kind);
                setActiveTab(tab);
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#EBE5D8] shadow-card">
              {activeTab === 'kyc' && <KycDesk kind={kycKind} onKindChange={setKycKind} />}
              {activeTab === 'users-verified' && <AllUsersView verifiedOnly />}
              {activeTab === 'drivers-verified' && <AllDriversView verifiedOnly />}
              {activeTab === 'cars-verified' && <AllVehiclesView verifiedOnly />}
              {activeTab === 'car-catalog' && <CarCatalogView />}
              {activeTab === 'live-cars' && <AllCarListingsView />}
              {activeTab === 'agency-tour-posts' && <AgencyTourPostsManager />}
              {activeTab === 'deals' && <InquiriesDesk />}
              {activeTab === 'chats' && <AdminChatsView />}
              {activeTab === 'plans' && <PlansCatalogView />}
              {activeTab === 'payments' && <AllPaymentsView />}
              {activeTab === 'legal' && <LegalPagesView />}
              {activeTab === 'settings' && (
                <AdminProfileSettings adminUser={adminUser} onUpdated={setAdminUser} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
