'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// ============================================================
// ITINERARY TYPES
// Matches the JSON schema output by Keffy
// ============================================================

export type ItineraryElement = {
  type: 'experience' | 'dining' | 'insider' | 'accommodation' | 'transport';
  title: string;
  description: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'flexible' | null;
  booking_link: string | null;
};

export type ItineraryDay = {
  day: number;
  date: string;
  theme: string;
  note: string | null;
  elements: ItineraryElement[];
};

export type InsiderTip = {
  tip: string;
};

export type BookingItem = {
  location: string;
  name: string | null;
  check_in: string;
  check_out: string;
  link: string | null;
};

export type ActivityItem = {
  title: string;
  link: string | null;
};

export type Itinerary = {
  destination: string;
  trip_concept: string;
  dates: {
    arrival: string;
    departure: string;
    duration_nights: number;
  };
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  days: ItineraryDay[];
  insider_tips: InsiderTip[];
  booking: {
    flights: { status: string; link: string | null };
    accommodation: BookingItem[];
    activities: ActivityItem[];
  };
  status: 'draft' | 'confirmed';
  generated_at: string;
};

// ============================================================
// CONTEXT
// ============================================================

type ItineraryContextType = {
  itinerary: Itinerary | null;
  setItinerary: (itinerary: Itinerary | null) => void;
  hasNewItinerary: boolean;
  setHasNewItinerary: (val: boolean) => void;
};

const ItineraryContext = createContext<ItineraryContextType>({
  itinerary: null,
  setItinerary: () => {},
  hasNewItinerary: false,
  setHasNewItinerary: () => {},
});

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [hasNewItinerary, setHasNewItinerary] = useState(false);

  return (
    <ItineraryContext.Provider value={{
      itinerary,
      setItinerary,
      hasNewItinerary,
      setHasNewItinerary,
    }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  return useContext(ItineraryContext);
}

// ============================================================
// ITINERARY PARSER
// Extracts JSON from Keffy's response and returns clean chat text
// ============================================================

export function extractItineraryFromMessage(message: string): {
  chatText: string;
  itinerary: Itinerary | null;
} {
  const startMarker = 'KEFFY_ITINERARY_START';
  const endMarker = 'KEFFY_ITINERARY_END';

  const startIndex = message.indexOf(startMarker);
  const endIndex = message.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return { chatText: message, itinerary: null };
  }

  // Extract JSON string between markers
  const jsonString = message
    .substring(startIndex + startMarker.length, endIndex)
    .trim();

  // Extract chat text (everything before the marker)
  const chatText = message.substring(0, startIndex).trim();

  try {
    const itinerary = JSON.parse(jsonString) as Itinerary;
    return { chatText, itinerary };
  } catch (e) {
    console.error('Failed to parse itinerary JSON:', e);
    // If parsing fails, show the full message without crashing
    return { chatText: message, itinerary: null };
  }
}
