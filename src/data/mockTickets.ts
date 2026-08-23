export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userType: 'rider' | 'driver';
  userName: string;
  userPhone: string;
  subject: string;
  category: 'Booking & OTP' | 'Payment & Refund' | 'Driver Conduct' | 'Route & Delay' | 'Account & KYC';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  lastReply: string;
}

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    ticketNumber: 'TKT-8841',
    userType: 'rider',
    userName: 'Rahul Sharma',
    userPhone: '+91 98765 43210',
    subject: 'Driver arrived 25 mins late at IFFCO Chowk pickup',
    category: 'Route & Delay',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-08-23 11:30 AM',
    lastReply: 'Waiting for operations review',
  },
  {
    id: 'tkt-102',
    ticketNumber: 'TKT-8842',
    userType: 'driver',
    userName: 'Vikram Choudhary',
    userPhone: '+91 98290 11223',
    subject: 'KYC Document re-verification after renewed Driving License',
    category: 'Account & KYC',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-08-23 09:15 AM',
    lastReply: 'Support agent reviewing uploaded DL copy',
  },
  {
    id: 'tkt-103',
    ticketNumber: 'TKT-8843',
    userType: 'rider',
    userName: 'Priya Mehra',
    userPhone: '+91 98112 33445',
    subject: 'Need tax invoice for business trip Delhi to Chandigarh',
    category: 'Booking & OTP',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-08-22 04:45 PM',
    lastReply: 'Invoice PDF sent to priya.m@techcorp.in',
  },
  {
    id: 'tkt-104',
    ticketNumber: 'TKT-8844',
    userType: 'driver',
    userName: 'Aman Singhal',
    userPhone: '+91 98712 34567',
    subject: 'Weekly Boost Package not reflecting gold badge on search',
    category: 'Booking & OTP',
    priority: 'high',
    status: 'open',
    createdAt: '2026-08-23 01:20 PM',
    lastReply: 'Assigned to Tech Operations',
  },
  {
    id: 'tkt-105',
    ticketNumber: 'TKT-8845',
    userType: 'rider',
    userName: 'Neha Gupta',
    userPhone: '+91 99100 44556',
    subject: 'Left umbrella in Honda City back seat',
    category: 'Driver Conduct',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-08-21 07:10 PM',
    lastReply: 'Driver contacted; item returned at Jaipur drop point',
  },
];
