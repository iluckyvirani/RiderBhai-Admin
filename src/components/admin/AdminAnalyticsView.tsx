import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, Car, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AdminAnalyticsView: React.FC = () => {
  const { drivers, carListings, inquiries, agencyTripPosts, agencySubscriptions, agencyPackages } = useAppStore();

  const liveCars = carListings.filter((c) => c.status === 'available').length;
  const liveTours = agencyTripPosts.filter((t) => t.status === 'active').length;
  const planRevenue = agencySubscriptions.reduce((sum, sub) => {
    const pkg = agencyPackages.find((p) => p.id === sub.packageId);
    return sum + (pkg?.price || 0);
  }, 0);

  const monthlyData = [
    { month: 'Apr', rides: 28, revenue: 8997 },
    { month: 'May', rides: 41, revenue: 11996 },
    { month: 'Jun', rides: 55, revenue: 16494 },
    { month: 'Jul', rides: 72, revenue: 20993 },
    { month: 'Aug', rides: 88, revenue: 26991 },
  ];

  const topCorridors = [
    { route: 'Delhi NCR ↔ Jaipur', volume: 88, share: '38%' },
    { route: 'Mumbai ↔ Pune', volume: 64, share: '27%' },
    { route: 'Bangalore ↔ Mysore', volume: 46, share: '19%' },
    { route: 'Delhi NCR ↔ Chandigarh', volume: 38, share: '16%' },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="px-1">
        <h3 className="text-sm font-extrabold text-[#1C1C1C]">Marketplace analytics</h3>
        <p className="text-xs text-[#6B6B6B]">Listings, inquiries, and partner posting-plan revenue</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-3xl border border-[#EBE5D8] shadow-card">
          <div className="flex items-center justify-between text-[#6B6B6B] mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Plan revenue</span>
            <div className="w-6 h-6 rounded-lg bg-[#EBF7F0] text-[#2E9E5B] flex items-center justify-center text-xs font-bold">
              ₹
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1C1C]">₹{planRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-[#2E9E5B] font-bold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +24% vs last mo
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-[#EBE5D8] shadow-card">
          <div className="flex items-center justify-between text-[#6B6B6B] mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Partners</span>
            <div className="w-6 h-6 rounded-lg bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#F15A24]">{drivers.length}</p>
          <span className="text-[10px] text-[#F15A24] font-bold">
            {agencySubscriptions.length} active posting plans
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-[#EBE5D8] shadow-card">
          <div className="flex items-center justify-between text-[#6B6B6B] mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Live listings</span>
            <Car className="w-4 h-4 text-[#F15A24]" />
          </div>
          <p className="text-xl font-extrabold text-[#1C1C1C]">{liveCars + liveTours}</p>
          <span className="text-[10px] text-[#6B6B6B]">
            {liveCars} cars · {liveTours} tours
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-[#EBE5D8] shadow-card">
          <div className="flex items-center justify-between text-[#6B6B6B] mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Inquiries</span>
            <Users className="w-4 h-4 text-[#2E9E5B]" />
          </div>
          <p className="text-xl font-extrabold text-[#1C1C1C]">{inquiries.length}</p>
          <span className="text-[10px] text-[#2E9E5B] font-bold">Call / WhatsApp only</span>
        </div>
      </div>

      {/* Monthly Rides Bar Chart */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE5D8] shadow-card space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#1C1C1C] uppercase tracking-wider">
            Monthly inquiries
          </h4>
          <span className="text-[10px] text-[#F15A24] font-bold">+41% MoM</span>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B6B6B' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1C',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="rides" fill="#F15A24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Highways Corridor Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE5D8] shadow-card space-y-3">
        <h4 className="text-xs font-extrabold text-[#1C1C1C] uppercase tracking-wider">
          Top Highway Corridors
        </h4>

        <div className="space-y-2.5">
          {topCorridors.map((c, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#1C1C1C]">
                <span>{c.route}</span>
                <span className="text-[#F15A24]">{c.volume} trips ({c.share})</span>
              </div>
              <div className="w-full h-2 bg-[#FAF6EE] rounded-full overflow-hidden border border-[#EBE5D8]">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: c.share }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
