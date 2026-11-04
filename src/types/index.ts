export type UserRole = 'rider' | 'driver' | 'agency' | 'admin';

export type DriverStatus = 'unverified' | 'pending_verification' | 'verified' | 'rejected' | 'blocked';

export type AgencyStatus = 'unverified' | 'pending_verification' | 'verified' | 'rejected';

export type FuelType = 'electric' | 'petrol' | 'diesel' | 'cng' | 'hybrid';

export interface Vehicle {
  id?: string;
  displayId?: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  seats: number;
  fuelType?: FuelType;
  rcNumber?: string;
  rcDocument?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  insuranceDocument?: string;
  pucCertificateNumber?: string;
  pucExpiryDate?: string;
  pucDocument?: string;
  image?: string;
  isPrimary?: boolean;
  currentCity?: string;
  availability?: 'citywide' | 'route';
  toCity?: string;
}

export interface CarListing {
  id: string;
  displayId?: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  partnerWhatsapp: string;
  partnerCity: string;
  partnerRating: number;
  carId: string;
  carName: string;
  carImage?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  plate?: string;
  seats: number;
  fuelType?: FuelType;
  fullCarPrice: number;
  availability: 'citywide' | 'route';
  currentCity: string;
  toCity?: string;
  notes?: string;
  postedDate?: string;
  postedTime?: string;
  bookingDate?: string;
  bookingTime?: string;
  availableTillDate?: string;
  availableTillTime?: string;
  driverName?: string;
  driverExperienceYears?: number;
  status: 'available' | 'inactive';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  listingType: 'car' | 'tour';
  listingId: string;
  riderId: string;
  riderName: string;
  inquirerRole?: 'customer' | 'partner';
  inquirerPhone?: string;
  partnerId: string;
  partnerName: string;
  channel: 'call' | 'whatsapp';
  createdAt: string;
  title: string;
  price: number;
  fromCity?: string;
  toCity?: string;
}

export interface DriverPreferences {
  ac: boolean;
  smoking: boolean;
  pets: boolean;
  music: boolean;
  luggage: 'small' | 'medium' | 'large';
  maxTwoInBack: boolean;
}

export interface DriverDocuments {
  aadhaarNumber?: string;
  aadhaarFrontDoc?: string;
  aadhaarBackDoc?: string;
  panNumber?: string;
  panDoc?: string;
  drivingLicenseNumber?: string;
  drivingLicenseExpiry?: string;
  drivingLicenseDoc?: string;
  licenseUrl?: string;
  rcUrl?: string;
  aadhaarUrl?: string;
  submittedAt?: string;
  verificationNotes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  totalRides: number;
  bio: string;
  city: string;
  memberSince: string;
  status: DriverStatus;
  rejectionReason?: string;
  idVerified: boolean;
  vehicle: Vehicle;
  vehicles?: Vehicle[];
  documents?: DriverDocuments;
  onboardingStep?: number;
}

// --- Travel Agency Partner Types ---
export interface AgencyDocuments {
  gstNumber?: string;
  gstDoc?: string;
  panNumber?: string;
  panDoc?: string;
  tradeLicenseNumber?: string;
  tradeLicenseDoc?: string;
  ownerAadhaarNumber?: string;
  ownerAadhaarDoc?: string;
  officeAddressProofDoc?: string;
  submittedAt?: string;
  verificationNotes?: string;
}

export interface TravelAgency {
  id: string;
  agencyName: string;
  ownerName: string;
  phone: string;
  whatsappPhone?: string;
  email: string;
  city: string;
  address: string;
  logo?: string;
  rating: number;
  totalReviews: number;
  totalToursPosted: number;
  joinedAt: string;
  status: AgencyStatus;
  rejectionReason?: string;
  idVerified: boolean;
  documents?: AgencyDocuments;
  activePackageId?: string;
}

export interface AgencyPackage {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  postLimit: number;
  badgeText: string;
  benefitsDescription: string[];
  isActive: boolean;
  popular?: boolean;
}

export interface AgencyActiveSubscription {
  id: string;
  agencyId: string;
  packageId: string;
  purchasedAt: number;
  expiresAt: number;
  postsRemaining: number;
}

export type AgencyTripStatus = 'active' | 'claimed' | 'completed' | 'cancelled' | 'closed';

export interface AgencyTripPost {
  id: string;
  displayId?: string;
  agencyId: string;
  agencyName: string;
  agencyPhone: string;
  whatsappNumber: string;
  agencyCity: string;
  agencyRating: number;
  fromCity: string;
  toCity: string;
  passengers: number;
  duration: string;
  startDate: string;
  endDate?: string;
  pickupTime?: string;
  pickupLocation: string;
  dropLocation: string;
  requiredVehicleType: string;
  desiredCar?: { name: string; specs: string[] };
  totalCustomerPrice: number; // e.g. ₹1000
  agencyCommission: number; // e.g. ₹200
  driverNetPayout: number; // e.g. ₹800 (totalCustomerPrice - agencyCommission)
  tripDetails: string; // Full itinerary, inclusions & requirements
  status: AgencyTripStatus;
  createdAt: string;
  claimedByDriverId?: string;
  claimedByDriverName?: string;
  claimedByDriverPhone?: string;
  claimedAt?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  city: string;
  idVerified: boolean;
  emergencyContact?: string;
  rating: number;
  totalRides: number;
  memberSince: string;
}

export interface RidePreferences {
  ac: boolean;
  smoking: boolean;
  pets: boolean;
  music: boolean;
  luggage: 'small' | 'medium' | 'large';
  maxTwoInBack: boolean;
  womenOnly?: boolean;
}

export interface Stopover {
  city: string;
  point: string;
  timeOffsetMinutes: number;
  pricePerSeat: number;
}

export interface Ride {
  id: string;
  driverId: string;
  fromCity: string;
  toCity: string;
  pickupPoint: string;
  dropPoint: string;
  date: string;
  departureTime: string;
  estimatedDuration: string;
  distanceKm: number;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  instantBooking: boolean;
  preferences: RidePreferences;
  stopovers?: Stopover[];
  recurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface EnrichedRide extends Ride {
  driver: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalReviews: number;
    totalRides: number;
    vehicle: Vehicle;
    idVerified: boolean;
    phone?: string;
  };
  isFeatured: boolean;
  packageName?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  badgeText: string;
  benefitsDescription: string[];
  isActive: boolean;
  popular?: boolean;
}

export interface DriverPackage {
  id: string;
  driverId: string;
  packageId: string;
  purchasedAt: number;
  expiresAt: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'started' | 'completed' | 'cancelled' | 'rejected';

export interface BookingReview {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  rideId: string;
  riderId: string;
  driverId: string;
  seatsBooked: number;
  totalPrice: number;
  status: BookingStatus;
  pickupOtp: string;
  paymentMethod: 'upi' | 'card' | 'wallet';
  bookedAt: string;
  startedAt?: string;
  completedAt?: string;
  review?: BookingReview;
}

export interface ChatMessage {
  id: string;
  bookingId?: string;
  rideId?: string;
  senderId: string;
  senderRole: 'rider' | 'driver' | 'agency';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  userRole: UserRole;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'boost' | 'verification' | 'system' | 'agency';
  time: string;
  read: boolean;
}

export interface DisputeItem {
  id: string;
  bookingId: string;
  riderName: string;
  driverName: string;
  route: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface CityLocation {
  name: string;
  state: string;
  popularPoints: string[];
}

export type AppViewMode = 'landing' | 'rider-app' | 'driver-app' | 'agency-app' | 'admin-portal';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'normal' | 'high' | 'urgent';
export type TicketCategory = 'booking' | 'payment' | 'kyc' | 'listing' | 'account' | 'general';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  admin_notes?: string;
  resolution_notes?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  user_city?: string;
  user_agency_name?: string;
}

