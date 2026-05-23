export const site = {
  name: "Jin Hyung Lee",
  title: "Reliable software. Clear impact.",
  tagline: "Portfolio & Resume",
  intro:
    "Development Lead and full-stack engineer with 6+ years building production systems — currently delivering a cloud ERP migration for a public-sector organization with 3,000+ employees.",
  email: "jinleehy@gmail.com",
  github: {
    label: "@Jinlehs",
    url: "https://github.com/Jinlehs",
  },
  linkedin: {
    label: "/in/jinhyunglee",
    url: "https://www.linkedin.com/in/jinhyunglee",
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
    "Computer Science graduate (U of A, GPA 3.7) with experience spanning helpdesk, freelance consulting, full-stack development, and team leadership. I build systems that hold up in production and are clear to the people who maintain them.",
    "Currently managing a cross-functional team on a multi-year ERP migration and championing AI-assisted development workflows. PMP-certified and Dynamics 365 Business Central certified.",
  ],
  skills: [
    "JavaScript / TypeScript",
    "Python / PySpark",
    "React / Angular",
    "C# / ASP.NET",
    "SQL",
    "Azure / Microsoft Fabric",
    "Power BI",
    "Docker / CI/CD",
    "Agile / Scrum",
    "Git / Jira",
  ],
};

export const projects = [
  {
    type: "Web app",
    year: "2025",
    title: "Project Title One",
    description: "What it solved, your role, and key outcomes.",
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
    description: "Internal tools, open source, or side projects worth highlighting.",
    tags: ["Python", "Docker", "AWS"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    type: "Case study",
    year: "2023",
    title: "Project Title Three",
    description: "Good for work where process and trade-offs matter as much as the result.",
    tags: ["TypeScript", "GraphQL", "CI/CD"],
    links: [{ label: "Case study", href: "#" }],
  },
];

export const experience = [
  {
    title: "Development Lead",
    org: "Greater Saskatoon Catholic Schools",
    start: "2024",
    end: "Present",
    bullets: [
      "Led 5 developers and 3 BAs on an on-premise-to-cloud ERP migration (Finance & HR) for a $186.4M public-sector organization with 3,000+ employees.",
      "Championed AI-assisted development tooling (Cursor IDE, MCP integrations, Rovo AI), embedding AI capabilities directly into ERP workflows.",
      "Replaced legacy helpdesk with Jira Service Management — designed custom workflows, automations, and migrated historical ticket data.",
      "Established Agile & DevOps practices across a team of 5; delivered training on Git, CI/CD, and Docker, reducing deployment frequency by 25%.",
      "Built PySpark and Power BI pipelines on Microsoft Fabric, cutting reporting turnaround from 2–3 days to 3–4 hours.",
    ],
  },
  {
    title: "Full Stack Developer",
    org: "Framewerx",
    start: "2022",
    end: "2024",
    bullets: [
      "Built and maintained web and on-premise features for Supreme Steel, including MRP systems, HRMS tools, and analytics dashboards.",
      "Developed Swagger/OData API-driven applications enabling SaaS product integrations.",
      "Wrote XUnit unit and integration tests, contributing to an 80% increase in test coverage.",
    ],
  },
  {
    title: "Digital Consultant",
    org: "Freelance",
    start: "2020",
    end: "2022",
    bullets: [
      "Built React/Deno/PostgreSQL and WordPress/MySQL web applications with OAuth and SSO integrations.",
      "Delivered 2 projects for GongCha Western Canada contributing to a 3–4% increase in online orders.",
    ],
  },
  {
    title: "IT Analyst",
    org: "University of Alberta",
    start: "2019",
    end: "2020",
    bullets: [
      "Co-developed Python automation scripts for image deployment, cutting per-device time from 2 hours to 20 minutes across 500+ machines.",
    ],
  },
  {
    title: "B.S. Computer Science, Minor: Business",
    org: "University of Alberta",
    start: "2019",
    end: null,
    summary:
      "GPA 3.7 / 4.0 — Software Engineering, Intelligent Systems, File & Database Management, Reinforcement Learning, Business Economics.",
  },
  {
    title: "Event Coordinator & Instructor",
    org: "Freestyle Movement",
    start: "2013",
    end: "2025",
    summary:
      "Volunteered as a breakdance instructor and organized Get School'd, a hip-hop youth event that raised $15,000+ for Edmonton non-profits.",
  },
];
