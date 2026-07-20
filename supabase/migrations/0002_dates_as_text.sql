-- Resume date ranges are rarely exact days ("Aug 2024", "2023", "Present").
-- A strict `date` column can't hold "Present" or a bare year, so store these
-- as free-form text; ordering within a section is handled by sort_order.

alter table public.education
  alter column start_date type text using start_date::text,
  alter column end_date type text using end_date::text;

alter table public.experience
  alter column start_date type text using start_date::text,
  alter column end_date type text using end_date::text;

alter table public.projects
  alter column start_date type text using start_date::text,
  alter column end_date type text using end_date::text;
