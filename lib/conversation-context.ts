/**
 * Extract travel context from conversation messages
 * This helps generate accurate booking links
 */

export interface TravelContext {
  destination?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  tripType?: 'romantic' | 'family' | 'business' | 'adventure';
}

/**
 * Extract destination from messages
 */
function extractDestination(messages: any[]): string | undefined {
  // Look for common patterns in recent messages
  const recentMessages = messages.slice(-6).map(m => m.content.toLowerCase());
  const text = recentMessages.join(' ');
  
  // Common city patterns
  const cities = [
    'tokyo', 'paris', 'london', 'new york', 'rome', 'barcelona', 
    'amsterdam', 'dubai', 'singapore', 'hong kong', 'sydney',
    'bali', 'santorini', 'mykonos', 'athens', 'istanbul',
    'bangkok', 'phuket', 'maldives', 'seychelles', 'mauritius'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      // Capitalize first letter
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return undefined;
}

/**
 * Extract dates from messages
 * Looks for common date patterns
 */
function extractDates(messages: any[]): { checkin?: string; checkout?: string } {
  const recentMessages = messages.slice(-6).map(m => m.content);
  const text = recentMessages.join(' ');
  
  // Look for date patterns like "Feb 14-16" or "February 14-16"
  const datePattern = /(\w+)\s+(\d{1,2})[-–](\d{1,2})|(\d{4})-(\d{2})-(\d{2})/g;
  const matches = text.match(datePattern);
  
  if (matches && matches.length > 0) {
    // For now, return undefined - we'll enhance this later
    // TODO: Parse actual dates properly
    return {};
  }
  
  // Look for explicit date mentions like "Feb 14"
  const explicitPattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})/gi;
  const explicitMatches = text.match(explicitPattern);
  
  if (explicitMatches && explicitMatches.length >= 2) {
    // TODO: Convert to proper date format
    return {};
  }
  
  return {};
}

/**
 * Extract number of guests
 */
function extractGuests(messages: any[]): number {
  const recentMessages = messages.slice(-6).map(m => m.content.toLowerCase());
  const text = recentMessages.join(' ');
  
  // Look for "for two", "for 2", "couple", "romantic"
  if (text.includes('couple') || text.includes('romantic') || text.includes('for two') || text.includes('for 2')) {
    return 2;
  }
  
  // Look for family patterns
  if (text.includes('family') || text.includes('kids') || text.includes('children')) {
    return 4; // Default family size
  }
  
  return 2; // Default to 2
}

/**
 * Main function: Extract travel context from conversation
 */
export function extractTravelContext(messages: any[]): TravelContext {
  return {
    destination: extractDestination(messages),
    ...extractDates(messages),
    guests: extractGuests(messages),
  };
}

/**
 * Generate hotel-specific booking link
 */
export function generateHotelLink(hotelName: string, context: TravelContext, affiliateId: string): string {
  const params = new URLSearchParams();
  
  // Search query combines destination + hotel name for better results
  const searchQuery = context.destination 
    ? `${hotelName} ${context.destination}`
    : hotelName;
  
  params.append('ss', searchQuery);
  params.append('aid', affiliateId);
  
  if (context.checkin) params.append('checkin', context.checkin);
  if (context.checkout) params.append('checkout', context.checkout);
  if (context.guests) params.append('group_adults', context.guests.toString());
  
  params.append('no_rooms', '1');
  
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
