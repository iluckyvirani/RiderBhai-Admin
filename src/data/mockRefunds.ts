export interface RefundItem {
  id: string;
  refundNumber: string;
  bookingId: string;
  riderName: string;
  riderPhone: string;
  driverName: string;
  route: string;
  amount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Wallet';
  reason: 'Trip Cancelled by Driver' | 'Pickup Delay > 45 mins' | 'Vehicle Mismatch' | 'Rider Emergency';
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  refundTxnId?: string;
}

export const INITIAL_REFUNDS: RefundItem[] = [
  {
    id: 'ref-101',
    refundNumber: 'REF-9921',
    bookingId: 'bk-1002',
    riderName: 'Priya Mehra',
    riderPhone: '+91 98112 33445',
    driverName: 'Vikram Choudhary',
    route: 'Delhi NCR → Agra',
    amount: 380,
    paymentMethod: 'UPI',
    reason: 'Trip Cancelled by Driver',
    status: 'pending',
    requestedAt: '2026-08-23 10:15 AM',
  },
  {
    id: 'ref-102',
    refundNumber: 'REF-9922',
    bookingId: 'bk-1004',
    riderName: 'Ananya Verma',
    riderPhone: '+91 97110 55667',
    driverName: 'Amit Verma',
    route: 'Delhi NCR → Jaipur',
    amount: 960,
    paymentMethod: 'UPI',
    reason: 'Vehicle Mismatch',
    status: 'pending',
    requestedAt: '2026-08-23 12:40 PM',
  },
  {
    id: 'ref-103',
    refundNumber: 'REF-9920',
    bookingId: 'bk-1001',
    riderName: 'Rahul Sharma',
    riderPhone: '+91 98765 43210',
    driverName: 'Rajesh Kumar',
    route: 'Delhi NCR → Chandigarh',
    amount: 450,
    paymentMethod: 'Credit Card',
    reason: 'Pickup Delay > 45 mins',
    status: 'processed',
    requestedAt: '2026-08-22 03:20 PM',
    processedAt: '2026-08-22 04:10 PM',
    refundTxnId: 'REF-UPI-8844001',
  },
];
