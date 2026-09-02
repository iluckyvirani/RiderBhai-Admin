import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  Car,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Driver } from '../../types';

export const DriverVerificationQueue: React.FC = () => {
  const { drivers, simulateDriverStatusChange } = useAppStore();
  const [rejectingDriver, setRejectingDriver] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Driving License image was unclear / expired.');

  const pendingDrivers = drivers.filter((d) => d.status === 'pending_verification');
  const verifiedDrivers = drivers.filter((d) => d.status === 'verified');
  const rejectedDrivers = drivers.filter((d) => d.status === 'rejected');

  const handleApprove = (driverId: string) => {
    simulateDriverStatusChange(driverId, 'verified');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingDriver) {
      simulateDriverStatusChange(rejectingDriver.id, 'rejected', rejectionReason);
      setRejectingDriver(null);
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1C1C]">Partner KYC queue</h3>
          <p className="text-xs text-[#6B6B6B]">Review partner licence, RC, and ID documents</p>
        </div>
        <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          {pendingDrivers.length} Pending
        </span>
      </div>

      {/* Pending Queue List */}
      {pendingDrivers.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 border border-[#EBE5D8] text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#2E9E5B] mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-[#1C1C1C]">All Caught Up!</h4>
          <p className="text-xs text-[#6B6B6B]">There are no pending driver verification requests in the queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-3xl p-4 border border-[#FF8A00] shadow-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#EBE5D8]"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1">
                      {driver.name}
                    </h4>
                    <p className="text-[10px] text-[#6B6B6B]">{driver.phone} • {driver.city}</p>
                    <p className="text-[10px] text-[#F15A24] font-semibold mt-0.5">
                      Vehicle: {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.plate})
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-[#FAF6EE] rounded-2xl p-3 border border-[#EBE5D8] space-y-1.5 text-xs">
                <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
                  Submitted Documents
                </p>
                <div className="flex items-center justify-between text-[#1C1C1C]">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#F15A24]" />
                    Driving License:
                  </span>
                  <span className="font-mono text-[11px] text-[#2E9E5B] font-bold">
                    {driver.documents?.licenseUrl || 'dl_verified.pdf'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#1C1C1C]">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#F15A24]" />
                    Vehicle RC:
                  </span>
                  <span className="font-mono text-[11px] text-[#2E9E5B] font-bold">
                    {driver.documents?.rcUrl || 'rc_verified.pdf'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setRejectingDriver(driver)}
                  className="py-2.5 rounded-xl bg-[#FAF6EE] border border-[#FACBCB] text-[#D64545] font-extrabold text-xs flex items-center justify-center gap-1 active-press hover:bg-[#FDEDED]"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleApprove(driver.id)}
                  className="py-2.5 rounded-xl bg-[#2E9E5B] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs active-press hover:bg-[#25824b]"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verified Drivers Directory */}
      <div className="space-y-2 pt-3">
        <h3 className="text-xs font-extrabold text-[#6B6B6B] uppercase tracking-wider px-1">
          Active Verified Drivers ({verifiedDrivers.length})
        </h3>
        <div className="space-y-1.5">
          {verifiedDrivers.slice(0, 5).map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-3 border border-[#EBE5D8] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <img src={d.avatar} alt={d.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-[#1C1C1C]">{d.name}</p>
                  <p className="text-[10px] text-[#6B6B6B]">{d.vehicle.make} {d.vehicle.model}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#2E9E5B] bg-[#EBF7F0] px-2 py-0.5 rounded-full">
                Active Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#EBE5D8] animate-scale-in space-y-3">
            <h4 className="font-extrabold text-sm text-[#D64545] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Reject Driver Verification
            </h4>
            <p className="text-xs text-[#6B6B6B]">
              Specify the reason to notify {rejectingDriver.name}:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl p-2.5 text-xs text-[#1C1C1C] focus:outline-none focus:border-[#D64545]"
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectingDriver(null)}
                className="py-2.5 rounded-xl bg-[#FAF6EE] text-[#6B6B6B] font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="py-2.5 rounded-xl bg-[#D64545] text-white font-bold text-xs shadow-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
