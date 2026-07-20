import type { MasterCv } from "@/lib/types/cv";
import type { GeneratedContent } from "@/lib/gemini/schema";
import type { ToggleState } from "@/lib/types/resume";
import { bulletKey } from "@/lib/types/resume";

export function ResumePreview({
  cv,
  content,
  toggleState,
}: {
  cv: MasterCv;
  content: GeneratedContent;
  toggleState: ToggleState;
}) {
  const experienceById = new Map(cv.experience.map((e) => [e.id, e]));
  const projectById = new Map(cv.projects.map((p) => [p.id, p]));
  const educationById = new Map(cv.education.map((e) => [e.id, e]));

  const visibleExperience = content.experience
    .filter((e) => toggleState.experience[e.sourceId]?.included)
    .map((e) => ({
      source: experienceById.get(e.sourceId),
      bullets: e.bullets.filter((b, i) => {
        const key = bulletKey(b.sourceBulletId, i);
        return toggleState.experience[e.sourceId]?.bullets[key] ?? true;
      }),
    }))
    .filter((e) => e.source);

  const visibleProjects = content.projects
    .filter((p) => toggleState.projects[p.sourceId]?.included)
    .map((p) => ({
      source: projectById.get(p.sourceId),
      bullets: p.bullets.filter((b, i) => {
        const key = bulletKey(b.sourceBulletId, i);
        return toggleState.projects[p.sourceId]?.bullets[key] ?? true;
      }),
    }))
    .filter((p) => p.source);

  const visibleEducation = content.education
    .filter((e) => toggleState.education[e.sourceId])
    .map((e) => educationById.get(e.sourceId))
    .filter((e) => !!e);

  const visibleSkills = cv.skills.filter((s) => toggleState.skills[s.id]);
  const visibleLinks = cv.links.filter((l) => toggleState.links[l.id]);

  return (
    <div className="font-serif text-slate-900">
      <div className="mb-6">
        <h2 className="text-4xl font-extrabold text-black tracking-tight font-sans">
          {cv.profile.full_name ?? "Your Name"}
        </h2>
        {content.headline && (
          <p className="text-sm text-slate-600 font-sans">{content.headline}</p>
        )}
        <div className="text-[13px] text-slate-700 mt-1 font-sans flex flex-wrap gap-4">
          {cv.profile.email && <span>{cv.profile.email}</span>}
          {cv.profile.phone && <span>{cv.profile.phone}</span>}
          {cv.profile.location && <span>{cv.profile.location}</span>}
          {cv.profile.website_url && <span>{cv.profile.website_url}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {toggleState.sections.summary && content.summary && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
              Summary
            </h3>
            <p className="text-[13px] text-slate-800">{content.summary}</p>
          </section>
        )}

        {toggleState.sections.experience && visibleExperience.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-3 font-sans">
              Work Experience
            </h3>
            <div className="space-y-4">
              {visibleExperience.map(({ source, bullets }) => (
                <div key={source!.id} className="break-inside-avoid">
                  <div className="flex justify-between font-bold text-[13px] text-black">
                    <span>
                      {source!.company} &mdash; {source!.role_title}
                    </span>
                    <span>
                      {source!.start_date} - {source!.is_current ? "Present" : source!.end_date}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc list-outside text-[12px] text-slate-700 mt-1 ml-4 space-y-0.5">
                      {bullets.map((b, i) => (
                        <li key={i}>{b.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {toggleState.sections.projects && visibleProjects.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-3 font-sans">
              Projects
            </h3>
            <div className="space-y-4">
              {visibleProjects.map(({ source, bullets }) => (
                <div key={source!.id} className="break-inside-avoid">
                  <div className="flex justify-between font-bold text-[13px] text-black">
                    <span>{source!.name}</span>
                    {source!.tech_stack && source!.tech_stack.length > 0 && (
                      <span className="italic text-slate-600 font-normal">
                        {source!.tech_stack.join(", ")}
                      </span>
                    )}
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc list-outside text-[12px] text-slate-700 mt-1 ml-4 space-y-0.5">
                      {bullets.map((b, i) => (
                        <li key={i}>{b.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {toggleState.sections.education && visibleEducation.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-3 font-sans">
              Education
            </h3>
            <div className="space-y-2">
              {visibleEducation.map((edu) => (
                <div key={edu!.id} className="flex justify-between text-[13px] text-black">
                  <span className="font-bold">
                    {edu!.institution} &mdash; {edu!.degree}
                  </span>
                  <span>
                    {edu!.start_date} - {edu!.end_date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {toggleState.sections.skills && visibleSkills.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
              Skills
            </h3>
            <p className="text-[13px] text-slate-800">
              {visibleSkills.map((s) => s.name).join(", ")}
            </p>
          </section>
        )}

        {toggleState.sections.links && visibleLinks.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
              Links
            </h3>
            <p className="text-[13px] text-slate-800 font-sans">
              {visibleLinks.map((l) => `${l.label}: ${l.url}`).join("  |  ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
