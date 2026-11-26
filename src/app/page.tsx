import { ViewTransition } from "react";
import { Hero } from "@/components/hero/Hero";
import { ProofStrip } from "@/components/home/ProofStrip";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Experience } from "@/components/home/Experience";
import { MoreProjects } from "@/components/home/MoreProjects";
import { Lab } from "@/components/home/Lab";
import { Skills } from "@/components/home/Skills";
import { Contact } from "@/components/home/Contact";

export default function Home() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <Hero />
      <ProofStrip />
      <FeaturedWork />
      <Lab />
      <Experience />
      <MoreProjects />
      <Skills />
      <Contact />
    </ViewTransition>
  );
}
