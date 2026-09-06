export type KycUser = {
  id: string;
  phone: string;
  name: string;
  email: string;
  agencyName?: string;
  gstNumber?: string;
  aadhaarDoc?: string;
  selfieDoc?: string;
  selfieName?: string;
  city?: string;
  rejectionReason?: string;
  profileStatus: 'incomplete' | 'pending_verification' | 'verified' | 'rejected';
};

export function mapKycUser(row: any): KycUser {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name || '',
    email: row.email || '',
    agencyName: row.agency_name || undefined,
    gstNumber: row.gst_number || undefined,
    aadhaarDoc: row.aadhaar_doc || undefined,
    selfieDoc: row.selfie_doc || undefined,
    selfieName: row.selfie_name || undefined,
    city: row.city || undefined,
    rejectionReason: row.rejection_reason || undefined,
    profileStatus: row.profile_status,
  };
}

export function isPreviewableImage(url?: string) {
  if (!url) return false;
  if (url.startsWith('data:image')) return true;
  return /^https?:\/\//.test(url) && !url.toLowerCase().includes('.pdf');
}
