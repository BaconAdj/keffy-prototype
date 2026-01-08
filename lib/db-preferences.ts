import { getSupabaseAdmin } from './supabase';
import { UserPreferences, TravelStyle } from './database.types';

// =============================================
// USER PREFERENCES OPERATIONS
// =============================================

/**
 * Get user preferences (create default if doesn't exist)
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If doesn't exist, create default preferences
      if (error.code === 'PGRST116') {
        return await createUserPreferences(userId);
      }
      console.error('Error fetching user preferences:', error);
      return null;
    }

    // Convert dietary_restrictions from text to array if needed
    if (data && typeof data.dietary_restrictions === 'string') {
      data.dietary_restrictions = data.dietary_restrictions ? [data.dietary_restrictions] : [];
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return null;
  }
}

/**
 * Create default user preferences
 */
export async function createUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  try {
    const { data, error} = await getSupabaseAdmin()
      .from('user_preferences')
      .insert({
        user_id: userId,
        home_city: null,
        travel_style: null,
        dietary_restrictions: [],
        preferred_airlines: [],
        notes: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserPreferences:', error);
    return null;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences | null> {
  try {
    // Ensure dietary_restrictions is an array or null
    if (updates.dietary_restrictions !== undefined) {
      if (Array.isArray(updates.dietary_restrictions) && updates.dietary_restrictions.length === 0) {
        updates.dietary_restrictions = null as any;
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    return null;
  }
}

/**
 * Helper: Extract preferences from conversation and update
 * This can be called after a conversation to automatically update preferences
 */
export async function extractAndUpdatePreferences(
  userId: string,
  conversationText: string
): Promise<void> {
  try {
    const preferences = await getUserPreferences(userId);
    if (!preferences) return;

    const updates: Partial<UserPreferences> = {};
    const lowerText = conversationText.toLowerCase();

    // Extract home city - match against our known cities
    const cityPatterns = [
      /(?:from|live in|based in|home is|flying from)\s+([a-z\s]+(?:,\s*[a-z]+)?)/i,
      /(?:i'm from|i am from)\s+([a-z\s]+)/i
    ];
    
    for (const pattern of cityPatterns) {
      const match = conversationText.match(pattern);
      if (match && !preferences.home_city) {
        const mentionedCity = match[1].trim();
        // Could match against MAJOR_CITIES list here for validation
        updates.home_city = mentionedCity;
        break;
      }
    }

    // Extract dietary restrictions
    const dietaryKeywords = {
      'vegetarian': 'Vegetarian',
      'vegan': 'Vegan',
      'pescatarian': 'Pescatarian',
      'gluten-free': 'Gluten-free',
      'gluten free': 'Gluten-free',
      'dairy-free': 'Dairy-free', 
      'dairy free': 'Dairy-free',
      'nut allergy': 'Nut allergy',
      'shellfish allergy': 'Shellfish allergy',
      'kosher': 'Kosher',
      'halal': 'Halal'
    };
    
    const foundDietary: string[] = [];
    Object.entries(dietaryKeywords).forEach(([keyword, standardName]) => {
      if (lowerText.includes(keyword) && !foundDietary.includes(standardName)) {
        foundDietary.push(standardName);
      }
    });
    
    if (foundDietary.length > 0 && (!preferences.dietary_restrictions || preferences.dietary_restrictions.length === 0)) {
      updates.dietary_restrictions = foundDietary as any;
    }

    // Extract preferred airlines
    const airlineKeywords = {
      'air canada': 'Air Canada',
      'westjet': 'WestJet',
      'porter': 'Porter Airlines',
      'united': 'United Airlines',
      'american airlines': 'American Airlines',
      'delta': 'Delta Air Lines',
      'british airways': 'British Airways',
      'air france': 'Air France',
      'lufthansa': 'Lufthansa',
      'klm': 'KLM',
      'emirates': 'Emirates',
      'qatar': 'Qatar Airways'
    };
    
    const foundAirlines: string[] = [];
    Object.entries(airlineKeywords).forEach(([keyword, standardName]) => {
      if (lowerText.includes(keyword) && !foundAirlines.includes(standardName)) {
        foundAirlines.push(standardName);
      }
    });
    
    if (foundAirlines.length > 0 && (!preferences.preferred_airlines || preferences.preferred_airlines.length === 0)) {
      updates.preferred_airlines = foundAirlines;
    }

    // Update if we found anything
    if (Object.keys(updates).length > 0) {
      await updateUserPreferences(userId, updates);
    }
  } catch (error) {
    console.error('Error in extractAndUpdatePreferences:', error);
  }
}
