// lib/conversation-context.ts
// UPDATED: Added new fields for phase tracking and state management
// This merges your existing working extraction logic with new architecture fields

interface TravelContext {
  // Core trip details (existing)
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  
  // Passengers (existing)
  adults: number;
  children: number;
  infants: number;
  
  // NEW: Enhanced passenger tracking
  childrenCount: number;      // Declared number of kids
  childrenAges: number[];     // Provided ages
  hasSpouse: boolean;         // Spouse/partner mentioned
  
  // Booking details (existing)
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST_CLASS' | null;
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  
  // Multi-city (existing)
  isMultiCity: boolean;
  multiCityLegs: Array<{origin: string, destination: string, date: string}>;
  
  // NEW: Conversation state tracking
  itinerary: string | null;
  itineraryConfirmed: boolean;
  bookingStarted: boolean;
  flightLinkGenerated: boolean;
  hotelLinkGenerated: boolean;
}

/**
 * Extract travel context from conversation messages
 * RUNS ON EVERY MESSAGE to catch changes/updates
 * 
 * UPDATED: Now tracks additional state for phase management
 */
export function extractTravelContext(messages: any[]): TravelContext {
  const context: TravelContext = {
    // Existing defaults
    origin: 'Montreal',
    destination: null,
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: null,
    tripType: 'roundtrip',
    isMultiCity: false,
    multiCityLegs: [],
    
    // NEW: State tracking defaults
    childrenCount: 0,
    childrenAges: [],
    hasSpouse: false,
    itinerary: null,
    itineraryConfirmed: false,
    bookingStarted: false,
    flightLinkGenerated: false,
    hotelLinkGenerated: false
  };

  // Safe extraction with null checks
  const userText = messages?.filter(m => m?.role === 'user').map(m => m?.content || '').join(' ') || '';
  const allText = messages?.map(m => m?.content || '').join(' ') || '';
  const lastUserMsg = messages?.filter(m => m?.role === 'user').pop()?.content || '';

  // ========== YOUR EXISTING EXTRACTION LOGIC ==========
  // (Keep all your working cabin class, trip type, destination, date extraction)
  
  // Cabin Class
  if (/\b(first[\s-]?class|first)\b/i.test(userText)) {
    context.cabinClass = 'FIRST_CLASS';
  } else if (/\b(business[\s-]?class|business)\b/i.test(userText)) {
    context.cabinClass = 'BUSINESS';
  } else if (/\b(premium[\s-]?economy|premium)\b/i.test(userText)) {
    context.cabinClass = 'PREMIUM_ECONOMY';
  } else if (/\b(economy[\s-]?class|economy)\b/i.test(userText)) {
    context.cabinClass = 'ECONOMY';
  }

  // Trip Type
  if (/\b(one[\s-]?way|oneway)\b/i.test(userText)) {
    context.tripType = 'oneway';
  }

  // Multi-city detection (your existing logic)
  const multiCityPatterns = [
    /fly\s+(?:in)?to\s+([A-Za-z\s]+?)\s+and\s+(?:fly\s+)?out\s+(?:of\s+)?([A-Za-z\s]+)/i,
    /(\d+)\s+days?\s+in\s+([A-Za-z\s]+?)\s+and\s+(\d+)\s+days?\s+in\s+([A-Za-z\s]+)/i,
  ];
  
  for (const pattern of multiCityPatterns) {
    if (pattern.test(userText)) {
      context.isMultiCity = true;
      context.tripType = 'multicity';
      break;
    }
  }

  // Destination extraction (your existing logic with smart state detection)
  // ... (keep your full destination extraction code)

  // Date extraction (your existing logic)
  // ... (keep your full date extraction code)

  // ========== ENHANCED: Passenger extraction with new tracking ==========
  
  // Detect spouse/partner
  if (/with (my )?(wife|husband|partner|spouse)/i.test(userText) || /\b(my\s+)?wife\b/i.test(userText)) {
    context.hasSpouse = true;
  }

  // Extract declared children count
  const childCountMatch = /(\d+)\s*(?:kid|child)s?/i.exec(userText);
  if (childCountMatch) {
    context.childrenCount = parseInt(childCountMatch[1]);
  }

  // Extract ages (your existing patterns + twins/triplets)
  const agePatterns = [
    /(?:kid|child)s?\s*\(([^)]+)\)/gi,
    /(?:kid|child)s?\s+(?:are|is)\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi,
    /(?:kid|child)s?\s+ages?\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi,
  ];
  
  const ages: number[] = [];
  
  for (const pattern of agePatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(userText)) !== null) {
      if (match[1]) {
        const foundAges = match[1].match(/\d+/g)?.map(Number) || [];
        ages.push(...foundAges);
      }
    }
  }
  
  // Handle twins/triplets
  const twinMatch = /(\d+)\s*year\s*old\s+twins?/i.exec(userText);
  if (twinMatch) {
    ages.push(parseInt(twinMatch[1]));
  }
  
  const tripletMatch = /(\d+)\s*year\s*old\s+triplets?/i.exec(userText);
  if (tripletMatch) {
    const tripletAge = parseInt(tripletMatch[1]);
    ages.push(tripletAge, tripletAge);
  }
  
  context.childrenAges = ages;
  
  // Categorize passengers by age
  if (ages.length > 0) {
    context.adults = 0;
    context.children = 0;
    context.infants = 0;
    
    ages.forEach(age => {
      if (age < 2) context.infants++;
      else if (age >= 2 && age <= 11) context.children++;
      else context.adults++;
    });
    
    // Add spouse if mentioned
    if (context.hasSpouse) {
      context.adults += 1;
    }
    
    // Add user
    context.adults += 1;
  }

  // ========== NEW: State tracking ==========
  
  // Check if itinerary was proposed in assistant messages
  const assistantMessages = messages?.filter(m => m?.role === 'assistant') || [];
  const lastAssistant = assistantMessages[assistantMessages.length - 1];
  
  if (lastAssistant?.content && (
    lastAssistant.content.includes('Days 1-') ||
    lastAssistant.content.includes('Day 1:') ||
    /Days? \d+-\d+:/i.test(lastAssistant.content)
  )) {
    context.itinerary = lastAssistant.content;
  }
  
  // Check if booking has started (collecting passenger details)
  const hasAskedPassengers = allText.toLowerCase().includes('how many people');
  const hasAskedAges = allText.toLowerCase().includes('how old');
  const hasAskedCabin = allText.toLowerCase().includes('cabin class') || allText.toLowerCase().includes('economy or premium');
  
  if (hasAskedPassengers || hasAskedAges || hasAskedCabin) {
    context.bookingStarted = true;
//   }
//   
//   // Check if flight link was generated
//   if (allText.includes('FLIGHT_LINK_') || allText.includes('Search flights for')) {
//     context.flightLinkGenerated = true;
  }
  
  // Check if hotel link was generated
  if (allText.includes('BOOKING_LINK_') || allText.includes('HOTEL_LINK_')) {
    context.hotelLinkGenerated = true;
  }

  return context;
}

// Hotel link generation (your existing function - keep as is)
export function generateHotelLink(hotelName: string): string {
  const encodedName = encodeURIComponent(hotelName);
  return `BOOKING_LINK_${encodedName}`;
}

// Export for use in other files
export default {
  extractTravelContext,
  generateHotelLink
};
