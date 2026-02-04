// lib/travelpayouts-links.ts
// Travelpayouts Partner Integration with Direct Affiliate Links
// These are Travelpayouts redirect links that track commissions

/**
 * TRAVELPAYOUTS REDIRECT BASE URLS
 * These track clicks and conversions through Travelpayouts
 */
const TRAVELPAYOUTS_LINKS = {
  klook: 'https://klook.tpo.lu/H5AgBypX',
  localrent: 'https://localrent.tpo.lu/379P6pp6',
  welcomePickups: 'https://tpo.lu/PFGjcOjB',
  tiqets: 'https://tiqets.tpo.lu/LgIo455N',
  ekta: 'https://ektatraveling.tpo.lu/NM7gmV42',
  kiwitaxi: 'https://kiwitaxi.tpo.lu/KuTg8swU',
  airhelp: 'https://airhelp.tpo.lu/unL8bVj3',
  getrentacar: 'https://getrentacar.tpo.lu/UsR3U2uU'
};

/**
 * ========================================
 * HIGH PRIORITY: BOOKING.COM - Hotels
 * ========================================
 * Note: Booking.com integration separate from Travelpayouts
 */

export interface HotelSearchParams {
  destination: string;
  checkIn: string;      // YYYY-MM-DD
  checkOut: string;     // YYYY-MM-DD
  adults: number;
  children?: number;
  rooms?: number;
}

export function generateBookingLink(params: HotelSearchParams): string {
  const { destination, checkIn, checkOut, adults, children = 0, rooms = 1 } = params;
  
  const baseUrl = 'https://www.booking.com/searchresults.html';
  const formattedDest = destination.replace(/-/g, '+');
  
  const urlParams = new URLSearchParams({
    ss: formattedDest,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults.toString(),
    group_children: children.toString(),
    no_rooms: rooms.toString(),
    selected_currency: 'USD',
    aid: process.env.BOOKING_AFFILIATE_ID || '1234567'
  });
  
  return `${baseUrl}?${urlParams.toString()}`;
}

export function generateSpecificHotelLink(params: {
  hotelName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
}): string {
  const { hotelName, destination, checkIn, checkOut, adults, children = 0 } = params;
  
  const searchQuery = `${hotelName} ${destination}`.replace(/\s+/g, '+');
  const baseUrl = 'https://www.booking.com/searchresults.html';
  
  const urlParams = new URLSearchParams({
    ss: searchQuery,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults.toString(),
    group_children: children.toString(),
    aid: process.env.BOOKING_AFFILIATE_ID || '1234567'
  });
  
  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * ========================================
 * HIGH PRIORITY: KLOOK - Activities
 * ========================================
 */

export interface ActivityParams {
  activity: string;
  destination: string;
  date?: string;
}

export function generateKlookLink(params: ActivityParams): string {
  const { activity, destination } = params;
  
  // Use Travelpayouts redirect link
  // Append search parameters that Klook will recognize after redirect
  const searchQuery = `${activity} ${destination}`.replace(/\s+/g, '+');
  
  return `${TRAVELPAYOUTS_LINKS.klook}?q=${searchQuery}`;
}

/**
 * ========================================
 * HIGH PRIORITY: CAR RENTALS
 * ========================================
 * Localrent.com & GetRentacar.com
 */

export interface CarRentalParams {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  provider?: 'localrent' | 'getrentacar';
}

export function generateCarRentalLink(params: CarRentalParams): string {
  const {
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate,
    provider = 'localrent'
  } = params;
  
  const dropoff = dropoffLocation || pickupLocation;
  
  if (provider === 'localrent') {
    // Use Travelpayouts Localrent link
    return `${TRAVELPAYOUTS_LINKS.localrent}?pickup=${encodeURIComponent(pickupLocation)}&dropoff=${encodeURIComponent(dropoff)}&pickup_date=${pickupDate}&dropoff_date=${dropoffDate}`;
  }
  
  // GetRentacar
  return `${TRAVELPAYOUTS_LINKS.getrentacar}?pickup=${encodeURIComponent(pickupLocation)}&dropoff=${encodeURIComponent(dropoff)}&pickup_date=${pickupDate}&dropoff_date=${dropoffDate}`;
}

/**
 * ========================================
 * HIGH PRIORITY: AIRPORT TRANSFERS
 * ========================================
 * Welcome Pickups & Kiwitaxi
 */

export interface TransferParams {
  fromAirport: string;
  toAddress: string;
  date: string;
  passengers: number;
  provider?: 'welcome-pickups' | 'kiwitaxi';
}

export function generateAirportTransferLink(params: TransferParams): string {
  const {
    fromAirport,
    toAddress,
    date,
    passengers,
    provider = 'welcome-pickups'
  } = params;
  
  if (provider === 'welcome-pickups') {
    return `${TRAVELPAYOUTS_LINKS.welcomePickups}?from=${encodeURIComponent(fromAirport)}&to=${encodeURIComponent(toAddress)}&date=${date}&passengers=${passengers}`;
  }
  
  // Kiwitaxi
  return `${TRAVELPAYOUTS_LINKS.kiwitaxi}?from=${encodeURIComponent(fromAirport)}&to=${encodeURIComponent(toAddress)}&passengers=${passengers}`;
}

/**
 * ========================================
 * MEDIUM PRIORITY: TIQETS
 * ========================================
 */

export function generateTiqetsLink(attraction: string, city: string): string {
  const searchQuery = `${attraction} ${city}`.replace(/\s+/g, '+');
  return `${TRAVELPAYOUTS_LINKS.tiqets}?q=${searchQuery}`;
}

/**
 * ========================================
 * MEDIUM PRIORITY: EKTA INSURANCE
 * ========================================
 */

export interface InsuranceParams {
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
}

export function generateInsuranceLink(params: InsuranceParams): string {
  const { destination, departureDate, returnDate, travelers } = params;
  
  return `${TRAVELPAYOUTS_LINKS.ekta}?destination=${encodeURIComponent(destination)}&departure=${departureDate}&return=${returnDate}&travelers=${travelers}`;
}

/**
 * ========================================
 * LOW PRIORITY: AIRHELP
 * ========================================
 */

export function generateAirHelpLink(): string {
  // AirHelp is just a direct link - no parameters needed
  return TRAVELPAYOUTS_LINKS.airhelp;
}

/**
 * ========================================
 * HELPER FUNCTIONS
 * ========================================
 */

export function shouldSuggestCarRental(destination: string, isMultiCity: boolean): boolean {
  if (isMultiCity) return true;
  
  const carFriendlyDestinations = [
    'orlando', 'miami', 'fort-lauderdale', 'los-angeles', 'san-diego',
    'hawaii', 'maui', 'portugal', 'lisbon', 'italy', 'tuscany',
    'spain', 'croatia', 'iceland', 'new-zealand', 'australia'
  ];
  
  const destLower = destination.toLowerCase();
  return carFriendlyDestinations.some(loc => destLower.includes(loc));
}

export function shouldSuggestActivities(destination: string): boolean {
  const activityDestinations = [
    'orlando', 'disney', 'universal', 'paris', 'london', 'tokyo',
    'dubai', 'singapore', 'barcelona', 'amsterdam', 'rome',
    'new-york', 'las-vegas', 'miami', 'los-angeles'
  ];
  
  const destLower = destination.toLowerCase();
  return activityDestinations.some(loc => destLower.includes(loc));
}

export function shouldSuggestAirportTransfer(hasChildren: boolean, destination: string): boolean {
  if (hasChildren) return true;
  
  const transferFriendlyDestinations = [
    'tokyo', 'bangkok', 'dubai', 'istanbul', 'paris', 'london'
  ];
  
  const destLower = destination.toLowerCase();
  return transferFriendlyDestinations.some(loc => destLower.includes(loc));
}

export default {
  // Hotel booking
  generateBookingLink,
  generateSpecificHotelLink,
  
  // Activities
  generateKlookLink,
  generateTiqetsLink,
  
  // Car rentals
  generateCarRentalLink,
  
  // Airport transfers
  generateAirportTransferLink,
  
  // Insurance
  generateInsuranceLink,
  
  // Flight compensation
  generateAirHelpLink,
  
  // Helper functions
  shouldSuggestCarRental,
  shouldSuggestActivities,
  shouldSuggestAirportTransfer,
  
  // Direct access to Travelpayouts links
  TRAVELPAYOUTS_LINKS
};
