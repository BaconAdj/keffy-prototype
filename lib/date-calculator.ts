// lib/date-calculator.ts
// Converts vague date references to actual dates

interface DateResult {
  startDate: string | null;
  endDate: string | null;
  confidence: 'high' | 'low';
}

/**
 * Extracts and calculates dates from conversation text
 * Returns YYYY-MM-DD format dates
 */
export function calculateDatesFromText(text: string): DateResult {
  const lowerText = text.toLowerCase();
  const today = new Date();
  
  // Day name mapping
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = today.getDay();
  
  // Helper: Get next occurrence of a day
  function getNextDay(dayName: string): Date {
    const targetIndex = dayNames.indexOf(dayName);
    if (targetIndex === -1) return today;
    
    let daysToAdd = targetIndex - currentDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // If day already passed this week, get next week
    
    const resultDate = new Date(today);
    resultDate.setDate(today.getDate() + daysToAdd);
    return resultDate;
  }
  
  // Helper: Format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  // Pattern 1: "this [day]" or just "[day]" (e.g., "this Saturday", "Sunday")
  const thisDayPattern = /\b(?:this\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/;
  const thisDayMatch = lowerText.match(thisDayPattern);
  
  // Pattern 2: "[day] to [day]" (e.g., "Saturday to Wednesday", "Sunday to Thursday")
  const rangePattern = /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+to\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/;
  const rangeMatch = lowerText.match(rangePattern);
  
  // Pattern 3: Explicit dates (YYYY-MM-DD, MM-DD, Month DD)
  const explicitDatePattern = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}-\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})\b/i;
  const explicitMatch = lowerText.match(explicitDatePattern);
  
  // Pattern 4: "this weekend"
  if (/\bthis\s+weekend\b/.test(lowerText)) {
    const saturday = getNextDay('saturday');
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    
    return {
      startDate: formatDate(saturday),
      endDate: formatDate(sunday),
      confidence: 'high'
    };
  }
  
  // Pattern 5: "next week"
  if (/\bnext\s+week\b/.test(lowerText)) {
    const nextMonday = getNextDay('monday');
    nextMonday.setDate(nextMonday.getDate() + 7); // Add a week
    
    return {
      startDate: formatDate(nextMonday),
      endDate: null,
      confidence: 'low'
    };
  }
  
  // Check range pattern first
  if (rangeMatch) {
    const [_, startDay, endDay] = rangeMatch;
    const startDate = getNextDay(startDay);
    
    // End day calculation: from START day, count forward
    const endDayIndex = dayNames.indexOf(endDay);
    const startDayIndex = dayNames.indexOf(startDay);
    
    let daysToAdd = endDayIndex - startDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // If end day is before start in week, it's next week
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      confidence: 'high'
    };
  }
  
  // Check single day pattern
  if (thisDayMatch) {
    const [_, dayName] = thisDayMatch;
    const date = getNextDay(dayName);
    
    return {
      startDate: formatDate(date),
      endDate: null,
      confidence: 'high'
    };
  }
  
  // Check explicit dates
  if (explicitMatch) {
    // For now, just flag that explicit dates were found
    // The AI should handle these directly
    return {
      startDate: null,
      endDate: null,
      confidence: 'low'
    };
  }
  
  // No dates detected
  return {
    startDate: null,
    endDate: null,
    confidence: 'low'
  };
}

/**
 * Generate human-readable date context for the AI
 */
export function generateDateContext(messages: Array<{role: string, content: string}>): string {
  // Only check the last 3 messages for date references
  const recentMessages = messages.slice(-3);
  const conversationText = recentMessages
    .map(m => m.content)
    .join(' ');
  
  const result = calculateDatesFromText(conversationText);
  
  if (result.confidence === 'high' && result.startDate) {
    const today = new Date();
    const currentDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let context = `**DATE CALCULATION ASSISTANCE:**\n`;
    context += `Today is: ${currentDate}\n`;
    
    if (result.endDate) {
      context += `User mentioned date range: ${result.startDate} to ${result.endDate}\n`;
      context += `Use these exact dates in YYYY-MM-DD format.\n`;
    } else {
      context += `User mentioned date: ${result.startDate}\n`;
      context += `Use this exact date in YYYY-MM-DD format.\n`;
    }
    
    return context;
  }
  
  // Low confidence or no dates detected
  const today = new Date();
  const currentDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `**TODAY'S DATE:** ${currentDate}\nIf user mentions day names, ask them to confirm specific dates.`;
}
