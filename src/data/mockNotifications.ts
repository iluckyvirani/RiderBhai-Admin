import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'rdr-current',
    userRole: 'rider',
    title: 'Ride Confirmed! 🚗',
    message: 'Rajesh Sharma confirmed your seat for Delhi to Jaipur. Boarding OTP: 8492',
    type: 'booking',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    userId: 'drv-current',
    userRole: 'driver',
    title: 'New Booking Request 🙋‍♂️',
    message: 'Tanmay Bhattacharya requested 1 seat for Delhi to Jaipur.',
    type: 'booking',
    time: '35 mins ago',
    read: false,
  },
  {
    id: 'notif-3',
    userId: 'drv-current',
    userRole: 'driver',
    title: 'Weekly Boost Active 🚀',
    message: 'Your Weekly Boost is live! Your rides are appearing on top with the Featured badge.',
    type: 'boost',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'notif-4',
    userId: 'rdr-current',
    userRole: 'rider',
    title: 'Welcome to Ridebhai! 🎉',
    message: 'Your travel buddy is ready. Save up to 70% on highway travel.',
    type: 'system',
    time: '3 days ago',
    read: true,
  },
];
