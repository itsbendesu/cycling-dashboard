export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  views?: number;
  raceName?: string; // extracted from title if possible
}

// Channels that post race highlights (ordered by highlight quality)
const HIGHLIGHT_CHANNELS = [
  { id: "UC77UtoyivVHkpApL0wGfH5w", name: "Lanterne Rouge" },
  { id: "UC1sTqWskIXqSItyojGhXPyQ", name: "LR Cycling Podcast" },
  { id: "UCu7phdCr-raU7OaJfEpHZww", name: "GCN Racing" },
  { id: "UCn7YuJaZmdmx_ERZH9r6eTA", name: "Chris Horner" },
];

// Patterns that indicate a video is a race highlight (not a review, podcast, etc.)
const HIGHLIGHT_PATTERNS = [
  /stage\s*\d+/i,
  /highlights?/i,
  /recap/i,
  /finish/i,
  /attack/i,
  /sprint/i,
  /breakaway/i,
  /summit/i,
  /crash/i,
  /won|wins|victory/i,
  /paris.?nice/i,
  /tirreno/i,
  /milano.?sanremo|milan.?san.?remo/i,
  /tour\s*(de|of)/i,
  /giro/i,
  /vuelta/i,
  /roubaix/i,
  /flanders|vlaanderen/i,
  /li[eè]ge/i,
  /lombardia/i,
  /strade\s*bianche/i,
  /amstel/i,
  /fl[eè]che/i,
  /san\s*sebasti[aá]n/i,
  /romandie/i,
  /dauphin[eé]/i,
  /suisse/i,
  /basque/i,
  /catalunya/i,
  /uae\s*tour/i,
  /down\s*under/i,
  /qu[eé]bec|montr[eé]al/i,
];

function isRaceHighlight(title: string): boolean {
  return HIGHLIGHT_PATTERNS.some((p) => p.test(title));
}

// Score videos: race highlights rank higher, recency matters
function scoreVideo(video: YouTubeVideo): number {
  let score = 0;
  const title = video.title.toLowerCase();

  // Strong highlight indicators
  if (/stage\s*\d+/i.test(title)) score += 20;
  if (/highlights?/i.test(title)) score += 15;
  if (/full\s*(race|stage)/i.test(title)) score += 25;

  // Race name mentions
  if (/grand\s*tour|giro|tour\s*de\s*france|vuelta/i.test(title)) score += 10;
  if (/monument|roubaix|flanders|sanremo|li[eè]ge|lombardia/i.test(title)) score += 10;

  // Negative signals (not highlights)
  if (/preview|prediction|podcast|review|unbox|bike\s*check/i.test(title)) score -= 15;
  if (/how\s*to|training|nutrition|best\s*of/i.test(title)) score -= 20;

  // Recency bonus (within last 7 days gets big boost)
  const daysAgo = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo < 1) score += 30;
  else if (daysAgo < 3) score += 20;
  else if (daysAgo < 7) score += 10;

  // View count bonus
  if (video.views && video.views > 50000) score += 5;

  return score;
}

interface FeedEntry {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  channelName: string;
  views: number;
}

function parseXMLFeed(xml: string, channelName: string): FeedEntry[] {
  const entries: FeedEntry[] = [];
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
      entries.push({
        videoId,
        title: decodeXMLEntities(title),
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        published: published || "",
        channelName,
        views: viewsStr ? parseInt(viewsStr, 10) : 0,
      });
    }
  }

  return entries;
}

function decodeXMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function fetchHighlights(maxResults: number = 12): Promise<YouTubeVideo[]> {
  const allEntries: FeedEntry[] = [];

  // Fetch all channel feeds in parallel
  const feedPromises = HIGHLIGHT_CHANNELS.map(async (channel) => {
    try {
      const res = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
        { next: { revalidate: 1800 } } // cache for 30 minutes
      );
      if (!res.ok) return [];
      const xml = await res.text();
      return parseXMLFeed(xml, channel.name);
    } catch {
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  for (const entries of results) {
    allEntries.push(...entries);
  }

  // Convert to YouTubeVideo and filter for race content
  const videos: YouTubeVideo[] = allEntries
    .filter((e) => isRaceHighlight(e.title))
    .map((e) => ({
      id: e.videoId,
      title: e.title,
      thumbnail: e.thumbnail,
      publishedAt: e.published,
      channelTitle: e.channelName,
      views: e.views,
    }));

  // Sort by score (best highlights first)
  videos.sort((a, b) => scoreVideo(b) - scoreVideo(a));

  return videos.slice(0, maxResults);
}

// Search highlights relevant to a specific race
export async function fetchRaceHighlights(
  raceName: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const all = await fetchHighlights(50);

  // Build search patterns from race name
  const searchTerms = raceName
    .toLowerCase()
    .replace(/['']/g, "")
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !["the", "and", "des", "del"].includes(t));

  const relevant = all.filter((v) => {
    const title = v.title.toLowerCase();
    // At least one significant term from the race name must appear
    return searchTerms.some((term) => title.includes(term));
  });

  return relevant.slice(0, maxResults);
}
