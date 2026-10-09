import { z } from "zod";

export const ParsedProfileSchema = z.object({
  fullName: z.string().nullable(),
  headline: z.string().nullable(),
  summary: z.string().nullable(),
  location: z.string().nullable(),
  phone: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

export const ParsedEducationSchema = z.object({
  institution: z.string().nullable(),
  degree: z.string().nullable(),
  fieldOfStudy: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  gpa: z.string().nullable(),
  bullets: z.array(z.string()),
});

export const ParsedExperienceSchema = z.object({
  company: z.string().nullable(),
  roleTitle: z.string().nullable(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  bullets: z.array(z.string()),
});

export const ParsedProjectSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string().nullable(),
  techStack: z.array(z.string()),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  bullets: z.array(z.string()),
});

export const ParsedSkillSchema = z.object({
  category: z.string().nullable(),
  name: z.string(),
});

export const ParsedLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const ParsedResumeSchema = z.object({
  profile: ParsedProfileSchema,
  education: z.array(ParsedEducationSchema),
  experience: z.array(ParsedExperienceSchema),
  projects: z.array(ParsedProjectSchema),
  skills: z.array(ParsedSkillSchema),
  links: z.array(ParsedLinkSchema),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
