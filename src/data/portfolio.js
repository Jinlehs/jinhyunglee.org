export const site = {
  name: "Jin Hyung Lee",
  title: "Reliable software. Clear impact.",
  tagline: "Portfolio & Resume",
  intro: "Software engineer focused on reliable systems and clean interfaces.",
  email: "hello@jinhyunglee.org",
  github: {
    label: "@Jinlehs",
    url: "https://github.com/Jinlehs",
  },
  linkedin: {
    label: "/in/your-profile",
    url: "https://linkedin.com/in/your-profile",
  },
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export const about = {
  paragraphs: [
    "Replace with a short paragraph about your background and the problems you like to solve.",
    "Add your current focus or what you're looking for next.",
  ],
  skills: [
    "JavaScript / TypeScript",
    "Python",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "Cloud / DevOps",
    "System design",
  ],
};

export const projects = [
  {
    type: "Web app",
    year: "2025",
    title: "Project Title One",
    description:
      "What it solved, your role, and key outcomes.",
    tags: ["React", "Node.js", "PostgreSQL"],
    links: [
      { label: "GitHub", href: "#" },
      { label: "Live demo", href: "#" },
    ],
  },
  {
    type: "Tooling",
    year: "2024",
    title: "Project Title Two",
    description:
      "Internal tools, open source, or side projects worth highlighting.",
    tags: ["Python", "Docker", "AWS"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    type: "Case study",
    year: "2023",
    title: "Project Title Three",
    description:
      "Good for work where process and trade-offs matter as much as the result.",
    tags: ["TypeScript", "GraphQL", "CI/CD"],
    links: [{ label: "Case study", href: "#" }],
  },
];

export const experience = [
  {
    title: "Software Engineer",
    org: "Company Name",
    start: "2023",
    end: "Present",
    bullets: [
      "Shipped a feature used by X users or reduced latency by Y%.",
      "Owned a service from design through deployment and monitoring.",
      "Collaborated with design and product on roadmap planning.",
    ],
  },
  {
    title: "Previous Role Title",
    org: "Previous Company",
    start: "2021",
    end: "2023",
    bullets: [
      "Describe scope, team size, or technical ownership.",
      "Highlight a project you're proud of.",
    ],
  },
  {
    title: "Degree or Certification",
    org: "University Name",
    start: "2021",
    end: null,
    summary:
      "B.S. in Computer Science — add honors or relevant coursework.",
  },
];
