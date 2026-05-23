export const site = {
  name: "Jin Hyung Lee",
  title: "Building thoughtful software with clear impact.",
  tagline: "Portfolio & Resume",
  intro:
    "I'm Jin Hyung Lee — a software engineer focused on reliable systems, clean interfaces, and work that holds up in production.",
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
    "Sample bio — replace this with a short paragraph about your background, what you care about in your work, and the kinds of problems you like to solve.",
    "Mention your current focus, recent roles, or what you're looking for next (full-time, contract, open source, etc.).",
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
      "Brief description of the project, the problem it solved, and your role. Highlight measurable outcomes when you can.",
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
      "Another sample project card. Use this space for internal tools, open source contributions, or side projects worth calling out.",
    tags: ["Python", "Docker", "AWS"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    type: "Case study",
    year: "2023",
    title: "Project Title Three",
    description:
      "A third example with a longer-form case study link. Good for work where process and trade-offs matter as much as the final product.",
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
      "Sample bullet: shipped a feature used by X users or reduced latency by Y%.",
      "Sample bullet: owned a service from design through deployment and monitoring.",
      "Sample bullet: collaborated with design and product on roadmap planning.",
    ],
  },
  {
    title: "Previous Role Title",
    org: "Previous Company",
    start: "2021",
    end: "2023",
    bullets: [
      "Sample bullet describing scope, team size, or technical ownership.",
      "Sample bullet highlighting a project you're proud of.",
    ],
  },
  {
    title: "Degree or Certification",
    org: "University Name",
    start: "2021",
    end: null,
    summary:
      "B.S. in Computer Science — add honors, relevant coursework, or activities if useful.",
  },
];
