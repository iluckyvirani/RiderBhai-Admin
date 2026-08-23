import { Booking } from '../types';

export const INITIAL_BOOKINGS: Booking[] = [
  // Active booking for Rohan Mehra (Current Rider) with Rajesh Sharma (drv-1)
  {
    id: 'bk-1001',
    rideId: 'ride-101',
    riderId: 'rdr-current',
    driverId: 'drv-1',
    seatsBooked: 1,
    totalPrice: 450,
    status: 'confirmed',
    pickupOtp: '8492',
    paymentMethod: 'upi',
    bookedAt: '2026-08-22T19:40:00Z',
  },
  // Upcoming booking for another rider with current driver (Aman Singhal - drv-current)
  {
    id: 'bk-1002',
    rideId: 'ride-102',
    riderId: 'rdr-2', // Sneha Kapur
    driverId: 'drv-current',
    seatsBooked: 1,
    totalPrice: 480,
    status: 'confirmed',
    pickupOtp: '3318',
    paymentMethod: 'card',
    bookedAt: '2026-08-22T21:15:00Z',
  },
  // Pending request for current driver (Aman Singhal) to demo Accept / Reject
  {
    id: 'bk-1003',
    rideId: 'ride-102',
    riderId: 'rdr-3', // Tanmay Bhattacharya
    driverId: 'drv-current',
    seatsBooked: 1,
    totalPrice: 480,
    status: 'pending',
    pickupOtp: '5791',
    paymentMethod: 'upi',
    bookedAt: '2026-08-23T08:10:00Z',
  },
  // Completed past booking for Rohan Mehra (Rider) with Vikramaditya Rao (drv-2)
  {
    id: 'bk-1004',
    rideId: 'ride-301',
    riderId: 'rdr-current',
    driverId: 'drv-2',
    seatsBooked: 2,
    totalPrice: 580,
    status: 'completed',
    pickupOtp: '1234',
    paymentMethod: 'upi',
    bookedAt: '2026-08-15T10:00:00Z',
    startedAt: '2026-08-16T07:05:00Z',
    completedAt: '2026-08-16T09:20:00Z',
    review: {
      rating: 5,
      comment: 'Super smooth ride to Mysore. Vikramaditya is a very humble driver and great host.',
      createdAt: '2026-08-16T10:00:00Z',
    },
  },
  // Another completed booking for driver stats (Aman Singhal)
  {
    id: 'bk-1005',
    rideId: 'ride-502',
    riderId: 'rdr-4',
    driverId: 'drv-current',
    seatsBooked: 2,
    totalPrice: 780,
    status: 'completed',
    pickupOtp: '9921',
    paymentMethod: 'upi',
    bookedAt: '2026-08-10T14:30:00Z',
    startedAt: '2026-08-11T08:30:00Z',
    completedAt: '2026-08-11T11:15:00Z',
    review: {
      rating: 5,
      comment: 'Super fast and punctual! Loved the car.',
      createdAt: '2026-08-11T12:00:00Z',
    },
  },
];
