/**
 * Well-known, highly selective schools in England. Not an official ranking:
 * a starting list for students to set targets. Entry details change, so the
 * app always sends people to the school's own admissions page to check.
 */

export type SchoolType = "grammar" | "independent";
export type Region = "London" | "South East" | "South West" | "East" | "Midlands" | "North";

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  gender: "Boys" | "Girls" | "Co-ed" | "Check website";
  area: string;
  region: Region;
  /** Main ages you can join at, e.g. ["11+", "16+"]. */
  entry: string[];
  note?: string;
}

const g = (id: string, name: string, gender: School["gender"], area: string, region: Region, note?: string): School => ({ id, name, type: "grammar", gender, area, region, entry: ["11+"], note });
const i = (id: string, name: string, gender: School["gender"], area: string, region: Region, entry: string[], note?: string): School => ({ id, name, type: "independent", gender, area, region, entry, note });

export const SCHOOLS: School[] = [
  // Independent (fee-paying; bursaries and scholarships available)
  i("st-pauls", "St Paul's School", "Boys", "Barnes, London", "London", ["13+", "16+"], "Younger boys join St Paul's Juniors at 7+ or 11+."),
  i("spgs", "St Paul's Girls' School", "Girls", "Hammersmith, London", "London", ["11+", "16+"]),
  i("westminster", "Westminster School", "Check website", "Westminster, London", "London", ["13+", "16+"], "Younger pupils join Westminster Under School."),
  i("eton", "Eton College", "Boys", "Windsor, Berkshire", "South East", ["13+", "16+"], "Assessment for 13+ entry starts years ahead, in Year 6."),
  i("harrow", "Harrow School", "Boys", "Harrow, London", "London", ["13+", "16+"]),
  i("winchester", "Winchester College", "Check website", "Winchester, Hampshire", "South East", ["13+", "16+"]),
  i("nlcs", "North London Collegiate School", "Girls", "Edgware, London", "London", ["11+", "16+"]),
  i("wycombe-abbey", "Wycombe Abbey", "Girls", "High Wycombe, Buckinghamshire", "South East", ["11+", "13+", "16+"]),
  i("cls", "City of London School", "Boys", "City of London", "London", ["11+", "13+", "16+"]),
  i("clsg", "City of London School for Girls", "Girls", "City of London", "London", ["11+", "16+"]),
  i("latymer-upper", "Latymer Upper School", "Co-ed", "Hammersmith, London", "London", ["11+", "13+", "16+"]),
  i("brighton", "Brighton College", "Co-ed", "Brighton, East Sussex", "South East", ["11+", "13+", "16+"]),
  i("sevenoaks", "Sevenoaks School", "Co-ed", "Sevenoaks, Kent", "South East", ["11+", "13+", "16+"]),
  i("tonbridge", "Tonbridge School", "Boys", "Tonbridge, Kent", "South East", ["13+", "16+"]),
  i("mgs", "The Manchester Grammar School", "Boys", "Manchester", "North", ["11+", "16+"], "Independent, despite the name."),
  i("cheltenham-ladies", "Cheltenham Ladies' College", "Girls", "Cheltenham, Gloucestershire", "South West", ["11+", "13+", "16+"]),

  // Grammar (state, free; entry by the 11+ test)
  g("qe-barnet", "Queen Elizabeth's School", "Boys", "Barnet, London", "London"),
  g("henrietta-barnett", "The Henrietta Barnett School", "Girls", "Hampstead Garden Suburb, London", "London"),
  g("tiffin", "Tiffin School", "Boys", "Kingston upon Thames, London", "London"),
  g("tiffin-girls", "The Tiffin Girls' School", "Girls", "Kingston upon Thames, London", "London"),
  g("wilsons", "Wilson's School", "Boys", "Wallington, London", "London"),
  g("sutton-grammar", "Sutton Grammar School", "Boys", "Sutton, London", "London"),
  g("nonsuch", "Nonsuch High School for Girls", "Girls", "Cheam, London", "London"),
  g("latymer-edmonton", "The Latymer School", "Co-ed", "Edmonton, London", "London"),
  g("reading", "Reading School", "Boys", "Reading, Berkshire", "South East"),
  g("kendrick", "Kendrick School", "Girls", "Reading, Berkshire", "South East"),
  g("rgs-wycombe", "Royal Grammar School", "Boys", "High Wycombe, Buckinghamshire", "South East", "Uses the Buckinghamshire transfer test."),
  g("crgs", "Colchester Royal Grammar School", "Boys", "Colchester, Essex", "East"),
  g("pates", "Pate's Grammar School", "Co-ed", "Cheltenham, Gloucestershire", "South West"),
  g("camp-hill-boys", "King Edward VI Camp Hill School for Boys", "Boys", "Birmingham", "Midlands"),
  g("agsb", "Altrincham Grammar School for Boys", "Boys", "Altrincham, Greater Manchester", "North"),
  g("agsg", "Altrincham Grammar School for Girls", "Girls", "Altrincham, Greater Manchester", "North"),
];

export const schoolById = (id: string) => SCHOOLS.find((s) => s.id === id);

/** A web search for the school's admissions page (always current, never a broken link). */
export const admissionsLink = (s: School) => `https://www.google.com/search?q=${encodeURIComponent(`${s.name} ${s.area.split(",")[0]} admissions`)}`;

export const MAX_TARGETS = 3;

export const HOW_TO_GET_IN: Record<SchoolType, { title: string; points: string[] }> = {
  grammar: {
    title: "How grammar school entry usually works",
    points: [
      "Free state schools. Places go by your score in the 11+ test (and sometimes how far you live from the school).",
      "You usually register in the summer of Year 5. The test is usually in September of Year 6.",
      "Tests cover some mix of maths, English, verbal reasoning and non-verbal reasoning, depending on the area.",
      "You then list the school on your council's secondary school application by 31 October of Year 6. Offers come on 1 March.",
    ],
  },
  independent: {
    title: "How independent school entry usually works",
    points: [
      "Fee-paying schools with their own entry process. Many offer bursaries (help with fees) and scholarships.",
      "At 11+: register in Year 5 or early Year 6, then sit the school's exams (often November to January of Year 6) and an interview.",
      "At 13+: many schools use an online pre-test in Year 6 or 7, plus an interview, then offer a place years ahead.",
      "Academic scholarships usually mean extra, harder exams. Many schools publish sample papers on their websites.",
    ],
  },
};
