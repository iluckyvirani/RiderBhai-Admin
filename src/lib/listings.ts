import { AgencyTripPost, CarListing } from '../types';

function dateOnly(value: unknown): string | undefined {
  if (!value) return undefined;
  return String(value).slice(0, 10);
}

function whatsappFromPhone(phone?: string | null): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('91') ? digits : `91${digits}`;
}

export function mapCarListing(row: any): CarListing {
  return {
    id: row.id,
    displayId: row.display_id || undefined,
    partnerId: row.partner_id,
    partnerName: row.agency_name || row.partner_name || 'Partner',
    partnerPhone: row.partner_phone || '',
    partnerWhatsapp: whatsappFromPhone(row.partner_phone),
    partnerCity: row.current_city || '',
    partnerRating: 5,
    carId: row.vehicle_id || '',
    carName: row.car_name,
    make: row.vehicle_make || undefined,
    model: row.vehicle_model || undefined,
    year: row.vehicle_year || undefined,
    color: row.vehicle_color || undefined,
    plate: row.vehicle_plate || row.plate || undefined,
    seats: Number(row.vehicle_seats || row.seats || 5),
    fuelType: row.vehicle_fuel_type || row.fuel_type || undefined,
    fullCarPrice: Number(row.full_car_price || 0),
    availability: row.availability === 'route' ? 'route' : 'citywide',
    currentCity: row.current_city,
    toCity: row.to_city || undefined,
    notes: row.notes || undefined,
    postedDate: dateOnly(row.posted_date),
    postedTime: row.posted_time || undefined,
    bookingDate: dateOnly(row.booking_date),
    bookingTime: row.booking_time || undefined,
    availableTillDate: dateOnly(row.available_till_date),
    availableTillTime: row.available_till_time || undefined,
    driverName: row.driver_name || undefined,
    driverExperienceYears:
      row.driver_experience_years === 0 || row.driver_experience_years
        ? Number(row.driver_experience_years)
        : undefined,
    status: row.status === 'inactive' ? 'inactive' : 'available',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapTourListing(row: any): AgencyTripPost {
  const specs = Array.isArray(row.desired_car_specs) ? row.desired_car_specs : [];
  const bookingDate = dateOnly(row.booking_date) || '';
  const bookingTime = row.booking_time || '';
  return {
    id: row.id,
    displayId: row.display_id || undefined,
    agencyId: row.partner_id,
    agencyName: row.agency_name,
    agencyPhone: row.partner_phone || '',
    whatsappNumber: whatsappFromPhone(row.partner_phone),
    agencyCity: row.from_city || '',
    agencyRating: 5,
    fromCity: row.from_city,
    toCity: row.to_city,
    passengers: Number(row.passengers || 1),
    duration: row.duration || '',
    startDate: bookingDate,
    pickupTime: bookingTime,
    pickupLocation: row.pickup_location || '',
    dropLocation: row.drop_location || '',
    requiredVehicleType: row.required_vehicle_type || '',
    desiredCar: row.desired_car_name ? { name: row.desired_car_name, specs } : undefined,
    totalCustomerPrice: Number(row.total_customer_price || 0),
    agencyCommission: Number(row.agency_commission || 0),
    driverNetPayout: Number(row.driver_net_payout || 0),
    tripDetails: row.trip_details || '',
    status: row.status === 'cancelled' ? 'cancelled' : row.status === 'closed' ? 'closed' : 'active',
    createdAt: row.created_at || new Date().toISOString(),
  };
}
