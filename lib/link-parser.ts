// lib/link-parser.ts
// Frontend link parser - converts AI-generated placeholders to actual URLs

interface ParsedLink {
  text: string;
  url: string;
}

/**
 * Main parser - detects link type and generates actual URL
 */
export function parseTravelLink(linkText: string): ParsedLink | null {
  if (linkText.startsWith('FLIGHT_LINK_')) return parseFlightLink(linkText);
  if (linkText.startsWith('BOOKING_LINK_')) return parseBookingLink(linkText);
  if (linkText.startsWith('HOTEL_LINK_')) return parseHotelLink(linkText);
  if (linkText.startsWith('TIQETS_LINK_')) return parseTiqetsLink(linkText);
  if (linkText.startsWith('KLOOK_LINK_')) return parseKlookLink(linkText);
  if (linkText.startsWith('WEGOTRIP_LINK_')) return parseWeGoTripLink(linkText);
  if (linkText.startsWith('CAR_RENTAL_LINK_')) return parseCarRentalLink(linkText);
  if (linkText.startsWith('TRANSFER_LINK_')) return parseTransferLink(linkText);
  if (linkText.startsWith('GETTRANSFER_LINK_')) return parseGetTransferLink(linkText);
  if (linkText.startsWith('INSURANCE_LINK')) return parseInsuranceLink();
  if (linkText.startsWith('AIRHELP_LINK')) return parseAirHelpLink();
  return null;
}

// ============================================================
// FLIGHTS — Kiwi.com via Travelpayouts
// Format: FLIGHT_LINK_origin|destination|departure|return|adults|children|infants|cabin
// ============================================================
function parseFlightLink(linkText: string): ParsedLink {
  const params = linkText.replace('FLIGHT_LINK_', '').split('|');
  const [origin, destination, departureDate, returnDate, adults, children, infants, cabinClass] = params;

  // Build Kiwi URL with Travelpayouts affiliate parameters
  // These fixed params are tied to your Travelpayouts account (keffy.ai project)
  const affilid = 'travelpayoutsdeeplink_keffyai.com_d5850e0eced8477d93fd773aa-697863';
  const sub1 = 'd5850e0eced8477d93fd773aa-697863';
  const deeplinkId = '28960750235';

  const outboundDate = departureDate || '';
  const inboundDate = returnDate || 'no-return';

  let url = `https://www.kiwi.com/us/?origin=${origin}&destination=${destination}`;
  url += `&outboundDate=${outboundDate}`;
  url += `&inboundDate=${inboundDate}`;
  url += `&lang=us`;
  if (adults) url += `&adults=${adults}`;
  if (children && parseInt(children) > 0) url += `&children=${children}`;
  if (infants && parseInt(infants) > 0) url += `&infants=${infants}`;
  if (cabinClass && cabinClass !== 'ECONOMY') url += `&cabinClass=${cabinClass}-false`;
  url += `&affilid=${affilid}&sub1=${sub1}&deeplinkId=${deeplinkId}`;

  const originCity = origin.split('-')[0];
  const destCity = destination.split('-')[0];

  return {
    text: `Search flights ${originCity} to ${destCity}`,
    url
  };
}

// ============================================================
// HOTELS — Booking.com (no affiliate until approved)
// Format: HOTEL_LINK_City|CheckIn|CheckOut|Adults|Children
//         BOOKING_LINK_City|CheckIn|CheckOut|Adults|Children (legacy)
// ============================================================
function parseHotelLink(linkText: string): ParsedLink {
  const params = linkText.replace('HOTEL_LINK_', '').split('|');
  const [destination, checkIn, checkOut, adults, children] = params;
  const cityName = destination.replace(/-/g, ' ');

  const bookingParams = new URLSearchParams({
    ss: cityName,
    checkin: checkIn || '',
    checkout: checkOut || '',
    group_adults: adults || '2',
    group_children: children || '0',
    no_rooms: '1',
    // aid=2721550 will be added here once Booking.com affiliate is approved
  });

  return {
    text: `Search hotels in ${cityName}`,
    url: `https://www.booking.com/searchresults.html?${bookingParams.toString()}`
  };
}

function parseBookingLink(linkText: string): ParsedLink {
  // Legacy format support
  const params = linkText.replace('BOOKING_LINK_', '').split('|');
  const [destination, checkIn, checkOut, adults, children] = params;
  const cityName = destination.replace(/-/g, ' ');

  const bookingParams = new URLSearchParams({
    ss: cityName,
    checkin: checkIn || '',
    checkout: checkOut || '',
    group_adults: adults || '2',
    group_children: children || '0',
    no_rooms: '1',
  });

  return {
    text: `Search hotels in ${cityName}`,
    url: `https://www.booking.com/searchresults.html?${bookingParams.toString()}`
  };
}

// ============================================================
// ACTIVITIES — Tiqets via Travelpayouts (preferred)
// Format: TIQETS_LINK_City
// ============================================================
function parseTiqetsLink(linkText: string): ParsedLink {
  const city = linkText.replace('TIQETS_LINK_', '').replace(/-/g, ' ');
  return {
    text: `Find experiences in ${city}`,
    url: 'https://tiqets.tpo.lu/LEFxHNqM'
  };
}

// ============================================================
// ACTIVITIES — Klook via Travelpayouts (alternative)
// Format: KLOOK_LINK_City
// ============================================================
function parseKlookLink(linkText: string): ParsedLink {
  const city = linkText.replace('KLOOK_LINK_', '').replace(/-/g, ' ');
  return {
    text: `Find activities in ${city}`,
    url: 'https://klook.tpo.lu/UNckA7qt'
  };
}

// ============================================================
// GUIDED TOURS — WeGoTrip via Travelpayouts
// Format: WEGOTRIP_LINK_City
// ============================================================
function parseWeGoTripLink(linkText: string): ParsedLink {
  const city = linkText.replace('WEGOTRIP_LINK_', '').replace(/-/g, ' ');
  return {
    text: `Find guided tours in ${city}`,
    url: 'https://wegotrip.tpo.lu/qiiXr772'
  };
}

// ============================================================
// CAR RENTALS — EconomyBookings via Travelpayouts
// Format: CAR_RENTAL_LINK_City|PickupDate|ReturnDate
// ============================================================
function parseCarRentalLink(linkText: string): ParsedLink {
  const params = linkText.replace('CAR_RENTAL_LINK_', '').split('|');
  const [city, pickupDate, returnDate] = params;
  const cityName = (city || '').replace(/-/g, ' ');

  // Convert YYYY-MM-DD to DD.MM.YYYY for EconomyBookings
  function convertDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }

  let url = 'https://economybookings.tpo.lu/rzIM2l7Q';

  if (cityName && pickupDate && returnDate) {
    const deepLink = `https://getrentacar.com/en-US/car-rental/request?vehicleSegment=cars&pickup[location]=${encodeURIComponent(cityName)}&pickup[date]=${convertDate(pickupDate)}&return[date]=${convertDate(returnDate)}`;
    url = `${url}?url=${encodeURIComponent(deepLink)}`;
  }

  return {
    text: `Rent a car in ${cityName}`,
    url
  };
}

// ============================================================
// AIRPORT TRANSFERS — WelcomePickups via Travelpayouts
// Format: TRANSFER_LINK_AirportCode|City|Date|Time|Passengers|Luggage
// ============================================================
function parseTransferLink(linkText: string): ParsedLink {
  const params = linkText.replace('TRANSFER_LINK_', '').split('|');
  const [airportCode, city, date, time, passengers, luggage] = params;
  const cityName = (city || '').replace(/-/g, ' ').toLowerCase();

  // Convert YYYY-MM-DD to M/DD/YYYY for WelcomePickups
  function convertDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(m)}/${d}/${y}`;
  }

  let url = 'https://tpo.lu/Yp0yW5sV';

  if (cityName && date) {
    const deepLink = `https://traveler.welcomepickups.com/en/${cityName}/transfer/new?passengers=${passengers || 2}&luggage=${luggage || 1}&date=${convertDate(date)}&time=${time || '12:00'}&city=${cityName}&from=${encodeURIComponent(airportCode || '')}&from_category=hub&to_type=hotel`;
    url = `${url}?url=${encodeURIComponent(deepLink)}`;
  }

  return {
    text: 'Book airport transfer',
    url
  };
}

// ============================================================
// PRIVATE TRANSFERS — GetTransfer via Travelpayouts
// Format: GETTRANSFER_LINK_City
// ============================================================
function parseGetTransferLink(linkText: string): ParsedLink {
  const city = linkText.replace('GETTRANSFER_LINK_', '').replace(/-/g, ' ');
  return {
    text: `Book private transfer in ${city}`,
    url: 'https://gettransfer.tpo.lu/a4NduUuU'
  };
}

// ============================================================
// TRAVEL INSURANCE — Ekta via Travelpayouts
// ============================================================
function parseInsuranceLink(): ParsedLink {
  return {
    text: 'Get travel insurance',
    url: 'https://ektatraveling.tpo.lu/iGVJdY16'
  };
}

// ============================================================
// FLIGHT COMPENSATION — AirHelp via Travelpayouts
// ============================================================
function parseAirHelpLink(): ParsedLink {
  return {
    text: 'Check for flight compensation',
    url: 'https://airhelp.tpo.lu/unL8bVj3'
  };
}

export default { parseTravelLink };
