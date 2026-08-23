export interface DriverSettlement {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverAvatar: string;
  upiId: string;
  bankAccount: string;
  totalTripsCompleted: number;
  grossFareAmount: number;
  platformFee: number;
  netPayable: number;
  status: 'pending' | 'settled' | 'processing';
  lastTripDate: string;
  settledAt?: string;
  txnRef?: string;
}

export const INITIAL_SETTLEMENTS: DriverSettlement[] = [
  {
    id: 'stl-101',
    driverId: 'drv-current',
    driverName: 'Aman Singhal',
    driverPhone: '+91 98712 34567',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    upiId: 'amansinghal@okhdfcbank',
    bankAccount: 'HDFC Bank •••• 4492',
    totalTripsCompleted: 8,
    grossFareAmount: 4320,
    platformFee: 0,
    netPayable: 4320,
    status: 'pending',
    lastTripDate: '2026-08-23',
  },
  {
    id: 'stl-102',
    driverId: 'drv-1',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98101 23456',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    upiId: 'rajesh.k@paytm',
    bankAccount: 'SBI Bank •••• 8821',
    totalTripsCompleted: 14,
    grossFareAmount: 7850,
    platformFee: 0,
    netPayable: 7850,
    status: 'pending',
    lastTripDate: '2026-08-22',
  },
  {
    id: 'stl-103',
    driverId: 'drv-2',
    driverName: 'Sneha Patel',
    driverPhone: '+91 98200 54321',
    driverAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    upiId: 'sneha.patel@icici',
    bankAccount: 'ICICI Bank •••• 1109',
    totalTripsCompleted: 22,
    grossFareAmount: 11400,
    platformFee: 0,
    netPayable: 11400,
    status: 'settled',
    lastTripDate: '2026-08-21',
    settledAt: '2026-08-22 10:30 AM',
    txnRef: 'UPI-TXN-99882241',
  },
  {
    id: 'stl-104',
    driverId: 'drv-3',
    driverName: 'Vikram Choudhary',
    driverPhone: '+91 98290 11223',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    upiId: 'vikram.ch@axisbank',
    bankAccount: 'Axis Bank •••• 7731',
    totalTripsCompleted: 5,
    grossFareAmount: 2450,
    platformFee: 0,
    netPayable: 2450,
    status: 'pending',
    lastTripDate: '2026-08-23',
  },
];
