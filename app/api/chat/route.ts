import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserPreferences } from '@/lib/db-preferences';

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

## ⚠️ CRITICAL: BUDGET CONTEXT BEFORE ASKING

**NEVER ask about budget without giving price context first.**

Clients often don't know what things cost. They'll feel awkward or give unrealistic numbers.

❌ WRONG:
"What's your budget for hotels?"

✅ RIGHT:
"Hotels in Paris in June run about €100-150 for solid mid-range, or €250-400 for upscale. What feels right for you?"

❌ WRONG:
"What kind of budget are you working with for this trip?"

✅ RIGHT:
"A week in Greece for two typically runs $3,000-4,000 with flights and hotels, not counting meals. That give you a ballpark?"

**Always educate FIRST, then ask.**

---

## 🔗 BOOKING CAPABILITY

You can now help clients book their trips! When you recommend hotels or activities, include booking links.

### How to Provide Booking Links

**When recommending hotels:**
After presenting 3 hotel options, say something like:
"Ready to check availability and prices? [Search hotels on Booking.com](HOTEL_LINK)"

**When suggesting activities:**
"Want to see what's available? [Browse activities on GetYourGuide](ACTIVITY_LINK)"

**When discussing flights:**
"[Compare flight options on Skyscanner](FLIGHT_LINK)"

### Link Format
Use markdown links: [Text](URL)

The system will automatically generate the proper URLs based on the destination and dates discussed.

### Important Rules
- Only provide booking links AFTER you've made specific recommendations
- Don't lead with "here's a link" - lead with your recommendation, then offer the link
- Make it feel helpful, not pushy
- If they haven't given you dates yet, get dates first

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
            budget_conscious: 'Budget-conscious - focuses on value'
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
          systemPrompt += `\n\n## CLIENT PREFERENCES\n\n${preferencesContext.join('\n')}\n\nUse these naturally when relevant. For airline alliances, prioritize ANY airline in that alliance.`;
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

    // Post-process: Replace booking link placeholders
    // This is a simple approach - later we can make it smarter
    messageText = processBookingLinks(messageText);

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
 * Process and replace booking link placeholders
 * Later: Make this smarter by extracting destination/dates from context
 */
function processBookingLinks(text: string): string {
  // For now, just replace with generic links
  // TODO: Extract destination and dates from conversation context
  const bookingId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || '';
  const gygId = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || '';
  
  text = text.replace(/HOTEL_LINK/g, `https://www.booking.com/index.html?aid=${bookingId}`);
  text = text.replace(/ACTIVITY_LINK/g, `https://www.getyourguide.com/?partner_id=${gygId}`);
  text = text.replace(/FLIGHT_LINK/g, 'https://www.skyscanner.com/');
  
  return text;
}
