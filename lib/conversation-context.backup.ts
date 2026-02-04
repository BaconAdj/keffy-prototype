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
  } else {
    // AUTO-DETECT multi-city from patterns
    
    // Pattern 1: "fly into [City1] and out of [City2]" (open-jaw)
    const openJawPattern = /fly\s+(?:in)?to\s+([A-Za-z\s]+?)\s+and\s+(?:fly\s+)?out\s+(?:of\s+)?([A-Za-z\s]+)/i;
    const matchOpenJaw = openJawPattern.exec(userText);
    
    // Pattern 2: "X days in [City1] and Y days in [City2]"
    const multiCityPattern1 = /(\d+)\s+days?\s+in\s+([A-Za-z\s]+?)\s+and\s+(\d+)\s+days?\s+in\s+([A-Za-z\s]+)/i;
    const match1 = multiCityPattern1.exec(userText);
    
    // Pattern 3: "fly to [City1] then [City2]"
    const multiCityPattern2 = /(?:fly|travel)\s+to\s+([A-Za-z\s]+?)\s+(?:then|and then)\s+(?:to\s+)?([A-Za-z\s]+)/i;
    const match2 = multiCityPattern2.exec(userText);
    
    // Pattern 4: "start in [City1] end in [City2]"
    const startEndPattern = /start\s+in\s+([A-Za-z\s]+?).*end\s+in\s+([A-Za-z\s]+)/i;
    const matchStartEnd = startEndPattern.exec(userText);
    
    // Pattern 5: "[City1] to [City2] to [City3]" - but only if cities are capitalized properly
    // This prevents matching "plan a family trip to Mexico"
    const multiCityPattern3 = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i;
    const match3 = multiCityPattern3.exec(userText);
    
    if (matchOpenJaw) {
      // Open-jaw detected: "fly into London and out of Amsterdam"
      context.tripType = 'multicity';
      
      const city1 = matchOpenJaw[1].trim();
      const city2 = matchOpenJaw[2].trim();
      
      console.log('Open-jaw detected:', { city1, city2 });
      
      // Set destination to first city for now
      // AI should ask if they want flights between cities or will travel overland
      if (!context.destination) {
        context.destination = city1.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Create basic 2-leg structure (user travels between cities on their own)
      if (context.departureDate && context.returnDate) {
        context.multiCityLegs = [
          {
            origin: context.origin || 'montreal',
            destination: city1.toLowerCase().replace(/\s+/g, '-'),
            date: context.departureDate
          },
          {
            origin: city2.toLowerCase().replace(/\s+/g, '-'),
            destination: context.origin || 'montreal',
            date: context.returnDate
          }
        ];
        
        console.log('Open-jaw legs (2-leg ticket):', context.multiCityLegs);
      }
      
    } else if (matchStartEnd) {
      // "start in X, end in Y"
      context.tripType = 'multicity';
      
      const city1 = matchStartEnd[1].trim();
      const city2 = matchStartEnd[2].trim();
      
      console.log('Start/end pattern detected:', { city1, city2 });
      
      if (!context.destination) {
        context.destination = city1.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Create 2-leg open-jaw structure
      if (context.departureDate && context.returnDate) {
        context.multiCityLegs = [
          {
            origin: context.origin || 'montreal',
            destination: city1.toLowerCase().replace(/\s+/g, '-'),
            date: context.departureDate
          },
          {
            origin: city2.toLowerCase().replace(/\s+/g, '-'),
            destination: context.origin || 'montreal',
            date: context.returnDate
          }
        ];
      }
      
    } else if (match1) {
      // Pattern 1 matched: "3 days in Rosario and 4 days in Buenos Aires"
      context.tripType = 'multicity';
      
      const days1 = parseInt(match1[1]);
      const city1 = match1[2].trim();
      const days2 = parseInt(match1[3]);
      const city2 = match1[4].trim();
      
      console.log('Multi-city detected:', { city1, days1, city2, days2 });
      
      // Calculate dates for each leg if we have departure date
      if (context.departureDate) {
        const leg1Date = new Date(context.departureDate);
        const leg2Date = new Date(leg1Date);
        leg2Date.setDate(leg1Date.getDate() + days1);
        const leg3Date = new Date(leg2Date);
        leg3Date.setDate(leg2Date.getDate() + days2);
        
        context.multiCityLegs = [
          {
            origin: context.origin || 'montreal',
            destination: city1.toLowerCase().replace(/\s+/g, '-'),
            date: leg1Date.toISOString().split('T')[0]
          },
          {
            origin: city1.toLowerCase().replace(/\s+/g, '-'),
            destination: city2.toLowerCase().replace(/\s+/g, '-'),
            date: leg2Date.toISOString().split('T')[0]
          },
          {
            origin: city2.toLowerCase().replace(/\s+/g, '-'),
            destination: context.origin || 'montreal',
            date: leg3Date.toISOString().split('T')[0]
          }
        ];
        
        // Update return date to final leg
        context.returnDate = leg3Date.toISOString().split('T')[0];
        
        console.log('Multi-city legs:', context.multiCityLegs);
      }
    } else if (match2 || match3) {
      // Pattern 2 or 3 matched - mark as multi-city but AI should ask for durations
      context.tripType = 'multicity';
      console.log('Multi-city detected (needs clarification)');
    }
  }

  // Extract multi-city legs if mentioned (legacy pattern)
  if (context.tripType === 'multicity' && context.multiCityLegs.length === 0) {
    // Pattern: "Toronto to Bali to Tokyo to Toronto"
    const cityChainPattern = /(?:from\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    const match = cityChainPattern.exec(userText);
    if (match) {
      console.log('Multi-city chain detected (needs dates):', match[0]);
      // AI should ask for specific dates for each leg
    }
  }

  // ========== DESTINATION ==========
  // Only extract destination if not already set (persist once found)
  if (!context.destination) {
    // Pattern 1: "to [City]" - explicit travel intention
    // Exclude common time words to avoid matching "go at the start" as a city
    const toCityPattern = /\b(?:to|visit|fly\s+to|travel\s+to|go\s+to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i;
    const toCityMatch = toCityPattern.exec(lastUserMsg);
    
    // Pattern 2: City selection from options - "[City] would be nice/perfect/great/sounds good"
    const citySelectionPattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:would be|sounds?|looks?|seems?)\s+(?:nice|perfect|great|good|wonderful|amazing|ideal)/i;
    const citySelectionMatch = citySelectionPattern.exec(lastUserMsg);
    
    // Pattern 3: Affirmative city choice - "Let's do/go with [City]" or just "[City]" alone
    const cityChoicePattern = /(?:let'?s\s+(?:do|go with|choose)|I'?ll take|I want)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    const cityChoiceMatch = cityChoicePattern.exec(lastUserMsg);
    
    // Pattern 4: Just the city name as a standalone response
    const standaloneCityPattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\.?$/i;
    const standaloneCityMatch = standaloneCityPattern.exec(lastUserMsg.trim());
    
    // Check if toCityMatch is a time word (false positive)
    const timeWords = ['at', 'on', 'in', 'by', 'during', 'for', 'after', 'before'];
    let validToCityMatch = null;
    if (toCityMatch) {
      const cityWord = toCityMatch[1].toLowerCase();
      if (!timeWords.includes(cityWord)) {
        validToCityMatch = toCityMatch;
      }
    }
    
    const cityMatch = validToCityMatch || citySelectionMatch || cityChoiceMatch || standaloneCityMatch;
    
    if (cityMatch) {
      const cityName = cityMatch[1].trim();
      const cityLower = cityName.toLowerCase().replace(/\s+/g, '-');
      
      console.log('Found city:', cityName);
      
      // Look for country and state/province mentions in ALL text
      let countryFound = null;
      let stateFound = null;
      
      // Pattern 1: "City, State/Province" or "City, Country" with comma
      const commaPattern = new RegExp(`${cityName},\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)`, 'i');
      const commaMatch = commaPattern.exec(allText);
      if (commaMatch) {
        const location = commaMatch[1].toLowerCase();
        console.log('Found location via comma pattern:', location);
        
        // Could be state or country - we'll determine later
        stateFound = location;
      }
      
      // Pattern 2: Look for countries in the conversation
      const countries = ['United States', 'USA', 'Canada', 'Australia', 'Argentina', 'Uruguay', 
                        'Jamaica', 'Kenya', 'Egypt', 'India', 'China', 'Japan', 'Thailand', 
                        'Chile', 'Peru', 'Ecuador', 'Colombia', 'Brazil', 'Mexico', 'France', 
                        'Germany', 'Italy', 'Spain', 'Portugal', 'Greece', 'Turkey', 'Morocco', 
                        'Vietnam', 'Malaysia', 'Indonesia', 'United Kingdom', 'UK'];
      
      for (const country of countries) {
        if (allText.toLowerCase().includes(country.toLowerCase())) {
          countryFound = country.toLowerCase().replace(/\s+/g, '-');
          if (country === 'USA') countryFound = 'united-states';
          if (country === 'UK') countryFound = 'united-kingdom';
          console.log('Found country via country list:', countryFound);
          break;
        }
      }
      
      // Pattern 3: Look for US states/Canadian provinces/Australian states in conversation
      const usStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
                       'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
                       'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
                       'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
                       'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
                       'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 
                       'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
                       'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 
                       'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
                       'Wisconsin', 'Wyoming'];
      
      const canadianProvinces = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
                                'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 
                                'Prince Edward Island', 'Quebec', 'Saskatchewan'];
      
      const australianStates = ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 
                               'Western Australia', 'Tasmania', 'Northern Territory'];
      
      const argentineProvinces = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán'];
      
      // Check for states/provinces
      const allStates = [...usStates, ...canadianProvinces, ...australianStates, ...argentineProvinces];
      
      for (const state of allStates) {
        if (allText.includes(state) && state.toLowerCase() !== cityName.toLowerCase()) {
          stateFound = state.toLowerCase().replace(/\s+/g, '-');
          console.log('Found state/province:', stateFound);
          
          // If we found a state but no country, infer country
          if (!countryFound) {
            if (usStates.includes(state)) countryFound = 'united-states';
            else if (canadianProvinces.includes(state)) countryFound = 'canada';
            else if (australianStates.includes(state)) countryFound = 'australia';
            else if (argentineProvinces.includes(state)) countryFound = 'argentina';
            console.log('Inferred country from state:', countryFound);
          }
          break;
        }
      }
      
      // Build destination string based on what we found
      if (stateFound && countryFound && 
          ['united-states', 'canada', 'australia', 'argentina'].includes(countryFound)) {
        // Format: city-state-country (for US/Canada/Australia/Argentina)
        context.destination = `${cityLower}-${stateFound}-${countryFound}`;
      } else if (countryFound) {
        // Format: city-country (for other countries)
        context.destination = `${cityLower}-${countryFound}`;
      } else {
        // Just city name if nothing else found
        context.destination = cityLower;
      }
      
      console.log('Final destination:', context.destination);
    }
  } else {
    console.log('Destination already set:', context.destination);
  }

  // ========== PASSENGERS (AGE-BASED) ==========
  // Adults: 11+, Children: 2-11, Infants: <2
  
  console.log('Analyzing passenger counts from:', userText.substring(0, 200));
  
  // Patterns to extract ages:
  const agePatterns = [
    /(?:kid|child)s?\s*\(([^)]+)\)/gi,                    // "2 kids (18 and 10)"
    /(?:kid|child)s?\s+(?:are|is)\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi,  // "kids are 13, 12, 8 and 1"
    /(?:kid|child)s?\s+ages?\s+([0-9,\s]+(?:and\s+[0-9]+)?)/gi,       // "kids ages 5, 6 and 7"
  ];
  
  const ages: number[] = [];
  
  for (const pattern of agePatterns) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    while ((match = pattern.exec(userText)) !== null) {
      console.log('Age pattern match:', match[0]);
      
      if (match[1]) {
        // Extract all numbers from the captured string
        // Handles: "13, 12, 8 and 1" or "5 and 6" or "18 and 10"
        const foundAges = match[1].match(/\d+/g)?.map(Number) || [];
        ages.push(...foundAges);
        console.log('Extracted ages from this match:', foundAges);
      }
    }
  }
  
  console.log('Extracted ages:', ages);
  
  // Check for twins/triplets mentions
  const twinPattern = /(\d+)\s*year\s*old\s+twins?/i;
  const tripletPattern = /(\d+)\s*year\s*old\s+triplets?/i;
  
  const twinMatch = twinPattern.exec(userText);
  const tripletMatch = tripletPattern.exec(userText);
  
  if (twinMatch) {
    const twinAge = parseInt(twinMatch[1]);
    console.log('Detected twins at age:', twinAge);
    // Add one more instance of this age (twin = 2 total, one already counted)
    ages.push(twinAge);
  }
  
  if (tripletMatch) {
    const tripletAge = parseInt(tripletMatch[1]);
    console.log('Detected triplets at age:', tripletAge);
    // Add two more instances of this age (triplet = 3 total, one already counted)
    ages.push(tripletAge, tripletAge);
  }
  
  console.log('Ages after twin/triplet adjustment:', ages);
  
  if (ages.length > 0) {
    // Ages were specified - categorize by age (AGES ARE SOURCE OF TRUTH)
    context.adults = 0;
    context.children = 0;
    context.infants = 0;
    
    ages.forEach(age => {
      if (age < 2) context.infants++;
      else if (age >= 2 && age <= 11) context.children++;
      else context.adults++;
    });
    
    // CRITICAL: User asked "How many traveling WITH YOU?" 
    // So we need to add the user (1 adult) + detect spouse
    
    // Check if spouse is mentioned (adds 1 more adult)
    if (/with (my )?(wife|husband|partner|spouse)/i.test(userText) || /\b(my\s+)?wife\b/i.test(userText)) {
      context.adults += 1; // Add spouse only (user added below)
    }
    
    // Always add the user themselves (the person booking)
    context.adults += 1;
    
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
  
  // VALIDATION: Minimum 1 adult required (minors need accompanying adult)
  if (context.adults === 0 && (context.children > 0 || context.infants > 0)) {
    console.warn('⚠️ No adults detected but children/infants present - adding 1 adult');
    context.adults = 1;
  }

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
