// Database types for TypeScript

export type ConversationStatus = 'active' | 'archived';
export type MessageRole = 'user' | 'assistant';
export type TravelStyle = 'relaxed' | 'adventurous' | 'luxury' | 'budget_conscious';
export type TripStatus = 'planning' | 'researching' | 'booked' | 'completed' | 'cancelled';
export type BookingType = 'flight' | 'hotel' | 'activity' | 'car' | 'other';
export type CommissionStatus = 'pending' | 'confirmed' | 'paid';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: ConversationStatus;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  home_city: string | null;
  travel_style: TravelStyle | null;
  dietary_restrictions: string | null;
  preferred_airlines: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  conversation_id: string | null;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers_count: number;
  budget: number | null;
  currency: string;
  status: TripStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripBooking {
  id: string;
  trip_id: string;
  booking_type: BookingType;
  provider: string;
  booking_reference: string | null;
  affiliate_link: string | null;
  amount: number | null;
  currency: string;
  commission_amount: number | null;
  commission_status: CommissionStatus;
  booking_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface ConversationSummary extends Conversation {
  message_count: number;
  last_message_at: string | null;
}

export interface TripSummary extends Trip {
  booking_count: number;
  total_spent: number | null;
  total_commission: number | null;
}
