export const site = {
  name: "Rohit Kumar",
  domain: "rohitkumar.info",
  url: "https://rohitkumar.info",
  email: "contact@rohitkumar.info",
  role: "Software Engineer — AI products, end to end",
  tagline:
    "I build AI products end to end and put them in front of real users: agent backends, realtime LLM pipelines, and the product around them.",
  status: "Final year @ IIT (BHU) · open to full-time SDE, AI Engineer & FDE roles starting 2027",
  education: {
    school: "Indian Institute of Technology (BHU) Varanasi",
    degree: "B.Tech, Chemical Engineering",
    year: "2027",
  },
  links: {
    github: "https://github.com/r120dhiman",
    linkedin: "https://linkedin.com/in/rohit-kumar2005",
    email: "mailto:contact@rohitkumar.info",
  },
  /** Verified numbers only. */
  proof: [
    { value: 2000, suffix: "+", label: "trips planned on TripFlow" },
    { value: 250, suffix: "+", label: "TripFlow users" },
    { value: 1100, suffix: "+", label: "GitHub contributions in 2026" },
    { value: 5, suffix: "", label: "AI services built for Wolfe, solo" },
  ],
} as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/#contact" },
] as const;
