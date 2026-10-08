import type { ReactNode } from "react";
import type { MasterCv } from "@/lib/types/cv";
import type { GeneratedContent } from "@/lib/gemini/schema";
import type { ToggleState } from "@/lib/types/resume";
import { bulletKey } from "@/lib/types/resume";

function dateRange(start: string | null, end: string | null, current = false) {
  const to = current ? "Present" : end;
  return [start, to].filter(Boolean).join(" - ");
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section">
      <div className="cv-section-title">{title}</div>
      {children}
    </section>
  );
}

function Sep({ children }: { children: string }) {
  return <span className="blk">{children}</span>;
}

function Entry({
  left,
  dates,
  bullets,
}: {
  left: ReactNode;
  dates: string;
  bullets: string[];
}) {
  return (
    <div>
      <div className="cv-entry-head">
        <div className="left">{left}</div>
        <div className="dates">{dates}</div>
      </div>
      {bullets.length > 0 && (
        <ul className="cv-points">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Renders the CV in the one-page "Ashoka Gold" A4 format. */
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

  const contactLines = [
    [cv.profile.email, cv.profile.location].filter(Boolean).join(", "),
    [cv.profile.phone, cv.profile.website_url].filter(Boolean).join(", "),
    visibleLinks.map((l) => l.url).join(", "),
  ].filter(Boolean);

  return (
    <div className="cv-page">
      <div>
        <div className="cv-name">{cv.profile.full_name ?? "Your Name"}</div>
        <div className="cv-contact">
          {contactLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      {toggleState.sections.summary && content.summary && (
        <Section title="Profile Summary">
          <div>{content.summary}</div>
        </Section>
      )}

      {toggleState.sections.education && visibleEducation.length > 0 && (
        <Section title="Education">
          {visibleEducation.map((edu, i) => {
            const isDegree = i === 0;
            const qualification = [edu!.degree, edu!.field_of_study]
              .filter(Boolean)
              .join(" in ");
            return (
              <div key={edu!.id} className="cv-edu-row">
                <div className={isDegree ? "gold" : "blk"}>{qualification}</div>
                <div className={isDegree ? "blk" : "gold"}>{edu!.institution}</div>
                <div className="gold" />
                <div className={isDegree ? "blk" : "gold"}>{edu!.end_date}</div>
                <div className="gold">{edu!.gpa}</div>
              </div>
            );
          })}
        </Section>
      )}

      {toggleState.sections.projects && visibleProjects.length > 0 && (
        <Section title="Projects">
          {visibleProjects.map(({ source, bullets }) => (
            <Entry
              key={source!.id}
              left={
                <>
                  <span className="gold">{source!.name}</span>
                  {source!.tech_stack && source!.tech_stack.length > 0 && (
                    <>
                      <Sep> - </Sep>
                      <span className="gold">{source!.tech_stack.join(", ")}</span>
                    </>
                  )}
                </>
              }
              dates={dateRange(source!.start_date, source!.end_date)}
              bullets={bullets.map((b) => b.text)}
            />
          ))}
        </Section>
      )}

      {toggleState.sections.skills && visibleSkills.length > 0 && (
        <Section title="Skills">
          <div>
            {visibleSkills.map((s, i) => (
              <span key={s.id}>
                {i > 0 && <Sep>, </Sep>}
                <span className="gold">{s.name}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {toggleState.sections.experience && visibleExperience.length > 0 && (
        <Section title="Internships Experience">
          {visibleExperience.map(({ source, bullets }) => (
            <Entry
              key={source!.id}
              left={
                <>
                  <span className="gold" style={{ textTransform: "uppercase" }}>
                    {source!.company}
                  </span>
                  <Sep> | </Sep>
                  <span className="gold role">{source!.role_title}</span>
                </>
              }
              dates={dateRange(source!.start_date, source!.end_date, source!.is_current)}
              bullets={bullets.map((b) => b.text)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
