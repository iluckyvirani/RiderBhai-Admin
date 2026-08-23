import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  CalendarCheck,
  IndianRupee,
  Key,
  Sparkles,
  Zap,
  Check,
  Clock,
  Wind,
  Music,
  Users,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { Driver, Booking } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface DriverDetailModalProps {
  driver: Driver;
  onClose: () => void;
}

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({ driver, onClose }) => {
  const {
    simulateDriverStatusChange,
    isDriverBoosted,
    grantDriverBoost,
    rides,
    bookings,
    currentRider
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'vehicle' | 'kyc' | 'bookings'>('profile');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(driver.status === 'verified');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const boosted = isDriverBoosted(driver.id);

  // Driver rides and bookings
  const driverRides = rides.filter((r) => r.driverId === driver.id);
  const driverBookings = bookings.filter((b) => b.driverId === driver.id);

  const totalEarned = driverBookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const handleApproveDriver = () => {
    simulateDriverStatusChange(driver.id, 'verified');
    setVehicleVerified(true);
    setFeedbackMsg('Driver KYC & Vehicle have been successfully Verified!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleRejectDriver = (e: React.FormEvent) => {
    e.preventDefault();
    simulateDriverStatusChange(driver.id, 'rejected', rejectionReason || 'KYC documents do not match government records');
    setShowRejectBox(false);
    setFeedbackMsg('Driver KYC has been Marked as Rejected.');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleToggleVehicleVerification = () => {
    const nextState = !vehicleVerified;
    setVehicleVerified(nextState);
    if (nextState && driver.status !== 'verified') {
      simulateDriverStatusChange(driver.id, 'verified');
    }
    setFeedbackMsg(nextState ? 'Vehicle RC & Registration Approved!' : 'Vehicle Verification Revoked.');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#EBE5D8] overflow-hidden my-auto animate-scale-up">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#FAF6EE] border-b border-[#EBE5D8] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-white shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1C] font-display">
                  {driver.name}
                </h2>
                {driver.idVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#00A86B] text-[11px] font-extrabold border border-[#BDE8C7]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ID Verified
                  </span>
                )}
                {boosted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#F15A24] text-[11px] font-extrabold border border-[#FFD8CB] animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Boost Active
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B] mt-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#F15A24]" />
                  <strong className="font-mono text-[#1C1C1C]">{driver.phone}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#F15A24]" />
                  <span>{driver.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                  <span>{driver.city}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-[#1C1C1C]">{driver.rating}</span>
                  <span className="text-[#6B6B6B]">({driver.totalReviews} reviews)</span>
                </div>
                <span>•</span>
                <span className="font-bold text-[#1C1C1C]">{driver.totalRides} Trips Completed</span>
                <span>•</span>
                <span className="text-[#6B6B6B]">Member since {driver.memberSince}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-[#FAF6EE] border border-[#EBE5D8] text-[#6B6B6B] hover:text-[#1C1C1C] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Toast */}
        {feedbackMsg && (
          <div className="m-4 p-3.5 bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-xs font-extrabold rounded-2xl flex items-center gap-2 animate-slide-down">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="border-b border-[#EBE5D8] px-6 bg-white flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Overview & Stats', icon: Users },
            { id: 'vehicle', label: 'Vehicle & RC Details', icon: Car },
            { id: 'kyc', label: 'KYC & Gov Verification', icon: ShieldCheck },
            { id: 'bookings', label: `Driver Bookings (${driverBookings.length})`, icon: CalendarCheck },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3.5 px-3.5 border-b-2 text-xs font-extrabold transition-all flex items-center gap-2 flex-shrink-0 ${
                  isActive
                    ? 'border-[#F15A24] text-[#F15A24]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1C1C1C]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: PROFILE & OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* Financial & Performance Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
                  <span className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
                    Total Revenue Generated
                  </span>
                  <p className="text-xl font-extrabold text-[#00A86B] mt-1">
                    ₹{totalEarned.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B]">Across {driver.totalRides} trips</p>
                </div>

                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
                  <span className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
                    Driver KYC Status
                  </span>
                  <div className="mt-1">
                    {driver.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00A86B]">
                        <CheckCircle2 className="w-4 h-4" />
                        Fully Verified
                      </span>
                    ) : driver.status === 'pending_verification' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700">
                        <Clock className="w-4 h-4" />
                        Pending Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600">
                        <XCircle className="w-4 h-4" />
                        {driver.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">Aadhaar & DL verified</p>
                </div>

                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
                  <span className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
                    Boost Visibility
                  </span>
                  <p className="text-xl font-extrabold text-[#F15A24] mt-1">
                    {boosted ? 'Gold Rank #1' : 'Standard'}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {boosted ? 'Priority search listing' : 'Zero boost package'}
                  </p>
                </div>
              </div>

              {/* Bio & Description */}
              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] space-y-1">
                <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
                  Driver Bio & Note
                </p>
                <p className="text-xs text-[#1C1C1C] leading-relaxed">
                  {driver.bio || 'Daily verified commuter driving on intercity expressway routes.'}
                </p>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-4 bg-white rounded-2xl border border-[#EBE5D8] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-[#1C1C1C]">Admin Verification Control</p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Instant 1-click status update for driver partner
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {driver.status !== 'verified' ? (
                    <button
                      onClick={handleApproveDriver}
                      className="px-4 py-2 bg-[#00A86B] hover:bg-[#2E9E5B] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active-press flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Driver</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => simulateDriverStatusChange(driver.id, 'pending_verification')}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-extrabold rounded-xl border border-amber-200"
                    >
                      Revoke Verification
                    </button>
                  )}

                  {!boosted ? (
                    <button
                      onClick={() => grantDriverBoost(driver.id, 'pkg-weekly-boost')}
                      className="px-3.5 py-2 bg-[#FFF0EB] hover:bg-[#F15A24] text-[#F15A24] hover:text-white text-xs font-extrabold rounded-xl border border-[#FFD8CB] transition-all"
                    >
                      + Grant Boost
                    </button>
                  ) : null}

                  <button
                    onClick={() => setShowRejectBox(!showRejectBox)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold rounded-xl border border-red-200 transition-all"
                  >
                    Reject / Suspend
                  </button>
                </div>
              </div>

              {/* Rejection Form Box */}
              {showRejectBox && (
                <form onSubmit={handleRejectDriver} className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3 animate-slide-down">
                  <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Reject or Suspend Driver Account</span>
                  </div>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason (e.g. Expired DL, Fake Aadhaar, Vehicle RC mismatch)..."
                    className="w-full text-xs font-bold text-[#1C1C1C] bg-white p-3 rounded-xl border border-red-200 focus:outline-none"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectBox(false)}
                      className="px-3 py-1.5 text-xs text-[#6B6B6B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-xs"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: VEHICLE & RC DETAILS */}
          {activeTab === 'vehicle' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#EBE5D8] flex items-center justify-center text-[#F15A24] shadow-xs">
                    <Car className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-[#1C1C1C]">
                        {driver.vehicle.make} {driver.vehicle.model}
                      </h3>
                      <span className="font-mono font-extrabold text-xs bg-[#1C1C1C] text-white px-2 py-0.5 rounded-lg">
                        {driver.vehicle.plate}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      Model Year: <strong>{driver.vehicle.year}</strong> • Color: <strong>{driver.vehicle.color}</strong> • Capacity: <strong>{driver.vehicle.seats} Passenger Seats</strong>
                    </p>
                  </div>
                </div>

                {/* Verify Vehicle Button */}
                <div>
                  <button
                    onClick={handleToggleVehicleVerification}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs active-press ${
                      vehicleVerified
                        ? 'bg-[#EBF7EE] text-[#00A86B] border border-[#BDE8C7]'
                        : 'bg-[#F15A24] text-white hover:bg-[#E8380D]'
                    }`}
                  >
                    {vehicleVerified ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Vehicle RC Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Vehicle RC Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RC Document Inspection Preview */}
              <div className="bg-white p-5 rounded-2xl border border-[#EBE5D8] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#F15A24]" />
                    <span>Vehicle RC (Registration Certificate) Document</span>
                  </p>
                  <span className="text-[11px] font-mono text-[#6B6B6B]">
                    File: RC_{driver.vehicle.plate.replace(/\s+/g, '_')}.pdf
                  </span>
                </div>

                <div className="p-4 bg-[#FAF6EE] rounded-xl border border-dashed border-[#EBE5D8] flex items-center justify-between">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#1C1C1C]">State Transport Authority Record</p>
                    <p className="text-[11px] text-[#6B6B6B]">
                      Registration No: <span className="font-mono font-bold text-[#1C1C1C]">{driver.vehicle.plate}</span> | Fuel: Petrol/CNG | Fitness: Valid till 2031
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#00A86B] bg-[#EBF7EE] px-2.5 py-1 rounded-lg">
                    ✓ Valid RC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC & GOVERNMENT VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Card Inspection */}
                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                      <span>UIDAI Aadhaar Verification</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-[#00A86B] bg-[#EBF7EE] px-2 py-0.5 rounded border border-[#BDE8C7]">
                      Verified (OTP)
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EBE5D8] text-xs space-y-1">
                    <p className="text-[#6B6B6B]">Masked Aadhaar Number:</p>
                    <p className="font-mono font-bold text-sm text-[#1C1C1C]">•••• •••• 8842</p>
                    <p className="text-[11px] text-[#00A86B] font-bold pt-1">
                      ✓ Name matches government database ({driver.name})
                    </p>
                  </div>
                </div>

                {/* Driving License Inspection */}
                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#F15A24]" />
                      <span>Driving License (LMV - Non Transport)</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-[#00A86B] bg-[#EBF7EE] px-2 py-0.5 rounded border border-[#BDE8C7]">
                      Active & Valid
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EBE5D8] text-xs space-y-1">
                    <p className="text-[#6B6B6B]">License Number:</p>
                    <p className="font-mono font-bold text-sm text-[#1C1C1C]">DL-042018009941</p>
                    <p className="text-[11px] text-[#6B6B6B]">Validity: 2038 • Issuing RTO: Delhi South</p>
                  </div>
                </div>
              </div>

              {/* Approve & Reject KYC Actions */}
              <div className="p-5 bg-white rounded-2xl border border-[#EBE5D8] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#1C1C1C]">Official Verification Decision</h4>
                  <p className="text-[11px] text-[#6B6B6B]">Updates driver live status across search results & mobile app</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApproveDriver}
                    className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#2E9E5B] text-white text-xs font-extrabold rounded-xl shadow-md transition-all active-press flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify Driver</span>
                  </button>

                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold rounded-xl border border-red-200"
                  >
                    Reject KYC
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DRIVER'S BOOKINGS & PASSENGER RIDES */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-[#1C1C1C]">
                  Ride Reservations for {driver.name}
                </p>
                <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-2.5 py-1 rounded-xl">
                  {driverBookings.length} Bookings
                </span>
              </div>

              {driverBookings.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF6EE] rounded-2xl border border-[#EBE5D8] text-xs text-[#6B6B6B]">
                  No passenger bookings found for this driver partner yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] bg-[#FAF6EE]">
                        <th className="py-2.5 px-3">Booking Ref</th>
                        <th className="py-2.5 px-3">Passenger</th>
                        <th className="py-2.5 px-3">Seats</th>
                        <th className="py-2.5 px-3">Fare Earned</th>
                        <th className="py-2.5 px-3">Pickup OTP</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {driverBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FFFDF9]">
                          <td className="py-3 px-3 font-mono font-bold text-xs text-[#1C1C1C]">
                            {b.id.toUpperCase()}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-[#1C1C1C]">{currentRider.name}</p>
                            <p className="text-[10px] text-[#6B6B6B] font-mono">{currentRider.phone}</p>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#1C1C1C]">{b.seatsBooked} Seat(s)</td>
                          <td className="py-3 px-3 font-extrabold text-sm text-[#00A86B]">₹{b.totalPrice}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-[11px] bg-[#FFF0EB] text-[#F15A24] px-2 py-0.5 rounded border border-[#FFD8CB]">
                              {b.pickupOtp || '4829'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-extrabold bg-[#EBF7EE] text-[#00A86B] px-2 py-0.5 rounded border border-[#BDE8C7]">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF6EE] border-t border-[#EBE5D8] flex items-center justify-between">
          <span className="text-xs text-[#6B6B6B]">
            Driver ID: <code className="font-mono text-[#1C1C1C] font-bold">{driver.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] hover:bg-[#FAF6EE] transition-colors shadow-xs"
          >
            Close Details View
          </button>
        </div>
      </div>
    </div>
  );
};
