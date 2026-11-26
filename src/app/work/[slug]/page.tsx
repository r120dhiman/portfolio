import { ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/case/CaseStudyView";
import { CaseStudyJsonLd } from "@/components/seo/JsonLd";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { featured } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return featured.filter((p) => getCaseStudy(p.slug)).map((p) => ({ slug: p.slug }));
}

function resolve(slug: string) {
  const index = featured.findIndex((p) => p.slug === slug);
  const study = getCaseStudy(slug);
  if (index === -1 || !study) return null;
  const withStudies = featured.filter((p) => caseStudies.some((c) => c.slug === p.slug));
  const pos = withStudies.findIndex((p) => p.slug === slug);
  return { project: featured[index], study, next: withStudies[(pos + 1) % withStudies.length] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = resolve(slug);
  if (!data) return {};
  const { project, study } = data;
  const title = `${project.name} — case study`;
  return {
    title,
    description: `${project.oneLiner} ${project.team ? "Team project — " : ""}${project.role}.`,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title, description: study.lede, url: `/work/${slug}`, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const data = resolve(slug);
  if (!data) notFound();
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <CaseStudyJsonLd slug={slug} />
      <CaseStudyView {...data} />
    </ViewTransition>
  );
}
