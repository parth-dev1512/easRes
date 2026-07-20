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

export const PARSED_RESUME_JSON_SCHEMA = {
  type: "object",
  properties: {
    profile: {
      type: "object",
      properties: {
        fullName: { type: ["string", "null"] },
        headline: { type: ["string", "null"] },
        summary: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        websiteUrl: { type: ["string", "null"] },
      },
      required: [
        "fullName",
        "headline",
        "summary",
        "location",
        "phone",
        "websiteUrl",
      ],
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: ["string", "null"] },
          degree: { type: ["string", "null"] },
          fieldOfStudy: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          gpa: { type: ["string", "null"] },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "startDate",
          "endDate",
          "gpa",
          "bullets",
        ],
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: ["string", "null"] },
          roleTitle: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          isCurrent: { type: "boolean" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: [
          "company",
          "roleTitle",
          "location",
          "startDate",
          "endDate",
          "isCurrent",
          "bullets",
        ],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          url: { type: ["string", "null"] },
          techStack: { type: "array", items: { type: "string" } },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: [
          "name",
          "description",
          "url",
          "techStack",
          "startDate",
          "endDate",
          "bullets",
        ],
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: ["string", "null"] },
          name: { type: "string" },
        },
        required: ["category", "name"],
      },
    },
    links: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          url: { type: "string" },
        },
        required: ["label", "url"],
      },
    },
  },
  required: [
    "profile",
    "education",
    "experience",
    "projects",
    "skills",
    "links",
  ],
} as const;
