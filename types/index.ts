// types/index.ts
// Type definitions for the layered architecture

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface TravelContext {
  // Core trip details
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  
  // Passengers
  adults: number;
  children: number;
  infants: number;
  childrenCount: number; // Declared count
  childrenAges: number[]; // Provided ages
  hasSpouse: boolean;
  
  // Booking details
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first' | null;
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  
  // Multi-city specific
  isMultiCity: boolean;
  multiCityLegs: Array<{
    origin: string;
    destination: string;
    date: string;
  }>;
  
  // Conversation state
  itinerary: string | null;
  itineraryConfirmed: boolean;
  bookingStarted: boolean;
  flightLinkGenerated: boolean;
  hotelLinkGenerated: boolean;
  
  // Additional context
  tripPurpose: string | null;
  interests: string[];
  constraints: string[];
}

export interface UserPreferences {
  customInstructions?: string;
  preferredAirlines?: string[];
  dietaryRestrictions?: string[];
  // Add more as needed
}

export interface BookingValidation {
  complete: boolean;
  missing: string[];
  errors: string[];
}

export interface PassengerCategorization {
  adults: number;
  children: number;
  infants: number;
  total: number;
  breakdown: string; // Human-readable
}

export interface FlightLinkResult {
  url: string;
  passengerBreakdown: string;
  cabinClass: string;
  tripType: string;
}

export interface ConversationState {
  phase: ConversationPhase;
  isExploring: boolean;
  isReadyToBook: boolean;
  needsDestinationClarity: boolean;
  needsItineraryConfirmation: boolean;
  canGenerateFlightLink: boolean;
}

export type ConversationPhase = 
  | 'initial'
  | 'destination'
  | 'experience'
  | 'itinerary'
  | 'booking'
  | 'flights'
  | 'hotels'
  | 'activities';

export interface DynamicContextOptions {
  phase: ConversationPhase;
  context: TravelContext;
  preferences?: UserPreferences;
}
