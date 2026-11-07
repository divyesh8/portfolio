export const SITE = {
  name: "Divyesh Kolli",
  initials: "DK",
  role: "B.Tech Cloud Computing Student / Full-Stack Developer",
  careerPath: "Cloud Engineering → SRE → Platform Engineering",
  handle: "divyesh8",
  email: "kolli.divyesh@gmail.com",
  location: "Chennai, India",
  university: "SRM Institute of Science and Technology",
  campus: "SRM IST, Chennai",
  education: "B.Tech, Computer Science and Engineering",
  specialization: "Cloud Computing",
  studyPeriod: "2025–2029",
  graduation: 2029,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://divyeshkolli.fun",
  title: "Divyesh Kolli | Cloud & Full-Stack Engineering",
  description:
    "Divyesh Kolli is a B.Tech Cloud Computing student at SRM Institute of Science and Technology in Chennai, building reliable backend services, cloud infrastructure tooling, and scalable full-stack applications.",
  resumePath: "/Divyesh-Kolli-Resume.pdf",
  portrait: "/divyesh-kolli.webp",
} as const;

export const SOCIALS = {
  github: "https://github.com/divyesh8",
  linkedin: "https://www.linkedin.com/in/divyesh-kolli-690b0a102/",
  x: "https://x.com/_divyesh8",
  instagram: "https://www.instagram.com/_divyesshh",
};

export const SECTION_IDS = [
  "hero",
  "work",
  "about",
  "skills",
  "journey",
  "github",
  "profiles",
  "resume",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV: { id: SectionId; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "github", label: "GitHub" },
  { id: "resume", label: "Résumé" },
  { id: "contact", label: "Contact" },
];
