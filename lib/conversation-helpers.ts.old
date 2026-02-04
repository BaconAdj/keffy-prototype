// lib/conversation-helpers.ts - WITH MANDATORY ITINERARY ENFORCEMENT

import { TravelContext } from './conversation-context';

/**
 * Detect conversation phase based on context and messages
 */
export function detectConversationPhase(messages: any[], context: TravelContext): string {
  const lastMessages = messages.slice(-5).map(m => m.content?.toLowerCase() || '');
  const fullText = lastMessages.join(' ');
  
  // Check for itinerary confirmation
  const confirmedPatterns = [
    /\b(yes|yeah|yep|yup)\b/i,
    /\b(perfect|great|excellent|wonderful|amazing)\b/i,
    /\b(sounds? good|that works?|looks? good)\b/i,
    /\b(love it|like it)\b/i,
    /\b(let'?s do it|let'?s go)\b/i
  ];
  
  const hasConfirmation = confirmedPatterns.some(pattern => pattern.test(fullText));
  
  if (hasConfirmation && context.destination && context.departureDate) {
    return 'booking';
  }
  
  // If we have destination and dates but no confirmation, we're in itinerary phase
  if (context.destination && context.departureDate) {
    return 'itinerary';
  }
  
  return 'exploration';
}

/**
 * Generate dynamic context based on phase
 */
export function generateDynamicContext(phase: string, context: TravelContext): string {
  switch (phase) {
    case 'exploration':
      return generateExplorationContext();
    
    case 'itinerary':
      return generateItineraryContext(context);
    
    case 'booking':
      return generateBookingContext(context);
    
    default:
      return '';
  }
}

function generateExplorationContext(): string {
  return `**EXPLORATION PHASE**

You're learning about their trip. Ask ONE question at a time:
- Where are they thinking of going?
- What's drawing them there?
- When are they thinking of traveling?
- Who's traveling with them?

Paint pictures. Build excitement. Make it conversational.

Do NOT jump to booking. Do NOT ask about cabin class or hotel budget yet.`;
}

function generateItineraryContext(context: TravelContext): string {
  return `**ITINERARY PHASE - MANDATORY BEFORE BOOKING**

You have basic info. Now PROPOSE A COMPLETE ITINERARY.

**You must:**
1. Create day-by-day plan from arrival to departure
2. Include arrival day (light activities, account for travel fatigue)
3. Include departure day (morning only, assume afternoon flight)
4. End with: "Sound good?" or "Does that work?"

**Example:**
"So here's what I'm thinking:
- Friday Feb 21: Arrive Fort Lauderdale, settle at your mom's place
- Saturday Feb 22: Beach day in Fort Lauderdale
- Sunday Feb 23: Drive to Orlando (3.5hrs), Disney evening
- Monday Feb 24: Full Disney day
- Tuesday Feb 25: Drive back to Fort Lauderdale morning, fly home afternoon

Sound good?"

**CRITICAL:** You MUST get explicit confirmation ("Yes", "Perfect", "Sounds great") before moving to booking.

**DO NOT:**
- Ask about cabin class yet
- Ask about hotel budget yet
- Generate any booking links
- Ask about passenger ages yet

Wait for their "Yes" first!`;
}

function generateBookingContext(context: TravelContext): string {
  const hasChildren = context.children > 0;
  const hasFlightDetails = context.adults >= 1 && context.cabinClass;
  
  if (!hasFlightDetails) {
    return `**BOOKING PHASE - COLLECT FLIGHT DETAILS**

Itinerary confirmed! Now collect booking details ONE question at a time:

**Step 1:** "How many people traveling with you?"
(They might say "4 - me, my wife, 2 kids" or just "4")

**Step 2 (if children):** "How old are your kids?"
(For age categorization: 0-1 = infant, 2-11 = child, 12+ = adult)

**Step 3:** "Economy class, or would you prefer premium/business?"

Then generate FLIGHT_LINK.`;
  }
  
  return `**BOOKING PHASE - UPSELLS**

Flight link generated. Now offer additional services ONE AT A TIME:

1. **Hotels** (if needed):
   "For hotels - checking in [date], checking out [date], right?"
   Wait for confirmation, then: BOOKING_LINK

2. **Tickets** (if Disney, museums, attractions):
   "Want to book your Disney tickets in advance? Skip-the-line access available."
   TIQETS_LINK

3. **Tours** (if food tours, walking tours, experiences):
   "Want to book a food tour? Local experts show you the best spots."
   GETYOURGUIDE_LINK

4. **Car rental** (if multi-city):
   "Need a rental car? Makes it easy to explore on your own schedule."
   CAR_RENTAL_LINK

5. **Airport transfer**:
   "Want an airport transfer? Much easier than figuring out taxis with luggage."
   TRANSFER_LINK

6. **Insurance**:
   "Have you thought about travel insurance? Covers cancellations and emergencies."
   INSURANCE_LINK

**CRITICAL:**
- Tiqets = TICKETS (Disney tickets, museum admission, skip-the-line)
- GetYourGuide = TOURS (food tours, walking tours, day trips, guided experiences)
- Ask about ONE service at a time
- Provide link immediately, don't ask for dates/times/details`;
}

export {
  generateExplorationContext,
  generateItineraryContext,
  generateBookingContext
};
