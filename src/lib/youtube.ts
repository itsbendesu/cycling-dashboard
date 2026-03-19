export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  views?: number;
}

// Official extended highlights channels (RSS feeds)
const RSS_CHANNELS = [
  { id: "UCSpycUnuU0IVF7gGIhGojhg", name: "Tour de France" },
  { id: "UCfDfvvMARk4TKcC62ALi6eA", name: "TNT Sports Cycling" },
  { id: "UCe10BxbsFg9Kbmkg-ean_Dg", name: "Giro d'Italia" },
];

function isHighlight(title: string): boolean {
  const t = title.toLowerCase();

  // Exclude filler
  const excludes = [
    /jersey\s*minute/, /most\s*aggressive/, /polka\s*dot/, /preview/,
    /prediction/, /podcast/, /how\s*to/, /training/, /bike\s*(check|review)/,
    /unbox/, /nutrition/, /behind\s*the\s*scenes/, /press\s*conference/,
    /presentation/, /discover\s*(stage|the\s*route)/, /throwback/,
    /best\s*of\s*rivals/, /fashion\s*show/, /shoe\s*change/, /#shorts/,
    /heartbreak\s*and/, /everything.*ready/, /route\s*of\s*the/,
  ];
  if (excludes.some((p) => p.test(t))) return false;

  // Accept: extended highlights, highlights, final km
  if (/extended\s*highlights?/.test(t)) return true;
  if (/full\s*highlights?/.test(t)) return true;
  if (/highlights?\s*(of|from)/.test(t)) return true;
  if (/\bhighlights\b/.test(t) && /stage|men|women|edition/.test(t)) return true;
  if (/final\s*km|last\s*km/.test(t)) return true;

  return false;
}

function parseXMLFeed(xml: string, channelName: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const viewsStr = entry.match(/<media:statistics views="(\d+)"/)?.[1];

    if (videoId && title) {
      const decoded = decodeXMLEntities(title);
      videos.push({
        id: videoId,
        title: decoded,
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: published || "",
        channelTitle: channelName,
        views: viewsStr ? parseInt(viewsStr, 10) : 0,
      });
    }
  }
  return videos;
}

function decodeXMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Scrape YouTube search results for a query (no API key needed)
async function searchYouTube(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Find ytInitialData start and extract a workable chunk
    const startMarker = "var ytInitialData = ";
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return [];
    const jsonStart = startIdx + startMarker.length;

    // Find matching end — look for </script> after the start
    const endIdx = html.indexOf(";</script>", jsonStart);
    if (endIdx === -1) return [];
    const jsonStr = html.slice(jsonStart, endIdx);

    const videos: YouTubeVideo[] = [];
    const seen = new Set<string>();

    // Find videoRenderer blocks which contain videoId + title pairs
    const rendererRegex = /"videoRenderer":\{"videoId":"([^"]+)"[\s\S]*?"title":\{"runs":\[\{"text":"([^"]+)"/g;
    let m;
    while ((m = rendererRegex.exec(jsonStr)) !== null && videos.length < maxResults) {
      const [, videoId, title] = m;
      if (seen.has(videoId)) continue;
      seen.add(videoId);

      // Extract channel name from nearby context
      const nearby = jsonStr.slice(m.index, m.index + 3000);
      const channelMatch = nearby.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);

      videos.push({
        id: videoId,
        title: decodeXMLEntities(title),
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: "",
        channelTitle: channelMatch ? channelMatch[1] : "",
      });
    }
    return videos;
  } catch {
    return [];
  }
}

// Fetch highlights from RSS feeds
async function fetchRSSHighlights(): Promise<YouTubeVideo[]> {
  const feedPromises = RSS_CHANNELS.map(async (channel) => {
    try {
      const res = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
        { next: { revalidate: 1800 } }
      );
      if (!res.ok) return [];
      const xml = await res.text();
      return parseXMLFeed(xml, channel.name);
    } catch {
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  return results.flat().filter((v) => isHighlight(v.title));
}

// Search YouTube for highlights of a specific race
async function searchRaceHighlights(raceName: string): Promise<YouTubeVideo[]> {
  const results = await searchYouTube(`${raceName} 2026 extended highlights`);
  // Filter to only keep actual highlight videos
  return results.filter((v) => {
    const t = v.title.toLowerCase();
    return /highlights?|final\s*km|last\s*km/.test(t) && /2026/.test(t);
  });
}

// Main entry: get all highlights (RSS + search for past races)
export async function fetchHighlights(maxResults: number = 60): Promise<YouTubeVideo[]> {
  const rssHighlights = await fetchRSSHighlights();

  // Sort by date descending
  rssHighlights.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return rssHighlights.slice(0, maxResults);
}

// Build match phrases for a race name
export function buildRaceMatchers(raceName: string): string[] {
  const clean = raceName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/\d{4}.*/, "") // strip year and anything after
    .replace(/\s*highlights?\s*/g, "")
    .trim();

  const matchers: string[] = [clean];

  // Also add hyphenated version and without hyphens
  if (clean.includes("-")) matchers.push(clean.replace(/-/g, " "));
  if (clean.includes(" ")) matchers.push(clean.replace(/\s+/g, "-"));

  // Add key distinctive words (but not generic ones like "tour", "stage", "race")
  const genericWords = new Set(["tour", "de", "the", "and", "des", "del", "la", "a", "di", "van", "d", "gran", "grand", "gp", "classic"]);
  const distinctive = clean.split(/[\s-]+/).filter((w) => w.length > 2 && !genericWords.has(w));
  if (distinctive.length > 0) {
    // Only use distinctive words if they're specific enough (e.g. "nice", "roubaix", "flanders")
    matchers.push(...distinctive.filter((w) => w.length > 3));
  }

  return matchers;
}

export function videoMatchesRace(title: string, matchers: string[]): boolean {
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Require the full race name or a distinctive word match
  return matchers.some((m) => t.includes(m));
}

// Get highlights for a specific race — uses search to find older ones
export async function fetchRaceHighlights(
  raceName: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const matchers = buildRaceMatchers(raceName);

  // Check RSS feeds first
  const rss = await fetchRSSHighlights();
  const fromRSS = rss.filter((v) => videoMatchesRace(v.title, matchers));

  if (fromRSS.length >= maxResults) {
    return fromRSS.slice(0, maxResults);
  }

  // Fall back to YouTube search for older races
  const fromSearch = await searchRaceHighlights(raceName);
  const seen = new Set(fromRSS.map((v) => v.id));
  const combined = [...fromRSS, ...fromSearch.filter((v) => !seen.has(v.id))];

  return combined.slice(0, maxResults);
}

// Fetch highlights grouped by race (for the highlights page)
export async function fetchAllRaceHighlights(
  raceQueries: { id: string; searchTerm: string }[]
): Promise<Record<string, YouTubeVideo[]>> {
  const rss = await fetchRSSHighlights();
  const results: Record<string, YouTubeVideo[]> = {};

  // First pass: match RSS highlights to races
  const unmatched: string[] = [];

  for (const { id, searchTerm } of raceQueries) {
    const matchers = buildRaceMatchers(searchTerm);
    const matched = rss.filter((v) => videoMatchesRace(v.title, matchers));

    if (matched.length > 0) {
      results[id] = matched;
    } else {
      unmatched.push(id);
    }
  }

  // Second pass: search YouTube for races with no RSS matches
  const searchPromises = unmatched.map(async (raceId) => {
    const query = raceQueries.find((r) => r.id === raceId);
    if (!query) return;
    const found = await searchRaceHighlights(query.searchTerm);
    if (found.length > 0) {
      results[raceId] = found;
    }
  });
  await Promise.all(searchPromises);

  return results;
}
