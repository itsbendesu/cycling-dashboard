import * as cheerio from "cheerio";

export interface RaceResult {
  rank: number;
  rider: string;
  nationality: string;
  team: string;
  time: string;
}

export interface StageResult {
  stageNumber: number;
  stageName: string;
  results: RaceResult[];
  gcAfterStage: RaceResult[];
}

export interface ClassificationStanding {
  name: string; // "General classification", "Points classification", etc.
  results: RaceResult[];
}

export interface RaceResults {
  winner: string | null;
  winnerNat: string | null;
  winnerTeam: string | null;
  second: string | null;
  secondTeam: string | null;
  third: string | null;
  thirdTeam: string | null;
  totalTime: string | null;
  distance: string | null;
  stages: StageResult[];
  classifications: ClassificationStanding[];
}

// Map race IDs to Wikipedia article names
// Use readable Wikipedia article titles — encoded at fetch time
const WIKI_SLUGS: Record<string, string> = {
  // Stage races
  "tdf": "Tour_de_France",
  "giro": "Giro_d'Italia",
  "vuelta": "Vuelta_a_España",
  "pn": "Paris–Nice",
  "tirreno": "Tirreno–Adriatico",
  "catalan": "Volta_a_Catalunya",
  "pv": "Itzulia_Basque_Country",
  "romandie": "Tour_de_Romandie",
  "dauphine": "Critérium_du_Dauphiné",
  "suisse": "Tour_de_Suisse",
  "tdu": "Tour_Down_Under",
  "uae": "UAE_Tour",
  // One-day
  "msr": "Milan–San_Remo",
  "rvv": "Tour_of_Flanders",
  "pr": "Paris–Roubaix",
  "lg": "Liège–Bastogne–Liège",
  "lombardia": "Giro_di_Lombardia",
  "strade": "Strade_Bianche",
  "e3": "E3_Saxo_Classic",
  "gw": "Ghent–Wevelgem",
  "aw": "Amstel_Gold_Race",
  "fw": "La_Flèche_Wallonne",
  "sanSeb": "Clásica_de_San_Sebastián",
  "quebec": "Grand_Prix_Cycliste_de_Québec",
  "montreal": "Grand_Prix_Cycliste_de_Montréal",
};

function getWikiSlug(raceId: string): string | null {
  // Strip year suffix: "pn-2026" -> "pn"
  const base = raceId.replace(/-\d{4}$/, "");
  return WIKI_SLUGS[base] || null;
}

function parseRiderCell(text: string): { rider: string; nationality: string } {
  // Format: " Jonas Vingegaard (DEN)" or similar
  const cleaned = text.replace(/\u00a0/g, " ").trim();
  const natMatch = cleaned.match(/\(([A-Z]{3})\)\s*$/);
  const nationality = natMatch ? natMatch[1] : "";
  const rider = cleaned.replace(/\s*\([A-Z]{3}\)\s*$/, "").trim();
  return { rider, nationality };
}

function parseResultsTable($: cheerio.CheerioAPI, table: ReturnType<cheerio.CheerioAPI>): RaceResult[] {
  const results: RaceResult[] = [];
  const rows = table.find("tr");

  rows.each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const rankText = $(cells[0]).text().trim();
    const rank = parseInt(rankText, 10);
    if (isNaN(rank)) return;

    const { rider, nationality } = parseRiderCell($(cells[1]).text());
    const team = $(cells[2]).text().trim();
    const time = $(cells[3]).text().trim();

    if (rider) {
      results.push({ rank, rider, nationality, team, time });
    }
  });

  return results;
}

export async function fetchRaceResults(raceId: string, year: number = 2026): Promise<RaceResults | null> {
  const slug = getWikiSlug(raceId);
  if (!slug) return null;

  const pageTitle = `${year}_${slug}`;
  const encodedTitle = encodeURIComponent(pageTitle);

  try {
    // First get the infobox data
    const infoRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&prop=wikitext&section=0&format=json`,
      { next: { revalidate: 3600 } }
    );

    if (!infoRes.ok) return null;
    const infoData = await infoRes.json();

    if (infoData.error) return null;

    const wikitext = infoData.parse?.wikitext?.["*"] || "";

    // Parse infobox fields
    const winner = wikitext.match(/\|\s*first\s*=\s*\[\[([^\]|]+)/)?.[1] || null;
    const winnerNat = wikitext.match(/\|\s*first_nat\s*=\s*(\w+)/)?.[1] || null;
    const second = wikitext.match(/\|\s*second\s*=\s*\[\[([^\]|]+)/)?.[1] || null;
    const third = wikitext.match(/\|\s*third\s*=\s*\[\[([^\]|]+)/)?.[1] || null;
    const totalTime = wikitext.match(/\|\s*time\s*=\s*([^\n]+)/)?.[1]?.trim() || null;
    const distance = wikitext.match(/\|\s*distance\s*=\s*([^\n]+)/)?.[1]?.trim() || null;

    // Get team names from wikitext templates
    const winnerTeamMatch = wikitext.match(/\|\s*first_team\s*=\s*\{\{[^|]*\|([^|}\n]+)/);
    const winnerTeam = winnerTeamMatch ? winnerTeamMatch[1].trim() : null;
    const secondTeamMatch = wikitext.match(/\|\s*second_team\s*=\s*\{\{[^|]*\|([^|}\n]+)/);
    const secondTeam = secondTeamMatch ? secondTeamMatch[1].trim() : null;
    const thirdTeamMatch = wikitext.match(/\|\s*third_team\s*=\s*\{\{[^|]*\|([^|}\n]+)/);
    const thirdTeam = thirdTeamMatch ? thirdTeamMatch[1].trim() : null;

    // Get sections to find classifications
    const sectionsRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&prop=sections&format=json`,
      { next: { revalidate: 3600 } }
    );
    const sectionsData = await sectionsRes.json();
    const sections = sectionsData.parse?.sections || [];

    // Find stage sections and classification sections
    const stageSections = sections.filter(
      (s: { line: string; level: string }) => /^Stage\s+\d+/.test(s.line) && s.level === "3"
    );
    const classificationSections = sections.filter(
      (s: { line: string; level: string }) =>
        /(general|points|mountains|young|teams?)\s+classification/i.test(s.line) && s.level === "3"
    );

    // Fetch ALL stage results in parallel
    const stagePromises = stageSections.map(async (section: { line: string; index: string }) => {
      try {
        const stageRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&section=${section.index}&prop=text&format=json`,
          { next: { revalidate: 3600 } }
        );
        const stageData = await stageRes.json();
        const html = stageData.parse?.text?.["*"] || "";
        const $ = cheerio.load(html);
        const tables = $("table.wikitable");

        const stageNum = parseInt(section.line.match(/Stage\s+(\d+)/)?.[1] || "0", 10);
        const results: RaceResult[] = [];
        const gcAfter: RaceResult[] = [];

        tables.each((i, table) => {
          const caption = $(table).find("caption").text() || $(table).prev("p, h3, h4").text();
          const parsed = parseResultsTable($, $(table));

          if (i === 0 || /stage.*result/i.test(caption)) {
            results.push(...parsed);
          } else if (/general\s*classification/i.test(caption) || i === 1) {
            gcAfter.push(...parsed);
          }
        });

        if (results.length > 0) {
          return {
            stageNumber: stageNum,
            stageName: section.line,
            results,
            gcAfterStage: gcAfter,
          } as StageResult;
        }
        return null;
      } catch {
        return null;
      }
    });

    // Fetch ALL classification standings in parallel
    const classPromises = classificationSections.map(async (section: { line: string; index: string }) => {
      try {
        const classRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&section=${section.index}&prop=text&format=json`,
          { next: { revalidate: 3600 } }
        );
        const classData = await classRes.json();
        const html = classData.parse?.text?.["*"] || "";
        const $ = cheerio.load(html);

        const table = $("table.wikitable").first();
        if (table.length) {
          const results = parseResultsTable($, table);
          if (results.length > 0) {
            return { name: section.line, results } as ClassificationStanding;
          }
        }
        return null;
      } catch {
        return null;
      }
    });

    // Wait for all fetches
    const [stageResultsRaw, classificationsRaw] = await Promise.all([
      Promise.all(stagePromises),
      Promise.all(classPromises),
    ]);

    const stageResults = stageResultsRaw.filter((s): s is StageResult => s !== null);
    const classifications = classificationsRaw.filter((c): c is ClassificationStanding => c !== null);

    return {
      winner,
      winnerNat,
      winnerTeam,
      second,
      secondTeam,
      third,
      thirdTeam,
      totalTime,
      distance,
      stages: stageResults,
      classifications,
    };
  } catch {
    return null;
  }
}

// Check if a Wikipedia article exists for a race
export async function raceHasResults(raceId: string, year: number = 2026): Promise<boolean> {
  const slug = getWikiSlug(raceId);
  if (!slug) return false;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(`${year}_${slug}`)}&format=json`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const pages = data.query?.pages || {};
    return !Object.keys(pages).includes("-1");
  } catch {
    return false;
  }
}
