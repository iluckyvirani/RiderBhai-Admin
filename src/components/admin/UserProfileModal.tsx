import React, { useEffect, useState } from 'react';
import {
  Car,
  ChevronRight,
  CreditCard,
  IdCard,
  MapPin,
  Phone,
  ShieldCheck,
  X,
  IndianRupee,
  Landmark,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  kycClass,
  kycLabel,
  mapAdminDriver,
  mapAdminVehicle,
  vehicleStatusLabel,
  type AdminDriverRow,
  type AdminVehicleRow,
} from '../../lib/directory';
import { mapDeal, type Deal } from '../../lib/deals';
import { mapCarListing, mapTourListing } from '../../lib/listings';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';
import { DocumentPreview } from '../common/DocumentPreview';
import { DriverDetailsView } from './DriverDetailsView';
import { VehicleDetailsView } from './VehicleDetailsView';
import type { AgencyTripPost, CarListing } from '../../types';

type ProfileUser = {
  id: string;
  phone: string;
  name: string;
  email: string;
  city?: string;
  agency_name?: string;
  gst_number?: string;
  aadhaar_doc?: string;
  selfie_doc?: string;
  profile_status: string;
  created_at?: string;
};

type Bank = {
  account_holder_name: string;
  account_number: string;
  ifsc: string;
  bank_name: string;
  branch_name?: string | null;
  account_type?: string;
  upi_id?: string | null;
  completed?: boolean;
};

type Payment = {
  id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  duration_days: number;
  post_limit: number;
  badge_text?: string;
  purchased_at: string;
  expires_at: string;
  posts_remaining: number;
};

type ProfilePayload = {
  user: ProfileUser;
  driver: any | null;
  drivers?: any[];
  vehicles: any[];
  carListings: any[];
  tourListings: any[];
  deals: any[];
  payments: Payment[];
  activePlan: Payment | null;
  bank: Bank | null;
};

type Tab = 'overview' | 'drivers' | 'cars' | 'posts' | 'tours' | 'bank' | 'deals' | 'payments';

function driverKey(driver: AdminDriverRow) {
  return driver.id || `${driver.userId}-${driver.phone}`;
}

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function when(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function Empty({ text }: { text: string }) {
  return <EmptyState compact title="No record found" description={text} />;
}

export function UserProfileModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<AdminDriverRow[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicleRow[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedCarPostId, setSelectedCarPostId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSelectedDriverId(null);
    setSelectedVehicleId(null);
    setSelectedCarPostId(null);
    api<ProfilePayload>(`/admin/users/${userId}`)
      .then(setData)
      .catch((err: any) => setError(err?.message || 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const user = data?.user;

  useEffect(() => {
    if (!data?.user) {
      setDrivers([]);
      setVehicles([]);
      return;
    }
    const owner = data.user;
    const raw = data.drivers?.length ? data.drivers : data.driver ? [data.driver] : [];
    setDrivers(
      raw.map((row) =>
        mapAdminDriver({
          ...row,
          owner_name: owner.name,
          owner_phone: owner.phone,
          owner_email: owner.email,
          city: row.city || owner.city,
          profile_status: owner.profile_status,
        })
      )
    );
    setVehicles(
      (data.vehicles || []).map((row) =>
        mapAdminVehicle({
          ...row,
          owner_name: owner.name,
          owner_phone: owner.phone,
          owner_email: owner.email,
          owner_city: owner.city,
          profile_status: owner.profile_status,
        })
      )
    );
  }, [data]);

  const cars: CarListing[] = (data?.carListings || []).map(mapCarListing);
  const tours: AgencyTripPost[] = (data?.tourListings || []).map(mapTourListing);
  const deals: Deal[] = (data?.deals || []).map(mapDeal);
  const payments = data?.payments || [];
  const active = data?.activePlan;
  const bank = data?.bank;
  const selectedDriver = drivers.find((d) => driverKey(d) === selectedDriverId);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCarPost = cars.find((c) => c.id === selectedCarPostId);

  const openTab = (next: Tab) => {
    setTab(next);
    setSelectedDriverId(null);
    setSelectedVehicleId(null);
    setSelectedCarPostId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[86vh] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-[#EBE5D8] px-5 py-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F15A24]">User profile</p>
            <h3 className="text-lg font-black text-[#1C1C1C]">{user?.name || 'Unnamed'}</h3>
            <p className="text-xs font-bold text-[#6B6B6B]">
              {user ? `+91 ${user.phone}` : 'Loading…'}
              {user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-[#FAF6EE] p-2 text-[#1C1C1C]">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex gap-1.5 overflow-x-auto border-b border-[#EBE5D8] px-4 py-2 no-scrollbar">
          {(
            [
              ['overview', 'Overview'],
              ['drivers', 'Drivers'],
              ['cars', 'Cars'],
              ['posts', 'Car posts'],
              ['tours', 'Tours'],
              ['bank', 'Bank'],
              ['deals', 'Deals'],
              ['payments', 'Plans'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => openTab(id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-extrabold ${
                tab === id ? 'bg-[#1C1C1C] text-white' : 'bg-[#FAF6EE] text-[#6B6B6B]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</p>}
          {loading && <AdminPageSkeleton variant="list" rows={4} />}

          {!loading && user && tab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Account</p>
                  <p className="text-sm font-extrabold">{user.name || 'Unnamed'}</p>
                  <p className="text-xs font-bold text-[#6B6B6B] inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> +91 {user.phone}
                  </p>
                  {user.city && (
                    <p className="text-xs font-bold inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#F15A24]" /> {user.city}
                    </p>
                  )}
                  {user.agency_name && <p className="text-xs font-bold">{user.agency_name}</p>}
                  {user.gst_number && <p className="text-[11px] text-[#6B6B6B]">GST {user.gst_number}</p>}
                  <p className="text-[11px] text-[#8A8478]">Joined {when(user.created_at)}</p>
                </div>
                <div className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">KYC</p>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${kycClass(user.profile_status)}`}>
                    <ShieldCheck className="h-3 w-3" />
                    {kycLabel(user.profile_status)}
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <DocumentPreview label="Aadhaar" src={user.aadhaar_doc} />
                    <DocumentPreview label="Selfie" src={user.selfie_doc} />
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-[#EBE5D8] p-4 space-y-2">
                <p className="text-[10px] font-extrabold uppercase text-[#8A8478] inline-flex items-center gap-1">
                  <Landmark className="h-3.5 w-3.5" /> Bank details
                </p>
                {bank ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs font-bold">
                    <p><span className="text-[#8A8478]">Holder</span><br />{bank.account_holder_name}</p>
                    <p><span className="text-[#8A8478]">Bank</span><br />{bank.bank_name}{bank.branch_name ? ` · ${bank.branch_name}` : ''}</p>
                    <p className="font-mono"><span className="text-[#8A8478] font-bold">Account</span><br />{bank.account_number}</p>
                    <p className="font-mono"><span className="text-[#8A8478] font-bold">IFSC</span><br />{bank.ifsc}</p>
                    {bank.account_type && (
                      <p className="capitalize"><span className="text-[#8A8478]">Type</span><br />{bank.account_type}</p>
                    )}
                    {bank.upi_id && (
                      <p><span className="text-[#8A8478]">UPI</span><br />{bank.upi_id}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-[#8A8478]">No bank details saved yet.</p>
                )}
              </div>
              <div className="rounded-3xl border border-[#EBE5D8] p-4">
                <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Active plan</p>
                {active ? (
                  <div className="mt-2">
                    <p className="text-sm font-extrabold">{active.plan_name}</p>
                    <p className="text-xs font-bold text-[#00A86B]">
                      {money(active.price)} · {active.duration_days} days · {active.posts_remaining} posts left
                    </p>
                    <p className="text-[11px] text-[#6B6B6B]">Expires {when(active.expires_at)}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-bold text-[#8A8478]">No active plan</p>
                )}
              </div>
            </div>
          )}

          {!loading && user && tab === 'drivers' && (
            <div className="space-y-3">
              {selectedDriver ? (
                <DriverDetailsView
                  driver={selectedDriver}
                  backLabel="Drivers"
                  onBack={() => setSelectedDriverId(null)}
                  onUpdated={(next) => {
                    setDrivers((prev) =>
                      prev.map((d) => (driverKey(d) === driverKey(next) ? next : d))
                    );
                  }}
                />
              ) : drivers.length === 0 ? (
                <Empty text="No driver profiles yet." />
              ) : (
                drivers.map((driver, i) => (
                  <button
                    key={driverKey(driver)}
                    type="button"
                    onClick={() => setSelectedDriverId(driverKey(driver))}
                    className="w-full rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-2 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-extrabold uppercase text-[#8A8478] inline-flex items-center gap-1">
                        <IdCard className="h-3.5 w-3.5" /> Driver {i + 1}
                      </p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${kycClass(driver.verificationStatus)}`}>
                        {vehicleStatusLabel(driver.verificationStatus)}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold">{driver.name}</p>
                    <p className="text-xs font-bold text-[#6B6B6B]">
                      +91 {driver.phone} · {driver.email}
                    </p>
                    <p className="text-xs font-extrabold">{driver.experienceYears} years experience</p>
                    <span className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5">
                      View details <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {!loading && user && tab === 'cars' && (
            <div className="space-y-3">
              {selectedVehicle ? (
                <VehicleDetailsView
                  vehicle={selectedVehicle}
                  backLabel="Cars"
                  onBack={() => setSelectedVehicleId(null)}
                  onUpdated={(next) => {
                    setVehicles((prev) => prev.map((v) => (v.id === next.id ? next : v)));
                  }}
                />
              ) : vehicles.length === 0 ? (
                <Empty text="No vehicles on this profile." />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {vehicles.map((veh) => (
                    <button
                      key={veh.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(veh.id)}
                      className="rounded-3xl border border-[#EBE5D8] p-4 space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block rounded-xl bg-[#1C1C1C] px-2 py-1 font-mono text-[10px] font-extrabold text-white">
                          {veh.plate}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${kycClass(veh.verificationStatus)}`}>
                          {vehicleStatusLabel(veh.verificationStatus)}
                        </span>
                      </div>
                      <p className="text-sm font-extrabold">
                        {veh.make} {veh.model}
                      </p>
                      <p className="text-[11px] text-[#6B6B6B]">
                        {veh.seats} seats{veh.color ? ` · ${veh.color}` : ''}
                        {veh.fuelType ? ` · ${veh.fuelType}` : ''}
                      </p>
                      <span className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5">
                        View details <ChevronRight className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && user && tab === 'bank' && (
            <div className="space-y-3">
              {bank ? (
                <div className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
                  <p className="text-[10px] font-extrabold uppercase text-[#8A8478] inline-flex items-center gap-1">
                    <Landmark className="h-3.5 w-3.5" /> Payout account
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs font-bold">
                    <p><span className="text-[#8A8478]">Account holder</span><br />{bank.account_holder_name}</p>
                    <p><span className="text-[#8A8478]">Bank name</span><br />{bank.bank_name}</p>
                    <p className="font-mono"><span className="text-[#8A8478] font-bold">Account number</span><br />{bank.account_number}</p>
                    <p className="font-mono"><span className="text-[#8A8478] font-bold">IFSC</span><br />{bank.ifsc}</p>
                    <p><span className="text-[#8A8478]">Branch</span><br />{bank.branch_name || '—'}</p>
                    <p className="capitalize"><span className="text-[#8A8478]">Account type</span><br />{bank.account_type || '—'}</p>
                    <p className="sm:col-span-2"><span className="text-[#8A8478]">UPI</span><br />{bank.upi_id || '—'}</p>
                  </div>
                </div>
              ) : (
                <Empty text="This user has not added bank details yet." />
              )}
            </div>
          )}

          {!loading && user && tab === 'posts' && (
            <div className="space-y-3">
              {selectedCarPost ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCarPostId(null)}
                    className="text-xs font-extrabold text-[#F15A24]"
                  >
                    ← Car posts
                  </button>
                  <div className="rounded-3xl border border-[#EBE5D8] bg-white p-5 space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F15A24] inline-flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" /> Car post details
                    </p>
                    <h2 className="text-lg font-black text-[#1C1C1C]">{selectedCarPost.carName}</h2>
                    <p className="font-mono text-xs font-extrabold text-[#6B6B6B]">{selectedCarPost.plate || '—'}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      selectedCarPost.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8]'
                    }`}>
                      {selectedCarPost.status === 'available' ? 'Showing' : 'Hidden'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
                        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Price</p>
                        <p className="text-xs font-extrabold mt-0.5">{money(selectedCarPost.fullCarPrice)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
                        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Seats</p>
                        <p className="text-xs font-extrabold mt-0.5">{selectedCarPost.seats}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
                        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Route</p>
                        <p className="text-xs font-extrabold mt-0.5">
                          {selectedCarPost.availability === 'route'
                            ? `${selectedCarPost.currentCity} → ${selectedCarPost.toCity || '—'}`
                            : `Currently in ${selectedCarPost.currentCity} · All India`}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
                        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Fuel</p>
                        <p className="text-xs font-extrabold mt-0.5">{selectedCarPost.fuelType || '—'}</p>
                      </div>
                    </div>
                    {selectedCarPost.notes && (
                      <p className="text-[11px] text-[#6B6B6B]">{selectedCarPost.notes}</p>
                    )}
                    <p className="text-[11px] text-[#8A8478]">Posted {when(selectedCarPost.createdAt)}</p>
                  </div>
                </div>
              ) : cars.length === 0 ? (
                <Empty text="No car listings posted." />
              ) : (
                cars.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => setSelectedCarPostId(car.id)}
                    className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] p-3 text-left space-y-1"
                  >
                    <p className="text-sm font-extrabold inline-flex items-center gap-1">
                      <Car className="h-3.5 w-3.5 text-[#F15A24]" /> {car.carName}
                    </p>
                    <p className="text-[11px] text-[#6B6B6B]">
                      {car.plate || '—'} · {car.availability === 'route' ? `${car.currentCity} → ${car.toCity || '—'}` : `Currently in ${car.currentCity} · All India`}
                      {' · '}{car.status}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-[#F15A24]">{money(car.fullCarPrice)}</p>
                      <span className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5">
                        View details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {!loading && user && tab === 'tours' && (
            <div className="space-y-2">
              {tours.length === 0 && <Empty text="No tour listings posted." />}
              {tours.map((tour) => (
                <div key={tour.id} className="rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] p-3">
                  <p className="text-sm font-extrabold">
                    {tour.fromCity} → {tour.toCity}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {tour.agencyName} · {tour.passengers} pax · {tour.status}
                  </p>
                  <p className="text-xs font-extrabold text-[#F15A24]">{money(tour.totalCustomerPrice)}</p>
                </div>
              ))}
            </div>
          )}

          {!loading && user && tab === 'deals' && (
            <div className="space-y-2">
              {deals.length === 0 && <Empty text="No Ride Bhai deals for this user." />}
              {deals.map((deal) => (
                <div key={deal.id} className="rounded-2xl border border-[#EBE5D8] p-3 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-[#F15A24]">
                    {deal.listingType} · {deal.status}
                  </p>
                  <p className="text-sm font-extrabold">{deal.title}</p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Buyer {deal.buyerName} → Seller {deal.sellerName}
                  </p>
                  <p className="text-xs font-extrabold">{money(deal.price)}</p>
                </div>
              ))}
            </div>
          )}

          {!loading && user && tab === 'payments' && (
            <div className="space-y-3">
              {active && (
                <div className="rounded-3xl border border-[#BDE8C7] bg-[#EBF7EE] p-4">
                  <p className="text-[10px] font-extrabold uppercase text-[#00A86B]">Active now</p>
                  <p className="text-sm font-extrabold">{active.plan_name}</p>
                  <p className="text-xs font-bold">
                    {money(active.price)} · expires {when(active.expires_at)} · {active.posts_remaining} posts left
                  </p>
                </div>
              )}
              {payments.length === 0 && <Empty text="No plan purchases yet." />}
              {payments.map((pay) => {
                const live = new Date(pay.expires_at).getTime() > Date.now();
                return (
                  <div key={pay.id} className="rounded-2xl border border-[#EBE5D8] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold inline-flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-[#F15A24]" />
                          {pay.plan_name}
                        </p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Bought {when(pay.purchased_at)} · {pay.duration_days} days
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${live ? 'bg-[#EBF7EE] text-[#00A86B]' : 'bg-[#FAF6EE] text-[#8A8478]'}`}>
                        {live ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-extrabold inline-flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {Number(pay.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
