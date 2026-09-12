import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  Driver,
  DriverStatus,
  DriverDocuments,
  Vehicle,
  Rider,
  Ride,
  EnrichedRide,
  Package,
  DriverPackage,
  Booking,
  ChatMessage,
  NotificationItem,
  DisputeItem,
  AppViewMode,
  TravelAgency,
  AgencyStatus,
  AgencyDocuments,
  AgencyPackage,
  AgencyActiveSubscription,
  AgencyTripPost,
  AgencyTripStatus,
  CarListing,
  Inquiry,
} from '../types';
import { INITIAL_DRIVERS } from '../data/mockDrivers';
import { INITIAL_RIDES } from '../data/mockRides';
import { INITIAL_PACKAGES } from '../data/mockPackages';
import { INITIAL_DRIVER_PACKAGES } from '../data/mockDriverPackages';
import { CURRENT_RIDER } from '../data/mockRiders';
import { INITIAL_BOOKINGS } from '../data/mockBookings';
import { INITIAL_CHATS } from '../data/mockChats';
import { INITIAL_DISPUTES } from '../data/mockDisputes';
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications';
import {
  INITIAL_AGENCIES,
  INITIAL_AGENCY_PACKAGES,
  INITIAL_AGENCY_SUBSCRIPTIONS,
  INITIAL_AGENCY_TRIPS,
} from '../data/mockAgencies';
import { INITIAL_CAR_LISTINGS, INITIAL_INQUIRIES } from '../data/mockCarListings';

const DEMO_VERSION = 'partner-v7';
const VERSION_KEY = 'ridebhai_demo_version';

function wipeRideBhaiStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ridebhai_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

try {
  if (localStorage.getItem(VERSION_KEY) !== DEMO_VERSION) {
    wipeRideBhaiStorage();
    localStorage.setItem(VERSION_KEY, DEMO_VERSION);
  }
} catch {
  /* ignore */
}

const STORAGE_KEYS = {
  ROLE: 'ridebhai_role',
  ONBOARDED: 'ridebhai_onboarded',
  DRIVERS: 'ridebhai_drivers_v1',
  RIDES: 'ridebhai_rides_v1',
  PACKAGES: 'ridebhai_packages_v1',
  DRIVER_PACKAGES: 'ridebhai_driver_packages_v1',
  CURRENT_RIDER: 'ridebhai_current_rider_v1',
  CURRENT_DRIVER: 'ridebhai_current_driver_v1',
  BOOKINGS: 'ridebhai_bookings_v1',
  CHATS: 'ridebhai_chats_v1',
  DISPUTES: 'ridebhai_disputes_v1',
  NOTIFICATIONS: 'ridebhai_notifications_v1',
  APP_VIEW: 'ridebhai_app_view_v1',
  RIDER_AUTH: 'ridebhai_rider_auth_v1',
  DRIVER_AUTH: 'ridebhai_driver_auth_v1',
  AGENCY_AUTH: 'ridebhai_agency_auth_v1',
  AGENCIES: 'ridebhai_agencies_v1',
  AGENCY_PACKAGES: 'ridebhai_agency_packages_v1',
  AGENCY_SUBSCRIPTIONS: 'ridebhai_agency_subscriptions_v1',
  AGENCY_TRIPS: 'ridebhai_agency_trips_v1',
  CAR_LISTINGS: 'ridebhai_car_listings_v2',
  INQUIRIES: 'ridebhai_inquiries_v2',
};

// Safe JSON parser from LocalStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed to parse localStorage key: ${key}`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage: ${key}`, e);
  }
}

let storeListeners: Array<() => void> = [];
const notifyListeners = () => storeListeners.forEach((l) => l());

export function useAppStore() {
  const [appView, setAppViewState] = useState<AppViewMode>(() => loadFromStorage(STORAGE_KEYS.APP_VIEW, 'landing'));
  const [isRiderLoggedIn, setIsRiderLoggedInState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.RIDER_AUTH, false));
  const [isDriverLoggedIn, setIsDriverLoggedInState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.DRIVER_AUTH, false));
  const [isAgencyLoggedIn, setIsAgencyLoggedInState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.AGENCY_AUTH, false));
  const [role, setRoleState] = useState<UserRole>(() => loadFromStorage(STORAGE_KEYS.ROLE, 'admin'));
  const [hasOnboarded, setHasOnboardedState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.ONBOARDED, true));
  const [drivers, setDriversState] = useState<Driver[]>(() => loadFromStorage(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS));
  const [rides, setRidesState] = useState<Ride[]>(() => loadFromStorage(STORAGE_KEYS.RIDES, INITIAL_RIDES));
  const [packages, setPackagesState] = useState<Package[]>(() => loadFromStorage(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES));
  const [driverPackages, setDriverPackagesState] = useState<DriverPackage[]>(() => loadFromStorage(STORAGE_KEYS.DRIVER_PACKAGES, INITIAL_DRIVER_PACKAGES));
  const [currentRider, setCurrentRiderState] = useState<Rider>(() => loadFromStorage(STORAGE_KEYS.CURRENT_RIDER, CURRENT_RIDER));
  const [bookings, setBookingsState] = useState<Booking[]>(() => loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS));
  const [chats, setChatsState] = useState<ChatMessage[]>(() => loadFromStorage(STORAGE_KEYS.CHATS, INITIAL_CHATS));
  const [disputes, setDisputesState] = useState<DisputeItem[]>(() => loadFromStorage(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES));
  const [notifications, setNotificationsState] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));

  // Agency specific state
  const [agencies, setAgenciesState] = useState<TravelAgency[]>(() => loadFromStorage(STORAGE_KEYS.AGENCIES, INITIAL_AGENCIES));
  const [agencyPackages, setAgencyPackagesState] = useState<AgencyPackage[]>(() => loadFromStorage(STORAGE_KEYS.AGENCY_PACKAGES, INITIAL_AGENCY_PACKAGES));
  const [agencySubscriptions, setAgencySubscriptionsState] = useState<AgencyActiveSubscription[]>(() => loadFromStorage(STORAGE_KEYS.AGENCY_SUBSCRIPTIONS, INITIAL_AGENCY_SUBSCRIPTIONS));
  const [agencyTripPosts, setAgencyTripPostsState] = useState<AgencyTripPost[]>(() => loadFromStorage(STORAGE_KEYS.AGENCY_TRIPS, INITIAL_AGENCY_TRIPS));
  const [carListings, setCarListingsState] = useState<CarListing[]>(() =>
    loadFromStorage(STORAGE_KEYS.CAR_LISTINGS, INITIAL_CAR_LISTINGS)
  );
  const [inquiries, setInquiriesState] = useState<Inquiry[]>(() =>
    loadFromStorage(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES)
  );

  const currentDriver = useMemo(() => {
    return drivers.find((d) => d.id === 'drv-current') || drivers[0];
  }, [drivers]);

  const currentAgency = useMemo(() => {
    return agencies.find((a) => a.id === 'agency-current') || agencies[0];
  }, [agencies]);

  const setAppView = useCallback((view: AppViewMode) => {
    setAppViewState(view);
    saveToStorage(STORAGE_KEYS.APP_VIEW, view);
    notifyListeners();
  }, []);

  const loginRider = useCallback((phone: string, name?: string) => {
    setIsRiderLoggedInState(true);
    saveToStorage(STORAGE_KEYS.RIDER_AUTH, true);
    if (name || phone) {
      setCurrentRiderState((prev) => {
        const updated = {
          ...prev,
          name: name || prev.name,
          phone: phone || prev.phone,
        };
        saveToStorage(STORAGE_KEYS.CURRENT_RIDER, updated);
        return updated;
      });
    }
    notifyListeners();
  }, []);

  const logoutRider = useCallback(() => {
    setIsRiderLoggedInState(false);
    saveToStorage(STORAGE_KEYS.RIDER_AUTH, false);
    notifyListeners();
  }, []);

  const loginDriver = useCallback((phone: string, name?: string, vehicleInfo?: any, initialStatus?: DriverStatus) => {
    setIsDriverLoggedInState(true);
    saveToStorage(STORAGE_KEYS.DRIVER_AUTH, true);
    setDriversState((prev) => {
      const updated = prev.map((d) => {
        if (d.id === 'drv-current') {
          return {
            ...d,
            name: name || d.name,
            phone: phone || d.phone,
            status: initialStatus !== undefined ? initialStatus : d.status,
            vehicle: vehicleInfo || d.vehicle,
          };
        }
        return d;
      });
      saveToStorage(STORAGE_KEYS.DRIVERS, updated);
      return updated;
    });
    notifyListeners();
  }, []);

  const logoutDriver = useCallback(() => {
    setIsDriverLoggedInState(false);
    saveToStorage(STORAGE_KEYS.DRIVER_AUTH, false);
    notifyListeners();
  }, []);

  const loginAgency = useCallback((phone: string, agencyName?: string, ownerName?: string, city?: string) => {
    setIsAgencyLoggedInState(true);
    saveToStorage(STORAGE_KEYS.AGENCY_AUTH, true);
    setAgenciesState((prev) => {
      const exists = prev.find((a) => a.id === 'agency-current');
      if (exists) {
        const updated = prev.map((a) => {
          if (a.id === 'agency-current') {
            return {
              ...a,
              agencyName: agencyName || a.agencyName,
              ownerName: ownerName || a.ownerName,
              phone: phone || a.phone,
              city: city || a.city,
            };
          }
          return a;
        });
        saveToStorage(STORAGE_KEYS.AGENCIES, updated);
        return updated;
      }
      return prev;
    });
    notifyListeners();
  }, []);

  const logoutAgency = useCallback(() => {
    setIsAgencyLoggedInState(false);
    saveToStorage(STORAGE_KEYS.AGENCY_AUTH, false);
    notifyListeners();
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    saveToStorage(STORAGE_KEYS.ROLE, newRole);
    notifyListeners();
  }, []);

  const setHasOnboarded = useCallback((val: boolean) => {
    setHasOnboardedState(val);
    saveToStorage(STORAGE_KEYS.ONBOARDED, val);
    notifyListeners();
  }, []);

  const updateDrivers = useCallback((updater: (prev: Driver[]) => Driver[]) => {
    setDriversState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.DRIVERS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateRides = useCallback((updater: (prev: Ride[]) => Ride[]) => {
    setRidesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.RIDES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updatePackages = useCallback((updater: (prev: Package[]) => Package[]) => {
    setPackagesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.PACKAGES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateDriverPackages = useCallback((updater: (prev: DriverPackage[]) => DriverPackage[]) => {
    setDriverPackagesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.DRIVER_PACKAGES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateBookings = useCallback((updater: (prev: Booking[]) => Booking[]) => {
    setBookingsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.BOOKINGS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateChats = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setChatsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.CHATS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateDisputes = useCallback((updater: (prev: DisputeItem[]) => DisputeItem[]) => {
    setDisputesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.DISPUTES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateNotifications = useCallback((updater: (prev: NotificationItem[]) => NotificationItem[]) => {
    setNotificationsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateAgencies = useCallback((updater: (prev: TravelAgency[]) => TravelAgency[]) => {
    setAgenciesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.AGENCIES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateAgencyPackages = useCallback((updater: (prev: AgencyPackage[]) => AgencyPackage[]) => {
    setAgencyPackagesState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.AGENCY_PACKAGES, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateAgencySubscriptions = useCallback((updater: (prev: AgencyActiveSubscription[]) => AgencyActiveSubscription[]) => {
    setAgencySubscriptionsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.AGENCY_SUBSCRIPTIONS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateAgencyTripPosts = useCallback((updater: (prev: AgencyTripPost[]) => AgencyTripPost[]) => {
    setAgencyTripPostsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.AGENCY_TRIPS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const updateCarListings = useCallback((updater: (prev: CarListing[]) => CarListing[]) => {
    setCarListingsState((prev) => {
      const next = updater(prev);
      saveToStorage(STORAGE_KEYS.CAR_LISTINGS, next);
      return next;
    });
    notifyListeners();
  }, []);

  const isDriverBoosted = useCallback((driverId: string): boolean => {
    const now = Date.now();
    return driverPackages.some((dp) => dp.driverId === driverId && dp.expiresAt > now);
  }, [driverPackages]);

  const getDriverActivePackage = useCallback((driverId: string): { pkg: Package | undefined; expiresAt: number } | null => {
    const now = Date.now();
    const activeDP = driverPackages.find((dp) => dp.driverId === driverId && dp.expiresAt > now);
    if (!activeDP) return null;
    const pkg = packages.find((p) => p.id === activeDP.packageId);
    return { pkg, expiresAt: activeDP.expiresAt };
  }, [driverPackages, packages]);

  const getAgencyActiveSubscription = useCallback((agencyId: string): { sub: AgencyActiveSubscription; pkg: AgencyPackage } | null => {
    const now = Date.now();
    const activeSub = agencySubscriptions.find((s) => s.agencyId === agencyId && s.expiresAt > now && s.postsRemaining > 0);
    if (!activeSub) return null;
    const pkg = agencyPackages.find((p) => p.id === activeSub.packageId) || agencyPackages[0];
    return { sub: activeSub, pkg };
  }, [agencySubscriptions, agencyPackages]);

  const isAgencyVerified = useCallback((agencyId: string): boolean => {
    const target = agencies.find((a) => a.id === agencyId);
    return target ? target.status === 'verified' : false;
  }, [agencies]);

  const canAgencyPost = useCallback((agencyId: string = currentAgency.id): { canPost: boolean; reason?: string; code?: 'not_verified' | 'no_package' } => {
    const target = agencies.find((a) => a.id === agencyId) || currentAgency;
    if (target.status !== 'verified') {
      if (target.status === 'pending_verification') {
        return {
          canPost: false,
          code: 'not_verified',
          reason: 'Your agency documents are under verification by the Ride Bhai Admin team. You can post tour bookings once approved.',
        };
      }
      return {
        canPost: false,
        code: 'not_verified',
        reason: 'You must submit your business verification documents (GST / Trade License / PAN) and be verified by admin before posting.',
      };
    }

    const subInfo = getAgencyActiveSubscription(agencyId);
    if (!subInfo) {
      return {
        canPost: false,
        code: 'no_package',
        reason: 'Active Posting Package required. Please purchase an Agency Package to publish your tour bookings to drivers.',
      };
    }

    return { canPost: true };
  }, [agencies, currentAgency, getAgencyActiveSubscription]);

  const getRankedRides = useCallback(
    (filterParams?: {
      fromCity?: string;
      toCity?: string;
      date?: string;
      minSeats?: number;
      instantOnly?: boolean;
      acOnly?: boolean;
      maxPrice?: number;
    }): EnrichedRide[] => {
      const {
        fromCity = '',
        toCity = '',
        date = '',
        minSeats = 1,
        instantOnly = false,
        acOnly = false,
        maxPrice,
      } = filterParams || {};

      const matched = rides.filter((ride) => {
        if (fromCity && !ride.fromCity.toLowerCase().includes(fromCity.toLowerCase())) return false;
        if (toCity && !ride.toCity.toLowerCase().includes(toCity.toLowerCase())) return false;
        if (date && ride.date !== date) return false;
        if (ride.availableSeats < minSeats) return false;
        if (instantOnly && !ride.instantBooking) return false;
        if (acOnly && !ride.preferences.ac) return false;
        if (maxPrice && ride.pricePerSeat > maxPrice) return false;
        return true;
      });

      const featuredGroup: EnrichedRide[] = [];
      const regularGroup: EnrichedRide[] = [];

      for (const ride of matched) {
        const driver = drivers.find((d) => d.id === ride.driverId);
        if (!driver) continue;

        const boosted = isDriverBoosted(driver.id);
        const activePkgInfo = getDriverActivePackage(driver.id);

        if (boosted) {
          featuredGroup.push({
            ...ride,
            isFeatured: true,
            packageName: activePkgInfo?.pkg?.name || 'Weekly Boost',
            driver: {
              id: driver.id,
              name: driver.name,
              avatar: driver.avatar,
              rating: driver.rating,
              totalReviews: driver.totalReviews,
              totalRides: driver.totalRides,
              vehicle: driver.vehicle,
              idVerified: driver.idVerified,
              phone: driver.phone,
            },
          });
        } else {
          regularGroup.push({
            ...ride,
            isFeatured: false,
            driver: {
              id: driver.id,
              name: driver.name,
              avatar: driver.avatar,
              rating: driver.rating,
              totalReviews: driver.totalReviews,
              totalRides: driver.totalRides,
              vehicle: driver.vehicle,
              idVerified: driver.idVerified,
            },
          });
        }
      }

      featuredGroup.sort((a, b) => (b.driver.rating || 0) - (a.driver.rating || 0));
      regularGroup.sort((a, b) => a.pricePerSeat - b.pricePerSeat);

      return [...featuredGroup, ...regularGroup];
    },
    [rides, drivers, isDriverBoosted, getDriverActivePackage]
  );

  const postRide = useCallback(
    (newRideData: Omit<Ride, 'id' | 'createdAt' | 'driverId'>) => {
      const newRide: Ride = {
        ...newRideData,
        id: `ride-${Date.now()}`,
        driverId: currentDriver.id,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updateRides((prev) => [newRide, ...prev]);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: currentDriver.id,
        userRole: 'driver',
        title: 'Ride Published! 🚀',
        message: `Your ride from ${newRide.fromCity} to ${newRide.toCity} on ${newRide.date} is now live for bookings.`,
        type: 'booking',
        time: 'Just now',
        read: false,
      };
      updateNotifications((prev) => [newNotif, ...prev]);
      return newRide;
    },
    [currentDriver, updateRides, updateNotifications]
  );

  const purchasePackage = useCallback(
    (packageId: string) => {
      const pkg = packages.find((p) => p.id === packageId);
      if (!pkg) throw new Error('Package not found');

      const now = Date.now();
      const expiresAt = now + pkg.durationDays * 24 * 60 * 60 * 1000;

      const newDriverPackage: DriverPackage = {
        id: `dp-${Date.now()}`,
        driverId: currentDriver.id,
        packageId,
        purchasedAt: now,
        expiresAt,
      };

      updateDriverPackages((prev) => {
        const filtered = prev.filter((dp) => dp.driverId !== currentDriver.id);
        return [newDriverPackage, ...filtered];
      });

      const notif: NotificationItem = {
        id: `notif-pkg-${Date.now()}`,
        userId: currentDriver.id,
        userRole: 'driver',
        title: 'Boost Activated! 🌟',
        message: `Your "${pkg.name}" is active until ${new Date(expiresAt).toLocaleDateString()}. All your rides are now Featured!`,
        type: 'boost',
        time: 'Just now',
        read: false,
      };
      updateNotifications((prev) => [notif, ...prev]);

      return newDriverPackage;
    },
    [packages, currentDriver, updateDriverPackages, updateNotifications]
  );

  const simulatePackageExpiry = useCallback(
    (driverId: string = currentDriver.id) => {
      const pastTime = Date.now() - 1000 * 60;
      updateDriverPackages((prev) =>
        prev.map((dp) => (dp.driverId === driverId ? { ...dp, expiresAt: pastTime } : dp))
      );
    },
    [currentDriver, updateDriverPackages]
  );

  const simulateDriverStatusChange = useCallback(
    (driverId: string, status: DriverStatus, reason?: string) => {
      updateDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId
            ? {
                ...d,
                status,
                idVerified: status === 'verified',
                rejectionReason: status === 'rejected' ? (reason || 'Document verification failed. Please upload a clear copy.') : undefined,
              }
            : d
        )
      );
    },
    [updateDrivers]
  );

  const submitDriverVerification = useCallback(
    (documents: DriverDocuments, vehiclesList: Vehicle[]) => {
      const primaryVehicle = vehiclesList.find((v) => v.isPrimary) || vehiclesList[0];
      updateDrivers((prev) =>
        prev.map((d) => {
          if (d.id === 'drv-current' || d.id === currentDriver.id) {
            return {
              ...d,
              status: 'pending_verification' as DriverStatus,
              idVerified: false,
              rejectionReason: undefined,
              documents: {
                ...d.documents,
                ...documents,
                submittedAt: new Date().toISOString(),
              },
              vehicle: primaryVehicle || d.vehicle,
              vehicles: vehiclesList.length > 0 ? vehiclesList : (d.vehicles || [primaryVehicle || d.vehicle]),
            };
          }
          return d;
        })
      );
    },
    [currentDriver.id, updateDrivers]
  );

  const grantDriverBoost = useCallback(
    (driverId: string, packageId: string = 'pkg-weekly-boost') => {
      const pkg = packages.find((p) => p.id === packageId) || packages[0];
      const now = Date.now();
      const expiresAt = now + (pkg?.durationDays || 7) * 24 * 60 * 60 * 1000;

      updateDriverPackages((prev) => {
        const filtered = prev.filter((dp) => dp.driverId !== driverId);
        return [
          {
            id: `dp-${Date.now()}`,
            driverId,
            packageId: pkg?.id || 'pkg-weekly-boost',
            purchasedAt: now,
            expiresAt,
          },
          ...filtered,
        ];
      });
    },
    [packages, updateDriverPackages]
  );

  const savePackage = useCallback(
    (pkg: Package) => {
      updatePackages((prev) => {
        const exists = prev.some((p) => p.id === pkg.id);
        if (exists) {
          return prev.map((p) => (p.id === pkg.id ? pkg : p));
        }
        return [...prev, pkg];
      });
    },
    [updatePackages]
  );

  const deletePackage = useCallback(
    (pkgId: string) => {
      updatePackages((prev) => prev.filter((p) => p.id !== pkgId));
    },
    [updatePackages]
  );

  const resolveDispute = useCallback(
    (disputeId: string) => {
      updateDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? { ...d, status: 'resolved' } : d))
      );
    },
    [updateDisputes]
  );

  const submitAgencyVerification = useCallback(
    (agencyId: string, docs: AgencyDocuments) => {
      updateAgencies((prev) =>
        prev.map((a) => {
          if (a.id === agencyId || a.id === 'agency-current') {
            return {
              ...a,
              status: 'pending_verification' as AgencyStatus,
              idVerified: false,
              rejectionReason: undefined,
              documents: {
                ...a.documents,
                ...docs,
                submittedAt: new Date().toISOString(),
              },
            };
          }
          return a;
        })
      );
    },
    [updateAgencies]
  );

  const adminVerifyAgency = useCallback(
    (agencyId: string, status: AgencyStatus, reason?: string) => {
      updateAgencies((prev) =>
        prev.map((a) =>
          a.id === agencyId
            ? {
                ...a,
                status,
                idVerified: status === 'verified',
                rejectionReason: status === 'rejected' ? (reason || 'Verification documents were unclear or invalid.') : undefined,
              }
            : a
        )
      );
    },
    [updateAgencies]
  );

  const purchaseAgencyPackage = useCallback(
    (agencyId: string, packageId: string) => {
      const pkg = agencyPackages.find((p) => p.id === packageId);
      if (!pkg) throw new Error('Agency Package not found');

      const now = Date.now();
      const expiresAt = now + pkg.durationDays * 24 * 60 * 60 * 1000;

      const newSub: AgencyActiveSubscription = {
        id: `sub-${Date.now()}`,
        agencyId,
        packageId,
        purchasedAt: now,
        expiresAt,
        postsRemaining: pkg.postLimit,
      };

      updateAgencySubscriptions((prev) => {
        const filtered = prev.filter((s) => s.agencyId !== agencyId);
        return [newSub, ...filtered];
      });

      updateAgencies((prev) =>
        prev.map((a) => (a.id === agencyId ? { ...a, activePackageId: packageId } : a))
      );

      return newSub;
    },
    [agencyPackages, updateAgencySubscriptions, updateAgencies]
  );

  const postAgencyTrip = useCallback(
    (tripData: {
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
      totalCustomerPrice: number;
      agencyCommission: number;
      tripDetails: string;
    }) => {
      const gateCheck = canAgencyPost(currentAgency.id);
      if (!gateCheck.canPost) {
        throw new Error(gateCheck.reason || 'Cannot post trip.');
      }

      const driverNet = Number(tripData.totalCustomerPrice) - Number(tripData.agencyCommission);
      const cleanPhone = currentAgency.whatsappPhone || currentAgency.phone.replace(/[^0-9]/g, '');

      const newTrip: AgencyTripPost = {
        ...tripData,
        id: `trip-agency-${Date.now()}`,
        agencyId: currentAgency.id,
        agencyName: currentAgency.agencyName,
        agencyPhone: currentAgency.phone,
        whatsappNumber: cleanPhone,
        agencyCity: currentAgency.city,
        agencyRating: currentAgency.rating || 4.9,
        driverNetPayout: driverNet > 0 ? driverNet : 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      updateAgencyTripPosts((prev) => [newTrip, ...prev]);

      updateAgencySubscriptions((prev) =>
        prev.map((s) => {
          if (s.agencyId === currentAgency.id && s.postsRemaining < 9000) {
            return { ...s, postsRemaining: Math.max(0, s.postsRemaining - 1) };
          }
          return s;
        })
      );

      updateAgencies((prev) =>
        prev.map((a) => (a.id === currentAgency.id ? { ...a, totalToursPosted: (a.totalToursPosted || 0) + 1 } : a))
      );

      return newTrip;
    },
    [currentAgency, canAgencyPost, updateAgencyTripPosts, updateAgencySubscriptions, updateAgencies]
  );

  const claimAgencyTrip = useCallback(
    (tripId: string, driverId?: string, driverName?: string, driverPhone?: string) => {
      const dId = driverId || currentDriver.id;
      const dName = driverName || currentDriver.name;
      const dPhone = driverPhone || currentDriver.phone;

      updateAgencyTripPosts((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          return {
            ...t,
            status: 'claimed' as AgencyTripStatus,
            claimedByDriverId: dId,
            claimedByDriverName: dName,
            claimedByDriverPhone: dPhone,
            claimedAt: new Date().toISOString(),
          };
        })
      );
    },
    [currentDriver, updateAgencyTripPosts]
  );

  const updateAgencyTripStatus = useCallback(
    (tripId: string, status: AgencyTripStatus) => {
      updateAgencyTripPosts((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status } : t))
      );
    },
    [updateAgencyTripPosts]
  );

  const saveAgencyPackage = useCallback(
    (pkg: AgencyPackage) => {
      updateAgencyPackages((prev) => {
        const exists = prev.some((p) => p.id === pkg.id);
        if (exists) {
          return prev.map((p) => (p.id === pkg.id ? pkg : p));
        }
        return [...prev, pkg];
      });
    },
    [updateAgencyPackages]
  );

  const deleteAgencyPackage = useCallback(
    (pkgId: string) => {
      updateAgencyPackages((prev) => prev.filter((p) => p.id !== pkgId));
    },
    [updateAgencyPackages]
  );

  const updateCurrentAgency = useCallback(
    (updates: Partial<TravelAgency>) => {
      updateAgencies((prev) =>
        prev.map((a) => (a.id === 'agency-current' || a.id === currentAgency.id ? { ...a, ...updates } : a))
      );
    },
    [currentAgency.id, updateAgencies]
  );

  const resetDemoData = useCallback(() => {
    wipeRideBhaiStorage();
    try {
      localStorage.setItem(VERSION_KEY, DEMO_VERSION);
    } catch {
      /* ignore */
    }
    setRoleState('admin');
    setHasOnboardedState(false);
    setDriversState(INITIAL_DRIVERS);
    setRidesState(INITIAL_RIDES);
    setPackagesState(INITIAL_PACKAGES);
    setDriverPackagesState(INITIAL_DRIVER_PACKAGES);
    setCurrentRiderState(CURRENT_RIDER);
    setBookingsState(INITIAL_BOOKINGS);
    setChatsState(INITIAL_CHATS);
    setDisputesState(INITIAL_DISPUTES);
    setNotificationsState(INITIAL_NOTIFICATIONS);
    setAgenciesState(INITIAL_AGENCIES);
    setAgencyPackagesState(INITIAL_AGENCY_PACKAGES);
    setAgencySubscriptionsState(INITIAL_AGENCY_SUBSCRIPTIONS);
    setAgencyTripPostsState(INITIAL_AGENCY_TRIPS);
    setIsAgencyLoggedInState(false);
    setCarListingsState(INITIAL_CAR_LISTINGS);
    setInquiriesState(INITIAL_INQUIRIES);
    notifyListeners();
  }, []);

  return {
    appView,
    setAppView,
    isRiderLoggedIn,
    isDriverLoggedIn,
    isAgencyLoggedIn,
    loginRider,
    logoutRider,
    loginDriver,
    logoutDriver,
    loginAgency,
    logoutAgency,
    role,
    setRole,
    hasOnboarded,
    setHasOnboarded,
    drivers,
    rides,
    packages,
    driverPackages,
    currentRider,
    currentDriver,
    bookings,
    chats,
    disputes,
    notifications,
    agencies,
    agencyPackages,
    agencySubscriptions,
    agencyTripPosts,
    currentAgency,
    carListings,
    inquiries,
    updateCarListings,
    isDriverBoosted,
    getDriverActivePackage,
    getRankedRides,
    getAgencyActiveSubscription,
    isAgencyVerified,
    canAgencyPost,
    postRide,
    purchasePackage,
    grantDriverBoost,
    simulatePackageExpiry,
    simulateDriverStatusChange,
    submitDriverVerification,
    savePackage,
    deletePackage,
    resolveDispute,
    resetDemoData,
    updateNotifications,
    updateDriverPackages,
    submitAgencyVerification,
    adminVerifyAgency,
    purchaseAgencyPackage,
    postAgencyTrip,
    claimAgencyTrip,
    updateAgencyTripStatus,
    saveAgencyPackage,
    deleteAgencyPackage,
    updateCurrentAgency,
    updateAgencies,
    updateAgencyTripPosts,
  };
}
