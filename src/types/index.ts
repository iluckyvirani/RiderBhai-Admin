export type UserRole = 'rider' | 'driver' | 'admin';

export type DriverStatus = 'unverified' | 'pending_verification' | 'verified' | 'rejected';

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  seats: number;
  image?: string;
}

export interface DriverPreferences {
  ac: boolean;
  smoking: boolean;
  pets: boolean;
  music: boolean;
  luggage: 'small' | 'medium' | 'large';
  maxTwoInBack: boolean;
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
  documents?: {
    licenseUrl?: string;
    rcUrl?: string;
    aadhaarUrl?: string;
    submittedAt?: string;
  };
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
  date: string; // YYYY-MM-DD
  departureTime: string; // HH:MM AM/PM
  estimatedDuration: string; // e.g. "4h 30m"
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

// Decorated ride object passed to UI with computed driver & boost info
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
    phone?: string; // Strictly omitted for regular (unboosted) rides in search selector
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
  purchasedAt: number; // timestamp ms
  expiresAt: number; // timestamp ms
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
  senderRole: 'rider' | 'driver';
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
  type: 'booking' | 'payment' | 'boost' | 'verification' | 'system';
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

export type AppViewMode = 'landing' | 'rider-app' | 'driver-app' | 'admin-portal';

export interface AuthState {
  isRiderLoggedIn: boolean;
  isDriverLoggedIn: boolean;
  riderPhone?: string;
  driverPhone?: string;
}

