export type RaceClass = "Grand Tour" | "Monument" | "WT Stage Race" | "WT One Day" | "Pro Series";

export interface Race {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  countryCode: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  class: RaceClass;
  stages?: number;
  distance?: string;
  pcsSlug?: string;
  youtubeSearchTerm?: string;
  winner2025?: string;
  estimated?: boolean; // dates not yet confirmed
}

export interface Stage {
  number: number;
  date: string;
  start: string;
  finish: string;
  distance: string;
  type: "Flat" | "Hilly" | "Mountain" | "ITT" | "TTT" | "Sprint";
  profileScore?: number;
}

export type RaceStatus = "upcoming" | "active" | "completed";

export function getRaceStatus(race: Race, today: string = new Date().toISOString().split("T")[0]): RaceStatus {
  if (today < race.startDate) return "upcoming";
  if (today > race.endDate) return "completed";
  return "active";
}

export function getStageDay(race: Race, today: string = new Date().toISOString().split("T")[0]): number | null {
  if (getRaceStatus(race, today) !== "active") return null;
  const start = new Date(race.startDate);
  const now = new Date(today);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// 2026 UCI WorldTour Calendar (estimated dates based on historical patterns)
export const RACES_2026: Race[] = [
  // Grand Tours
  {
    id: "giro-2026",
    name: "Giro d'Italia",
    shortName: "Giro",
    country: "Italy",
    countryCode: "IT",
    startDate: "2026-05-08",
    endDate: "2026-05-31",
    class: "Grand Tour",
    stages: 21,
    distance: "~3,400 km",
    pcsSlug: "giro-d-italia",
    youtubeSearchTerm: "Giro d'Italia 2026 highlights",
    estimated: true,
  },
  {
    id: "tdf-2026",
    name: "Tour de France",
    shortName: "TdF",
    country: "France",
    countryCode: "FR",
    startDate: "2026-07-04",
    endDate: "2026-07-26",
    class: "Grand Tour",
    stages: 21,
    distance: "~3,350 km",
    pcsSlug: "tour-de-france",
    youtubeSearchTerm: "Tour de France 2026 highlights",
    estimated: true,
  },
  {
    id: "vuelta-2026",
    name: "Vuelta a España",
    shortName: "Vuelta",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-08-22",
    endDate: "2026-09-13",
    class: "Grand Tour",
    stages: 21,
    distance: "~3,200 km",
    pcsSlug: "vuelta-a-espana",
    youtubeSearchTerm: "Vuelta a España 2026 highlights",
    estimated: true,
  },
  // Monuments
  {
    id: "msr-2026",
    name: "Milano-Sanremo",
    shortName: "MSR",
    country: "Italy",
    countryCode: "IT",
    startDate: "2026-03-21",
    endDate: "2026-03-21",
    class: "Monument",
    distance: "~294 km",
    pcsSlug: "milano-sanremo",
    youtubeSearchTerm: "Milan San Remo 2026 highlights",
    estimated: true,
  },
  {
    id: "rvv-2026",
    name: "Ronde van Vlaanderen",
    shortName: "Flanders",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2026-04-05",
    endDate: "2026-04-05",
    class: "Monument",
    distance: "~272 km",
    pcsSlug: "ronde-van-vlaanderen",
    youtubeSearchTerm: "Tour of Flanders 2026 highlights",
    estimated: true,
  },
  {
    id: "pr-2026",
    name: "Paris-Roubaix",
    shortName: "Roubaix",
    country: "France",
    countryCode: "FR",
    startDate: "2026-04-12",
    endDate: "2026-04-12",
    class: "Monument",
    distance: "~260 km",
    pcsSlug: "paris-roubaix",
    youtubeSearchTerm: "Paris Roubaix 2026 highlights",
    estimated: true,
  },
  {
    id: "lg-2026",
    name: "Liège-Bastogne-Liège",
    shortName: "LBL",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2026-04-26",
    endDate: "2026-04-26",
    class: "Monument",
    distance: "~260 km",
    pcsSlug: "liege-bastogne-liege",
    youtubeSearchTerm: "Liege Bastogne Liege 2026 highlights",
    estimated: true,
  },
  {
    id: "lombardia-2026",
    name: "Il Lombardia",
    shortName: "Lombardia",
    country: "Italy",
    countryCode: "IT",
    startDate: "2026-10-10",
    endDate: "2026-10-10",
    class: "Monument",
    distance: "~245 km",
    pcsSlug: "il-lombardia",
    youtubeSearchTerm: "Il Lombardia 2026 highlights",
    estimated: true,
  },
  // Major WT Stage Races
  {
    id: "tdu-2026",
    name: "Santos Tour Down Under",
    country: "Australia",
    countryCode: "AU",
    startDate: "2026-01-20",
    endDate: "2026-01-25",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "tour-down-under",
    youtubeSearchTerm: "Tour Down Under 2026 highlights",
    estimated: true,
  },
  {
    id: "uae-2026",
    name: "UAE Tour",
    country: "UAE",
    countryCode: "AE",
    startDate: "2026-02-16",
    endDate: "2026-02-22",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "uae-tour",
    youtubeSearchTerm: "UAE Tour 2026 highlights",
    estimated: true,
  },
  {
    id: "pn-2026",
    name: "Paris-Nice",
    shortName: "P-N",
    country: "France",
    countryCode: "FR",
    startDate: "2026-03-08",
    endDate: "2026-03-15",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "paris-nice",
    youtubeSearchTerm: "Paris Nice 2026 highlights",
    estimated: true,
  },
  {
    id: "tirreno-2026",
    name: "Tirreno-Adriatico",
    shortName: "T-A",
    country: "Italy",
    countryCode: "IT",
    startDate: "2026-03-09",
    endDate: "2026-03-15",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "tirreno-adriatico",
    youtubeSearchTerm: "Tirreno Adriatico 2026 highlights",
    estimated: true,
  },
  {
    id: "catalan-2026",
    name: "Volta a Catalunya",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-03-23",
    endDate: "2026-03-29",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "volta-a-catalunya",
    youtubeSearchTerm: "Volta Catalunya 2026 highlights",
    estimated: true,
  },
  {
    id: "pv-2026",
    name: "Itzulia Basque Country",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-04-06",
    endDate: "2026-04-11",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "itzulia-basque-country",
    youtubeSearchTerm: "Itzulia Basque Country 2026 highlights",
    estimated: true,
  },
  {
    id: "romandie-2026",
    name: "Tour de Romandie",
    country: "Switzerland",
    countryCode: "CH",
    startDate: "2026-04-28",
    endDate: "2026-05-03",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "tour-de-romandie",
    youtubeSearchTerm: "Tour de Romandie 2026 highlights",
    estimated: true,
  },
  {
    id: "dauphine-2026",
    name: "Critérium du Dauphiné",
    shortName: "Dauphiné",
    country: "France",
    countryCode: "FR",
    startDate: "2026-06-07",
    endDate: "2026-06-14",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "criterium-du-dauphine",
    youtubeSearchTerm: "Criterium du Dauphine 2026 highlights",
    estimated: true,
  },
  {
    id: "suisse-2026",
    name: "Tour de Suisse",
    country: "Switzerland",
    countryCode: "CH",
    startDate: "2026-06-14",
    endDate: "2026-06-21",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "tour-de-suisse",
    youtubeSearchTerm: "Tour de Suisse 2026 highlights",
    estimated: true,
  },
  // Major WT One-Day
  {
    id: "strade-2026",
    name: "Strade Bianche",
    country: "Italy",
    countryCode: "IT",
    startDate: "2026-03-07",
    endDate: "2026-03-07",
    class: "WT One Day",
    distance: "~185 km",
    pcsSlug: "strade-bianche",
    youtubeSearchTerm: "Strade Bianche 2026 highlights",
    estimated: true,
  },
  {
    id: "e3-2026",
    name: "E3 Saxo Classic",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2026-03-27",
    endDate: "2026-03-27",
    class: "WT One Day",
    distance: "~207 km",
    pcsSlug: "e3-harelbeke",
    youtubeSearchTerm: "E3 Saxo Classic 2026 highlights",
    estimated: true,
  },
  {
    id: "gw-2026",
    name: "Gent-Wevelgem",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2026-03-29",
    endDate: "2026-03-29",
    class: "WT One Day",
    distance: "~250 km",
    pcsSlug: "gent-wevelgem",
    youtubeSearchTerm: "Gent Wevelgem 2026 highlights",
    estimated: true,
  },
  {
    id: "aw-2026",
    name: "Amstel Gold Race",
    country: "Netherlands",
    countryCode: "NL",
    startDate: "2026-04-19",
    endDate: "2026-04-19",
    class: "WT One Day",
    distance: "~254 km",
    pcsSlug: "amstel-gold-race",
    youtubeSearchTerm: "Amstel Gold Race 2026 highlights",
    estimated: true,
  },
  {
    id: "fw-2026",
    name: "La Flèche Wallonne",
    shortName: "Flèche",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2026-04-22",
    endDate: "2026-04-22",
    class: "WT One Day",
    distance: "~195 km",
    pcsSlug: "la-fleche-wallonne",
    youtubeSearchTerm: "Fleche Wallonne 2026 highlights",
    estimated: true,
  },
  {
    id: "sanSeb-2026",
    name: "Clásica San Sebastián",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    class: "WT One Day",
    distance: "~225 km",
    pcsSlug: "clasica-ciclista-san-sebastian",
    youtubeSearchTerm: "Clasica San Sebastian 2026 highlights",
    estimated: true,
  },
  {
    id: "quebec-2026",
    name: "GP de Québec",
    country: "Canada",
    countryCode: "CA",
    startDate: "2026-09-11",
    endDate: "2026-09-11",
    class: "WT One Day",
    distance: "~201 km",
    pcsSlug: "gp-de-quebec",
    youtubeSearchTerm: "GP Quebec 2026 highlights",
    estimated: true,
  },
  {
    id: "montreal-2026",
    name: "GP de Montréal",
    country: "Canada",
    countryCode: "CA",
    startDate: "2026-09-13",
    endDate: "2026-09-13",
    class: "WT One Day",
    distance: "~219 km",
    pcsSlug: "gp-de-montreal",
    youtubeSearchTerm: "GP Montreal 2026 highlights",
    estimated: true,
  },
];

// Use current season's races as the primary list
export const ALL_RACES = RACES_2026;

export function getUpcomingRaces(races: Race[], count: number = 5): Race[] {
  const today = new Date().toISOString().split("T")[0];
  return races
    .filter((r) => r.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, count);
}

export function getActiveRaces(races: Race[]): Race[] {
  const today = new Date().toISOString().split("T")[0];
  return races.filter((r) => getRaceStatus(r, today) === "active");
}

export function getCompletedRaces(races: Race[]): Race[] {
  const today = new Date().toISOString().split("T")[0];
  return races
    .filter((r) => getRaceStatus(r, today) === "completed")
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
}

export const CLASS_COLORS: Record<RaceClass, string> = {
  "Grand Tour": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Monument": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "WT Stage Race": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "WT One Day": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Pro Series": "bg-zinc-500/20 text-muted border-zinc-500/30",
};

export const STAGE_TYPE_ICONS: Record<Stage["type"], string> = {
  Flat: "―",
  Hilly: "⌇",
  Mountain: "▲",
  ITT: "⏱",
  TTT: "⏱⏱",
  Sprint: "⚡",
};
