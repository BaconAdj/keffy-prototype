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
  // FLIGHT_LINK format
  if (linkText.startsWith('FLIGHT_LINK_')) {
    return parseFlightLink(linkText);
  }
  
  // BOOKING_LINK format (hotels)
  if (linkText.startsWith('BOOKING_LINK_')) {
    return parseBookingLink(linkText);
  }
  
  // TIQETS_LINK format (attractions - PREFERRED)
  if (linkText.startsWith('TIQETS_LINK_')) {
    return parseTiqetsLink(linkText);
  }
  
  // KLOOK_LINK format (activities - alternative)
  if (linkText.startsWith('KLOOK_LINK_')) {
    return parseKlookLink(linkText);
  }
  
  // CAR_RENTAL_LINK format
  if (linkText.startsWith('CAR_RENTAL_LINK_')) {
    return parseCarRentalLink(linkText);
  }
  
  // TRANSFER_LINK format (airport transfers)
  if (linkText.startsWith('TRANSFER_LINK_')) {
    return parseTransferLink(linkText);
  }
  
  // INSURANCE_LINK format
  if (linkText.startsWith('INSURANCE_LINK')) {
    return parseInsuranceLink(linkText);
  }
  
  // AIRHELP_LINK format
  if (linkText.startsWith('AIRHELP_LINK')) {
    return parseAirHelpLink();
  }
  
  return null;
}

/**
 * FLIGHT LINKS (Kiwi.com)
 * Format: FLIGHT_LINK_Origin|Destination|YYYY-MM-DD|YYYY-MM-DD|Adults|Children|Infants|CabinClass
 */
function parseFlightLink(linkText: string): ParsedLink {
  const params = linkText.replace('FLIGHT_LINK_', '').split('|');
  const [origin, destination, departureDate, returnDate, adults, children, infants, cabinClass] = params;
  
  // Build Kiwi.com URL with all parameters
  let url = `https://www.kiwi.com/en/?origin=${origin}&destination=${destination}`;
  
  if (departureDate) {
    url += `&outboundDate=${departureDate}`;
  }
  
  if (returnDate) {
    url += `&inboundDate=${returnDate}`;
  }
  
  // Add passenger counts
  if (adults) {
    url += `&adults=${adults}`;
  }
  
  if (children && parseInt(children) > 0) {
    url += `&children=${children}`;
  }
  
  if (infants && parseInt(infants) > 0) {
    url += `&infants=${infants}`;
  }
  
  // Add cabin class (only if not economy)
  if (cabinClass && cabinClass !== 'ECONOMY') {
    url += `&cabinClass=${cabinClass}-false`;
  }
  
  return {
    text: `Search flights ${origin.split('-')[0]} to ${destination.split('-')[0]}`,
    url
  };
}

/**
 * BOOKING LINKS (Booking.com via Travelpayouts)
 * Format: BOOKING_LINK_Destination|CheckIn|CheckOut|Adults|Children
 * Format: BOOKING_LINK_SPECIFIC_HotelName|Destination|CheckIn|CheckOut|Adults
 */
function parseBookingLink(linkText: string): ParsedLink {
  const params = linkText.replace('BOOKING_LINK_', '').split('|');
  
  // Check if specific hotel
  if (linkText.includes('BOOKING_LINK_SPECIFIC_')) {
    const [hotelName, destination, checkIn, checkOut, adults] = params;
    const searchQuery = `${hotelName} ${destination}`.replace(/-/g, ' ');
    
    const bookingParams = new URLSearchParams({
      ss: searchQuery,
      checkin: checkIn,
      checkout: checkOut,
      group_adults: adults,
      group_children: '0',
      no_rooms: '1'
    });
    
    const url = `https://www.booking.com/searchresults.html?${bookingParams.toString()}`;
    
    return {
      text: hotelName.replace(/-/g, ' '),
      url
    };
  }
  
  // General search
  const [destination, checkIn, checkOut, adults, children] = params;
  const cityName = destination.replace(/-/g, ' ');
  
  const bookingParams = new URLSearchParams({
    ss: cityName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults,
    group_children: children || '0',
    no_rooms: '1'
  });
  
  const url = `https://www.booking.com/searchresults.html?${bookingParams.toString()}`;
  
  return {
    text: `Search hotels in ${cityName}`,
    url
  };
}

/**
 * TIQETS LINKS (Attractions - PREFERRED)
 * Format: TIQETS_LINK_City
 * Use actual Travelpayouts URL
 */
function parseTiqetsLink(linkText: string): ParsedLink {
  const city = linkText.replace('TIQETS_LINK_', '').replace(/-/g, ' ');
  
  // Use your actual Travelpayouts Tiqets link
  const url = 'https://tiqets.tpo.lu/LgIo455N';
  
  return {
    text: `Find tickets in ${city}`,
    url
  };
}

/**
 * KLOOK LINKS (Activities - Alternative)
 * Format: KLOOK_LINK_Destination
 * Use actual Travelpayouts URL
 */
function parseKlookLink(linkText: string): ParsedLink {
  const destination = linkText.replace('KLOOK_LINK_', '').replace(/-/g, ' ');
  
  // Use your actual Travelpayouts Klook link
  const url = 'https://klook.tpo.lu/H5AgBypX';
  
  return {
    text: `Find activities in ${destination}`,
    url
  };
}

/**
 * CAR RENTAL LINKS
 * Format: CAR_RENTAL_LINK_Destination
 * Use actual Travelpayouts URL (GetRentACar preferred)
 */
function parseCarRentalLink(linkText: string): ParsedLink {
  const destination = linkText.replace('CAR_RENTAL_LINK_', '').replace(/-/g, ' ');
  
  // Use your actual Travelpayouts GetRentACar link
  const url = 'https://getrentacar.tpo.lu/UsR3U2uU';
  
  return {
    text: `Rent a car in ${destination}`,
    url
  };
}

/**
 * AIRPORT TRANSFER LINKS
 * Format: TRANSFER_LINK_City
 * Use actual Travelpayouts URL (Welcome Pickups)
 */
function parseTransferLink(linkText: string): ParsedLink {
  const city = linkText.replace('TRANSFER_LINK_', '').replace(/-/g, ' ');
  
  // Use your actual Travelpayouts Welcome Pickups link
  const url = 'https://tpo.lu/PFGjcOjB';
  
  return {
    text: 'Book airport transfer',
    url
  };
}

/**
 * INSURANCE LINKS
 * Format: INSURANCE_LINK
 * Use actual Travelpayouts URL (EKTA)
 */
function parseInsuranceLink(linkText: string): ParsedLink {
  // Use your actual Travelpayouts EKTA link
  const url = 'https://ektatraveling.tpo.lu/NM7gmV42';
  
  return {
    text: 'Get travel insurance',
    url
  };
}

/**
 * AIRHELP LINKS
 * Format: AIRHELP_LINK
 * Use actual Travelpayouts URL
 */
function parseAirHelpLink(): ParsedLink {
  // Use your actual Travelpayouts AirHelp link
  const url = 'https://airhelp.tpo.lu/unL8bVj3';
  
  return {
    text: 'Check for flight compensation',
    url
  };
}

export default {
  parseTravelLink
};
