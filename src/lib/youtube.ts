export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  views?: number;
}

// Official race organizer channels (post extended highlights)
const ORGANIZER_CHANNELS = [
  { id: "UCSpycUnuU0IVF7gGIhGojhg", name: "Tour de France" }, // ASO: TdF, Paris-Nice, Paris-Roubaix, Liège, Flèche, Dauphiné, Strade Bianche
  { id: "UCe10BxbsFg9Kbmkg-ean_Dg", name: "Giro d'Italia" }, // RCS: Giro, Milano-Sanremo, Lombardia, Tirreno, Strade Bianche
  { id: "UCf7iHZIcKEhiN34-fETtNCA", name: "La Vuelta" }, // Unipublic: Vuelta
  { id: "UCfDfvvMARk4TKcC62ALi6eA", name: "TNT Sports Cycling" }, // Formerly Eurosport: Flanders, other classics
];

// Commentary/analysis channels (secondary, for races without organizer highlights)
const COMMENTARY_CHANNELS = [
  { id: "UC77UtoyivVHkpApL0wGfH5w", name: "Lanterne Rouge" },
  { id: "UCu7phdCr-raU7OaJfEpHZww", name: "GCN Racing" },
];

const ALL_CHANNELS = [...ORGANIZER_CHANNELS, ...COMMENTARY_CHANNELS];

// Strict filter: only actual race recaps, not promos/previews/jerseys/etc.
function isExtendedHighlight(title: string): boolean {
  const t = title.toLowerCase();

  // Must-have: these patterns indicate actual race footage recaps
  const highlightPatterns = [
    /extended\s*highlights?/,
    /full\s*highlights?/,
    /highlights?\s*(of|from)/,
    /stage\s*\d+.*highlights?/,
    /stage\s*\d+.*(recap|review|summary)/,
    /highlights?\s*-?\s*stage/,
    /race\s*highlights?/,
    /last\s*km/,
    /final\s*k(ilo)?m/,
    /finish/,
  ];

  // Commentary channels: stage recaps are highlights too
  const commentaryPatterns = [
    /stage\s*\d+/,
    /\|\s*(paris|tirreno|giro|tour|vuelta|strade|roubaix|flanders|liège|lombardia|amstel|flèche|romandie|dauph|suisse|basque|catalu|uae|down\s*under|québec|montréal|san\s*sebast)/i,
  ];

  // Must NOT match: these are filler content
  const excludePatterns = [
    /jersey\s*minute/,
    /most\s*aggressive/,
    /polka\s*dot/,
    /preview/,
    /prediction/,
    /podcast/,
    /how\s*to/,
    /training/,
    /bike\s*(check|review)/,
    /unbox/,
    /nutrition/,
    /behind\s*the\s*scenes/,
    /press\s*conference/,
    /presentation/,
    /discover\s*(stage|the\s*route)/,
    /throwback/,
    /best\s*of\s*rivals/,
  ];

  if (excludePatterns.some((p) => p.test(t))) return false;
  if (highlightPatterns.some((p) => p.test(t))) return true;
  if (commentaryPatterns.some((p) => p.test(t))) return true;

  return false;
}

// Score: prefer extended highlights from organizers, then recency
function scoreVideo(video: YouTubeVideo, isOrganizer: boolean): number {
  let score = 0;
  const t = video.title.toLowerCase();

  // Extended highlights from organizers are gold
  if (isOrganizer && /extended\s*highlights?/.test(t)) score += 50;
  if (isOrganizer && /full\s*highlights?/.test(t)) score += 45;
  if (isOrganizer && /last\s*km/.test(t)) score += 30;
  if (isOrganizer && /highlights?/.test(t)) score += 35;

  // Stage number = concrete race content
  if (/stage\s*\d+/.test(t)) score += 15;

  // Grand Tour content gets a boost
  if (/giro|tour\s*de\s*france|vuelta/.test(t)) score += 10;
  if (/monument|roubaix|flanders|sanremo|liège|lombardia/.test(t)) score += 10;

  // Commentary channels get lower base score
  if (!isOrganizer) score -= 10;

  // Recency
  const daysAgo = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo < 1) score += 25;
  else if (daysAgo < 3) score += 15;
  else if (daysAgo < 7) score += 8;

  return score;
}

interface FeedEntry {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  channelName: string;
  views: number;
  isOrganizer: boolean;
}

function parseXMLFeed(xml: string, channelName: string, isOrganizer: boolean): FeedEntry[] {
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
        isOrganizer,
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

async function fetchChannelFeed(
  channel: { id: string; name: string },
  isOrganizer: boolean
): Promise<FeedEntry[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    return parseXMLFeed(xml, channel.name, isOrganizer);
  } catch {
    return [];
  }
}

export async function fetchHighlights(maxResults: number = 12): Promise<YouTubeVideo[]> {
  // Fetch all feeds in parallel
  const feedPromises = [
    ...ORGANIZER_CHANNELS.map((ch) => fetchChannelFeed(ch, true)),
    ...COMMENTARY_CHANNELS.map((ch) => fetchChannelFeed(ch, false)),
  ];

  const results = await Promise.all(feedPromises);
  const allEntries = results.flat();

  // Filter to only race highlights
  const highlights = allEntries.filter((e) => isExtendedHighlight(e.title));

  // Convert and score
  const videos: (YouTubeVideo & { _score: number })[] = highlights.map((e) => ({
    id: e.videoId,
    title: e.title,
    thumbnail: e.thumbnail,
    publishedAt: e.published,
    channelTitle: e.channelName,
    views: e.views,
    _score: scoreVideo(
      {
        id: e.videoId,
        title: e.title,
        thumbnail: e.thumbnail,
        publishedAt: e.published,
        channelTitle: e.channelName,
        views: e.views,
      },
      e.isOrganizer
    ),
  }));

  // Sort by score descending
  videos.sort((a, b) => b._score - a._score);

  return videos.slice(0, maxResults).map(({ _score, ...v }) => v);
}

// Search highlights relevant to a specific race
export async function fetchRaceHighlights(
  raceName: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const all = await fetchHighlights(50);

  // Build search terms from race name
  const searchTerms = raceName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents for matching
    .replace(/['']/g, "")
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !["the", "and", "des", "del", "2026", "2025"].includes(t));

  const relevant = all.filter((v) => {
    const title = v.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return searchTerms.some((term) => title.includes(term));
  });

  // If no race-specific results, return general highlights
  return relevant.length > 0
    ? relevant.slice(0, maxResults)
    : all.slice(0, maxResults);
}
