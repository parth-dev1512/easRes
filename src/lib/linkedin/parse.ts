import { getDocumentProxy } from "unpdf";
import type { ParsedResume } from "@/lib/gemini/importSchema";

/**
 * Deterministic parser for LinkedIn's "Save to PDF" export. No AI is involved,
 * so imports cost nothing. LinkedIn's layout is a narrow left sidebar (Contact,
 * Top Skills, ...) next to a main column (name, Summary, Experience, Education),
 * which we split by x-position before reading sections by their headings.
 */

export type PdfLine = { text: string; x: number; height: number };

const MONTHS: Record<string, string> = {
  january: "Jan", february: "Feb", march: "Mar", april: "Apr", may: "May",
  june: "Jun", july: "Jul", august: "Aug", september: "Sep", october: "Oct",
  november: "Nov", december: "Dec",
};

const MAIN_SECTIONS = new Set([
  "summary", "experience", "education", "projects", "volunteer experience",
  "certifications", "honors-awards", "publications", "patents", "courses",
  "organizations", "test scores", "recommendations", "languages", "licenses & certifications",
]);
const SIDEBAR_SECTIONS = new Set([
  "contact", "top skills", "skills", "languages", "certifications",
  "honors-awards", "publications", "patents", "courses", "organizations",
  "test scores", "licenses & certifications",
]);

const DATE = "(?:[A-Za-z]+ )?\\d{4}";
const DATE_RANGE = new RegExp(`^(${DATE}) - (${DATE}|Present)(?: \\(.*\\))?$`);
const DURATION_ONLY = /^\d+ (?:years?|months?)(?: \d+ months?)?$/;
const PAGE_MARKER = /^Page \d+ of \d+$/i;
const BULLET_START = /^[•·▪●◦\-–*]\s*/;

function shortDate(d: string): string {
  const [first, year] = d.split(" ");
  if (!year) return d;
  return `${MONTHS[first.toLowerCase()] ?? first} ${year}`;
}

export async function extractPdfLines(data: Uint8Array): Promise<PdfLine[]> {
  const pdf = await getDocumentProxy(data);
  const lines: PdfLine[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let cur: { text: string; x: number; height: number; y: number } | null = null;
    const flush = () => {
      if (cur && cur.text.trim()) {
        lines.push({ text: cur.text.replace(/\s+/g, " ").trim(), x: cur.x, height: cur.height });
      }
      cur = null;
    };
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      if (cur && Math.abs(y - cur.y) > 2) flush();
      if (!cur) {
        cur = { text: "", x, height: item.height, y };
      }
      cur.text += item.str;
      cur.height = Math.max(cur.height, item.height);
      if (item.hasEOL) flush();
    }
    flush();
  }
  return lines;
}

type Sections = Record<string, string[]>;

function splitSections(lines: string[], known: Set<string>): { head: string[]; sections: Sections } {
  const head: string[] = [];
  const sections: Sections = {};
  let current: string | null = null;
  for (const line of lines) {
    const key = line.toLowerCase();
    if (known.has(key)) {
      current = key;
      sections[current] ??= [];
    } else if (current) {
      sections[current].push(line);
    } else {
      head.push(line);
    }
  }
  return { head, sections };
}

/** Joins hard-wrapped lines into paragraphs/bullets. */
function toBullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const startsBullet = BULLET_START.test(raw);
    const text = raw.replace(BULLET_START, "").trim();
    if (!text) continue;
    const prev = out[out.length - 1];
    const prevEnded = prev !== undefined && /[.!?:]$/.test(prev) && /^[A-Z0-9]/.test(text);
    if (prev === undefined || startsBullet || prevEnded) out.push(text);
    else out[out.length - 1] = `${prev} ${text}`;
  }
  return out;
}

const LOCATION_HINT = /,|\b(Area|Region|Remote|Hybrid|On-site|Metropolitan)\b/i;

function looksLikeName(s: string): boolean {
  return s.length <= 70 && !/[.!?]$/.test(s) && s.split(" ").length <= 9;
}

type DatedEntry = {
  title: string;
  company: string | null;
  start: string;
  end: string;
  location: string | null;
  body: string[];
};

/** Reads Experience/Projects blocks, which are anchored on "Mon YYYY - Mon YYYY" lines. */
function parseDated(lines: string[], withCompany: boolean): DatedEntry[] {
  const dateIdx: number[] = [];
  lines.forEach((l, i) => {
    if (DATE_RANGE.test(l)) dateIdx.push(i);
  });

  const entries: DatedEntry[] = [];
  let groupCompany: string | null = null;

  dateIdx.forEach((d, k) => {
    const m = DATE_RANGE.exec(lines[d])!;
    const prevDate = k === 0 ? -1 : dateIdx[k - 1];
    // Everything between the previous date line and this one: the previous
    // entry's body, then this entry's heading lines, then its title.
    const gap = lines.slice(prevDate + 1, d);
    const title = gap[gap.length - 1] ?? "";
    const rest = gap.slice(0, -1);

    let company: string | null = null;
    let prevBody = rest;

    if (withCompany) {
      const last = rest[rest.length - 1];
      if (last !== undefined && DURATION_ONLY.test(last)) {
        // Multi-role group: "Company", "3 years 2 months", "Title", date, ...
        groupCompany = rest[rest.length - 2] ?? null;
        company = groupCompany;
        prevBody = rest.slice(0, -2);
      } else if (k > 0 && groupCompany && !(rest.length >= 2 && looksLikeName(last))) {
        company = groupCompany; // another role at the same company
      } else {
        groupCompany = null;
        company = last ?? null;
        prevBody = rest.slice(0, -1);
      }
    } else {
      prevBody = k === 0 ? [] : rest;
    }

    if (k > 0) entries[k - 1].body = prevBody;

    entries.push({
      title,
      company,
      start: shortDate(m[1]),
      end: m[2] === "Present" ? "Present" : shortDate(m[2]),
      location: null,
      body: lines.slice(d + 1),
    });
  });

  for (const e of entries) {
    if (e.body[0] && e.body[0].length <= 70 && LOCATION_HINT.test(e.body[0]) && !/[.!?]$/.test(e.body[0])) {
      e.location = e.body[0];
      e.body = e.body.slice(1);
    }
  }
  return entries;
}

const EDU_DATES = /\(([^()]*\d{4}[^()]*)\)\s*$/;

function parseEducation(lines: string[]): ParsedResume["education"] {
  const out: ParsedResume["education"] = [];
  const idx: number[] = [];
  lines.forEach((l, i) => {
    if (EDU_DATES.test(l)) idx.push(i);
  });

  let consumedUntil = 0;
  idx.forEach((i, k) => {
    let degreeLine = lines[i];
    let instIdx = i - 1;
    // A wrapped degree line begins lowercase or follows an unterminated line.
    if (instIdx > consumedUntil && /^[a-z]/.test(degreeLine)) {
      degreeLine = `${lines[instIdx]} ${degreeLine}`;
      instIdx -= 1;
    }
    const m = EDU_DATES.exec(degreeLine)!;
    const dates = m[1].split(/\s+-\s+/).map((s) => s.trim());
    const degreeText = degreeLine.slice(0, m.index).replace(/[\s·]+$/, "");
    const comma = degreeText.indexOf(", ");
    const nextStart = idx[k + 1] !== undefined ? idx[k + 1] - 1 : lines.length;

    const body = lines.slice(i + 1, nextStart);
    consumedUntil = nextStart;
    let gpa: string | null = null;
    const rest: string[] = [];
    for (const b of body) {
      const g = /^(?:Grade|GPA|CGPA)\s*[:\-]\s*(.+)$/i.exec(b);
      if (g && !gpa) gpa = g[1].trim();
      else rest.push(b);
    }

    out.push({
      institution: lines[instIdx] ?? null,
      degree: (comma === -1 ? degreeText : degreeText.slice(0, comma)) || null,
      fieldOfStudy: comma === -1 ? null : degreeText.slice(comma + 2) || null,
      startDate: dates.length > 1 ? shortDate(dates[0]) : null,
      endDate: shortDate(dates[dates.length - 1]),
      gpa,
      bullets: toBullets(rest),
    });
  });
  return out;
}

function parseContact(lines: string[]) {
  // URLs wrap mid-token, so re-glue lines that end in a URL separator.
  let joined = "";
  for (const l of lines) {
    joined += joined && !/[-/._]$/.test(joined) ? ` ${l}` : l;
  }
  const links: { label: string; url: string }[] = [];
  for (const m of joined.matchAll(/(\S+?)\s*\(([A-Za-z ]+)\)/g)) {
    const label = m[2].trim();
    if (/^(mobile|home|work)$/i.test(label)) continue;
    links.push({ label, url: m[1] });
  }
  const phone = /(\+?\d[\d\s().-]{6,}\d)\s*\((?:Mobile|Home|Work)\)/i.exec(joined)?.[1]?.trim() ?? null;
  return { links, phone };
}

export function parseLinkedInLines(all: PdfLine[]): ParsedResume {
  const lines = all.filter((l) => !PAGE_MARKER.test(l.text));

  // The name is the tallest text on the page; it marks the main column's left edge.
  const nameLine = lines.reduce<PdfLine | null>(
    (best, l) => (!best || l.height > best.height ? l : best),
    null
  );
  const hasSidebar = lines.some(
    (l) => SIDEBAR_SECTIONS.has(l.text.toLowerCase()) && nameLine && l.x < nameLine.x - 20
  );
  const mainX = hasSidebar && nameLine ? nameLine.x - 5 : -Infinity;

  const side = lines.filter((l) => l.x < mainX).map((l) => l.text);
  const main = lines.filter((l) => l.x >= mainX).map((l) => l.text);

  const sideSections = splitSections(side, SIDEBAR_SECTIONS).sections;
  const { head, sections } = splitSections(main, MAIN_SECTIONS);

  const contact = parseContact(sideSections["contact"] ?? []);
  const website = contact.links.find((l) => /^(personal|portfolio|blog|company|website)/i.test(l.label));

  const skillLines = [...(sideSections["top skills"] ?? []), ...(sideSections["skills"] ?? [])];

  const [fullName, ...rest] = head;
  const location = rest.length >= 2 ? rest[rest.length - 1] : null;
  const headline = (rest.length >= 2 ? rest.slice(0, -1) : rest).join(" ") || null;

  const experience = parseDated(sections["experience"] ?? [], true).map((e) => ({
    company: e.company,
    roleTitle: e.title || null,
    location: e.location,
    startDate: e.start,
    endDate: e.end === "Present" ? null : e.end,
    isCurrent: e.end === "Present",
    bullets: toBullets(e.body),
  }));

  const projects = parseDated(sections["projects"] ?? [], false).map((p) => ({
    name: p.title || null,
    description: null,
    url: null,
    techStack: [] as string[],
    startDate: p.start,
    endDate: p.end === "Present" ? null : p.end,
    bullets: toBullets(p.body),
  }));

  return {
    profile: {
      fullName: fullName ?? null,
      headline,
      summary: sections["summary"]?.join(" ") || null,
      location,
      phone: contact.phone,
      websiteUrl: website?.url ?? null,
    },
    education: parseEducation(sections["education"] ?? []),
    experience,
    projects,
    skills: skillLines.map((name) => ({ category: "General", name })),
    links: contact.links.map((l) => ({ label: l.label, url: l.url })),
  };
}

export async function parseLinkedInPdf(data: Uint8Array): Promise<ParsedResume> {
  const parsed = parseLinkedInLines(await extractPdfLines(data));
  if (
    !parsed.profile.fullName ||
    (parsed.experience.length === 0 && parsed.education.length === 0)
  ) {
    throw new Error("NOT_LINKEDIN_PDF");
  }
  return parsed;
}
