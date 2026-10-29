/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReverseImageMatch {
  title: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
}

export interface ReverseImageResult {
  engine: 'apify-google-lens' | 'direct-vision-fallback';
  matches: ReverseImageMatch[];
  searchUrl?: string;
  rawSummary?: string;
}

/**
 * Executes or prepares web reverse image search.
 * If APIFY_API_TOKEN is provided in environment variables, queries the Apify Google Lens actor.
 */
export async function performReverseImageSearch(
  base64Data: string,
  mimeType: string,
  userNotes?: string
): Promise<ReverseImageResult> {
  const apifyToken = process.env.APIFY_API_TOKEN;

  if (apifyToken && apifyToken.trim() !== '') {
    try {
      // Call Apify Google Lens actor
      const res = await fetch(
        `https://api.apify.com/v2/acts/apify~google-lens-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(
          apifyToken.trim()
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Pass the image data
            image: `data:${mimeType};base64,${base64Data}`,
            maxResults: 5,
          }),
        }
      );

      if (res.ok) {
        const dataset = await res.json();
        if (Array.isArray(dataset) && dataset.length > 0) {
          const matches: ReverseImageMatch[] = [];
          for (const item of dataset.slice(0, 5)) {
            if (item.title || item.source) {
              matches.push({
                title: item.title || item.source || 'Visual match',
                sourceUrl: item.url || item.link,
                thumbnailUrl: item.thumbnail,
              });
            }
          }
          if (matches.length > 0) {
            return {
              engine: 'apify-google-lens',
              matches,
              searchUrl: 'https://lens.google.com',
              rawSummary: `Google Lens matched: ${matches.map((m) => m.title).join(', ')}`,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Apify Google Lens reverse search error:', err);
    }
  }

  // Fallback: Gemini multimodal vision + Google Lens direct navigation
  return {
    engine: 'direct-vision-fallback',
    matches: [],
    searchUrl: 'https://lens.google.com',
    rawSummary: 'Live Google Lens web reverse search available via one-click link or Apify token.',
  };
}
