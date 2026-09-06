export type AdminUserRow = {
  id: string;
  phone: string;
  name: string;
  email: string;
  city?: string;
  agencyName?: string;
  profileStatus: 'incomplete' | 'pending_verification' | 'verified' | 'rejected';
  hasPlan: boolean;
  isDriver: boolean;
  vehicleCount: number;
  createdAt: string;
};

export type VehicleVerification = 'pending_verification' | 'verified' | 'rejected';

export type AdminVehicleRow = {
  id: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  plate: string;
  seats: number;
  fuelType?: string;
  rcNumber?: string;
  rcDocument?: string;
  insuranceDocument?: string;
  currentCity?: string;
  availability: string;
  toCity?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerCity?: string;
  profileStatus: string;
  verificationStatus: VehicleVerification;
  rejectionReason?: string;
  createdAt?: string;
};

export type AdminDriverRow = {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  experienceNote?: string;
  completed: boolean;
  profileStatus: string;
  city?: string;
  agencyName?: string;
  selfieDoc?: string;
  aadhaarDoc?: string;
  ownerName?: string;
  ownerPhone?: string;
  verificationStatus: VehicleVerification;
  rejectionReason?: string;
};

export function isListedAdmin(row: { phone?: string; email?: string }) {
  const phone = String(row.phone || '').replace(/\D/g, '').slice(-10);
  const email = String(row.email || '').toLowerCase();
  return phone === '9999999999' || email === 'admin@ridebhai.in';
}

export function mapAdminUser(row: any): AdminUserRow {
  return {
    id: row.id,
    phone: row.phone || '',
    name: row.name || '',
    email: row.email || '',
    city: row.city || undefined,
    agencyName: row.agency_name || undefined,
    profileStatus: row.profile_status,
    hasPlan: Boolean(row.has_plan),
    isDriver: Boolean(row.is_driver),
    vehicleCount: Number(row.vehicle_count || 0),
    createdAt: row.created_at || '',
  };
}

export function mapAdminVehicle(row: any): AdminVehicleRow {
  return {
    id: row.id,
    make: row.make || '',
    model: row.model || '',
    year: row.year || undefined,
    color: row.color || undefined,
    plate: row.plate || '',
    seats: Number(row.seats || 5),
    fuelType: row.fuel_type || undefined,
    rcNumber: row.rc_number || undefined,
    rcDocument: row.rc_document || undefined,
    insuranceDocument: row.insurance_document || undefined,
    currentCity: row.current_city || undefined,
    availability: row.availability || 'citywide',
    toCity: row.to_city || undefined,
    ownerName: row.owner_name || 'User',
    ownerPhone: row.owner_phone || '',
    ownerEmail: row.owner_email || undefined,
    ownerCity: row.owner_city || undefined,
    profileStatus: row.profile_status || 'incomplete',
    verificationStatus:
      row.verification_status === 'verified'
        ? 'verified'
        : row.verification_status === 'rejected'
          ? 'rejected'
          : 'pending_verification',
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at || undefined,
  };
}

export function mapAdminDriver(row: any): AdminDriverRow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    experienceYears: Number(row.experience_years || 0),
    experienceNote: row.experience_note || undefined,
    completed: Boolean(row.completed),
    profileStatus: row.profile_status || 'incomplete',
    city: row.city || undefined,
    agencyName: row.agency_name || undefined,
    selfieDoc: row.selfie_doc || undefined,
    aadhaarDoc: row.aadhaar_doc || undefined,
    ownerName: row.owner_name || undefined,
    ownerPhone: row.owner_phone || undefined,
    verificationStatus:
      row.verification_status === 'verified'
        ? 'verified'
        : row.verification_status === 'rejected'
          ? 'rejected'
          : 'pending_verification',
    rejectionReason: row.rejection_reason || undefined,
  };
}

export function kycLabel(status: string) {
  if (status === 'verified') return 'Verified';
  if (status === 'pending_verification') return 'Pending KYC';
  if (status === 'rejected') return 'Rejected';
  return 'Incomplete';
}

export function kycClass(status: string) {
  if (status === 'verified') return 'bg-[#EBF7EE] text-[#00A86B] border-[#BDE8C7]';
  if (status === 'pending_verification') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'rejected') return 'bg-red-50 text-red-600 border-red-200';
  return 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8]';
}

export function vehicleStatusLabel(status?: string) {
  if (status === 'verified') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  return 'Pending verification';
}
