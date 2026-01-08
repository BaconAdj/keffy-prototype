'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { AIRPORT_CITIES, DIETARY_SUGGESTIONS, AIRLINE_SUGGESTIONS } from '@/lib/airport-cities';

interface UserPreferences {
  home_city: string;
  travel_style: 'relaxed' | 'adventurous' | 'luxury' | 'budget_conscious' | '';
  dietary_restrictions: string[];
  preferred_airlines: string[];
  notes: string;
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>({
    home_city: '',
    travel_style: '',
    dietary_restrictions: [],
    preferred_airlines: [],
    notes: ''
  });
  
  // Autocomplete states
  const [cityInput, setCityInput] = useState('');
  const [cityFocused, setCityFocused] = useState(false);
  const [dietaryInput, setDietaryInput] = useState('');
  const [dietaryFocused, setDietaryFocused] = useState(false);
  const [airlineInput, setAirlineInput] = useState('');
  const [airlineFocused, setAirlineFocused] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  const cityRef = useRef<HTMLDivElement>(null);
  const dietaryRef = useRef<HTMLDivElement>(null);
  const airlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadPreferences();
    }
  }, [isLoaded, user]);
  
  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityFocused(false);
      }
      if (dietaryRef.current && !dietaryRef.current.contains(event.target as Node)) {
        setDietaryFocused(false);
      }
      if (airlineRef.current && !airlineRef.current.contains(event.target as Node)) {
        setAirlineFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (!response.ok) throw new Error('Failed to load preferences');
      
      const data = await response.json();
      if (data.preferences) {
        const prefs = {
          home_city: data.preferences.home_city || '',
          travel_style: data.preferences.travel_style || '',
          dietary_restrictions: Array.isArray(data.preferences.dietary_restrictions) 
            ? data.preferences.dietary_restrictions 
            : data.preferences.dietary_restrictions 
              ? [data.preferences.dietary_restrictions]
              : [],
          preferred_airlines: data.preferences.preferred_airlines || [],
          notes: data.preferences.notes || ''
        };
        setPreferences(prefs);
        setCityInput(prefs.home_city);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setSavedMessage('');
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_city: preferences.home_city || null,
          travel_style: preferences.travel_style || null,
          dietary_restrictions: preferences.dietary_restrictions.length > 0 ? preferences.dietary_restrictions : null,
          preferred_airlines: preferences.preferred_airlines.length > 0 ? preferences.preferred_airlines : null,
          notes: preferences.notes || null
        })
      });

      if (!response.ok) throw new Error('Failed to save preferences');
      
      setSavedMessage('Preferences saved!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSavedMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };
  
  // Filter suggestions based on input - show more results (up to 12)
  const filteredCities = AIRPORT_CITIES.filter(city =>
    city.toLowerCase().includes(cityInput.toLowerCase())
  );
  
  const filteredDietary = DIETARY_SUGGESTIONS.filter(diet =>
    diet.toLowerCase().includes(dietaryInput.toLowerCase()) &&
    !preferences.dietary_restrictions.includes(diet)
  );
  
  const filteredAirlines = AIRLINE_SUGGESTIONS.filter(airline =>
    airline.toLowerCase().includes(airlineInput.toLowerCase()) &&
    !preferences.preferred_airlines.includes(airline)
  );
  
  // Select from autocomplete
  const selectCity = (city: string) => {
    setPreferences({...preferences, home_city: city});
    setCityInput(city);
    setCityFocused(false);
  };
  
  const addDietary = (diet: string) => {
    setPreferences({
      ...preferences,
      dietary_restrictions: [...preferences.dietary_restrictions, diet]
    });
    setDietaryInput('');
    setDietaryFocused(false);
  };
  
  const removeDietary = (diet: string) => {
    setPreferences({
      ...preferences,
      dietary_restrictions: preferences.dietary_restrictions.filter(d => d !== diet)
    });
  };
  
  const addAirline = (airline: string) => {
    setPreferences({
      ...preferences,
      preferred_airlines: [...preferences.preferred_airlines, airline]
    });
    setAirlineInput('');
    setAirlineFocused(false);
  };
  
  const removeAirline = (airline: string) => {
    setPreferences({
      ...preferences,
      preferred_airlines: preferences.preferred_airlines.filter(a => a !== airline)
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="bg-navy text-white px-5 py-4">
          <h1 className="font-vibes text-3xl text-gold mb-1">Account</h1>
          <p className="text-sm text-white/70">Manage your profile and preferences</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          
          {/* Profile Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-navy mb-4">Profile</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Name</label>
                <p className="text-navy font-medium">{user?.fullName || 'Not set'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-navy font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Member Since</label>
                <p className="text-navy font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Travel Preferences Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-navy mb-4">Travel Preferences</h2>
            
            <div className="space-y-4">
              {/* My Airport - Autocomplete */}
              <div ref={cityRef} className="relative">
                <label className="block text-sm font-medium text-navy mb-1">
                  My Airport
                </label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setPreferences({...preferences, home_city: e.target.value});
                  }}
                  onFocus={() => setCityFocused(true)}
                  placeholder="Montreal, Canada"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                
                {cityFocused && filteredCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredCities.slice(0, 12).map(city => (
                      <div
                        key={city}
                        onClick={() => selectCity(city)}
                        className="px-3 py-2 hover:bg-sand cursor-pointer text-sm text-navy"
                      >
                        {city}
                      </div>
                    ))}
                    {filteredCities.length > 12 && (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">
                        + {filteredCities.length - 12} more cities (keep typing to narrow)
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Where you typically fly from</p>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Travel Style
                </label>
                <select
                  value={preferences.travel_style}
                  onChange={(e) => setPreferences({...preferences, travel_style: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="">Select your style</option>
                  <option value="relaxed">Relaxed - Take it easy, enjoy downtime</option>
                  <option value="adventurous">Adventurous - Active and exploring</option>
                  <option value="luxury">Luxury - Premium experiences</option>
                  <option value="budget_conscious">Budget-Conscious - Value focused</option>
                </select>
              </div>

              {/* Dietary Restrictions - Autocomplete with tags */}
              <div ref={dietaryRef} className="relative">
                <label className="block text-sm font-medium text-navy mb-1">
                  Dietary Restrictions
                </label>
                
                {/* Selected tags */}
                {preferences.dietary_restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {preferences.dietary_restrictions.map(diet => (
                      <span
                        key={diet}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full"
                      >
                        {diet}
                        <button
                          onClick={() => removeDietary(diet)}
                          className="hover:text-gold/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <input
                  type="text"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  onFocus={() => setDietaryFocused(true)}
                  placeholder="Vegetarian"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                
                {dietaryFocused && filteredDietary.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredDietary.map(diet => (
                      <div
                        key={diet}
                        onClick={() => addDietary(diet)}
                        className="px-3 py-2 hover:bg-sand cursor-pointer text-sm text-navy"
                      >
                        {diet}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Type to add, click × to remove</p>
              </div>

              {/* Preferred Airlines - Autocomplete with tags */}
              <div ref={airlineRef} className="relative">
                <label className="block text-sm font-medium text-navy mb-1">
                  Preferred Airlines
                </label>
                
                {/* Selected tags */}
                {preferences.preferred_airlines.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {preferences.preferred_airlines.map(airline => (
                      <span
                        key={airline}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full"
                      >
                        {airline}
                        <button
                          onClick={() => removeAirline(airline)}
                          className="hover:text-gold/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <input
                  type="text"
                  value={airlineInput}
                  onChange={(e) => setAirlineInput(e.target.value)}
                  onFocus={() => setAirlineFocused(true)}
                  placeholder="Air Canada"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                
                {airlineFocused && filteredAirlines.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredAirlines.map(airline => (
                      <div
                        key={airline}
                        onClick={() => addAirline(airline)}
                        className="px-3 py-2 hover:bg-sand cursor-pointer text-sm text-navy"
                      >
                        {airline}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Type to add, click × to remove</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={preferences.notes}
                  onChange={(e) => setPreferences({...preferences, notes: e.target.value})}
                  placeholder="Window seat preference, accessibility needs, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={savePreferences}
                disabled={saving}
                className="w-full py-3 bg-gold text-white rounded-lg font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>

              {savedMessage && (
                <p className={`text-sm text-center ${savedMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {savedMessage}
                </p>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-4 italic bg-sand/50 p-3 rounded-lg">
              💡 Tip: Start typing and suggestions will appear. You can also type custom values if your preference isn't listed!
            </p>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-navy mb-4">Your Travel Stats</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-sand/50 rounded-xl">
                <div className="text-2xl font-bold text-gold">0</div>
                <div className="text-xs text-gray-600 mt-1">Trips Planned</div>
              </div>
              
              <div className="text-center p-4 bg-sand/50 rounded-xl">
                <div className="text-2xl font-bold text-gold">0</div>
                <div className="text-xs text-gray-600 mt-1">Trips Booked</div>
              </div>
              
              <div className="text-center p-4 bg-sand/50 rounded-xl">
                <div className="text-2xl font-bold text-gold">0</div>
                <div className="text-xs text-gray-600 mt-1">Countries Visited</div>
              </div>
              
              <div className="text-center p-4 bg-sand/50 rounded-xl">
                <div className="text-2xl font-bold text-gold">0</div>
                <div className="text-xs text-gray-600 mt-1">Conversations</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Navigation */}
        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>
          
          <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium">Bookings</span>
          </Link>
          
          <Link href="/account" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
