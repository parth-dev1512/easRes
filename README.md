# easRes

**One CV. Every resume, tailored.**

easRes keeps a single master CV and turns it into a resume tailored to a specific job. Paste a job description, get a targeted resume in seconds, then toggle exactly which entries and bullets appear before printing it.

## Features

- **Master CV editor** – personal info, education, experience, projects, skills and links in one place
- **Import** – bootstrap your CV from a LinkedIn export or an existing PDF resume
- **AI tailoring** – generates a job-specific resume from your CV and a pasted job description
- **Live toggle tree** – show or hide any section, entry or bullet and see the preview update instantly
- **Print-ready output** – a clean print view for exporting to PDF
- **Accounts** – email sign-up/login with per-user data, plus self-serve account deletion

## Tech stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth + Postgres) · Gemini API · Zod · React Hook Form

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase and AI provider keys
npm run dev                  # http://localhost:3000
```

Apply the database schema by running the SQL files in `supabase/migrations/` (in order) against your Supabase project.

## Project structure

```
src/
  app/
    (auth)/        login and signup
    (protected)/   dashboard, CV editor, resumes, tailoring workspace, settings
    api/           CV import and resume tailoring endpoints
  components/      CV editor sections, resume preview and toggle tree, UI primitives
  lib/             Supabase clients, data access, AI prompts and schemas, LinkedIn parser
supabase/migrations/   database schema
```
