// lib/travelpayouts.ts
// Fully Automated Travelpayouts Link Generation

/**
 * Wrap any URL in Travelpayouts tracking
 * This works for ALL Travelpayouts programs automatically
 */
export async function wrapInTravelpayoutsTracking(
  destinationUrl: string,
  program: string = ''
): Promise<string> {
  // For now, use Travelpayouts' short link service
  // Their tpo.lu shortener automatically tracks clicks
  
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;
  
  if (!marker) {
    console.warn('Travelpayouts marker not configured - returning direct URL');
    return destinationUrl;
  }

  try {
    // Travelpayouts universal link API
    // This endpoint wraps ANY URL with tracking
    const response = await fetch('https://tpo.lu/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: destinationUrl,
        marker: marker,
        subid: program, // Track which service (kiwi, klook, etc.)
      }),
    });

    if (!response.ok) {
      console.error('Travelpayouts API error:', response.statusText);
      return destinationUrl;
    }

    const data = await response.json();
    return data.short_url || destinationUrl;
  } catch (error) {
    console.error('Error generating Travelpayouts link:', error);
    // Fallback: return direct URL so user experience isn't broken
    return destinationUrl;
  }
}

/**
 * Alternative: Client-side redirect method
 * If API doesn't exist, use their redirect service directly
 */
export function generateTravelpayoutsLink(
  destinationUrl: string,
  marker: string,
  subid: string = ''
): string {
  // Encode the destination URL
  const encoded = encodeURIComponent(destinationUrl);
  
  // Build Travelpayouts tracking URL
  // Format: https://tpo.lu/{marker}?url={destination}
  let trackingUrl = `https://tpo.lu/${marker}`;
  
  if (subid) {
    trackingUrl += `/${subid}`;
  }
  
  trackingUrl += `?url=${encoded}`;
  
  return trackingUrl;
}

/**
 * Batch process multiple links at once
 * Useful for processing entire AI responses
 */
export async function wrapMultipleLinks(
  links: Array<{ url: string; program: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process all links in parallel
  const promises = links.map(async ({ url, program }) => {
    const tracked = await wrapInTravelpayoutsTracking(url, program);
    results.set(url, tracked);
  });
  
  await Promise.all(promises);
  
  return results;
}

