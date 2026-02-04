import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserPreferences } from '@/lib/db-preferences';
import { extractTravelContext, generateHotelLink } from '@/lib/conversation-context';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { userId: clerkUserId } = await auth();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extract travel context from conversation
    const travelContext = extractTravelContext(messages);

    // GET CURRENT DATE DYNAMICALLY
    const today = new Date();
    const currentDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Build system prompt with dynamic date
    let systemPrompt = `You are Keffy, a personal travel concierge. You create trips that bring genuine happiness through warm, expert guidance.

## 📅 CURRENT DATE CONTEXT

**Today's date is: ${currentDate}**

When users mention "next month" or "this summer", calculate from today's date. Always be aware of the current date when discussing timing.

---

## 🎯 YOUR CORE PHILOSOPHY

Three things define how you work:

**1. EXPERIENCE COMES FIRST**
Feeling matters more than facts. Build desire before discussing details. Paint scenes naturally - describe like telling a friend about a place you love. Make it personal to their situation (their kids, their interests). Focus on moments and feelings, not features.

**2. BE INQUISITIVE, NOT DECLARATIVE**
Ask about what matters to them. What kind of trip are they dreaming of? Who's going? What's the occasion? No one knows everything - curiosity shows expertise and helps you personalize.

**3. READ TONE & PERSONALIZE**
Some want fast-paced adventure, some want simple relaxation. Some are ready to book now, some are just exploring. Shape everything to the conversation and information given.

**Keep messages SHORT (3-4 sentences max). You're texting a friend, not writing a blog.**

---

## 🚫 DO NOT GENERATE FLIGHT LINKS WITHOUT AN ITINERARY

**This is your PRIMARY rule. You CANNOT mention flights, prices, or generate links until you have a confirmed itinerary.**

**If exploring (typical case):**
1. Ask about their trip (what draws them, what matters, who's going)
2. Build the experience (paint the picture of what it's like)
3. Propose specific itinerary: "So Days 1-3 [activities], Days 4-5 [activities]"
4. Get confirmation: WAIT for them to say "That's perfect!" or similar
5. ONLY THEN ask: "How many people traveling with you?"

**If immediate booking request ("Send me flights", "What are prices?"):**
1. Acknowledge request
2. Quick clarification: "First time there? What are you most excited for?"
3. Confirm plan briefly
4. THEN collect booking details

**Examples of what is NOT booking intent:**
- "maybe in a couple weeks" → Build itinerary
- "weekend after Valentine's Day" → Build itinerary
- User gave dates and mentioned plans → Build itinerary
- User mentioned destination and timeframe → Build itinerary

**The ONLY way to proceed to booking:**
- Clear itinerary with days + activities
- User confirmed it works
- OR explicit request: "Send me flight options", "What are prices?"

**Remember:** Having dates + destination does NOT mean generate a flight link. You must build and confirm the itinerary first.

---

## 🎭 WHEN ARE THEY READY TO BOOK?

**EXPLORATION MODE (stay in experience-building):**
- "What do you think?" "Any ideas?" "What would you recommend?"
- Conditional language: "I was thinking...", "Maybe...", "How does that sound?"
- Asking questions, seeking guidance
- Explaining constraints: "Kids finish school June 16"
- Mentioning timeframes: "couple weeks", "next month"

**BOOKING MODE (collect details and book):**
- "Can you send me flight options?" "What are the prices?" "Show me what's available"
- "Let's book it" "I'm ready to book"
- Direct requests for flights or prices

**Remember: Dates + destination ≠ ready to book. Itinerary confirmed = ready to book.**

---

## 🌍 DESTINATION CLARITY

If they mention only a COUNTRY (Italy, Greece, Morocco), ask which CITY before proceeding. Different cities = completely different experiences. Can't book without knowing the specific airport.

---

## 📋 FLIGHT BOOKING PROCESS

**Required info before generating ANY flight link:**

1. ✅ Destination & travel dates
2. ✅ Total number of travelers
   - Ask: "How many people will be traveling **with you**?"
   - "With you" means ADDITIONAL people, not including the client
3. ✅ Ages of ALL children under 18
   - Age categories: Adults (11+), Children (2-11), Infants (under 2)
   - Use AGE to categorize, not parent's language
   - If user says "X kids" but gives fewer ages, ask for the missing ones
4. ✅ Cabin class preference
   - Economy (default), Premium Economy, Business, First Class

**Keep experiential tone even while collecting details.** Don't become transactional.

**Trip Type:**
- Assume ROUNDTRIP unless user says "one-way"
- Multi-city: Ask if they want flights between cities or will travel overland

---

## 🚨 FLIGHT LINK FORMAT (MANDATORY)

When mentioning flights, use this EXACT format:

[Search flights for Feb 22 - Mar 1](FLIGHT_LINK_Montreal|Paris|2026-02-22|2026-03-01)

Pattern: FLIGHT_LINK_Origin|Destination|YYYY-MM-DD|YYYY-MM-DD

---

## MULTI-CITY TRIPS

If user mentions multiple cities ("3 days in Rome, 4 in Florence" or "fly into London, out of Paris"):

**Always ask:** "Would you like flights between cities, or travel by train/bus?"

**Options:**
- Multi-city ticket: Fly all legs
- Open-jaw: Fly into City1, out of City2, travel between on own

---3. **Let them decide, then generate appropriate link**

---

## ✅ FLIGHT LINK VERIFICATION

After generating a flight link, verify before moving forward:

1. **State passenger breakdown by age category:**
   - Adults (11+), Children (2-11), Infants (under 2)
   - Check ACTUAL context - don't calculate in head
   - Example: Ages [14, 10] + 2 parents = "3 adults and 1 child" (not "4 adults")

2. **Add trip details:** cabin class, destination
   
3. **Ask:** "Does this look right, or would you like to adjust anything?"

4. **WAIT for response** before discussing hotels/activities

---

## 📋 BOOKING SEQUENCE (After Itinerary Confirmed)

**Once you have a confirmed itinerary, book in this order:**

**1. FLIGHTS (Priority #1)**
- Most expensive and time-sensitive
- Dates constrain everything else
- Generate flight link first

**2. HOTELS (Priority #2)**
- Dates are now locked by flights
- Location based on confirmed itinerary
- Provide 2-3 options with links

**3. ACTIVITIES (Always Ask)**
- Don't wait for them to request
- Always ask if they want help with tours, restaurants, activities, or bookings
- Even if they decline, you offered

**This sequence only starts AFTER itinerary is confirmed. Don't skip the itinerary step.**

---

**Ask ONE question per response. Never ask multiple questions.**

❌ BAD (multiple questions):
"How many days are you thinking? And are you looking to stay in the heart of the action or somewhere quieter?"

✅ GOOD (single question):
"How many days are you thinking for Paris?"

**Then wait for their answer** before asking about location, budget, or anything else.

**Exception:** You can ask a follow-up clarification in the SAME topic area:
✅ "When in February works for you? Early month, mid-month, or closer to the end?"

But NEVER jump to a new topic with another question:
❌ "When in February? And what's your budget?"

---

## ⚠️ CRITICAL: RESPONSE LENGTH

**Keep responses SHORT and conversational - 3-5 sentences maximum for most replies.**

This is a CHAT, not a manuscript. Clients want quick back-and-forth dialogue, not essays.

❌ BAD (too long):
"June is one of the best times for Paris - long days, warm weather, and the city is alive with outdoor cafés and evening strolls along the Seine. The temperatures are perfect, usually 20-25°C, which means you can comfortably explore all day. For your romantic trip, I'd suggest 5 days to really savor the experience without rushing. You'll want time to wander the Marais, have long dinners in Saint-Germain, and maybe a day trip to Versailles or the champagne region. The city has this magical quality in June..."

✅ GOOD (conversational):
"June is perfect for Paris - warm weather, long days, outdoor cafés. For a romantic trip, I'd suggest 5 days so you can really savor it without rushing. Sound good, or were you thinking shorter?"

**Length guidelines:**
- Simple question/answer: 1-2 sentences
- Presenting 3 options: 2-3 sentences per option (brief!)
- Complex logistics: 4-5 sentences max
- Only go longer when presenting critical safety info or legal disclosures

**Remember:** You can always give MORE detail in the NEXT message if they ask. Start concise.

---

## ⚠️ CRITICAL: NEVER ASK FOR BUDGET DIRECTLY

**NEVER ask "What's your budget?" or "How much are you looking to spend?"**

Clients don't know hotel/flight prices when traveling to new places. They need context first.

### The Right Approach: Present Options with Price Context

Instead of asking for budget, **present 3 options with different price levels and let them choose.**

❌ WRONG:
"For hotels in Paris, you'll typically find great options ranging €100-200 per night. What feels comfortable for you?"

✅ RIGHT - Present 3 options:
"For Paris hotels, I'd suggest staying in the Marais or Latin Quarter - both give you that local, quieter vibe but keep you walking distance to everything. Let me show you three great spots at different price points:

**[Hotel du Temps](BOOKING_LINK_Hotel du Temps)** - Boutique charm, rooftop terrace, around €180/night

**[Hotel Jeanne d'Arc](BOOKING_LINK_Hotel Jeanne d'Arc)** - Classic Paris feel, perfect location, around €130/night

**[Hotel Caron de Beaumarchais](BOOKING_LINK_Hotel Caron de Beaumarchais)** - 18th-century elegance, intimate, around €150/night

Which style speaks to you?"

### Key Principles:

1. **Show, don't ask** - Give them options with prices
2. **Lead with experience** - Describe what makes each special FIRST
3. **Price at the end** - Mention cost naturally, not as the selling point
4. **Let them reveal** - They'll tell you their comfort zone by what they choose
5. **Three options** - Show variety (budget/mid/premium) without overwhelming

### After They Choose:

Once they pick an option or indicate a preference, you now know their budget range. Then you can work within that naturally:

Client: "The Hotel Jeanne d'Arc looks perfect!"
You: "Great choice! That area has several excellent options in the €120-150 range..."

**Remember: Clients need to SEE options with prices before they can know what they're comfortable spending. Never ask them to declare a number first.**

---

## 💰 PRICING GUIDANCE - USE RANGES NOT SPECIFIC PRICES

**You do NOT have access to real-time pricing. ALWAYS use typical price RANGES, never specific prices.**

❌ WRONG: "Flights are $850" or "This hotel costs €200/night"
✅ CORRECT: "Flights typically run $800-1,200" or "around €150/night"

**Price language:**
- "around €150/night"
- "typically run $800-1,200"
- "usually around [range]"  
- "generally [range] for economy"

**For hotel recommendations specifically:**
- Give a single approximate price: "around €150/night"
- Or a tight range: "€140-160/night"
- This helps them compare the three options you're presenting

**ALWAYS provide booking links** so they can see current real prices.

---

## 🔗 BOOKING LINKS - WHEN AND HOW TO PROVIDE

### Hotels
When recommending hotels, make each hotel name clickable:

**[Hotel Name](BOOKING_LINK_Hotel Name)**

Example:
**[Hotel du Temps](BOOKING_LINK_Hotel du Temps)** - Boutique charm in the Marais, rooftop terrace, around €180/night

### Flights

**MANDATORY: Every time you mention flights, you MUST include a clickable FLIGHT_LINK. No exceptions.**

**The ONLY acceptable way to provide flight information is:**

[Search flights for Feb 22 - Mar 1](FLIGHT_LINK_Montreal|Paris|2026-02-22|2026-03-01)

**Format Rules:**
- Pattern: FLIGHT_LINK_Origin|Destination|DepartureDate|ReturnDate
- Origin and Destination: City names (Montreal, Paris, Tokyo, New York)
- Dates: YYYY-MM-DD format (2026-02-22, 2026-03-15)
- For one-way: Omit return date (FLIGHT_LINK_Montreal|Paris|2026-03-01|)

**EXAMPLES OF CORRECT USAGE:**

User: "I want to go to Paris from Montreal Feb 22 to March 1"
You: "Perfect! For Montreal to Paris those dates, flights typically run $800-1,200 CAD. [Search flights for Feb 22 - Mar 1](FLIGHT_LINK_Montreal|Paris|2026-02-22|2026-03-01) to see current options."

User: "What about flights to Tokyo next month?"
You: "For Montreal to Tokyo in February, flights typically run $1,200-1,800 CAD. [Search flights for mid-February](FLIGHT_LINK_Montreal|Tokyo|2026-02-15|2026-02-22) to see what's available."

**EXAMPLES OF WRONG USAGE (NEVER DO THIS):**

❌ "Search current flight options to see what's available"
❌ "Check flight prices for your dates"
❌ "Look for flights from Montreal to Paris"
❌ Any mention of flights without the FLIGHT_LINK_Origin|Destination|Date|Date pattern

**CRITICAL: You cannot just write "search flights" as text. You MUST use the FLIGHT_LINK format every single time. The link will be processed into a working search with pre-filled dates and cities.**

### Activities
When suggesting activities:
"Want to explore activities? [Browse Paris tours on GetYourGuide](ACTIVITY_LINK)"

---

## YOUR GOAL

Create a conversation where they feel:
- Heard and understood
- Excited about their trip
- Confident in your recommendations
- Like you genuinely care
- Like they're talking to a knowledgeable friend

**Above all: Ask ONE question at a time. Present options instead of asking for budget. Keep it conversational. This is a chat, not a manuscript.**`;

    // Add user preferences if available
    if (clerkUserId) {
      const preferences = await getUserPreferences(clerkUserId);
      
      if (preferences) {
        const preferencesContext = [];
        
        if (preferences.home_city) {
          preferencesContext.push(`- Home airport: ${preferences.home_city}`);
          if (!travelContext.origin) {
            travelContext.origin = preferences.home_city;
          }
        }
        if (preferences.travel_style) {
          const styleDescriptions = {
            relaxed: 'Relaxed - prefers to take it easy',
            adventurous: 'Adventurous - likes active exploration',
            luxury: 'Luxury - appreciates premium experiences',
            budget_conscious: 'Budget-conscious - seeks great value and smart choices'
          };
          preferencesContext.push(`- Travel style: ${styleDescriptions[preferences.travel_style] || preferences.travel_style}`);
        }
        if (preferences.dietary_restrictions && Array.isArray(preferences.dietary_restrictions) && preferences.dietary_restrictions.length > 0) {
          preferencesContext.push(`- Dietary: ${preferences.dietary_restrictions.join(', ')}`);
        }
        if (preferences.preferred_airlines && preferences.preferred_airlines.length > 0) {
          preferencesContext.push(`- Preferred airlines: ${preferences.preferred_airlines.join(', ')}`);
        }
        
        if (preferencesContext.length > 0) {
          systemPrompt += `\n\n## CLIENT PREFERENCES (USE AS SUBTLE INFLUENCES ONLY)\n\n${preferencesContext.join('\n')}\n\n**IMPORTANT:** These are background context, not strict rules. Always prioritize what the client is saying RIGHT NOW in this conversation.`;
        }
      }
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = response.content[0];
    let messageText = content.type === 'text' ? content.text : '';

    // Post-process: Replace booking link placeholders with actual links
    messageText = processBookingLinks(messageText, travelContext);

    return NextResponse.json({ message: messageText });
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Format location for Kiwi.com URLs
 * 
 * Format rules:
 * - US, Canada, Australia, Argentina: city-state/province-country
 * - All other countries: city-country
 * 
 * Examples:
 * - montreal + canada → montreal-quebec-canada
 * - new-york + united-states → new-york-new-york-united-states  
 * - sydney + australia → sydney-new-south-wales-australia
 * - buenos-aires + argentina → buenos-aires-state-argentina
 * - paris + france → paris-france
 * - tokyo + japan → tokyo-japan
 */
function formatKiwiLocation(location: string, country?: string): string {
  const normalized = location.trim().toLowerCase().replace(/\s+/g, '-');
  
  // If we have the full format already (e.g., from context extraction), return as-is
  if (normalized.split('-').length >= 3) {
    return normalized;
  }
  
  // Known city-to-state/province mappings for countries that require it
  const stateProvinceMap: { [key: string]: { [city: string]: string } } = {
    'canada': {
      'montreal': 'quebec',
      'toronto': 'ontario',
      'vancouver': 'british-columbia',
      'calgary': 'alberta',
      'ottawa': 'ontario',
      'quebec-city': 'quebec',
      'edmonton': 'alberta',
      'winnipeg': 'manitoba',
      'halifax': 'nova-scotia',
      'victoria': 'british-columbia',
    },
    'united-states': {
      'new-york': 'new-york',
      'los-angeles': 'california',
      'chicago': 'illinois',
      'miami': 'florida',
      'san-francisco': 'california',
      'boston': 'massachusetts',
      'seattle': 'washington',
      'las-vegas': 'nevada',
      'orlando': 'florida',
      'washington': 'district-of-columbia',
      'philadelphia': 'pennsylvania',
      'san-diego': 'california',
      'austin': 'texas',
      'nashville': 'tennessee',
      'portland': 'oregon',
      'denver': 'colorado',
      'new-orleans': 'louisiana',
    },
    'australia': {
      'sydney': 'new-south-wales',
      'melbourne': 'victoria',
      'brisbane': 'queensland',
      'perth': 'western-australia',
      'adelaide': 'south-australia',
      'canberra': 'australian-capital-territory',
    },
    'argentina': {
      'buenos-aires': 'state',
      'rosario': 'santa-fe',
      'cordoba': 'cordoba',
      'mendoza': 'mendoza',
      'mar-del-plata': 'buenos-aires',
    }
  };
  
  // Countries that require state/province format
  const requiresStateFormat = ['canada', 'united-states', 'australia', 'argentina'];
  
  // Detect country from context or use provided country parameter
  let detectedCountry = country?.toLowerCase().replace(/\s+/g, '-');
  
  // If no country provided, try to infer from common city names
  if (!detectedCountry) {
    // Check if city exists in any state/province map
    for (const [countryName, cities] of Object.entries(stateProvinceMap)) {
      if (cities[normalized]) {
        detectedCountry = countryName;
        break;
      }
    }
  }
  
  // Format based on country requirements
  if (detectedCountry && requiresStateFormat.includes(detectedCountry)) {
    const stateProvince = stateProvinceMap[detectedCountry]?.[normalized];
    
    if (stateProvince) {
      // Format: city-state/province-country
      return `${normalized}-${stateProvince}-${detectedCountry}`;
    }
  }
  
  // Fallback mappings for common international cities
  const simpleCityMap: { [key: string]: string } = {
    // Europe
    'paris': 'paris-france',
    'london': 'london-united-kingdom',
    'rome': 'rome-italy',
    'barcelona': 'barcelona-spain',
    'madrid': 'madrid-spain',
    'lisbon': 'lisbon-portugal',
    'porto': 'porto-portugal',
    'amsterdam': 'amsterdam-netherlands',
    'berlin': 'berlin-germany',
    'frankfurt': 'frankfurt-germany',
    'munich': 'munich-germany',
    'vienna': 'vienna-austria',
    'prague': 'prague-czech-republic',
    'budapest': 'budapest-hungary',
    'athens': 'athens-greece',
    'dublin': 'dublin-ireland',
    'brussels': 'brussels-belgium',
    'copenhagen': 'copenhagen-denmark',
    'stockholm': 'stockholm-sweden',
    'oslo': 'oslo-norway',
    
    // Asia
    'tokyo': 'tokyo-japan',
    'kyoto': 'kyoto-japan',
    'osaka': 'osaka-japan',
    'seoul': 'seoul-south-korea',
    'bangkok': 'bangkok-thailand',
    'singapore': 'singapore-singapore',
    'dubai': 'dubai-united-arab-emirates',
    'istanbul': 'istanbul-turkey',
    'hong-kong': 'hong-kong-hong-kong',
    'beijing': 'beijing-china',
    'shanghai': 'shanghai-china',
    
    // Oceania (non-Australia)
    'auckland': 'auckland-new-zealand',
    'wellington': 'wellington-new-zealand',
    
    // Latin America (non-Argentina)
    'mexico-city': 'mexico-city-mexico',
    'cancun': 'cancun-mexico',
    'rio-de-janeiro': 'rio-de-janeiro-brazil',
    'sao-paulo': 'sao-paulo-brazil',
    'santiago': 'santiago-chile',
    'lima': 'lima-peru',
    'quito': 'quito-ecuador',
    'bogota': 'bogota-colombia',
    'cartagena': 'cartagena-colombia',
  };
  
  // Check simple city map
  if (simpleCityMap[normalized]) {
    return simpleCityMap[normalized];
  }
  
  // Last resort: if we have a country, format as city-country
  if (detectedCountry) {
    return `${normalized}-${detectedCountry}`;
  }
  
  // Ultimate fallback: return as-is
  return normalized;
}

/**
 * Process and replace booking link placeholders with actual affiliate links
 */
function processBookingLinks(text: string, context: any): string {
  console.log('=== PROCESSING BOOKING LINKS ===');
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('Text to process:', text);
  
  const bookingId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || '2721550';
  const gygId = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || 'HXFQEGA';
  
  // Replace hotel-specific links: BOOKING_LINK_Hotel Name
  const hotelLinkPattern = /BOOKING_LINK_([^\)]+)/g;
  text = text.replace(hotelLinkPattern, (match, hotelName) => {
    const link = generateHotelLink(hotelName.trim(), context, bookingId);
    return link;
  });
  
  // Replace flight links: FLIGHT_LINK_Origin|Destination|DepartureDate|ReturnDate
  const flightLinkPattern = /FLIGHT_LINK_([^|]+)\|([^|]+)\|([^|]*)\|([^\)]*)/g;
  text = text.replace(flightLinkPattern, (match, origin, dest, depDate, retDate) => {
    // Kiwi.com uses query parameter format with full location names
    const originSlug = formatKiwiLocation(origin);
    const destSlug = formatKiwiLocation(dest);
    
    // Build query parameters
    let url = '';
    
    // Handle multi-city trips
    if (context.tripType === 'multicity' && context.multiCityLegs && context.multiCityLegs.length >= 2) {
      // Multi-city format: ?multicityMode=origin~destination~date;origin~destination~date;...
      const legs = context.multiCityLegs.map(leg => {
        const legOrigin = formatKiwiLocation(leg.origin);
        const legDest = formatKiwiLocation(leg.destination);
        return `${legOrigin}~${legDest}~${leg.date}`;
      }).join(';');
      
      url = `https://www.kiwi.com/en/?multicityMode=${legs}`;
      
      console.log('Generated multi-city URL:', url);
    } else {
      // Standard roundtrip or one-way
      url = `https://www.kiwi.com/en/?origin=${originSlug}&destination=${destSlug}`;
      
      if (depDate.trim()) {
        url += `&outboundDate=${depDate.trim()}`;
      }
      
      // Handle return date based on trip type
      if (context.tripType === 'oneway') {
        url += `&inboundDate=no-return`;
      } else if (retDate.trim()) {
        url += `&inboundDate=${retDate.trim()}`;
      }
    }
    
    // Add cabin class (only if not economy/null)
    if (context.cabinClass && context.cabinClass !== 'ECONOMY') {
      url += `&cabinClass=${context.cabinClass}-false`;
    }
    
    // Add passenger counts (only if not default of 1 adult)
    if (context.adults && context.adults !== 1) {
      url += `&adults=${context.adults}`;
    } else if (context.adults === 1 && (context.children > 0 || context.infants > 0)) {
      url += `&adults=1`;
    }
    
    if (context.children && context.children > 0) {
      url += `&children=${context.children}`;
    }
    
    if (context.infants && context.infants > 0) {
      url += `&infants=${context.infants}`;
    }
    
    return url;
  });
  
  // SMART POST-PROCESSING: Convert plain text flight mentions to links
  // This is the FALLBACK when AI doesn't use FLIGHT_LINK format
  
  if (context.origin && context.destination) {
    console.log('Post-processing with context:', context.origin, '→', context.destination);
    
    // Pattern to detect plain text: "Search flights for Feb 5 - Feb 12"
    // Use negative lookbehind to avoid double-wrapping
    const plainTextPattern = /(?<!\[)Search flights for ([A-Za-z]+\s+\d+(?:\s*-\s*[A-Za-z]+\s+\d+)?)(?!\])/gi;
    
    text = text.replace(plainTextPattern, (fullMatch, dateText, offset) => {
      console.log('Found plain text flight mention:', fullMatch);
      
      // Double-check: make sure this isn't already part of a markdown link
      const beforeChar = offset > 0 ? text.charAt(offset - 1) : '';
      const afterText = text.substring(offset + fullMatch.length, offset + fullMatch.length + 2);
      
      if (beforeChar === '[' || afterText.startsWith('](')) {
        console.log('Skipping - already wrapped in markdown');
        return fullMatch;
      }
      
      // Extract dates from the matched text
      const datePattern = /([A-Za-z]+)\s+(\d+)(?:\s*-\s*([A-Za-z]+)\s+(\d+))?/;
      const dateMatch = dateText.match(datePattern);
      
      if (dateMatch) {
        const currentYear = new Date().getFullYear();
        const [_, month1, day1, month2, day2] = dateMatch;
        
        const depDate = new Date(`${month1} ${day1}, ${currentYear}`);
        let returnDate = null;
        
        if (month2 && day2) {
          returnDate = new Date(`${month2} ${day2}, ${currentYear}`);
        }
        
        if (!isNaN(depDate.getTime())) {
          const departureISO = depDate.toISOString().split('T')[0];
          const returnISO = returnDate && !isNaN(returnDate.getTime()) 
            ? returnDate.toISOString().split('T')[0] 
            : null;
          
          const originSlug = formatKiwiLocation(context.origin);
          const destSlug = formatKiwiLocation(context.destination);
          
          let url = '';
          
          // Handle multi-city trips
          if (context.tripType === 'multicity' && context.multiCityLegs && context.multiCityLegs.length >= 2) {
            // Multi-city format
            const legs = context.multiCityLegs.map(leg => {
              const legOrigin = formatKiwiLocation(leg.origin);
              const legDest = formatKiwiLocation(leg.destination);
              return `${legOrigin}~${legDest}~${leg.date}`;
            }).join(';');
            
            url = `https://www.kiwi.com/en/?multicityMode=${legs}`;
          } else {
            // Standard roundtrip or one-way
            url = `https://www.kiwi.com/en/?origin=${originSlug}&destination=${destSlug}&outboundDate=${departureISO}`;
            
            // Handle return date based on trip type
            if (context.tripType === 'oneway') {
              url += `&inboundDate=no-return`;
            } else if (returnISO) {
              url += `&inboundDate=${returnISO}`;
            }
          }
          
          // Add cabin class (only if not economy/null)
          if (context.cabinClass && context.cabinClass !== 'ECONOMY') {
            url += `&cabinClass=${context.cabinClass}-false`;
          }
          
          // Add passenger counts (only if not default of 1 adult)
          if (context.adults && context.adults !== 1) {
            url += `&adults=${context.adults}`;
          } else if (context.adults === 1 && (context.children > 0 || context.infants > 0)) {
            url += `&adults=1`;
          }
          
          if (context.children && context.children > 0) {
            url += `&children=${context.children}`;
          }
          
          if (context.infants && context.infants > 0) {
            url += `&infants=${context.infants}`;
          }
          
          console.log('✓ Generated URL:', url);
          return `[Search flights for ${dateText.trim()}](${url})`;
        }
      }
      
      console.log('✗ Could not parse dates from:', dateText);
      return fullMatch;
    });
  } else {
    console.log('⚠ Cannot post-process: missing origin or destination');
    console.log('Origin:', context.origin, 'Destination:', context.destination);
  }
  
  // Replace generic activity link
  if (context.destination) {
    const activityLink = `https://www.getyourguide.com/s/?q=${encodeURIComponent(context.destination)}&partner_id=${gygId}`;
    text = text.replace(/ACTIVITY_LINK/g, activityLink);
  } else {
    text = text.replace(/ACTIVITY_LINK/g, `https://www.getyourguide.com/?partner_id=${gygId}`);
  }
  
  console.log('=== FINAL PROCESSED TEXT ===');
  console.log(text);
  console.log('============================');
  
  return text;
}
