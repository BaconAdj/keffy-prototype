/**
 * Booking Service - Handles affiliate links and API integrations
 * Phase 1: Affiliate links
 * Phase 2: Real-time API searches
 */

export interface HotelSearchParams {
  destination: string;
  checkin: string;
  checkout: string;
  guests?: number;
  rooms?: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers?: number;
}

export interface ActivitySearchParams {
  destination: string;
  date?: string;
}

/**
 * Generate Booking.com affiliate link
 */
export function generateBookingComLink(params: HotelSearchParams): string {
  const affiliateId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || 'YOUR_AID';
  const baseUrl = 'https://www.booking.com/searchresults.html';
  
  const queryParams = new URLSearchParams({
    ss: params.destination,
    checkin: params.checkin,
    checkout: params.checkout,
    group_adults: String(params.guests || 2),
    no_rooms: String(params.rooms || 1),
    aid: affiliateId,
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate Skyscanner affiliate link
 */
export function generateSkyscannerLink(params: FlightSearchParams): string {
  const baseUrl = 'https://www.skyscanner.com/transport/flights';
  
  // Format: /origin/destination/departDate/returnDate
  const path = params.returnDate
    ? `${params.origin}/${params.destination}/${params.departDate}/${params.returnDate}`
    : `${params.origin}/${params.destination}/${params.departDate}`;

  return `${baseUrl}/${path}/?adultsv2=${params.passengers || 1}`;
}

/**
 * Generate GetYourGuide affiliate link
 */
export function generateGetYourGuideLink(params: ActivitySearchParams): string {
  const partnerId = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || 'YOUR_PARTNER_ID';
  const baseUrl = 'https://www.getyourguide.com/s/';
  
  const queryParams = new URLSearchParams({
    q: params.destination,
    partner_id: partnerId,
  });

  if (params.date) {
    queryParams.append('date', params.date);
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Future: Search hotels via Booking.com API
 * Requires Demand API access
 */
export async function searchHotels(params: HotelSearchParams) {
  // TODO: Implement when API access is approved
  // For now, return affiliate link
  return {
    type: 'affiliate_link',
    url: generateBookingComLink(params),
    message: 'Click to search hotels on Booking.com'
  };
}

/**
 * Future: Search flights via API
 * Options: Skyscanner, Kiwi.com, Amadeus
 */
export async function searchFlights(params: FlightSearchParams) {
  // TODO: Implement when API access is approved
  return {
    type: 'affiliate_link',
    url: generateSkyscannerLink(params),
    message: 'Click to search flights on Skyscanner'
  };
}

/**
 * Future: Search activities via GetYourGuide API
 */
export async function searchActivities(params: ActivitySearchParams) {
  // TODO: Implement when API access is approved
  return {
    type: 'affiliate_link',
    url: generateGetYourGuideLink(params),
    message: 'Click to browse activities on GetYourGuide'
  };
}

/**
 * Helper: Format booking links for Keffy's responses
 */
export function formatBookingLinks(destination: string, dates: { checkin: string; checkout: string }) {
  const hotelLink = generateBookingComLink({
    destination,
    checkin: dates.checkin,
    checkout: dates.checkout,
  });

  const activityLink = generateGetYourGuideLink({
    destination,
  });

  return {
    hotels: hotelLink,
    activities: activityLink,
  };
}
