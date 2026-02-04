// lib/booking-helpers.ts
// Phase 2: Booking Logic - All procedural rules moved to code

import { Message, TravelContext } from '@/types';

/**
 * PASSENGER CATEGORIZATION
 * Age-based categorization for airline pricing
 */

export interface PassengerBreakdown {
  adults: number;      // 11+ years
  children: number;    // 2-11 years
  infants: number;     // Under 2 years
  total: number;
}

export function categorizePassengers(ages: number[], includeUser: boolean = true): PassengerBreakdown {
  let adults = includeUser ? 1 : 0; // Start with the user if specified
  let children = 0;
  let infants = 0;
  
  // Check for spouse/partner mention in context
  // This would come from the travel context
  
  ages.forEach(age => {
    if (age < 2) {
      infants++;
    } else if (age >= 2 && age <= 11) {
      children++;
    } else {
      adults++;
    }
  });
  
  return {
    adults,
    children,
    infants,
    total: adults + children + infants
  };
}

/**
 * AGE EXTRACTION AND VALIDATION
 * Extracts ages from text and handles twins/triplets
 */

export function extractAges(text: string): number[] {
  const ages: number[] = [];
  
  // Pattern 1: "kids (18 and 10)"
  const pattern1 = /(?:kid|child)s?\s*\(([^)]+)\)/gi;
  let match = pattern1.exec(text);
  if (match) {
    const numbers = match[1].match(/\d+/g)?.map(Number) || [];
    ages.push(...numbers);
  }
  
  // Pattern 2: "kids are 13, 12, 8 and 1"
  const pattern2 = /(?:kid|child)s?\s+(?:are|is)\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi;
  match = pattern2.exec(text);
  if (match) {
    const numbers = match[1].match(/\d+/g)?.map(Number) || [];
    ages.push(...numbers);
  }
  
  // Pattern 3: "kids ages 5, 6 and 7"
  const pattern3 = /(?:kid|child)s?\s+ages?\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi;
  match = pattern3.exec(text);
  if (match) {
    const numbers = match[1].match(/\d+/g)?.map(Number) || [];
    ages.push(...numbers);
  }
  
  // Handle twins/triplets
  const twinMatch = /(\d+)\s*year\s*old\s+twins?/i.exec(text);
  if (twinMatch) {
    const twinAge = parseInt(twinMatch[1]);
    ages.push(twinAge); // Add second twin
  }
  
  const tripletMatch = /(\d+)\s*year\s*old\s+triplets?/i.exec(text);
  if (tripletMatch) {
    const tripletAge = parseInt(tripletMatch[1]);
    ages.push(tripletAge, tripletAge); // Add two more triplets
  }
  
  return ages;
}

export function validateAges(declaredCount: number, providedAges: number[]): {
  valid: boolean;
  missingCount: number;
} {
  return {
    valid: providedAges.length === declaredCount,
    missingCount: Math.max(0, declaredCount - providedAges.length)
  };
}

/**
 * BOOKING PARAMETERS VALIDATION
 * Checks if we have everything needed for booking
 */

export interface BookingParameters {
  complete: boolean;
  missing: string[];
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  ages: number[];
}

export function validateBookingParameters(
  messages: Message[],
  context: TravelContext
): BookingParameters {
  const missing: string[] = [];
  
  // Check required fields
  if (!context.origin) missing.push('origin');
  if (!context.destination) missing.push('destination');
  if (!context.departureDate) missing.push('departure date');
  if (!context.returnDate) missing.push('return date');
  if (context.adults === 0 && context.children === 0) missing.push('passenger count');
  if (!context.cabinClass) missing.push('cabin class');
  
  // Check age validation
  if (context.childrenCount > 0 && context.childrenAges.length < context.childrenCount) {
    missing.push('complete age information');
  }
  
  return {
    complete: missing.length === 0,
    missing,
    origin: context.origin || 'Montreal',
    destination: context.destination || '',
    departureDate: context.departureDate || '',
    returnDate: context.returnDate || '',
    adults: context.adults,
    children: context.children,
    infants: context.infants,
    cabinClass: context.cabinClass || 'economy',
    ages: context.childrenAges || []
  };
}

/**
 * FLIGHT LINK GENERATION
 * Creates properly formatted Kiwi.com links
 */

export interface FlightLinkParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass?: string;
  isMultiCity?: boolean;
  multiCityLegs?: Array<{
    origin: string;
    destination: string;
    date: string;
  }>;
}

export function generateFlightLink(params: FlightLinkParams): string {
  // Format destination (city-state-country for US/Canada/Australia/Argentina)
  const destination = formatDestinationForURL(params.destination);
  const origin = formatDestinationForURL(params.origin);
  
  // Base URL
  let url = 'https://www.kiwi.com/en/?';
  
  // Add parameters
  const urlParams = new URLSearchParams({
    adults: params.adults.toString(),
    children: params.children.toString(),
    infants: params.infants.toString(),
    outboundDate: params.departureDate,
    inboundDate: params.returnDate,
    destination: destination,
    origin: origin
  });
  
  // Add cabin class if specified
  if (params.cabinClass && params.cabinClass !== 'economy') {
    urlParams.append('cabinClass', params.cabinClass);
  }
  
  return url + urlParams.toString();
}

function formatDestinationForURL(destination: string): string {
  // Already formatted (contains hyphens)
  if (destination.includes('-')) {
    return destination;
  }
  
  // Convert spaces to hyphens and lowercase
  return destination.toLowerCase().replace(/\s+/g, '-');
}

/**
 * PASSENGER BREAKDOWN TEXT
 * Generates human-readable passenger breakdown
 */

export function generatePassengerBreakdown(
  adults: number,
  children: number,
  infants: number
): string {
  const parts: string[] = [];
  
  if (adults > 0) {
    parts.push(`${adults} adult${adults > 1 ? 's' : ''}`);
  }
  
  if (children > 0) {
    parts.push(`${children} ${children > 1 ? 'children' : 'child'}`);
  }
  
  if (infants > 0) {
    parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) return '0 passengers';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  
  // Three parts (adults, children, and infants)
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}

/**
 * CABIN CLASS DETECTION
 * Extracts cabin class from conversation
 */

export function detectCabinClass(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('first class') || lowerText.includes('first-class')) {
    return 'first';
  }
  if (lowerText.includes('business class') || lowerText.includes('business')) {
    return 'business';
  }
  if (lowerText.includes('premium economy') || lowerText.includes('premium-economy')) {
    return 'premium-economy';
  }
  if (lowerText.includes('economy')) {
    return 'economy';
  }
  
  return null;
}

/**
 * MULTI-CITY DETECTION
 * Determines if this is a multi-city trip
 */

export function detectMultiCity(text: string): boolean {
  // Patterns that indicate multi-city
  const multiCityPatterns = [
    /\d+\s+days?\s+in\s+[A-Z][a-z]+\s+(?:and|then)\s+\d+\s+days?\s+in/i,
    /fly\s+(?:in)?to\s+[A-Z][a-z]+\s+and\s+out\s+of\s+[A-Z][a-z]+/i,
    /start\s+in\s+[A-Z][a-z]+.*end\s+in\s+[A-Z][a-z]+/i,
  ];
  
  return multiCityPatterns.some(pattern => pattern.test(text));
}

export default {
  categorizePassengers,
  extractAges,
  validateAges,
  validateBookingParameters,
  generateFlightLink,
  generatePassengerBreakdown,
  detectCabinClass,
  detectMultiCity
};
