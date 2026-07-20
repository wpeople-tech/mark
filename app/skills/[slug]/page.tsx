import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SKILL_DB,
  getSkillBySlug,
  slugify,
  getRelatedSkills,
  getNextSkillInCategory,
  getSkillPosition,
  skillPreview,
  LVL_STYLE,
} from "@/lib/landing-data";
import { SkillDetailClient } from "./SkillDetailClient";
import { Nav } from "@/components/landing/sections/Nav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SKILL_DB.map((skill) => ({
    slug: slugify(skill[2]),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return {
      title: "Skill Not Found",
    };
  }

  const [, , name, desc] = skill;

  return {
    title: `MARK Skill — ${name}`,
    description: desc,
  };
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const [cat, lvl, name, desc, tags] = skill;
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE];
  const { pos, total, globalIdx } = getSkillPosition(cat, name);
  const related = getRelatedSkills(cat, name, 3);
  const next = getNextSkillInCategory(cat, name);
  const preview = skillPreview(skill);
  const uni = tags.includes("universal");

  return (
    <>
      {/* NAV */}
      <Nav />

      {/* BREADCRUMB */}
      <div
        className="pt-[74px] px-10 bg-paper border-b border-border"
        style={{ borderBottom: ".5px solid #E5E3DC" }}
      >
        <div className="max-w-[1080px] mx-auto py-[10px] flex items-center gap-2 text-[12px] text-muted">
          <Link
            href="/"
            className="text-muted transition-colors hover:text-ink"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/skills"
            className="text-muted transition-colors hover:text-ink"
          >
            Skills Library
          </Link>
          <span>/</span>
          <span>{cat}</span>
          <span>/</span>
          <span className="text-ink font-medium">{name}</span>
        </div>
      </div>

      {/* DARK HERO */}
      <section
        data-screen-label="Skill hero"
        className="px-10 pt-16 pb-[72px]"
        style={{
          background: "#0B0B0A",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) .5px, transparent .5px), linear-gradient(90deg, rgba(255,255,255,.025) .5px, transparent .5px)",
          backgroundSize: "56px 56px",
        }}
      >
        <div className="max-w-[1080px] mx-auto">
          <div
            className="flex items-center gap-[10px] flex-wrap mb-6 opacity-0 blur-[6px] translate-y-[10px]"
            style={{
              animation: "blurIn .6s cubic-bezier(.16,1,.3,1) .05s forwards",
            }}
          >
            <span
              className="text-[10px] font-semibold font-mono tracking-[.1em] uppercase px-3 py-[3px] rounded-sm border"
              style={{
                color: "#7DAEEA",
                background: "rgba(125,174,234,.12)",
                borderColor: "rgba(125,174,234,.3)",
              }}
            >
              {cat}
            </span>
            <span
              className="text-[10px] font-mono px-3 py-[3px] rounded-sm border"
              style={{
                color: style.dark,
                background: "rgba(255,255,255,.05)",
                borderColor: "rgba(255,255,255,.12)",
              }}
            >
              {lvl}
            </span>
            <span className="text-[10px] font-mono text-[#555]">
              #{String(globalIdx + 1).padStart(2, "0")} · {pos} of {total} in
              category
            </span>
          </div>
          <h1
            className="font-bold tracking-[-.04em] leading-[1.02] text-[#F7F6F3] m-0 mb-5 opacity-0 blur-[8px] translate-y-[12px]"
            style={{
              fontSize: "clamp(38px, 6vw, 64px)",
              animation: "blurIn .7s cubic-bezier(.16,1,.3,1) .15s forwards",
            }}
          >
            {name}
          </h1>
          <p
            className="text-[16px] text-[#999] leading-[1.7] max-w-[560px] m-0 mb-5 opacity-0 blur-[6px] translate-y-[10px]"
            style={{
              animation: "blurIn .7s cubic-bezier(.16,1,.3,1) .28s forwards",
            }}
          >
            {desc}
          </p>
          <div
            className="flex gap-[6px] flex-wrap mb-8 opacity-0 blur-[4px]"
            style={{ animation: "blurIn .7s ease .4s forwards" }}
          >
            {tags.map((tg) => (
              <span
                key={tg}
                className="text-[11px] font-mono px-3 py-[3px] rounded-sm border"
                style={{
                  color: "#888",
                  background: "rgba(255,255,255,.04)",
                  borderColor: "rgba(255,255,255,.12)",
                }}
              >
                {tg}
              </span>
            ))}
          </div>
          <div
            className="flex gap-[10px] flex-wrap opacity-0 blur-[4px]"
            style={{ animation: "blurIn .7s ease .5s forwards" }}
          >
            <Link
              href="/"
              className="text-[13px] font-semibold px-[26px] py-[13px] rounded-md bg-accent text-white transition-opacity hover:opacity-88"
            >
              Scan with this skill →
            </Link>
            <SkillDetailClient preview={preview} name={name} />
          </div>
        </div>
      </section>

      {/* BODY */}
      <section
        data-screen-label="Skill content"
        className="px-10 py-16 pb-20 bg-paper"
      >
        <div
          className="max-w-[1080px] mx-auto grid gap-12 items-start"
          style={{ gridTemplateColumns: "1fr 320px" }}
        >
          {/* Main Content */}
          <div className="min-w-0">
            <div className="text-[11px] font-medium font-mono tracking-[.14em] uppercase text-accent mb-[14px]">
              {"//"} Skill content
            </div>
            <div className="flex items-end justify-between gap-4 mb-5">
              <h2
                className="font-bold tracking-[-.03em] text-ink m-0 leading-[1.05]"
                style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
              >
                The CLAUDE.md
                <br />
                <em className="italic font-medium">snippet</em>
              </h2>
              <SkillDetailClient preview={preview} name={name} compact />
            </div>
            <div
              className="rounded-[14px] overflow-hidden mb-14"
              style={{ background: "#0B0B0A" }}
            >
              <div
                className="px-4 py-[10px] flex items-center gap-2"
                style={{ borderBottom: ".5px solid rgba(255,255,255,.08)" }}
              >
                <span
                  className="size-[9px] rounded-full"
                  style={{ background: "#2a2a28" }}
                />
                <span
                  className="size-[9px] rounded-full"
                  style={{ background: "#2a2a28" }}
                />
                <span
                  className="size-[9px] rounded-full"
                  style={{ background: "#2a2a28" }}
                />
                <span className="text-[10px] font-mono text-[#555] ml-[6px]">
                  skills/{slugify(name)}.md
                </span>
              </div>
              <div className="px-[22px] py-[18px] font-mono text-[12.5px] leading-[2.1]">
                <div style={{ color: "#E8C56A" }}>## {name}</div>
                {preview.map((line, i) => (
                  <div key={i} style={{ color: "#6DBE8A" }}>
                    - {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Activation */}
            <div className="text-[11px] font-medium font-mono tracking-[.14em] uppercase text-accent mb-[14px]">
              {"//"} Activation
            </div>
            <h2
              className="font-bold tracking-[-.03em] text-ink m-0 mb-6 leading-[1.05]"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              When MARK
              <br />
              <em className="italic font-medium">selects this skill</em>
            </h2>
            <div
              className="grid gap-[14px]"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              <div className="bg-white border border-border rounded-[14px] p-6">
                <div
                  className="size-9 rounded-md flex items-center justify-center mb-[14px] text-[15px] border"
                  style={{
                    background: "#E9F5E9",
                    borderColor: "#B6DEB9",
                    color: "#1B6B28",
                  }}
                >
                  ✓
                </div>
                <div className="text-[15px] font-semibold text-ink mb-[10px]">
                  Auto-selected when
                </div>
                <span
                  className="text-[11px] font-mono px-3 py-[3px] rounded-sm border inline-block"
                  style={{
                    color: "#1B6B28",
                    background: "#E9F5E9",
                    borderColor: "#B6DEB9",
                  }}
                >
                  {uni
                    ? "universal — always included"
                    : `${tags[0]} detected in repo`}
                </span>
              </div>
              <div className="bg-white border border-border rounded-[14px] p-6">
                <div
                  className="size-9 rounded-md flex items-center justify-center mb-[14px] text-[14px] border"
                  style={{
                    background: "#EBF2FF",
                    borderColor: "#C3D7F7",
                    color: "#1A47A8",
                  }}
                >
                  ▤
                </div>
                <div className="text-[15px] font-semibold text-ink mb-[10px]">
                  Manual installation
                </div>
                <div className="text-[12.5px] text-muted leading-[1.9]">
                  1. Copy the snippet above
                  <br />
                  2. Add to your{" "}
                  <span
                    className="font-mono text-[10px] px-[7px] py-[1px] rounded-sm border inline-block"
                    style={{
                      color: "#1A47A8",
                      background: "#EBF2FF",
                      borderColor: "#C3D7F7",
                    }}
                  >
                    CLAUDE.md
                  </span>
                  <br />
                  3. Claude Code reads it next session
                </div>
              </div>
            </div>

            {/* Next Skill */}
            {next && (
              <Link
                href={`/skills/${slugify(next[2])}`}
                className="block mt-10 bg-white border border-border rounded-[14px] p-[22px_26px] text-right transition-colors hover:border-accent-border"
              >
                <div className="text-[10px] font-mono tracking-[.12em] uppercase text-muted mb-1">
                  Next →
                </div>
                <div className="text-[16px] font-semibold text-ink">
                  {next[2]}
                </div>
              </Link>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
              <div
                className="px-5 py-[14px] text-[11px] font-mono tracking-[.12em] uppercase text-muted"
                style={{ borderBottom: ".5px solid #E5E3DC" }}
              >
                {"//"} Skill stats
              </div>
              <div className="px-5 py-[6px_5px_12px]">
                <div
                  className="flex justify-between py-[9px] text-[13px]"
                  style={{ borderBottom: ".5px solid #E5E3DC" }}
                >
                  <span className="text-muted">Category</span>
                  <span className="font-medium">{cat}</span>
                </div>
                <div
                  className="flex justify-between py-[9px] text-[13px]"
                  style={{ borderBottom: ".5px solid #E5E3DC" }}
                >
                  <span className="text-muted">Difficulty</span>
                  <span className="font-medium" style={{ color: style.fg }}>
                    {lvl}
                  </span>
                </div>
                <div
                  className="flex justify-between py-[9px] text-[13px]"
                  style={{ borderBottom: ".5px solid #E5E3DC" }}
                >
                  <span className="text-muted">Stack tags</span>
                  <span className="font-medium">
                    {uni ? tags.length - 1 : tags.length}
                  </span>
                </div>
                <div
                  className="flex justify-between py-[9px] text-[13px]"
                  style={{ borderBottom: ".5px solid #E5E3DC" }}
                >
                  <span className="text-muted">Universal</span>
                  <span
                    className="font-medium"
                    style={{ color: uni ? "#1B6B28" : "#888785" }}
                  >
                    {uni ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-[9px] text-[13px]">
                  <span className="text-muted">Position</span>
                  <span className="font-medium">
                    {pos} of {total}
                  </span>
                </div>
              </div>
            </div>

            {/* Related */}
            <div className="bg-white border border-border rounded-[14px] overflow-hidden">
              <div
                className="px-5 py-[14px] text-[11px] font-mono tracking-[.12em] uppercase text-muted"
                style={{ borderBottom: ".5px solid #E5E3DC" }}
              >
                {"//"} Related skills
              </div>
              <div className="p-3 flex flex-col gap-2">
                {related.map((r) => {
                  const [, , rName, rDesc] = r;
                  const rSlug = slugify(rName);
                  const shortDesc =
                    rDesc.length > 70 ? rDesc.slice(0, 70) + "…" : rDesc;
                  return (
                    <Link
                      key={rName}
                      href={`/skills/${rSlug}`}
                      className="block bg-paper border border-border rounded-md p-[14px_16px] transition-colors hover:border-accent-border"
                    >
                      <div className="text-[13px] font-semibold text-ink mb-[3px]">
                        {rName}
                      </div>
                      <div className="text-[11.5px] text-muted leading-[1.5]">
                        {shortDesc}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section
        data-screen-label="Skill CTA"
        className="px-10 py-20 text-center"
        style={{ background: "#0B0B0A" }}
      >
        <div className="max-w-[720px] mx-auto">
          <div className="text-[10px] font-mono tracking-[.15em] uppercase text-[#7DAEEA] mb-4">
            {"//"} Ready to scan?
          </div>
          <h2
            className="font-bold tracking-[-.04em] text-[#F7F6F3] m-0 mb-[14px] leading-[1.08]"
            style={{ fontSize: "clamp(30px, 4.5vw, 48px)" }}
          >
            Add <em className="italic text-[#7DAEEA]">{name}</em>
            <br />
            to your project
          </h2>
          <p className="text-[14px] text-[#777] leading-[1.65] m-0 mb-8">
            MARK auto-selects this skill along with 5–7 others tailored to your
            repo.
          </p>
          <div className="flex gap-[10px] justify-center flex-wrap">
            <Link
              href="/"
              className="text-[13px] font-semibold px-7 py-[14px] rounded-md bg-accent text-white transition-opacity hover:opacity-88"
            >
              Add to Chrome →
            </Link>
            <Link
              href="/skills"
              className="text-[13px] font-semibold px-6 py-[14px] rounded-md bg-transparent border text-[#E8E6E0] transition-colors hover:border-[rgba(255,255,255,.5)]"
              style={{ borderColor: "rgba(255,255,255,.2)" }}
            >
              Browse all 59 skills
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-10 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <div className="text-[12px] text-muted font-mono">
          markintel.xyz · free ·
        </div>
        <Link
          href="/skills"
          className="text-[12px] text-muted transition-colors hover:text-ink"
        >
          ← All skills
        </Link>
      </footer>
    </>
  );
}
