import { Package } from '../types';

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg-weekly-boost',
    name: 'Weekly Boost',
    price: 99,
    durationDays: 7,
    badgeText: 'Featured',
    benefitsDescription: [
      'Top search ranking (#1 placement for all your rides)',
      'Eye-catching orange gradient ribbon badge',
      'Direct "Call Driver" button enabled for riders',
      'Up to 3.5x faster seat booking conversion',
      'Boost applies to all your rides during the 7 days',
    ],
    isActive: true,
    popular: true,
  },
  {
    id: 'pkg-monthly-pro',
    name: 'Monthly Pro',
    price: 299,
    durationDays: 30,
    badgeText: 'Pro Verified',
    benefitsDescription: [
      'Permanent Featured placement on all search results',
      'Direct Call & Priority Chat with potential riders',
      'Special Pro Driver badge on profile & ride cards',
      'Save ₹97 compared to weekly plan (25% discount)',
      'Zero booking cancellation penalty protection',
    ],
    isActive: true,
    popular: false,
  },
  {
    id: 'pkg-festival-pass',
    name: 'Festival Super Boost',
    price: 499,
    durationDays: 60,
    badgeText: 'VIP Leader',
    benefitsDescription: [
      '60-day uninterrupted maximum visibility',
      'Double boost algorithm: Pinned atop both city & stopover queries',
      'Instant SMS broadcast to riders searching your route',
      'Direct phone access & WhatsApp link enabled',
      'Dedicated driver support hotline',
    ],
    isActive: true,
    popular: false,
  },
];
