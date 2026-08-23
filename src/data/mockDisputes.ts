import { DisputeItem } from '../types';

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp-1',
    bookingId: 'bk-9901',
    riderName: 'Vikram Seth',
    driverName: 'Sunil Choudhary',
    route: 'Jaipur → Delhi NCR',
    amount: 450,
    reason: 'Driver cancelled 15 mins before scheduled departure time without answering calls.',
    status: 'open',
    createdAt: '2026-08-22 14:30',
  },
  {
    id: 'dsp-2',
    bookingId: 'bk-9902',
    riderName: 'Priyanka Sen',
    driverName: 'Amitabh Verma',
    route: 'Delhi NCR → Agra',
    amount: 380,
    reason: 'Incorrect drop location by 8 km due to expressway exit confusion. Rider had to take auto.',
    status: 'open',
    createdAt: '2026-08-21 19:10',
  },
  {
    id: 'dsp-3',
    bookingId: 'bk-9903',
    riderName: 'Arjun Nambiar',
    driverName: 'Deepak Patel',
    route: 'Ahmedabad → Surat',
    amount: 400,
    reason: 'Overcharged for extra luggage not mentioned in policy.',
    status: 'resolved',
    createdAt: '2026-08-19 11:20',
  },
];
