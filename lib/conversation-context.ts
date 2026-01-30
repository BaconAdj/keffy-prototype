// lib/conversation-context.ts
// Extracts travel context from conversation messages
// Re-extracts on EVERY message to catch updates

interface TravelContext {
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST_CLASS' | null;
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  multiCityLegs: Array<{origin: string, destination: string, date: string}>;
}

/**
 * Extract travel context from conversation messages
 * RUNS ON EVERY MESSAGE to catch changes/updates
 */
export function extractTravelContext(messages: any[]): TravelContext {
  const context: TravelContext = {
    origin: 'Montreal',
    destination: null,
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: null,
    tripType: 'roundtrip',
    multiCityLegs: []
  };

  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const allText = messages.map(m => m.content).join(' ');
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

  // ========== CABIN CLASS ==========
  if (/\b(first[\s-]?class|first)\b/i.test(userText)) {
    context.cabinClass = 'FIRST_CLASS';
  } else if (/\b(business[\s-]?class|business)\b/i.test(userText)) {
    context.cabinClass = 'BUSINESS';
  } else if (/\b(premium[\s-]?economy|premium)\b/i.test(userText)) {
    context.cabinClass = 'PREMIUM_ECONOMY';
  } else if (/\b(economy[\s-]?class|economy)\b/i.test(userText)) {
    context.cabinClass = 'ECONOMY';
  }

  // ========== TRIP TYPE ==========
  if (/\b(one[\s-]?way|oneway)\b/i.test(userText)) {
    context.tripType = 'oneway';
  } else if (/\b(multi[\s-]?city|multicity)\b/i.test(userText)) {
    context.tripType = 'multicity';
    // Extract multi-city legs if mentioned
    // Pattern: "Toronto to Bali to Tokyo to Toronto"
    const cityChainPattern = /(?:from\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    const match = cityChainPattern.exec(userText);
    if (match) {
      // For now, just mark as multi-city - full parsing would be complex
      // The AI should ask for specifics
    }
  }

  // ========== DESTINATION ==========
  // Look for "to [City]" pattern - but be careful not to capture the "to" itself
  const toCityPattern = /\b(?:to|visit|fly\s+to|travel\s+to|go\s+to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
  const toCityMatch = toCityPattern.exec(lastUserMsg);
  
  if (toCityMatch) {
    const cityName = toCityMatch[1].trim();
    const cityLower = cityName.toLowerCase().replace(/\s+/g, '-');
    
    console.log('Found city:', cityName);
    
    // Look for country mentions in ALL text
    // First check if the AI response mentions the country
    let countryFound = null;
    
    // Pattern 1: "Kingston, Jamaica" with comma
    const pattern1 = new RegExp(`${cityName},\\s*([A-Z][a-z]+)`, 'i');
    const match1 = pattern1.exec(allText);
    if (match1) {
      countryFound = match1[1].toLowerCase();
      console.log('Found country via pattern1:', countryFound);
    }
    
    // Pattern 2: Look for standalone country names in the text
    if (!countryFound) {
      const countries = ['Uruguay', 'Jamaica', 'Kenya', 'Egypt', 'India', 'China', 'Japan', 'Thailand', 
                        'Australia', 'Chile', 'Peru', 'Ecuador', 'Colombia', 'Argentina', 'Brazil', 
                        'Mexico', 'Canada', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 
                        'Greece', 'Turkey', 'Morocco', 'Vietnam', 'Malaysia', 'Indonesia'];
      
      for (const country of countries) {
        if (allText.includes(country) && country.toLowerCase() !== cityName.toLowerCase()) {
          countryFound = country.toLowerCase();
          console.log('Found country via country list:', countryFound);
          break;
        }
      }
    }
    
    if (countryFound) {
      context.destination = `${cityLower}-${countryFound}`;
    } else {
      context.destination = cityLower;
    }
    
    console.log('Final destination:', context.destination);
  }

  // ========== PASSENGERS (AGE-BASED) ==========
  // Adults: 11+, Children: 2-11, Infants: <2
  
  console.log('Analyzing passenger counts from:', userText.substring(0, 200));
  
  // Patterns to extract ages:
  const agePatterns = [
    /(?:kid|child)s?\s*\(([^)]+)\)/gi,                    // "2 kids (18 and 10)"
    /(?:kid|child)s?\s+ages?\s+([0-9, and]+)/gi,          // "kids ages 5 and 6"
    /(?:kid|child)s?\s+are\s+([0-9, and]+)/gi,            // "My kids are 5 and 6"
    /(?:kid|child)s?\s+(?:is|are)\s+(\d+)\s+(?:and|&)\s+(\d+)/gi  // "children are 3 and 7"
  ];
  
  const ages: number[] = [];
  
  for (const pattern of agePatterns) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    while ((match = pattern.exec(userText)) !== null) {
      console.log('Age pattern match:', match[0]);
      if (match[1] && match[2]) {
        // Pattern with two capture groups (e.g., "5 and 6")
        ages.push(parseInt(match[1]), parseInt(match[2]));
      } else if (match[1]) {
        // Pattern with one capture group - extract all numbers
        const foundAges = match[1].match(/\d+/g)?.map(Number) || [];
        ages.push(...foundAges);
      }
    }
  }
  
  console.log('Extracted ages:', ages);
  
  if (ages.length > 0) {
    // Ages were specified - categorize by age
    context.adults = 0;
    context.children = 0;
    context.infants = 0;
    
    ages.forEach(age => {
      if (age < 2) context.infants++;
      else if (age >= 2 && age < 11) context.children++;
      else context.adults++;
    });
    
    // Add parent(s)
    if (/with (my )?(wife|husband|partner|spouse)/i.test(userText) || /\b(my\s+)?wife\b/i.test(userText)) {
      context.adults += 2; // User + spouse
    } else if (context.adults === 0) {
      context.adults = 1; // At least the user
    }
  } else {
    // No ages specified - use simple patterns
    if (/with (my )?(wife|husband|partner|spouse)/i.test(userText) || /\band\s+my\s+wife\b/i.test(userText)) {
      context.adults = 2;
    }
    
    if (/\bsolo\b/i.test(userText)) {
      context.adults = 1;
      context.children = 0;
      context.infants = 0;
    }
    
    // "2 kids" without ages - assume children (2-11)
    const simpleKidsMatch = /(\d+)\s*(?:kid|child)s?/i.exec(userText);
    if (simpleKidsMatch && ages.length === 0) {
      context.children = parseInt(simpleKidsMatch[1]);
    }
    
    // Explicit adult count
    const adultsMatch = /(\d+)\s*(?:adult)s?/i.exec(userText);
    if (adultsMatch) {
      context.adults = parseInt(adultsMatch[1]);
    }
    
    // Infants
    const infantsMatch = /(\d+)\s*(?:infant|baby)s?/i.exec(userText);
    if (infantsMatch) {
      context.infants = parseInt(infantsMatch[1]);
    }
  }
  
  console.log('Final passenger counts:', { adults: context.adults, children: context.children, infants: context.infants });

  // ========== DATES ==========
  // Pattern 1: "May 12-19"
  const dateRange1 = /([A-Z][a-z]+)\s+(\d{1,2})(?:\s*-\s*|\s+to\s+)(\d{1,2})/i;
  const match1 = dateRange1.exec(userText);
  
  if (match1) {
    const year = new Date().getFullYear();
    const depDate = new Date(`${match1[1]} ${match1[2]}, ${year}`);
    const retDate = new Date(`${match1[1]} ${match1[3]}, ${year}`);
    
    if (!isNaN(depDate.getTime())) context.departureDate = depDate.toISOString().split('T')[0];
    if (!isNaN(retDate.getTime())) context.returnDate = retDate.toISOString().split('T')[0];
  }

  // Pattern 2: "Feb 5 to Mar 12"
  const dateRange2 = /([A-Z][a-z]+)\s+(\d{1,2})\s+(?:to|-)\s+([A-Z][a-z]+)\s+(\d{1,2})/i;
  const match2 = dateRange2.exec(userText);
  
  if (match2) {
    const year = new Date().getFullYear();
    const depDate = new Date(`${match2[1]} ${match2[2]}, ${year}`);
    const retDate = new Date(`${match2[3]} ${match2[4]}, ${year}`);
    
    if (!isNaN(depDate.getTime())) context.departureDate = depDate.toISOString().split('T')[0];
    if (!isNaN(retDate.getTime())) context.returnDate = retDate.toISOString().split('T')[0];
  }

  // Pattern 3: "Feb22" or "on Feb 22"
  const singleDate = /([A-Z][a-z]+)\s*(\d{1,2})/i;
  const match3 = singleDate.exec(userText);
  
  if (match3 && !match1 && !match2) {
    const year = new Date().getFullYear();
    const depDate = new Date(`${match3[1]} ${match3[2]}, ${year}`);
    
    if (!isNaN(depDate.getTime())) {
      context.departureDate = depDate.toISOString().split('T')[0];
      
      // Check for duration
      const weekMatch = /for\s+(\d+)\s*weeks?/i.exec(userText);
      if (weekMatch) {
        const weeks = parseInt(weekMatch[1]);
        const returnDateObj = new Date(depDate);
        returnDateObj.setDate(depDate.getDate() + (weeks * 7));
        context.returnDate = returnDateObj.toISOString().split('T')[0];
      }
    }
  }

  console.log('Extracted context:', context);
  return context;
}

/**
 * Generate Booking.com hotel link
 */
export function generateHotelLink(hotelName: string, context: any, affiliateId: string): string {
  const destination = context.destination || hotelName;
  const checkin = context.departureDate || '';
  const checkout = context.returnDate || '';
  
  let url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&aid=${affiliateId}`;
  
  if (checkin) url += `&checkin=${checkin}`;
  if (checkout) url += `&checkout=${checkout}`;
  
  return url;
}
