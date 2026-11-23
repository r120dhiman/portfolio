import { Hero } from "@/components/hero/Hero";
import { ProofStrip } from "@/components/home/ProofStrip";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Experience } from "@/components/home/Experience";
import { MoreProjects } from "@/components/home/MoreProjects";
import { Skills } from "@/components/home/Skills";
import { Contact } from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <FeaturedWork />
      <Experience />
      <MoreProjects />
      <Skills />
      <Contact />
    </>
  );
}
