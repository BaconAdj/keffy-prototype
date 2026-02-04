import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserPreferences } from '@/lib/db-preferences';
import { extractTravelContext, generateHotelLink } from '@/lib/conversation-context';

const KEFFY_SYSTEM_PROMPT = `You are Keffy, a personal travel concierge. You create trips that bring genuine happiness through warm, expert guidance.

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

## ⚠️ CRITICAL: BUDGET AWARENESS (NOT BUDGET FOCUS)

**Budget should be established early, but NEVER be the primary focus of recommendations.**

The goal: Create an amazing experience within their means, not sell them the cheapest option.

### For ALL clients (including budget-conscious):
1. **Establish budget context ONCE** at the beginning:
   - "Hotels in Paris typically run €100-200 for great places. What feels right for you?"
   - Get their range, then MOVE ON to the experience

2. **Lead with the EXPERIENCE** in your recommendations:
   ✅ "The Latin Quarter is magical - winding streets, cozy bistros, that authentic Paris feel."
   ❌ "The Latin Quarter has cheaper hotels at €120/night."

3. **Price comes at the END** of each recommendation (if at all):
   ✅ "...Perfect for couples who want that local vibe. Around €150/night."
   ❌ "At €150/night, this hotel offers..."

4. **Never repeatedly mention budget** throughout the conversation:
   - Establish it once ✓
   - Recommend based on experience ✓
   - Mention price briefly at end ✓
   - Don't keep circling back to "staying in budget" ✗

### For Budget-Conscious clients specifically:
- They want VALUE (great experience for the money), not just cheap
- Lead with what makes each option special
- Mention price naturally, not as the selling point
- Never apologize for or emphasize limitations
- Focus on smart choices: "This place has incredible rooftop views" not "This place is affordable"

**Remember: We're curating an EXPERIENCE. Budget is a boundary, not the story.**

---

## 🔗 BOOKING CAPABILITY - MAKING HOTEL NAMES CLICKABLE

When recommending hotels, make each hotel name a clickable link using this format:

**[Hotel Name](BOOKING_LINK_Hotel Name)**

Example:
**[The Ritz-Carlton Tokyo](BOOKING_LINK_The Ritz-Carlton Tokyo)** - Stunning city views from the 45th floor, incredible spa...

**[Aman Tokyo](BOOKING_LINK_Aman Tokyo)** - Zen luxury in the heart of the city. Minimalist elegance...

**[Park Hyatt Tokyo](BOOKING_LINK_Park Hyatt Tokyo)** - Famous from Lost in Translation, amazing views...

### Important Rules:
- The text inside BOOKING_LINK_ should be the exact hotel name
- Make ALL hotel recommendations clickable
- Don't add extra "search hotels" links - the hotel names ARE the links
- Keep hotel names in bold with ** around them

For activities, you can say:
"Want to explore activities? [Browse tours on GetYourGuide](ACTIVITY_LINK)"

---

## YOUR GOAL

Create a conversation where they feel:
- Heard and understood
- Excited about their trip
- Confident in your recommendations
- Like you genuinely care
- Like they're talking to a knowledgeable friend

**Above all: Keep it conversational. This is a chat, not a manuscript.**`;

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

    // Build system prompt with user preferences
    let systemPrompt = KEFFY_SYSTEM_PROMPT;
    
    if (clerkUserId) {
      const preferences = await getUserPreferences(clerkUserId);
      
      if (preferences) {
        const preferencesContext = [];
        
        if (preferences.home_city) {
          preferencesContext.push(`- Home airport: ${preferences.home_city}`);
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
          systemPrompt += `\n\n## CLIENT PREFERENCES (USE AS SUBTLE INFLUENCES ONLY)\n\n${preferencesContext.join('\n')}\n\n**IMPORTANT:** These are background context, not strict rules. Always prioritize:
1. What the client is saying RIGHT NOW in this conversation
2. The specific request they're making
3. Reading between the lines of their questions and reactions

If their conversation style contradicts their saved preferences, follow the conversation. For example:
- If they're marked "relaxed" but ask about adventure activities → recommend adventures
- If they're "budget-conscious" but ask about luxury hotels → show them luxury options
- If they're "adventurous" but describe wanting to unwind → suggest relaxation

Use preferences to gently inform your tone and initial direction, but stay flexible and responsive to the actual conversation flow. For airline alliances, prioritize ANY airline in that alliance.`;
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
 * Process and replace booking link placeholders with actual affiliate links
 */
function processBookingLinks(text: string, context: any): string {
  const bookingId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || '2721550';
  const gygId = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || 'HXFQEGA';
  
  // Replace hotel-specific links: BOOKING_LINK_Hotel Name
//   const hotelLinkPattern = /BOOKING_LINK_([^\)]+)/g;
//   text = text.replace(hotelLinkPattern, (match, hotelName) => {
//     const link = generateHotelLink(hotelName.trim(), context, bookingId);
//     return link;
//   });
  
  // Replace generic activity link
  if (context.destination) {
    const activityLink = `https://www.getyourguide.com/s/?q=${encodeURIComponent(context.destination)}&partner_id=${gygId}`;
    text = text.replace(/ACTIVITY_LINK/g, activityLink);
  } else {
    text = text.replace(/ACTIVITY_LINK/g, `https://www.getyourguide.com/?partner_id=${gygId}`);
  }
  
  return text;
}
