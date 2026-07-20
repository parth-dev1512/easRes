"use client";

import clsx from "clsx";
import { Briefcase, Rocket, School, Terminal, Share2, FileText } from "lucide-react";
import type { MasterCv } from "@/lib/types/cv";
import type { GeneratedContent } from "@/lib/gemini/schema";
import type { ToggleState } from "@/lib/types/resume";
import { bulletKey } from "@/lib/types/resume";
import type { TogglePath } from "@/lib/resume/toggleReducer";

function SectionHeader({
  icon: Icon,
  label,
  color,
  checked,
  onChange,
}: {
  icon: typeof Briefcase;
  label: string;
  color: "red" | "yellow" | "blue" | "green" | "pink" | "primary";
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const bg = {
    red: "bg-puzzle-red",
    yellow: "bg-puzzle-yellow",
    blue: "bg-puzzle-blue",
    green: "bg-puzzle-green",
    pink: "bg-puzzle-pink",
    primary: "bg-slate-200",
  }[color];

  return (
    <label
      className={clsx(
        "flex items-center gap-3 px-4 py-2 border-4 border-black cursor-pointer",
        bg
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 border-2 border-black"
      />
      <Icon size={18} />
      <span className="font-[900] uppercase tracking-tight text-sm">
        {label}
      </span>
    </label>
  );
}

export function ToggleTree({
  cv,
  content,
  toggleState,
  onToggle,
}: {
  cv: MasterCv;
  content: GeneratedContent;
  toggleState: ToggleState;
  onToggle: (path: TogglePath, value: boolean) => void;
}) {
  const experienceById = new Map(cv.experience.map((e) => [e.id, e]));
  const projectById = new Map(cv.projects.map((p) => [p.id, p]));
  const educationById = new Map(cv.education.map((e) => [e.id, e]));

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={FileText}
          label="Summary"
          color="primary"
          checked={toggleState.sections.summary}
          onChange={(v) => onToggle({ kind: "section", section: "summary" }, v)}
        />
      </div>

      {/* Experience */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={Briefcase}
          label="Work History"
          color="red"
          checked={toggleState.sections.experience}
          onChange={(v) => onToggle({ kind: "section", section: "experience" }, v)}
        />
        <div
          className={clsx(
            "flex flex-col gap-3 pl-4",
            !toggleState.sections.experience && "opacity-40"
          )}
        >
          {content.experience.map((entry) => {
            const source = experienceById.get(entry.sourceId);
            const entryState = toggleState.experience[entry.sourceId];
            if (!source || !entryState) return null;
            return (
              <div key={entry.sourceId} className="border-2 border-black p-3 bg-white">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entryState.included}
                    onChange={(e) =>
                      onToggle(
                        { kind: "experienceEntry", sourceId: entry.sourceId },
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 border-2 border-black"
                  />
                  <span className="text-sm font-bold">
                    {source.company} &mdash; {source.role_title}
                  </span>
                </label>
                <div className="flex flex-col gap-1 mt-2 pl-6">
                  {entry.bullets.map((b, i) => {
                    const key = bulletKey(b.sourceBulletId, i);
                    return (
                      <label
                        key={key}
                        className="flex items-start gap-2 cursor-pointer text-xs text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={entryState.bullets[key] ?? true}
                          onChange={(e) =>
                            onToggle(
                              {
                                kind: "experienceBullet",
                                sourceId: entry.sourceId,
                                bulletKey: key,
                              },
                              e.target.checked
                            )
                          }
                          className="mt-0.5 h-3.5 w-3.5 border-2 border-black shrink-0"
                        />
                        <span>{b.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={Rocket}
          label="Project Cases"
          color="yellow"
          checked={toggleState.sections.projects}
          onChange={(v) => onToggle({ kind: "section", section: "projects" }, v)}
        />
        <div
          className={clsx(
            "flex flex-col gap-3 pl-4",
            !toggleState.sections.projects && "opacity-40"
          )}
        >
          {content.projects.map((entry) => {
            const source = projectById.get(entry.sourceId);
            const entryState = toggleState.projects[entry.sourceId];
            if (!source || !entryState) return null;
            return (
              <div key={entry.sourceId} className="border-2 border-black p-3 bg-white">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entryState.included}
                    onChange={(e) =>
                      onToggle(
                        { kind: "projectEntry", sourceId: entry.sourceId },
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 border-2 border-black"
                  />
                  <span className="text-sm font-bold">{source.name}</span>
                </label>
                <div className="flex flex-col gap-1 mt-2 pl-6">
                  {entry.bullets.map((b, i) => {
                    const key = bulletKey(b.sourceBulletId, i);
                    return (
                      <label
                        key={key}
                        className="flex items-start gap-2 cursor-pointer text-xs text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={entryState.bullets[key] ?? true}
                          onChange={(e) =>
                            onToggle(
                              {
                                kind: "projectBullet",
                                sourceId: entry.sourceId,
                                bulletKey: key,
                              },
                              e.target.checked
                            )
                          }
                          className="mt-0.5 h-3.5 w-3.5 border-2 border-black shrink-0"
                        />
                        <span>{b.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Education */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={School}
          label="Academic Info"
          color="blue"
          checked={toggleState.sections.education}
          onChange={(v) => onToggle({ kind: "section", section: "education" }, v)}
        />
        <div
          className={clsx(
            "flex flex-col gap-2 pl-4",
            !toggleState.sections.education && "opacity-40"
          )}
        >
          {content.education.map((entry) => {
            const source = educationById.get(entry.sourceId);
            if (!source) return null;
            return (
              <label
                key={entry.sourceId}
                className="flex items-center gap-2 cursor-pointer border-2 border-black p-2 bg-white text-sm"
              >
                <input
                  type="checkbox"
                  checked={toggleState.education[entry.sourceId] ?? true}
                  onChange={(e) =>
                    onToggle(
                      { kind: "education", sourceId: entry.sourceId },
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 border-2 border-black"
                />
                <span>
                  {source.institution} &mdash; {source.degree}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={Terminal}
          label="Tech Skills"
          color="green"
          checked={toggleState.sections.skills}
          onChange={(v) => onToggle({ kind: "section", section: "skills" }, v)}
        />
        <div
          className={clsx(
            "flex flex-wrap gap-2 pl-4",
            !toggleState.sections.skills && "opacity-40"
          )}
        >
          {cv.skills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center gap-1.5 cursor-pointer border-2 border-black px-2 py-1 bg-white text-xs"
            >
              <input
                type="checkbox"
                checked={toggleState.skills[skill.id] ?? true}
                onChange={(e) =>
                  onToggle({ kind: "skill", skillId: skill.id }, e.target.checked)
                }
                className="h-3.5 w-3.5 border-2 border-black"
              />
              {skill.name}
            </label>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          icon={Share2}
          label="Social Links"
          color="pink"
          checked={toggleState.sections.links}
          onChange={(v) => onToggle({ kind: "section", section: "links" }, v)}
        />
        <div
          className={clsx(
            "flex flex-col gap-2 pl-4",
            !toggleState.sections.links && "opacity-40"
          )}
        >
          {cv.links.map((link) => (
            <label
              key={link.id}
              className="flex items-center gap-2 cursor-pointer border-2 border-black p-2 bg-white text-sm"
            >
              <input
                type="checkbox"
                checked={toggleState.links[link.id] ?? true}
                onChange={(e) =>
                  onToggle({ kind: "link", linkId: link.id }, e.target.checked)
                }
                className="h-4 w-4 border-2 border-black"
              />
              {link.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
