import { CityLocation } from '../types';

export const POPULAR_CITIES: CityLocation[] = [
  {
    name: 'Delhi NCR',
    state: 'Delhi',
    popularPoints: ['Kashmere Gate ISBT', 'Dhaula Kuan Metro', 'IFFCO Chowk Gurgaon', 'Akshardham Metro', 'Botanical Garden Noida'],
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    popularPoints: ['Sindhi Camp Bus Stand', '200ft Bypass Ajmer Rd', 'Transport Nagar', 'World Trade Park Malviya Nagar'],
  },
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    popularPoints: ['ISBT Agra', 'Bhagwan Talkies', 'Yamuna Expressway Toll', 'Fatehabad Road'],
  },
  {
    name: 'Chandigarh',
    state: 'Punjab / Haryana',
    popularPoints: ['Sector 43 ISBT', 'Sector 17 Bus Stand', 'Tribune Chowk', 'Zirakpur Flyover'],
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    popularPoints: ['Dadar TT Circle', 'Vashi Toll Plaza', 'Thane Teen Hath Naka', 'Bandra Kurla Complex', 'Borivali West'],
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    popularPoints: ['Wakad Flyover', 'Hinjewadi Phase 1', 'Swargate Bus Stand', 'Viman Nagar', 'Shivajinagar'],
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    popularPoints: ['Silk Board Junction', 'Majestic Metro', 'Hebbal Flyover', 'Electronic City Toll', 'Marathahalli Bridge'],
  },
  {
    name: 'Mysore',
    state: 'Karnataka',
    popularPoints: ['Suburban Bus Stand', 'Columbia Asia Hospital', 'Infosys Gate Hebbal', 'Ring Road Junction'],
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    popularPoints: ['Geeta Mandir ISBT', 'ISCON Cross Roads', 'Naroda Patiya', 'C.G. Road'],
  },
  {
    name: 'Surat',
    state: 'Gujarat',
    popularPoints: ['Kamrej Toll', 'Varachha Main Road', 'Surat Railway Station', 'Adajan Circle'],
  },
  {
    name: 'Dehradun',
    state: 'Uttarakhand',
    popularPoints: ['ISBT Dehradun', 'Clock Tower', 'Rispana Bridge', 'Rajpur Road'],
  },
  {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    popularPoints: ['Alambagh Bus Stand', 'Charbagh', 'Polytechnic Chauraha', 'Shaheed Path'],
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    popularPoints: ['Gachibowli ORR', 'Hitec City', 'Ameerpet Metro', 'Secunderabad Station', 'LB Nagar Ring Road'],
  },
];

// Distance matrix and estimated pricing (in INR) for realistic pricing calculations
export const ROUTE_DISTANCES: Record<string, { distanceKm: number; duration: string; defaultPrice: number }> = {
  'Delhi NCR-Jaipur': { distanceKm: 280, duration: '4h 45m', defaultPrice: 450 },
  'Jaipur-Delhi NCR': { distanceKm: 280, duration: '4h 45m', defaultPrice: 450 },
  'Delhi NCR-Agra': { distanceKm: 220, duration: '3h 30m', defaultPrice: 380 },
  'Agra-Delhi NCR': { distanceKm: 220, duration: '3h 30m', defaultPrice: 380 },
  'Delhi NCR-Chandigarh': { distanceKm: 250, duration: '4h 15m', defaultPrice: 420 },
  'Chandigarh-Delhi NCR': { distanceKm: 250, duration: '4h 15m', defaultPrice: 420 },
  'Delhi NCR-Dehradun': { distanceKm: 260, duration: '5h 30m', defaultPrice: 490 },
  'Dehradun-Delhi NCR': { distanceKm: 260, duration: '5h 30m', defaultPrice: 490 },
  'Delhi NCR-Lucknow': { distanceKm: 530, duration: '7h 30m', defaultPrice: 850 },
  'Lucknow-Delhi NCR': { distanceKm: 530, duration: '7h 30m', defaultPrice: 850 },
  'Mumbai-Pune': { distanceKm: 150, duration: '3h 00m', defaultPrice: 320 },
  'Pune-Mumbai': { distanceKm: 150, duration: '3h 00m', defaultPrice: 320 },
  'Mumbai-Surat': { distanceKm: 290, duration: '5h 15m', defaultPrice: 520 },
  'Surat-Mumbai': { distanceKm: 290, duration: '5h 15m', defaultPrice: 520 },
  'Bangalore-Mysore': { distanceKm: 145, duration: '2h 15m', defaultPrice: 280 },
  'Mysore-Bangalore': { distanceKm: 145, duration: '2h 15m', defaultPrice: 280 },
  'Ahmedabad-Surat': { distanceKm: 265, duration: '4h 30m', defaultPrice: 400 },
  'Surat-Ahmedabad': { distanceKm: 265, duration: '4h 30m', defaultPrice: 400 },
  'Hyderabad-Pune': { distanceKm: 560, duration: '9h 30m', defaultPrice: 900 },
  'Pune-Hyderabad': { distanceKm: 560, duration: '9h 30m', defaultPrice: 900 },
};

export const getRouteInfo = (fromCity: string, toCity: string) => {
  const key = `${fromCity}-${toCity}`;
  if (ROUTE_DISTANCES[key]) {
    return ROUTE_DISTANCES[key];
  }
  // Default fallback estimation
  return {
    distanceKm: 220,
    duration: '3h 45m',
    defaultPrice: 390,
  };
};
