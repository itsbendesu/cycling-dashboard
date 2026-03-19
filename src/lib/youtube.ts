export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  views?: number;
}

// Only official extended highlights channels
const HIGHLIGHT_CHANNELS = [
  { id: "UCSpycUnuU0IVF7gGIhGojhg", name: "Tour de France" }, // ASO: TdF, Paris-Nice, Dauphiné, Paris-Roubaix, LBL, Flèche, Strade Bianche
  { id: "UCfDfvvMARk4TKcC62ALi6eA", name: "TNT Sports Cycling" }, // Formerly Eurosport: Flanders, other classics
];

function isExtendedHighlight(title: string): boolean {
  const t = title.toLowerCase();

  // Only extended/full highlights
  if (/extended\s*highlights?/.test(t)) return true;
  if (/full\s*highlights?/.test(t)) return true;
  if (/highlights?\s*of\s*the\s*\d{4}\s*edition/.test(t)) return true;

  return false;
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

export async function fetchHighlights(maxResults: number = 60): Promise<YouTubeVideo[]> {
  const feedPromises = HIGHLIGHT_CHANNELS.map(async (channel) => {
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
  const allEntries = results.flat();

  // Only extended highlights
  const highlights = allEntries.filter((e) => isExtendedHighlight(e.title));

  // Sort by date descending (most recent first)
  highlights.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  return highlights.slice(0, maxResults).map((e) => ({
    id: e.videoId,
    title: e.title,
    thumbnail: e.thumbnail,
    publishedAt: e.published,
    channelTitle: e.channelName,
    views: e.views,
  }));
}

// Get highlights filtered for a specific race
export async function fetchRaceHighlights(
  raceName: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const all = await fetchHighlights(60);

  const searchTerms = raceName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !["the", "and", "des", "del", "2026", "2025"].includes(t));

  const relevant = all.filter((v) => {
    const title = v.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return searchTerms.some((term) => title.includes(term));
  });

  return relevant.length > 0 ? relevant.slice(0, maxResults) : all.slice(0, maxResults);
}
