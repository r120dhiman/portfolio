import type { Metadata } from "next";
import { Suspense } from "react";
import { Resume, ResumeFromParams } from "@/components/resume/Resume";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `${site.name} — resume for SDE-1, AI Engineer and Forward Deployed Engineer roles. ${site.education.degree}, IIT (BHU) Varanasi, ${site.education.year}.`,
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <section className="resume-page gutter mx-auto max-w-[1200px] pb-24 pt-32 md:pt-40">
      <Suspense fallback={<Resume initial="sde" />}>
        <ResumeFromParams />
      </Suspense>
    </section>
  );
}
