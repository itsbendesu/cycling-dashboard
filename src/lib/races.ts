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
  pcsSlug?: string; // for future scraping
  youtubeSearchTerm?: string;
  winner2024?: string;
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

// 2025 UCI WorldTour Calendar + key races
export const RACES_2025: Race[] = [
  // Grand Tours
  {
    id: "giro-2025",
    name: "Giro d'Italia",
    shortName: "Giro",
    country: "Italy",
    countryCode: "IT",
    startDate: "2025-05-09",
    endDate: "2025-06-01",
    class: "Grand Tour",
    stages: 21,
    distance: "3,400 km",
    pcsSlug: "giro-d-italia",
    youtubeSearchTerm: "Giro d'Italia 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "tdf-2025",
    name: "Tour de France",
    shortName: "TdF",
    country: "France",
    countryCode: "FR",
    startDate: "2025-07-05",
    endDate: "2025-07-27",
    class: "Grand Tour",
    stages: 21,
    distance: "3,320 km",
    pcsSlug: "tour-de-france",
    youtubeSearchTerm: "Tour de France 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "vuelta-2025",
    name: "Vuelta a España",
    shortName: "Vuelta",
    country: "Spain",
    countryCode: "ES",
    startDate: "2025-08-23",
    endDate: "2025-09-14",
    class: "Grand Tour",
    stages: 21,
    distance: "3,200 km",
    pcsSlug: "vuelta-a-espana",
    youtubeSearchTerm: "Vuelta a España 2025 highlights",
    winner2024: "Primož Roglič",
  },
  // Monuments
  {
    id: "msr-2025",
    name: "Milano-Sanremo",
    shortName: "MSR",
    country: "Italy",
    countryCode: "IT",
    startDate: "2025-03-22",
    endDate: "2025-03-22",
    class: "Monument",
    distance: "294 km",
    pcsSlug: "milano-sanremo",
    youtubeSearchTerm: "Milan San Remo 2025 highlights",
    winner2024: "Jasper Philipsen",
  },
  {
    id: "rvv-2025",
    name: "Ronde van Vlaanderen",
    shortName: "Flanders",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2025-04-06",
    endDate: "2025-04-06",
    class: "Monument",
    distance: "272 km",
    pcsSlug: "ronde-van-vlaanderen",
    youtubeSearchTerm: "Tour of Flanders 2025 highlights",
    winner2024: "Mathieu van der Poel",
  },
  {
    id: "pr-2025",
    name: "Paris-Roubaix",
    shortName: "Roubaix",
    country: "France",
    countryCode: "FR",
    startDate: "2025-04-13",
    endDate: "2025-04-13",
    class: "Monument",
    distance: "260 km",
    pcsSlug: "paris-roubaix",
    youtubeSearchTerm: "Paris Roubaix 2025 highlights",
    winner2024: "Mathieu van der Poel",
  },
  {
    id: "lg-2025",
    name: "Liège-Bastogne-Liège",
    shortName: "LBL",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2025-04-27",
    endDate: "2025-04-27",
    class: "Monument",
    distance: "260 km",
    pcsSlug: "liege-bastogne-liege",
    youtubeSearchTerm: "Liege Bastogne Liege 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "lombardia-2025",
    name: "Il Lombardia",
    shortName: "Lombardia",
    country: "Italy",
    countryCode: "IT",
    startDate: "2025-10-11",
    endDate: "2025-10-11",
    class: "Monument",
    distance: "245 km",
    pcsSlug: "il-lombardia",
    youtubeSearchTerm: "Il Lombardia 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  // Major WT Stage Races
  {
    id: "tdu-2025",
    name: "Santos Tour Down Under",
    country: "Australia",
    countryCode: "AU",
    startDate: "2025-01-21",
    endDate: "2025-01-26",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "tour-down-under",
    youtubeSearchTerm: "Tour Down Under 2025 highlights",
    winner2024: "Jay Vine",
  },
  {
    id: "uae-2025",
    name: "UAE Tour",
    country: "UAE",
    countryCode: "AE",
    startDate: "2025-02-17",
    endDate: "2025-02-23",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "uae-tour",
    youtubeSearchTerm: "UAE Tour 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "pn-2025",
    name: "Paris-Nice",
    shortName: "P-N",
    country: "France",
    countryCode: "FR",
    startDate: "2025-03-09",
    endDate: "2025-03-16",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "paris-nice",
    youtubeSearchTerm: "Paris Nice 2025 highlights",
    winner2024: "Matteo Jorgenson",
  },
  {
    id: "tirreno-2025",
    name: "Tirreno-Adriatico",
    shortName: "T-A",
    country: "Italy",
    countryCode: "IT",
    startDate: "2025-03-10",
    endDate: "2025-03-16",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "tirreno-adriatico",
    youtubeSearchTerm: "Tirreno Adriatico 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "catalan-2025",
    name: "Volta a Catalunya",
    country: "Spain",
    countryCode: "ES",
    startDate: "2025-03-24",
    endDate: "2025-03-30",
    class: "WT Stage Race",
    stages: 7,
    pcsSlug: "volta-a-catalunya",
    youtubeSearchTerm: "Volta Catalunya 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "pv-2025",
    name: "Itzulia Basque Country",
    country: "Spain",
    countryCode: "ES",
    startDate: "2025-04-07",
    endDate: "2025-04-12",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "itzulia-basque-country",
    youtubeSearchTerm: "Itzulia Basque Country 2025 highlights",
    winner2024: "Primož Roglič",
  },
  {
    id: "romandie-2025",
    name: "Tour de Romandie",
    country: "Switzerland",
    countryCode: "CH",
    startDate: "2025-04-29",
    endDate: "2025-05-04",
    class: "WT Stage Race",
    stages: 6,
    pcsSlug: "tour-de-romandie",
    youtubeSearchTerm: "Tour de Romandie 2025 highlights",
    winner2024: "Juan Ayuso",
  },
  {
    id: "dauphine-2025",
    name: "Critérium du Dauphiné",
    shortName: "Dauphiné",
    country: "France",
    countryCode: "FR",
    startDate: "2025-06-08",
    endDate: "2025-06-15",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "criterium-du-dauphine",
    youtubeSearchTerm: "Criterium du Dauphine 2025 highlights",
    winner2024: "Primož Roglič",
  },
  {
    id: "suisse-2025",
    name: "Tour de Suisse",
    country: "Switzerland",
    countryCode: "CH",
    startDate: "2025-06-15",
    endDate: "2025-06-22",
    class: "WT Stage Race",
    stages: 8,
    pcsSlug: "tour-de-suisse",
    youtubeSearchTerm: "Tour de Suisse 2025 highlights",
    winner2024: "Adam Yates",
  },
  // Major WT One-Day
  {
    id: "strade-2025",
    name: "Strade Bianche",
    country: "Italy",
    countryCode: "IT",
    startDate: "2025-03-08",
    endDate: "2025-03-08",
    class: "WT One Day",
    distance: "185 km",
    pcsSlug: "strade-bianche",
    youtubeSearchTerm: "Strade Bianche 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "e3-2025",
    name: "E3 Saxo Classic",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2025-03-28",
    endDate: "2025-03-28",
    class: "WT One Day",
    distance: "207 km",
    pcsSlug: "e3-harelbeke",
    youtubeSearchTerm: "E3 Saxo Classic 2025 highlights",
    winner2024: "Mathieu van der Poel",
  },
  {
    id: "gw-2025",
    name: "Gent-Wevelgem",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2025-03-30",
    endDate: "2025-03-30",
    class: "WT One Day",
    distance: "250 km",
    pcsSlug: "gent-wevelgem",
    youtubeSearchTerm: "Gent Wevelgem 2025 highlights",
    winner2024: "Mads Pedersen",
  },
  {
    id: "aw-2025",
    name: "Amstel Gold Race",
    country: "Netherlands",
    countryCode: "NL",
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    class: "WT One Day",
    distance: "254 km",
    pcsSlug: "amstel-gold-race",
    youtubeSearchTerm: "Amstel Gold Race 2025 highlights",
    winner2024: "Tom Pidcock",
  },
  {
    id: "fw-2025",
    name: "La Flèche Wallonne",
    shortName: "Flèche",
    country: "Belgium",
    countryCode: "BE",
    startDate: "2025-04-23",
    endDate: "2025-04-23",
    class: "WT One Day",
    distance: "195 km",
    pcsSlug: "la-fleche-wallonne",
    youtubeSearchTerm: "Fleche Wallonne 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "sanSeb-2025",
    name: "Clásica San Sebastián",
    country: "Spain",
    countryCode: "ES",
    startDate: "2025-08-02",
    endDate: "2025-08-02",
    class: "WT One Day",
    distance: "225 km",
    pcsSlug: "clasica-ciclista-san-sebastian",
    youtubeSearchTerm: "Clasica San Sebastian 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "montreal-2025",
    name: "GP de Montréal",
    country: "Canada",
    countryCode: "CA",
    startDate: "2025-09-14",
    endDate: "2025-09-14",
    class: "WT One Day",
    distance: "219 km",
    pcsSlug: "gp-de-montreal",
    youtubeSearchTerm: "GP Montreal 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
  {
    id: "quebec-2025",
    name: "GP de Québec",
    country: "Canada",
    countryCode: "CA",
    startDate: "2025-09-12",
    endDate: "2025-09-12",
    class: "WT One Day",
    distance: "201 km",
    pcsSlug: "gp-de-quebec",
    youtubeSearchTerm: "GP Quebec 2025 highlights",
    winner2024: "Tadej Pogačar",
  },
];

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
  "Pro Series": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export const STAGE_TYPE_ICONS: Record<Stage["type"], string> = {
  Flat: "―",
  Hilly: "⌇",
  Mountain: "▲",
  ITT: "⏱",
  TTT: "⏱⏱",
  Sprint: "⚡",
};
