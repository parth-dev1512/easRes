export const RESUME_IMPORT_PROMPT = `You are extracting structured resume data from an uploaded PDF (likely a LinkedIn profile export or a resume).

STRICT RULES:
1. Extract ONLY information explicitly present in the document. Never invent, guess, or embellish facts, employers, dates, or metrics.
2. Bullet/description text may be lightly cleaned up (fix obvious line-break or OCR artifacts) but must not be rephrased, summarized, or exaggerated.
3. If a field isn't present in the document, use null (or an empty array for list fields). Do not fabricate a value to fill a gap.

Return a JSON object matching the response schema with:
- profile: full name, professional headline/title, summary or "About" text, location, phone, and personal website/portfolio URL if present.
- education: every education entry, with institution, degree, field of study, start/end dates exactly as written (e.g. "2019" or "Aug 2020"), GPA if present, and any bullet points or descriptions listed under that entry.
- experience: every work experience entry, with company, role title, location, start/end dates, whether it is the current role (isCurrent), and each bullet point describing the role.
- projects: any projects or portfolio entries mentioned, with name, description, URL, tech stack (as an array of strings if listed), dates, and bullets.
- skills: every skill listed, with a category if the document groups them into categories (otherwise use "General").
- links: any social or portfolio links mentioned (LinkedIn, GitHub, personal site, etc.) with a label and URL.

If a section has no entries in the document, return an empty array for it. Return only the JSON object — no prose, no markdown fences.`;
