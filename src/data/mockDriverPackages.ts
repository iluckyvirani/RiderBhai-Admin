import { DriverPackage } from '../types';

const NOW = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

export const INITIAL_DRIVER_PACKAGES: DriverPackage[] = [
  // Rajesh Sharma has an active Weekly Boost (expires in 5 days)
  {
    id: 'dp-1',
    driverId: 'drv-1',
    packageId: 'pkg-weekly-boost',
    purchasedAt: NOW - (2 * ONE_DAY),
    expiresAt: NOW + (5 * ONE_DAY),
  },
  // Vikramaditya Rao has an active Monthly Pro (expires in 22 days)
  {
    id: 'dp-2',
    driverId: 'drv-2',
    packageId: 'pkg-monthly-pro',
    purchasedAt: NOW - (8 * ONE_DAY),
    expiresAt: NOW + (22 * ONE_DAY),
  },
  // Ananya Deshmukh has an active Weekly Boost (expires in 3 days)
  {
    id: 'dp-3',
    driverId: 'drv-3',
    packageId: 'pkg-weekly-boost',
    purchasedAt: NOW - (4 * ONE_DAY),
    expiresAt: NOW + (3 * ONE_DAY),
  },
  // Current user (Aman Singhal) starts with an active Weekly Boost (expires in 6 days)
  {
    id: 'dp-current',
    driverId: 'drv-current',
    packageId: 'pkg-weekly-boost',
    purchasedAt: NOW - (1 * ONE_DAY),
    expiresAt: NOW + (6 * ONE_DAY),
  },
  // Amitabh Verma had a package that expired 2 days ago (regular unboosted now)
  {
    id: 'dp-4',
    driverId: 'drv-4',
    packageId: 'pkg-weekly-boost',
    purchasedAt: NOW - (9 * ONE_DAY),
    expiresAt: NOW - (2 * ONE_DAY),
  },
];
