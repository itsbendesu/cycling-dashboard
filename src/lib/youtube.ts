export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  duration?: string;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Cycling highlight channels
const CYCLING_CHANNELS = [
  "UCloqTh1nPpXP_-mTCOPnBBQ", // GCN Racing
  "UCuTaETsuCOkIC0H1a0JIrng", // GCN
];

export async function searchYouTubeHighlights(
  query: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    return getMockHighlights(query);
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      maxResults: String(maxResults),
      type: "video",
      order: "date",
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error("YouTube API error:", res.status);
      return getMockHighlights(query);
    }

    const data = await res.json();

    return data.items.map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          thumbnails: { high: { url: string } };
          publishedAt: string;
          channelTitle: string;
        };
      }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      })
    );
  } catch {
    return getMockHighlights(query);
  }
}

// Mock data when no API key is set — shows what the UI looks like
function getMockHighlights(query: string): YouTubeVideo[] {
  const raceName = query.replace(/\d{4}.*/, "").trim();
  return [
    {
      id: "mock-1",
      title: `${raceName} 2025 - Stage Highlights | Epic Finish`,
      thumbnail: "",
      publishedAt: new Date().toISOString(),
      channelTitle: "GCN Racing",
    },
    {
      id: "mock-2",
      title: `${raceName} 2025 - Full Race Summary`,
      thumbnail: "",
      publishedAt: new Date().toISOString(),
      channelTitle: "GCN Racing",
    },
    {
      id: "mock-3",
      title: `${raceName} 2025 - Best Moments & Analysis`,
      thumbnail: "",
      publishedAt: new Date().toISOString(),
      channelTitle: "Lanterne Rouge",
    },
  ];
}
