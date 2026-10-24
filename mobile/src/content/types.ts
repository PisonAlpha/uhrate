export interface Policy {
  title: string;
  /** As shown on the website, e.g. "June 2026". */
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
}
