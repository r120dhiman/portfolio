import { site } from "@/content/site";
import { allProjects } from "@/content/projects";
import { skills } from "@/content/projects";

/**
 * Structured data. Server-rendered <script> tags — no client JS.
 *
 * "Rohit Kumar" is a common name, so the Person entity (with sameAs pointing at the
 * profiles that are unambiguously his) is the main lever for entity disambiguation.
 */
function Ld({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function SiteJsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.tagline,
    sameAs: [site.links.github, site.links.linkedin],
    alumniOf: { "@type": "CollegeOrUniversity", name: site.education.school },
    knowsAbout: skills.flatMap((g) => g.items as readonly string[]),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: `${site.name} — ${site.role}`,
    description: site.tagline,
    inLanguage: "en",
    author: { "@id": `${site.url}/#person` },
    publisher: { "@id": `${site.url}/#person` },
  };

  return (
    <>
      <Ld data={person} />
      <Ld data={website} />
    </>
  );
}

/** Breadcrumbs for a case study: Home → Work → {project}. */
export function CaseStudyJsonLd({ slug }: { slug: string }) {
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/work` },
      { "@type": "ListItem", position: 3, name: project.name, item: `${site.url}/work/${slug}` },
    ],
  };

  const work = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    abstract: project.oneLiner,
    url: `${site.url}/work/${slug}`,
    author: { "@id": `${site.url}/#person` },
    keywords: project.stack.join(", "),
    ...(project.live ? { sameAs: project.live } : {}),
    ...(project.repo ? { codeRepository: project.repo } : {}),
  };

  return (
    <>
      <Ld data={breadcrumbs} />
      <Ld data={work} />
    </>
  );
}

/** Breadcrumbs for a blog post: Home → Blog → {post}. */
export function PostBreadcrumbJsonLd({ slug, title }: { slug: string; title: string }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: title, item: `${site.url}/blog/${slug}` },
        ],
      }}
    />
  );
}
