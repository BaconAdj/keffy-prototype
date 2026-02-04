// app/api/booking/route.ts
// PHASE 2: Booking Agent - Structured data collection and validation

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  validateBookingParameters,
  categorizePassengers,
  generateFlightLink,
  generatePassengerBreakdown,
  extractAges,
  validateAges
} from '@/lib/booking-helpers';

export async function POST(req: Request) {
  try {
    const { messages, travelContext } = await req.json();
    const { userId: clerkUserId } = await auth();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Validate we have the confirmed itinerary
    if (!travelContext.itineraryConfirmed) {
      return NextResponse.json(
        { error: 'Itinerary must be confirmed before booking' },
        { status: 400 }
      );
    }

    // ==== CODE HANDLES VALIDATION ====
    
    // Extract ages from latest messages
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').slice(-1)[0];
    const extractedAges = lastUserMessage ? extractAges(lastUserMessage.content) : [];
    
    // Update context with extracted ages
    if (extractedAges.length > 0) {
      travelContext.childrenAges = extractedAges;
    }
    
    // Validate booking parameters
    const bookingParams = validateBookingParameters(messages, travelContext);
    
    // Validate age count matches declared children count
    let ageValidation = null;
    if (travelContext.childrenCount > 0) {
      ageValidation = validateAges(
        travelContext.childrenCount, 
        travelContext.childrenAges || []
      );
    }

    // ==== BOOKING AGENT PROMPT (Focused) ====
    
    let bookingPrompt = `You're handling a booking for Keffy. The user confirmed their itinerary and is ready to book.

**Confirmed Trip:**
- Destination: ${travelContext.destination || 'Unknown'}
- Dates: ${travelContext.departureDate || 'TBD'} to ${travelContext.returnDate || 'TBD'}
- Itinerary: ${travelContext.itinerary || 'See conversation'}

**Collect in order:**

1. **Passengers:** "How many people traveling with you?" (ADDITIONAL people, not including them)

2. **Ages:** If kids mentioned: "How old are your children?" Need ages for anyone under 18.

3. **Cabin class:** "Economy class, or would you prefer premium economy/business/first?"

4. **Generate flight link** once you have everything

**Keep conversational and brief.** Still Keffy, just collecting details.`;

    // Add missing info reminder if needed
    if (!bookingParams.complete && bookingParams.missing.length > 0) {
      bookingPrompt += `\n\n**STILL NEED:** ${bookingParams.missing.join(', ')}`;
    }

    // Add age validation warning
    if (ageValidation && !ageValidation.valid) {
      bookingPrompt += `\n\n**MISSING AGES:** User said ${travelContext.childrenCount} kids but only provided ${(travelContext.childrenAges || []).length} ages. Ask for the missing ${ageValidation.missingCount} age(s).`;
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: bookingPrompt,
      messages: messages,
    });

    const assistantMessage = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n\n');

    // ==== GENERATE FLIGHT LINK IF COMPLETE ====
    
    let flightLink = null;
    let passengerBreakdown = null;
    
    if (bookingParams.complete && ageValidation?.valid !== false) {
      // Categorize passengers by age
      const passengers = categorizePassengers(
        bookingParams.ages,
        true // Include user
      );
      
      // Add spouse if mentioned
      if (travelContext.hasSpouse) {
        passengers.adults += 1;
      }
      
      // Generate flight link
      flightLink = generateFlightLink({
        origin: bookingParams.origin,
        destination: bookingParams.destination,
        departureDate: bookingParams.departureDate,
        returnDate: bookingParams.returnDate,
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        cabinClass: bookingParams.cabinClass
      });
      
      // Generate passenger breakdown text
      passengerBreakdown = generatePassengerBreakdown(
        passengers.adults,
        passengers.children,
        passengers.infants
      );
    }

    return NextResponse.json({
      response: assistantMessage,
      bookingParams,
      flightLink,
      passengerBreakdown,
      complete: bookingParams.complete && ageValidation?.valid !== false,
      phase: 'booking'
    });

  } catch (error: any) {
    console.error('Error in booking route:', error);
    return NextResponse.json(
      { error: error.message || 'Booking failed' },
      { status: 500 }
    );
  }
}
