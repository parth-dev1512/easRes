import { z } from "zod";

export const ProfileSchema = z.object({
  full_name: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  headline: z.string().trim().max(200).optional().or(z.literal("")),
  summary: z.string().trim().max(2000).optional().or(z.literal("")),
  website_url: z.string().trim().max(500).optional().or(z.literal("")),
});

export const EducationSchema = z.object({
  institution: z.string().trim().max(200).optional().or(z.literal("")),
  degree: z.string().trim().max(200).optional().or(z.literal("")),
  field_of_study: z.string().trim().max(200).optional().or(z.literal("")),
  start_date: z.string().trim().max(20).optional().or(z.literal("")),
  end_date: z.string().trim().max(20).optional().or(z.literal("")),
  gpa: z.string().trim().max(50).optional().or(z.literal("")),
});

export const ExperienceSchema = z.object({
  company: z.string().trim().max(200).optional().or(z.literal("")),
  role_title: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  start_date: z.string().trim().max(20).optional().or(z.literal("")),
  end_date: z.string().trim().max(20).optional().or(z.literal("")),
  is_current: z.boolean().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  url: z.string().trim().max(500).optional().or(z.literal("")),
  tech_stack: z.string().trim().max(500).optional().or(z.literal("")),
  start_date: z.string().trim().max(20).optional().or(z.literal("")),
  end_date: z.string().trim().max(20).optional().or(z.literal("")),
});

export const SkillSchema = z.object({
  category: z.string().trim().max(100).optional().or(z.literal("")),
  name: z.string().trim().min(1).max(100),
});

export const LinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: z.string().trim().min(1).max(500),
});

export const BulletSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export type Bullet = {
  id: string;
  content: string;
  sort_order: number;
};

export type EducationEntry = {
  id: string;
  institution: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  sort_order: number;
  education_bullets: Bullet[];
};

export type ExperienceEntry = {
  id: string;
  company: string | null;
  role_title: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  sort_order: number;
  experience_bullets: Bullet[];
};

export type ProjectEntry = {
  id: string;
  name: string | null;
  description: string | null;
  url: string | null;
  tech_stack: string[] | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  project_bullets: Bullet[];
};

export type Skill = {
  id: string;
  category: string;
  name: string;
  sort_order: number;
};

export type Link = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  website_url: string | null;
};

export type MasterCv = {
  profile: Profile;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: Skill[];
  links: Link[];
};
