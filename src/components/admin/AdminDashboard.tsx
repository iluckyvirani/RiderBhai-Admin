import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  Layers,
  AlertCircle,
  BarChart3,
  RefreshCw,
  User,
  Car,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';
import { DriverVerificationQueue } from './DriverVerificationQueue';
import { PackageManager } from './PackageManager';
import { DriverBoostStatusList } from './DriverBoostStatusList';
import { DisputeResolutionView } from './DisputeResolutionView';
import { AdminAnalyticsView } from './AdminAnalyticsView';

interface AdminDashboardProps {
  onSwitchRole: (role: UserRole) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'packages' | 'boosts' | 'disputes'>('overview');
  const { drivers, disputes, resetDemoData } = useAppStore();

  const pendingCount = drivers.filter((d) => d.status === 'pending_verification').length;
  const openDisputesCount = disputes.filter((d) => d.status === 'open').length;

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Admin Top Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'overview', label: 'Analytics', icon: BarChart3 },
          { id: 'verifications', label: 'Partner KYC', icon: ShieldCheck, badge: pendingCount },
          { id: 'packages', label: 'Legacy boosts', icon: Package },
          { id: 'boosts', label: 'Boost status', icon: Layers },
          { id: 'disputes', label: 'Disputes', icon: AlertCircle, badge: openDisputesCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 active-press ${
                isActive
                  ? 'brand-gradient text-white shadow-sm'
                  : 'bg-white text-[#6B6B6B] border border-[#EBE5D8] hover:text-[#1C1C1C]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-4 h-4 rounded-full bg-[#E8380D] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-View */}
      {activeTab === 'overview' && <AdminAnalyticsView />}
      {activeTab === 'verifications' && <DriverVerificationQueue />}
      {activeTab === 'packages' && <PackageManager />}
      {activeTab === 'boosts' && <DriverBoostStatusList />}
      {activeTab === 'disputes' && <DisputeResolutionView />}

      {/* Admin Footer Controls */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE5D8] shadow-xs space-y-3 pt-4">
        <h4 className="font-extrabold text-xs text-[#1C1C1C] uppercase tracking-wider">
          Admin Quick Actions
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSwitchRole('rider')}
            className="p-2.5 bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl text-left active-press hover:border-[#F15A24]"
          >
            <User className="w-4 h-4 text-[#F15A24] mb-0.5" />
            <p className="text-xs font-bold text-[#1C1C1C]">Test customer view</p>
          </button>

          <button
            onClick={() => onSwitchRole('driver')}
            className="p-2.5 bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl text-left active-press hover:border-[#2E9E5B]"
          >
            <Car className="w-4 h-4 text-[#2E9E5B] mb-0.5" />
            <p className="text-xs font-bold text-[#1C1C1C]">Test partner view</p>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all demo state to fresh mock data?')) {
              resetDemoData();
              window.location.reload();
            }
          }}
          className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-[#D64545] font-bold text-xs flex items-center justify-center gap-1.5 active-press"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Mock State</span>
        </button>
      </div>
    </div>
  );
};
