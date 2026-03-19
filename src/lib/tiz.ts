// Tiz-cycling URL patterns for race pages
// These link to the race category which has full replays + final km videos

const TIZ_SLUGS: Record<string, string> = {
  // Grand Tours
  "tdf": "tour-de-france",
  "giro": "giro-d-italia",
  "vuelta": "vuelta-a-espana",
  // Stage races
  "pn": "paris-nice",
  "tirreno": "tirreno-adriatico",
  "catalan": "volta-a-catalunya",
  "pv": "itzulia-basque-country",
  "romandie": "tour-de-romandie",
  "dauphine": "criterium-du-dauphine",
  "suisse": "tour-de-suisse",
  "tdu": "tour-down-under",
  "uae": "uae-tour",
  // Monuments
  "msr": "milano-sanremo",
  "rvv": "tour-of-flanders",
  "pr": "paris-roubaix",
  "lg": "liege-bastogne-liege",
  "lombardia": "giro-di-lombardia",
  // One-day
  "strade": "strade-bianche",
  "e3": "e3-saxo-classic",
  "gw": "gent-wevelgem",
  "aw": "amstel-gold-race",
  "fw": "la-fleche-wallonne",
  "sanSeb": "clasica-san-sebastian",
  "quebec": "gp-de-quebec",
  "montreal": "gp-de-montreal",
};

export function getTizUrl(raceId: string): string | null {
  const base = raceId.replace(/-\d{4}$/, "");
  const yearMatch = raceId.match(/-(\d{4})$/);
  const year = yearMatch ? yearMatch[1] : "2026";
  const slug = TIZ_SLUGS[base];
  if (!slug) return null;
  return `https://tiz-cycling.tv/categories/${slug}-${year}/`;
}
