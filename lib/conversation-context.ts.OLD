/**
 * Extract travel context from conversation messages
 * This helps generate accurate booking links with dates
 */

export interface TravelContext {
  destination?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
}

/**
 * Parse common date patterns and convert to YYYY-MM-DD format
 */
function parseDate(dateStr: string, year?: number): string | null {
  const currentYear = year || new Date().getFullYear();
  
  // Month name to number mapping
  const months: { [key: string]: number } = {
    'january': 0, 'jan': 0,
    'february': 1, 'feb': 1,
    'march': 2, 'mar': 2,
    'april': 3, 'apr': 3,
    'may': 4,
    'june': 5, 'jun': 5,
    'july': 6, 'jul': 6,
    'august': 7, 'aug': 7,
    'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9,
    'november': 10, 'nov': 10,
    'december': 11, 'dec': 11
  };
  
  const lower = dateStr.toLowerCase().trim();
  
  // Try to extract month and day
  const monthDayPattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})/i;
  const match = lower.match(monthDayPattern);
  
  if (match) {
    const monthName = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const month = months[monthName];
    
    if (month !== undefined && day >= 1 && day <= 31) {
      const date = new Date(currentYear, month, day);
      // Format as YYYY-MM-DD
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  
  return null;
}

/**
 * Extract destination from messages
 */
function extractDestination(messages: any[]): string | undefined {
  const recentMessages = messages.slice(-6).map(m => m.content.toLowerCase());
  const text = recentMessages.join(' ');
  
  // Common cities - expanded list
  const cities = [
    'tokyo', 'paris', 'london', 'new york', 'rome', 'barcelona', 
    'amsterdam', 'dubai', 'singapore', 'hong kong', 'sydney',
    'bali', 'santorini', 'mykonos', 'athens', 'istanbul',
    'bangkok', 'phuket', 'maldives', 'seychelles', 'mauritius',
    'venice', 'florence', 'milan', 'madrid', 'lisbon',
    'prague', 'budapest', 'vienna', 'berlin', 'munich',
    'stockholm', 'copenhagen', 'oslo', 'helsinki', 'reykjavik',
    'toronto', 'vancouver', 'montreal', 'mexico city', 'cancun',
    'los angeles', 'san francisco', 'chicago', 'miami', 'boston',
    'seattle', 'austin', 'nashville', 'new orleans', 'portland'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      // Capitalize first letter of each word
      return city.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  
  return undefined;
}

/**
 * Extract dates from messages
 */
function extractDates(messages: any[]): { checkin?: string; checkout?: string } {
  const recentMessages = messages.slice(-10).map(m => m.content);
  const text = recentMessages.join(' ');
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Look for date range patterns like "Feb 14-16" or "February 14-16"
  const rangePattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})[–\-](\d{1,2})/i;
  const rangeMatch = text.match(rangePattern);
  
  if (rangeMatch) {
    const monthName = rangeMatch[1];
    const startDay = rangeMatch[2];
    const endDay = rangeMatch[3];
    
    const checkinDate = parseDate(`${monthName} ${startDay}`, currentYear);
    const checkoutDate = parseDate(`${monthName} ${endDay}`, currentYear);
    
    if (checkinDate && checkoutDate) {
      // If dates are in the past, try next year
      const checkinTimestamp = new Date(checkinDate).getTime();
      const now = Date.now();
      
      if (checkinTimestamp < now) {
        const checkinNextYear = parseDate(`${monthName} ${startDay}`, nextYear);
        const checkoutNextYear = parseDate(`${monthName} ${endDay}`, nextYear);
        return { checkin: checkinNextYear || checkinDate, checkout: checkoutNextYear || checkoutDate };
      }
      
      return { checkin: checkinDate, checkout: checkoutDate };
    }
  }
  
  // Look for "Valentine's Day" or similar special dates
  if (text.toLowerCase().includes("valentine")) {
    // Calculate Valentine's weekend based on what day Feb 14 falls on
    const valentinesDay = new Date(nextYear, 1, 14); // Feb 14
    const dayOfWeek = valentinesDay.getDay(); // 0=Sunday, 6=Saturday
    
    let checkinDate: Date;
    let checkoutDate: Date;
    
    // If Valentine's falls on Fri/Sat/Sun, weekend includes Valentine's Day
    if (dayOfWeek === 5) { // Friday
      checkinDate = new Date(nextYear, 1, 14); // Check in Friday
      checkoutDate = new Date(nextYear, 1, 17); // Check out Monday
    } else if (dayOfWeek === 6) { // Saturday
      checkinDate = new Date(nextYear, 1, 13); // Check in Friday
      checkoutDate = new Date(nextYear, 1, 15); // Check out Sunday
    } else if (dayOfWeek === 0) { // Sunday
      checkinDate = new Date(nextYear, 1, 13); // Check in Friday
      checkoutDate = new Date(nextYear, 1, 15); // Check out Sunday
    } else { // Monday-Thursday: use the weekend BEFORE Valentine's
      // Find the previous Friday
      const daysUntilFriday = (dayOfWeek + 2) % 7; // Days from Friday
      checkinDate = new Date(nextYear, 1, 14 - daysUntilFriday - 2);
      checkoutDate = new Date(nextYear, 1, 14 - daysUntilFriday);
    }
    
    // Format as YYYY-MM-DD
    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    
    return { checkin: formatDate(checkinDate), checkout: formatDate(checkoutDate) };
  }
  
  // Look for two separate dates
  const datePattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})/gi;
  const allMatches = text.match(datePattern);
  
  if (allMatches && allMatches.length >= 2) {
    const date1 = parseDate(allMatches[0], currentYear);
    const date2 = parseDate(allMatches[1], currentYear);
    
    if (date1 && date2) {
      // Check if dates are in the past
      const date1Timestamp = new Date(date1).getTime();
      if (date1Timestamp < Date.now()) {
        return {
          checkin: parseDate(allMatches[0], nextYear) || date1,
          checkout: parseDate(allMatches[1], nextYear) || date2
        };
      }
      
      return { checkin: date1, checkout: date2 };
    }
  }
  
  return {};
}

/**
 * Extract number of guests
 */
function extractGuests(messages: any[]): number {
  const recentMessages = messages.slice(-6).map(m => m.content.toLowerCase());
  const text = recentMessages.join(' ');
  
  if (text.includes('couple') || text.includes('romantic') || text.includes('for two') || text.includes('for 2')) {
    return 2;
  }
  
  if (text.includes('family') || text.includes('kids') || text.includes('children')) {
    return 4;
  }
  
  // Look for explicit numbers like "3 people" or "party of 4"
  const numberPattern = /(\d+)\s+(people|guests|adults|persons|travelers)/;
  const match = text.match(numberPattern);
  if (match) {
    return parseInt(match[1]);
  }
  
  return 2; // Default
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
 * Generate hotel-specific booking link with dates
 */
export function generateHotelLink(hotelName: string, context: TravelContext, affiliateId: string): string {
  const params = new URLSearchParams();
  
  // Search query combines destination + hotel name
  const searchQuery = context.destination 
    ? `${hotelName} ${context.destination}`
    : hotelName;
  
  params.append('ss', searchQuery);
  params.append('aid', affiliateId);
  
  // Add dates if available
  if (context.checkin) params.append('checkin', context.checkin);
  if (context.checkout) params.append('checkout', context.checkout);
  
  // Add guests
  if (context.guests) params.append('group_adults', context.guests.toString());
  params.append('no_rooms', '1');
  
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
