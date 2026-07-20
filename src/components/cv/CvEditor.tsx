import { PersonalInfoSection } from "./PersonalInfoSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";
import { LinksSection } from "./LinksSection";
import type { MasterCv } from "@/lib/types/cv";

export function CvEditor({ cv }: { cv: MasterCv }) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-12 py-12 px-4">
      <PersonalInfoSection profile={cv.profile} />
      <ExperienceSection entries={cv.experience} />
      <EducationSection entries={cv.education} />
      <ProjectsSection entries={cv.projects} />
      <SkillsSection skills={cv.skills} />
      <LinksSection links={cv.links} />
    </div>
  );
}
