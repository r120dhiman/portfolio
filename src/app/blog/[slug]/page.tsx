import { ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/PostView";
import { getLabProject, posts } from "@/content/lab";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getLabProject(slug);
  if (!project) return {};
  const { title, date } = project.post;
  return {
    title,
    description: project.oneLiner,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description: project.oneLiner,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: date,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const project = getLabProject(slug);
  if (!project) notFound();

  const pos = posts.findIndex((p) => p.slug === slug);
  const next = posts[(pos + 1) % posts.length];

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <PostView project={project} next={next.slug === slug ? null : next} />
    </ViewTransition>
  );
}
