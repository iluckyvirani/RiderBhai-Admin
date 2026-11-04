import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Car,
  CreditCard,
  IdCard,
  MapPin,
  MessageCircle,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import { api, getToken } from '../../lib/api';
import type { AdminTab } from '../../lib/tabs';
import type { KycKind } from './KycDesk';
import { AdminPageSkeleton } from '../common/AdminLoading';

type Overview = {
  users: { total: number; incomplete: number; pending: number; verified: number; rejected: number };
  drivers: { pending: number; verified: number; rejected: number };
  vehicles: { pending: number; verified: number; rejected: number };
  cars: { live: number; hidden: number };
  tours: { active: number; closed: number; cancelled: number };
  inquiries: {
    total: number;
    pending: number;
    open: number;
    success: number;
    cancelled: number;
    car: number;
    tour: number;
  };
  chats: { total: number; car: number; tour: number };
  payments: { active: number; expired: number; revenue: number; totalRevenue: number };
  trend: { day: string; label: string; users: number; cars: number; tours: number; inquiries: number; chats: number }[];
};

type Stats = {
  users: number;
  pendingKyc: number;
  drivers: number;
  vehicles: number;
  pendingDeals: number;
  liveCars: number;
  liveTours: number;
  activePlans: number;
  chats: number;
  directDeals: number;
  overview?: Overview;
};

const ORANGE = '#F15A24';
const CHARCOAL = '#1C1C1C';
const GREEN = '#2E9E5B';
const AMBER = '#E8A317';
const RED = '#D64545';
const MUTED = '#8A8478';
const CREAM = '#E8A86B';

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-[#1C1C1C] px-3 py-2 text-[11px] text-white shadow-lg">
      {label && <p className="mb-1 font-extrabold">{label}</p>}
      {payload.map((item: any) => (
        <p key={String(item.dataKey || item.name)} className="font-bold" style={{ color: item.color || '#fff' }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  hint,
  onOpen,
  children,
}: {
  title: string;
  hint: string;
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#EBE5D8] bg-white p-4 sm:p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1C1C]">{title}</h3>
          <p className="mt-0.5 text-[11px] font-bold text-[#8A8478]">{hint}</p>
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 rounded-xl bg-[#FAF6EE] px-2.5 py-1 text-[10px] font-extrabold text-[#F15A24]"
          >
            Open
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export const AdminOpsHome: React.FC<{ onOpen: (tab: AdminTab, kycKind?: KycKind) => void }> = ({ onOpen }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    api<Stats>('/admin/stats')
      .then(setStats)
      .catch((err: any) => setError(err?.message || 'Could not load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const ov = stats?.overview;
  const kycPending =
    (ov?.users.pending || stats?.pendingKyc || 0) + (ov?.drivers.pending || 0) + (ov?.vehicles.pending || 0);

  const cards: {
    key: string;
    tab: AdminTab;
    kind?: KycKind;
    label: string;
    value: string | number;
    sub: string;
    icon: typeof Car;
  }[] = [
    {
      key: 'kyc',
      tab: 'kyc',
      kind: 'users',
      label: 'KYC queue',
      value: kycPending,
      sub: 'Users, drivers, vehicles pending',
      icon: ShieldCheck,
    },
    {
      key: 'users',
      tab: 'users-verified',
      label: 'Users verified',
      value: ov?.users.verified ?? stats?.users ?? '—',
      sub: `${ov?.users.total ?? stats?.users ?? 0} accounts total`,
      icon: Users,
    },
    {
      key: 'drivers',
      tab: 'drivers-verified',
      label: 'Drivers verified',
      value: ov?.drivers.verified ?? stats?.drivers ?? '—',
      sub: `${ov?.drivers.pending || 0} still pending`,
      icon: IdCard,
    },
    {
      key: 'cars-v',
      tab: 'cars-verified',
      label: 'Cars verified',
      value: ov?.vehicles.verified ?? stats?.vehicles ?? '—',
      sub: `${ov?.vehicles.pending || 0} RC pending`,
      icon: Truck,
    },
    {
      key: 'live',
      tab: 'live-cars',
      label: 'Live cars',
      value: ov?.cars.live ?? stats?.liveCars ?? '—',
      sub: `${ov?.cars.hidden || 0} hidden from website`,
      icon: Radio,
    },
    {
      key: 'tours',
      tab: 'agency-tour-posts',
      label: 'Live tours',
      value: ov?.tours.active ?? stats?.liveTours ?? '—',
      sub: `${ov?.tours.closed || 0} closed · ${ov?.tours.cancelled || 0} cancelled`,
      icon: MapPin,
    },
    {
      key: 'inq',
      tab: 'deals',
      label: 'Inquiries',
      value: ov?.inquiries.pending ?? stats?.pendingDeals ?? '—',
      sub: `${ov?.inquiries.car || 0} car · ${ov?.inquiries.tour || 0} tour`,
      icon: Phone,
    },
    {
      key: 'chats',
      tab: 'chats',
      label: 'Direct chats',
      value: ov?.chats.total ?? stats?.directDeals ?? '—',
      sub: `${ov?.chats.car || 0} car · ${ov?.chats.tour || 0} tour`,
      icon: MessageCircle,
    },
    {
      key: 'plans',
      tab: 'subscribers',
      label: 'Active plans',
      value: ov?.payments.active ?? stats?.activePlans ?? '—',
      sub: `${ov?.payments.expired || 0} expired`,
      icon: Sparkles,
    },
    {
      key: 'pay',
      tab: 'payments',
      label: 'Plan revenue',
      value: ov ? money(ov.payments.totalRevenue) : '—',
      sub: `${money(ov?.payments.revenue || 0)} on live plans`,
      icon: CreditCard,
    },
  ];

  const kycBars = [
    {
      name: 'Users',
      Pending: ov?.users.pending || 0,
      Verified: ov?.users.verified || 0,
      Rejected: ov?.users.rejected || 0,
    },
    {
      name: 'Drivers',
      Pending: ov?.drivers.pending || 0,
      Verified: ov?.drivers.verified || 0,
      Rejected: ov?.drivers.rejected || 0,
    },
    {
      name: 'Vehicles',
      Pending: ov?.vehicles.pending || 0,
      Verified: ov?.vehicles.verified || 0,
      Rejected: ov?.vehicles.rejected || 0,
    },
  ];

  const listingBars = [
    { name: 'Live cars', value: ov?.cars.live || 0, color: ORANGE },
    { name: 'Hidden cars', value: ov?.cars.hidden || 0, color: MUTED },
    { name: 'Active tours', value: ov?.tours.active || 0, color: GREEN },
    { name: 'Closed tours', value: ov?.tours.closed || 0, color: CHARCOAL },
    { name: 'Cancelled tours', value: ov?.tours.cancelled || 0, color: RED },
  ];

  const inquiryStatus = [
    { name: 'Pending', value: ov?.inquiries.pending || 0, color: AMBER },
    { name: 'Open', value: ov?.inquiries.open || 0, color: ORANGE },
    { name: 'Success', value: ov?.inquiries.success || 0, color: GREEN },
    { name: 'Cancelled', value: ov?.inquiries.cancelled || 0, color: RED },
  ];
  const inquiryKind = [
    { name: 'Car inquiries', value: ov?.inquiries.car || 0, color: ORANGE },
    { name: 'Tour inquiries', value: ov?.inquiries.tour || 0, color: CHARCOAL },
  ];
  const chatKind = [
    { name: 'Car chats', value: ov?.chats.car || 0, color: ORANGE },
    { name: 'Tour chats', value: ov?.chats.tour || 0, color: CHARCOAL },
  ];
  const payBars = [
    { name: 'Active', value: ov?.payments.active || 0, color: GREEN },
    { name: 'Expired', value: ov?.payments.expired || 0, color: MUTED },
  ];
  const trend = ov?.trend || [];
  const inquiryPieTotal = inquiryStatus.reduce((sum, row) => sum + row.value, 0);
  const chatPieTotal = chatKind.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">Operations dashboard</h2>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            Live overview of KYC, listings, inquiries, chats and payments. Open a card to jump to that list.
          </p>
        </div>
        <p className="text-[11px] font-extrabold text-[#8A8478]">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</p>}
      {loading ? (
        <AdminPageSkeleton variant="dashboard" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => onOpen(card.tab, card.kind)}
                  className="space-y-2 rounded-3xl border border-[#EBE5D8] bg-white p-4 text-left shadow-card transition-all hover:border-[#F15A24]/60 hover:-translate-y-0.5 active-press"
                >
                  <Icon className="h-4 w-4 text-[#F15A24]" />
                  <p className="text-2xl font-black leading-none">{card.value}</p>
                  <div>
                    <p className="text-[11px] font-extrabold text-[#1C1C1C]">{card.label}</p>
                    <p className="text-[10px] font-bold text-[#8A8478]">{card.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <ChartCard title="14-day activity" hint="New users, car posts, tour posts, Ride Bhai inquiries and direct chats">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
                  <Line type="monotone" dataKey="users" name="Users" stroke={CHARCOAL} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cars" name="Cars" stroke={ORANGE} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tours" name="Tours" stroke={CREAM} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="inquiries" name="Inquiries" stroke={GREEN} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="chats" name="Chats" stroke={AMBER} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard title="KYC by component" hint="Pending, verified and rejected for users, drivers and vehicles" onOpen={() => onOpen('kyc', 'users')}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kycBars} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED, fontWeight: 800 }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
                    <Bar dataKey="Pending" fill={AMBER} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Verified" fill={GREEN} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Rejected" fill={RED} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Live cars & tours" hint="Website-visible posts vs hidden or closed" onOpen={() => onOpen('live-cars')}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listingBars} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: MUTED, fontWeight: 800 }} tickLine={false} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="value" name="Posts" radius={[6, 6, 0, 0]}>
                      {listingBars.map((row) => (
                        <Cell key={row.name} fill={row.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Inquiries" hint="Deal with Ride Bhai — cars vs tours, and status" onOpen={() => onOpen('deals')}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-52">
                  {inquiryPieTotal === 0 ? (
                    <p className="flex h-full items-center justify-center text-xs font-bold text-[#8A8478]">No inquiries yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={inquiryStatus} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={2}>
                          {inquiryStatus.map((row) => (
                            <Cell key={row.name} fill={row.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inquiryKind} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: MUTED, fontWeight: 800 }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                        {inquiryKind.map((row) => (
                          <Cell key={row.name} fill={row.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Direct chats" hint="Message direct only — cars and tours stay separate" onOpen={() => onOpen('chats')}>
              <div className="h-52">
                {chatPieTotal === 0 ? (
                  <p className="flex h-full items-center justify-center text-xs font-bold text-[#8A8478]">No direct chats yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chatKind} dataKey="value" nameKey="name" innerRadius={48} outerRadius={74} paddingAngle={3}>
                        {chatKind.map((row) => (
                          <Cell key={row.name} fill={row.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTip />} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 800 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Plans & payments" hint="Active vs expired subscriptions and collected plan fees" onOpen={() => onOpen('payments')}>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white border border-[#EBE5D8] px-3 py-2">
                  <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Live revenue</p>
                  <p className="text-lg font-black text-[#2E9E5B]">{money(ov?.payments.revenue || 0)}</p>
                </div>
                <div className="rounded-2xl bg-white border border-[#EBE5D8] px-3 py-2">
                  <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">All-time</p>
                  <p className="text-lg font-black">{money(ov?.payments.totalRevenue || 0)}</p>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payBars} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED, fontWeight: 800 }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="value" name="Subscriptions" radius={[6, 6, 0, 0]}>
                      {payBars.map((row) => (
                        <Cell key={row.name} fill={row.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Verified lists" hint="Jump to verified users, drivers or cars">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { tab: 'users-verified' as const, label: 'All users verified', value: ov?.users.verified || 0, icon: Users },
                  { tab: 'drivers-verified' as const, label: 'All driver verified', value: ov?.drivers.verified || 0, icon: IdCard },
                  { tab: 'cars-verified' as const, label: 'All cars verified', value: ov?.vehicles.verified || 0, icon: Car },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => onOpen(item.tab)}
                      className="rounded-2xl border border-[#EBE5D8] bg-white p-3 text-left shadow-2xs hover:border-[#F15A24]/50 transition active-press"
                    >
                      <Icon className="mb-2 h-4 w-4 text-[#F15A24]" />
                      <p className="text-xl font-black">{item.value}</p>
                      <p className="text-[11px] font-extrabold text-[#6B6B6B]">{item.label}</p>
                    </button>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};
