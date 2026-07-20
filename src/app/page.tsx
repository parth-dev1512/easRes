import Link from "next/link";
import { Briefcase, Terminal, School, Rocket, Share2 } from "lucide-react";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";

export default function Home() {
  return (
    <DotGridBackground className="relative flex-1 flex items-center justify-center px-6 py-24 overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-24 items-center justify-between px-6 sm:px-12 pointer-events-none">
        <PuzzleCard className="pointer-events-auto bg-white p-4 px-8">
          <h1 className="text-3xl font-[900] tracking-tighter uppercase italic">
            easRes
          </h1>
        </PuzzleCard>
        <div className="pointer-events-auto flex items-center gap-4">
          <Link href="/login">
            <BlueprintButton variant="secondary" className="px-6">
              Log In
            </BlueprintButton>
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl text-center flex flex-col items-center gap-8">
        <h2 className="text-5xl sm:text-6xl font-[900] uppercase italic tracking-tighter leading-none">
          One CV.
          <br />
          Every Resume, Tailored.
        </h2>
        <p className="text-lg text-slate-700 max-w-lg">
          Keep a single master CV. Paste a job description and get a
          tailored resume in seconds &mdash; then toggle exactly what shows,
          live.
        </p>
        <Link href="/signup">
          <BlueprintButton variant="primary">Get Started</BlueprintButton>
        </Link>
      </div>

      <PuzzleTag
        icon={Briefcase}
        title={"Work\nHistory"}
        subtitle="Professional Career Log"
        color="red"
        rotate={-4}
        className="hidden lg:flex absolute top-[15%] left-[6%] w-72"
      />
      <PuzzleTag
        icon={Terminal}
        title={"Tech\nSkills"}
        subtitle="Stack & Competencies"
        color="green"
        rotate={3}
        className="hidden lg:flex absolute top-[55%] left-[4%] w-72"
      />
      <PuzzleTag
        icon={School}
        title={"Academic\nInfo"}
        subtitle="Education & Degrees"
        color="blue"
        rotate={5}
        className="hidden lg:flex absolute top-[18%] right-[6%] w-72"
      />
      <PuzzleTag
        icon={Rocket}
        title={"Project\nCases"}
        subtitle="Portfolio Highlights"
        color="yellow"
        rotate={-3}
        className="hidden lg:flex absolute bottom-[15%] right-[8%] w-72"
      />
      <PuzzleTag
        icon={Share2}
        title={"Social\nLinks"}
        subtitle="Web Presence & Profiles"
        color="pink"
        rotate={8}
        className="hidden lg:flex absolute bottom-[15%] left-[10%] w-72"
      />
    </DotGridBackground>
  );
}
