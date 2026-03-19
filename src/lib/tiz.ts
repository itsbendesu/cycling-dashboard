export interface TizVideo {
  url: string;
  title: string;
  type: "full" | "final-km";
  stageNumber?: number;
}

// Race ID → tiz category slug
const TIZ_SLUGS: Record<string, string> = {
  "tdf": "tour-de-france",
  "giro": "giro-d-italia",
  "vuelta": "vuelta-a-espana",
  "pn": "paris-nice",
  "tirreno": "tirreno-adriatico",
  "catalan": "volta-a-catalunya",
  "pv": "itzulia-basque-country",
  "romandie": "tour-de-romandie",
  "dauphine": "criterium-du-dauphine",
  "suisse": "tour-de-suisse",
  "tdu": "tour-down-under",
  "uae": "uae-tour",
  "msr": "milano-sanremo",
  "rvv": "tour-of-flanders",
  "pr": "paris-roubaix",
  "lg": "liege-bastogne-liege",
  "lombardia": "giro-di-lombardia",
  "strade": "strade-bianche",
  "e3": "e3-saxo-classic",
  "gw": "gent-wevelgem",
  "aw": "amstel-gold-race",
  "fw": "la-fleche-wallonne",
  "sanSeb": "clasica-san-sebastian",
  "quebec": "gp-de-quebec",
  "montreal": "gp-de-montreal",
};

function getRaceBase(raceId: string): string {
  return raceId.replace(/-\d{4}$/, "");
}

function getRaceYear(raceId: string): string {
  return raceId.match(/-(\d{4})$/)?.[1] || "2026";
}

export interface TizCoverageItem {
  raceId: string;
  raceName: string;
  video: TizVideo;
}

export function getTizCategoryUrl(raceId: string): string | null {
  const slug = TIZ_SLUGS[getRaceBase(raceId)];
  if (!slug) return null;
  return `https://tiz-cycling.tv/categories/${slug}-${getRaceYear(raceId)}/`;
}

// Keep the old name as an alias
export function getTizUrl(raceId: string): string | null {
  return getTizCategoryUrl(raceId);
}

function formatTitle(slug: string): string {
  return slug
    .replace(/^.*\/video\//, "")
    .replace(/\/$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function classifyVideo(url: string): TizVideo["type"] {
  if (/last-\d+-km|final-km|final-\d+-km/.test(url)) return "final-km";
  return "full";
}

function extractStageNumber(url: string): number | undefined {
  const match = url.match(/stage-(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

export async function fetchTizVideos(raceId: string): Promise<TizVideo[]> {
  const categoryUrl = getTizCategoryUrl(raceId);
  if (!categoryUrl) return [];

  // Fetch via tiz-cycling.io (accessible proxy)
  const slug = TIZ_SLUGS[getRaceBase(raceId)];
  const year = getRaceYear(raceId);
  const ioUrl = `https://tiz-cycling.io/categories/${slug}-${year}/`;

  try {
    const res = await fetch(ioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Extract video links
    const linkRegex = /href="(https:\/\/tiz-cycling\.tv\/video\/[^"]+)"/g;
    const seen = new Set<string>();
    const videos: TizVideo[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      if (seen.has(url)) continue;
      seen.add(url);

      // Skip unrelated videos and women's/ladies races (calendar tracks men's WT)
      const urlSlug = url.replace("https://tiz-cycling.tv/video/", "");
      if (!urlSlug.includes(slug) && !urlSlug.includes(year)) continue;
      if (/ladies|women|donne|femme/i.test(urlSlug)) continue;

      videos.push({
        url,
        title: formatTitle(urlSlug),
        type: classifyVideo(url),
        stageNumber: extractStageNumber(url),
      });
    }

    // Sort: stages ascending, final-km after full for same stage
    videos.sort((a, b) => {
      const stageA = a.stageNumber ?? 0;
      const stageB = b.stageNumber ?? 0;
      if (stageA !== stageB) return stageA - stageB;
      if (a.type === "full" && b.type === "final-km") return -1;
      if (a.type === "final-km" && b.type === "full") return 1;
      return 0;
    });

    return videos;
  } catch {
    return [];
  }
}

// Fetch latest coverage across multiple races — most recent races first
export async function fetchLatestCoverage(
  races: { id: string; name: string; endDate: string }[],
  maxItems: number = 8
): Promise<TizCoverageItem[]> {
  // Fetch all races in parallel
  const results = await Promise.all(
    races.map(async (race) => {
      const videos = await fetchTizVideos(race.id);
      return videos.map((video) => ({
        raceId: race.id,
        raceName: race.name,
        video,
        _endDate: race.endDate,
      }));
    })
  );

  // Flatten and sort: most recent race (by endDate) first, then highest stage, full before final-km
  const all = results.flat();
  all.sort((a, b) => {
    if (a._endDate !== b._endDate) return b._endDate.localeCompare(a._endDate);
    const stageA = a.video.stageNumber ?? 999;
    const stageB = b.video.stageNumber ?? 999;
    if (stageA !== stageB) return stageB - stageA;
    if (a.video.type === "full" && b.video.type === "final-km") return -1;
    if (a.video.type === "final-km" && b.video.type === "full") return 1;
    return 0;
  });

  return all.slice(0, maxItems).map(({ _endDate, ...item }) => item);
}
