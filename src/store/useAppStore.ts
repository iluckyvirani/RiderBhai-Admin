import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  Driver,
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

// Global in-memory bus for listener synchronization across re-renders
let storeListeners: Array<() => void> = [];
const notifyListeners = () => storeListeners.forEach((l) => l());

export function useAppStore() {
  // 1. Core State Hooks initialized from LocalStorage
  const [appView, setAppViewState] = useState<AppViewMode>(() => loadFromStorage(STORAGE_KEYS.APP_VIEW, 'landing'));
  const [isRiderLoggedIn, setIsRiderLoggedInState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.RIDER_AUTH, false));
  const [isDriverLoggedIn, setIsDriverLoggedInState] = useState<boolean>(() => loadFromStorage(STORAGE_KEYS.DRIVER_AUTH, false));
  const [role, setRoleState] = useState<UserRole>(() => loadFromStorage(STORAGE_KEYS.ROLE, 'rider'));
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

  // Current active driver profile (defaults to Aman Singhal drv-current)
  const currentDriver = useMemo(() => {
    return drivers.find((d) => d.id === 'drv-current') || drivers[0];
  }, [drivers]);

  // View Navigation
  const setAppView = useCallback((view: AppViewMode) => {
    setAppViewState(view);
    saveToStorage(STORAGE_KEYS.APP_VIEW, view);
    notifyListeners();
  }, []);

  // Auth actions
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

  const loginDriver = useCallback((phone: string, name?: string, vehicleInfo?: any) => {
    setIsDriverLoggedInState(true);
    saveToStorage(STORAGE_KEYS.DRIVER_AUTH, true);
    setDriversState((prev) => {
      const updated = prev.map((d) => {
        if (d.id === 'drv-current') {
          return {
            ...d,
            name: name || d.name,
            phone: phone || d.phone,
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


  // Persist whenever state changes
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

  // --- CORE BOOST LOGIC: Computed Live On Every Read ---
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

  // --- SEARCH & RANKING SELECTOR ---
  // Strictly partitions into [Featured / Boosted] and [Regular], sorts each group, and concatenates.
  // CRITICAL RULE: Strips driver phone number on regular rides before handing to UI.
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

      // 1. Initial filter
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

      // 2. Separate into Featured & Regular groups based on LIVE driver package check
      const featuredGroup: EnrichedRide[] = [];
      const regularGroup: EnrichedRide[] = [];

      for (const ride of matched) {
        const driver = drivers.find((d) => d.id === ride.driverId);
        if (!driver) continue;

        const boosted = isDriverBoosted(driver.id);
        const activePkgInfo = getDriverActivePackage(driver.id);

        if (boosted) {
          // Featured Ride: Includes Driver Phone and Full Contact CTA capability
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
              phone: driver.phone, // Included for featured
            },
          });
        } else {
          // Regular Ride: Phone number is strictly OMITTED from the returned object (never sent to client)
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
              // phone is undefined here
            },
          });
        }
      }

      // 3. Sort each group internally (by departure time / rating)
      featuredGroup.sort((a, b) => (b.driver.rating || 0) - (a.driver.rating || 0));
      regularGroup.sort((a, b) => a.pricePerSeat - b.pricePerSeat);

      // 4. Concatenate: ALL featured rides first, then regular rides (never interleave)
      return [...featuredGroup, ...regularGroup];
    },
    [rides, drivers, isDriverBoosted, getDriverActivePackage]
  );

  // --- ACTIONS ---

  // 1. Post a new Ride (Driver)
  const postRide = useCallback(
    (newRideData: Omit<Ride, 'id' | 'createdAt' | 'driverId'>) => {
      const newRide: Ride = {
        ...newRideData,
        id: `ride-${Date.now()}`,
        driverId: currentDriver.id,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updateRides((prev) => [newRide, ...prev]);

      // Add driver notification
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

  // 2. Book Seats (Rider)
  const bookSeats = useCallback(
    (rideId: string, seatsCount: number, paymentMethod: 'upi' | 'card' | 'wallet' = 'upi') => {
      const ride = rides.find((r) => r.id === rideId);
      if (!ride || ride.availableSeats < seatsCount) {
        throw new Error('Seats not available');
      }

      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        rideId,
        riderId: currentRider.id,
        driverId: ride.driverId,
        seatsBooked: seatsCount,
        totalPrice: ride.pricePerSeat * seatsCount,
        status: ride.instantBooking ? 'confirmed' : 'pending',
        pickupOtp: generatedOtp,
        paymentMethod,
        bookedAt: new Date().toISOString(),
      };

      // Decrement seats
      updateRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, availableSeats: r.availableSeats - seatsCount } : r))
      );

      // Save booking
      updateBookings((prev) => [newBooking, ...prev]);

      // Add Rider & Driver notifications
      const riderNotif: NotificationItem = {
        id: `notif-rdr-${Date.now()}`,
        userId: currentRider.id,
        userRole: 'rider',
        title: ride.instantBooking ? 'Booking Confirmed! 🚗' : 'Booking Requested ⏳',
        message: `Your trip from ${ride.fromCity} to ${ride.toCity} is ${ride.instantBooking ? 'confirmed. OTP: ' + generatedOtp : 'awaiting driver confirmation.'}`,
        type: 'booking',
        time: 'Just now',
        read: false,
      };
      const driverNotif: NotificationItem = {
        id: `notif-drv-${Date.now()}`,
        userId: ride.driverId,
        userRole: 'driver',
        title: 'New Seat Booking! 🙋‍♂️',
        message: `${currentRider.name} booked ${seatsCount} seat(s) for your ${ride.fromCity} → ${ride.toCity} ride.`,
        type: 'booking',
        time: 'Just now',
        read: false,
      };
      updateNotifications((prev) => [riderNotif, driverNotif, ...prev]);

      return newBooking;
    },
    [rides, currentRider, updateRides, updateBookings, updateNotifications]
  );

  // 3. Purchase Driver Boost Package
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

      // Overwrite/extend existing package for current driver
      updateDriverPackages((prev) => {
        const filtered = prev.filter((dp) => dp.driverId !== currentDriver.id);
        return [newDriverPackage, ...filtered];
      });

      // Notification
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

  // 4. Simulate Package Expiry (for live ranking demotion testing)
  const simulatePackageExpiry = useCallback(
    (driverId: string = currentDriver.id) => {
      const pastTime = Date.now() - 1000 * 60; // 1 min ago
      updateDriverPackages((prev) =>
        prev.map((dp) => (dp.driverId === driverId ? { ...dp, expiresAt: pastTime } : dp))
      );
    },
    [currentDriver, updateDriverPackages]
  );

  // 5. Driver Verification / Simulation
  const simulateDriverStatusChange = useCallback(
    (driverId: string, status: 'verified' | 'rejected' | 'pending_verification', reason?: string) => {
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

  // 6. Driver Accept / Reject Booking Request
  const handleBookingRequest = useCallback(
    (bookingId: string, action: 'accept' | 'reject') => {
      updateBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            status: action === 'accept' ? 'confirmed' : 'rejected',
          };
        })
      );
    },
    [updateBookings]
  );

  // 7. Trip Lifecycle Simulation (Start ride, Complete ride)
  const simulateTripStart = useCallback(
    (bookingId: string) => {
      updateBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'started', startedAt: new Date().toISOString() }
            : b
        )
      );
    },
    [updateBookings]
  );

  const simulateTripComplete = useCallback(
    (bookingId: string) => {
      updateBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'completed', completedAt: new Date().toISOString() }
            : b
        )
      );
    },
    [updateBookings]
  );

  // 8. Submit Rating / Review
  const submitReview = useCallback(
    (bookingId: string, rating: number, comment: string) => {
      const targetBooking = bookings.find((b) => b.id === bookingId);
      if (!targetBooking) return;

      const review = {
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      updateBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, review } : b))
      );

      // Recompute driver rating
      updateDrivers((prev) =>
        prev.map((d) => {
          if (d.id !== targetBooking.driverId) return d;
          const newTotalReviews = (d.totalReviews || 0) + 1;
          const newRating = Number((((d.rating * d.totalReviews) + rating) / newTotalReviews).toFixed(1));
          return {
            ...d,
            rating: newRating,
            totalReviews: newTotalReviews,
          };
        })
      );
    },
    [bookings, updateBookings, updateDrivers]
  );

  // 9. In-app Chat messaging
  const sendChatMessage = useCallback(
    (text: string, bookingId?: string, rideId?: string) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        bookingId,
        rideId,
        senderId: role === 'driver' ? currentDriver.id : currentRider.id,
        senderRole: role === 'driver' ? 'driver' : 'rider',
        senderName: role === 'driver' ? currentDriver.name : currentRider.name,
        text,
        timestamp: 'Just now',
      };
      updateChats((prev) => [...prev, newMsg]);
      return newMsg;
    },
    [role, currentDriver, currentRider, updateChats]
  );

  // 10. Update Rider Profile / Verify ID
  const updateRiderProfile = useCallback(
    (updates: Partial<Rider>) => {
      setCurrentRiderState((prev) => {
        const next = { ...prev, ...updates };
        saveToStorage(STORAGE_KEYS.CURRENT_RIDER, next);
        return next;
      });
    },
    []
  );

  // 11. Admin CRUD on Packages
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

  // 12. Resolve Dispute
  const resolveDispute = useCallback(
    (disputeId: string) => {
      updateDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? { ...d, status: 'resolved' } : d))
      );
    },
    [updateDisputes]
  );

  // 13. Reset Entire Demo Data
  const resetDemoData = useCallback(() => {
    localStorage.clear();
    setRoleState('rider');
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
    notifyListeners();
  }, []);

  // 14. Admin Grant Boost to specific driver
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

  return {
    // App View & Auth State
    appView,
    setAppView,
    isRiderLoggedIn,
    isDriverLoggedIn,
    loginRider,
    logoutRider,
    loginDriver,
    logoutDriver,

    // Role & Entity State
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

    // Live Derived / Selectors
    isDriverBoosted,
    getDriverActivePackage,
    getRankedRides,

    // Actions
    postRide,
    bookSeats,
    purchasePackage,
    grantDriverBoost,
    simulatePackageExpiry,
    simulateDriverStatusChange,
    handleBookingRequest,
    simulateTripStart,
    simulateTripComplete,
    submitReview,
    sendChatMessage,
    updateRiderProfile,
    savePackage,
    deletePackage,
    resolveDispute,
    resetDemoData,
    updateNotifications,
    updateDriverPackages,
  };
}

