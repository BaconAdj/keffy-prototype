'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useItinerary, ItineraryElement, ItineraryDay } from '@/context/ItineraryContext';

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function elementTypeIcon(type: ItineraryElement['type']): string {
  switch (type) {
    case 'dining': return '🍽';
    case 'insider': return '✦';
    case 'accommodation': return '🏨';
    case 'transport': return '🚌';
    default: return '◆';
  }
}

function elementTypeColor(type: ItineraryElement['type']): string {
  switch (type) {
    case 'dining': return 'text-amber-600';
    case 'insider': return 'text-gold';
    case 'accommodation': return 'text-blue-600';
    case 'transport': return 'text-gray-500';
    default: return 'text-navy';
  }
}

function timeLabel(time: string | null): string {
  if (!time || time === 'flexible') return '';
  return time.charAt(0).toUpperCase() + time.slice(1);
}

// ============================================================
// ELEMENT CARD
// ============================================================

function ElementCard({ element }: { element: ItineraryElement }) {
  const hasLink = element.booking_link && element.booking_link !== 'null';

  return (
    <div className="flex gap-3 py-3 border-b border-navy/10 last:border-0">
      <div className={`text-lg leading-none mt-0.5 w-5 flex-shrink-0 ${elementTypeColor(element.type)}`}>
        {elementTypeIcon(element.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-navy leading-snug">{element.title}</p>
          {timeLabel(element.time_of_day) && (
            <span className="text-[10px] text-gold/80 font-medium uppercase tracking-wide flex-shrink-0 mt-0.5">
              {timeLabel(element.time_of_day)}
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">{element.description}</p>
        {hasLink && (
          <a
            href={element.booking_link!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-gold border border-gold/30 rounded-full px-3 py-1 hover:bg-gold hover:text-white transition-colors"
          >
            Book
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DAY CARD
// ============================================================

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-navy/8 mb-3">
      {/* Day header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">{day.day}</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold leading-tight">{day.theme}</p>
            <p className="text-white/50 text-[10px] mt-0.5">{formatDate(day.date)}</p>
          </div>
        </div>
      </div>

      {/* Note if present */}
      {day.note && (
        <div className="px-4 py-2 bg-gold/8 border-b border-navy/8">
          <p className="text-[11px] text-gold/90 italic">{day.note}</p>
        </div>
      )}

      {/* Elements */}
      <div className="px-4">
        {day.elements.map((element, i) => (
          <ElementCard key={i} element={element} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN BOOKINGS PAGE
// ============================================================

export default function BookingsPage() {
  const { user, isLoaded } = useUser();
  const { itinerary, setItinerary, setHasNewItinerary } = useItinerary();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-navy px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-vibes text-3xl text-gold mb-0.5">Trip Planner</h1>
              {itinerary ? (
                <p className="text-white/60 text-[11px]">
                  {itinerary.destination} · {formatDateShort(itinerary.dates.arrival)} – {formatDateShort(itinerary.dates.departure)}
                </p>
              ) : (
                <p className="text-white/60 text-[11px]">Your itinerary will appear here</p>
              )}
            </div>
            {itinerary && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                itinerary.status === 'confirmed'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-gold/20 text-gold'
              }`}>
                {itinerary.status === 'confirmed' ? 'CONFIRMED' : 'DRAFT'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!itinerary ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-navy mb-2">No itinerary yet</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Chat with Keffy to start planning your trip. Your itinerary will appear here once it's ready.
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-gold text-white rounded-full text-sm font-medium hover:bg-[#b89451] transition-colors"
              >
                Start Planning
              </Link>
            </div>
          ) : (
            <div className="px-4 pt-4 pb-6">

              {/* Trip concept */}
              <div className="bg-navy rounded-2xl p-4 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -translate-y-8 translate-x-8" />
                <p className="text-gold text-[11px] font-semibold uppercase tracking-widest mb-1.5">Your Trip</p>
                <p className="text-white text-[14px] leading-relaxed font-light italic">"{itinerary.trip_concept}"</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-wide">Nights</p>
                    <p className="text-white text-[13px] font-semibold">{itinerary.dates.duration_nights}</p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-wide">Travelers</p>
                    <p className="text-white text-[13px] font-semibold">
                      {itinerary.travelers.adults + itinerary.travelers.children}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-wide">Arrival</p>
                    <p className="text-white text-[13px] font-semibold">{formatDateShort(itinerary.dates.arrival)}</p>
                  </div>
                </div>
              </div>

              {/* Booking status strip */}
              <div className="flex gap-2 mb-4">
                {/* Flights */}
                <div className={`flex-1 rounded-xl p-2.5 flex flex-col items-center gap-1 ${
                  itinerary.booking.flights.link ? 'bg-green-50 border border-green-200' : 'bg-white border border-navy/10'
                }`}>
                  <span className="text-lg">✈️</span>
                  <span className="text-[10px] font-medium text-navy">Flights</span>
                  {itinerary.booking.flights.link ? (
                    <a href={itinerary.booking.flights.link} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-green-600 font-semibold">View →</a>
                  ) : (
                    <span className="text-[9px] text-gray-400">Pending</span>
                  )}
                </div>

                {/* Hotels */}
                <div className={`flex-1 rounded-xl p-2.5 flex flex-col items-center gap-1 ${
                  itinerary.booking.accommodation.some(a => a.link) ? 'bg-green-50 border border-green-200' : 'bg-white border border-navy/10'
                }`}>
                  <span className="text-lg">🏨</span>
                  <span className="text-[10px] font-medium text-navy">Hotels</span>
                  {itinerary.booking.accommodation.some(a => a.link) ? (
                    <span className="text-[9px] text-green-600 font-semibold">Ready</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">Pending</span>
                  )}
                </div>

                {/* Activities */}
                <div className={`flex-1 rounded-xl p-2.5 flex flex-col items-center gap-1 ${
                  itinerary.booking.activities.some(a => a.link) ? 'bg-green-50 border border-green-200' : 'bg-white border border-navy/10'
                }`}>
                  <span className="text-lg">🎭</span>
                  <span className="text-[10px] font-medium text-navy">Activities</span>
                  {itinerary.booking.activities.some(a => a.link) ? (
                    <span className="text-[9px] text-green-600 font-semibold">Ready</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">Pending</span>
                  )}
                </div>
              </div>

              {/* Day-by-day */}
              <div className="mb-1">
                <p className="text-[10px] text-navy/40 uppercase tracking-widest font-semibold mb-3 px-1">
                  Day by Day
                </p>
                {itinerary.days.map((day, index) => (
                  <DayCard key={index} day={day} index={index} />
                ))}
              </div>

              {/* Insider tips */}
              {itinerary.insider_tips && itinerary.insider_tips.length > 0 && (
                <div className="bg-gold/8 rounded-2xl p-4 mb-4 border border-gold/20">
                  <p className="text-[10px] text-gold font-semibold uppercase tracking-widest mb-3">
                    ✦ Insider Tips
                  </p>
                  <div className="space-y-2">
                    {itinerary.insider_tips.map((tip, i) => (
                      <p key={i} className="text-[12px] text-navy/80 leading-relaxed pl-3 border-l-2 border-gold/30">
                        {tip.tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Refine button */}
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 bg-navy text-white rounded-full text-[13px] font-medium hover:bg-navy/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Refine with Keffy
              </Link>

            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center flex-shrink-0">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>

          <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium">Bookings</span>
          </Link>

          <Link href="/account" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
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
