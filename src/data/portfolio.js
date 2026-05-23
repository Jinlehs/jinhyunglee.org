export const site = {
  name: "Jin Hyung Lee",
  title: "Hi there.",
  tagline: "Portfolio & Resume",
  intro:
    "I'm a PMP-certified Development Lead and full-stack engineer based in Saskatoon, SK — with 6+ years building production systems across enterprise software, cloud infrastructure, and team leadership.",
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
    "Computer Science grad from the University of Alberta (GPA 3.7) with a minor in Business. My career has spanned IT support, freelance consulting, full-stack development, and now leading engineering teams on large-scale cloud migrations.",
    "Currently delivering a multi-year ERP transformation at Greater Saskatoon Catholic Schools. PMP-certified and Microsoft-certified in Dynamics 365 Business Central.",
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
    type: "ERP Implementation",
    year: "2024",
    title: "Dynamics 365 Business Central",
    description:
      "Led an on-premise-to-cloud ERP migration for Greater Saskatoon Catholic Schools — covering payroll, vendor EFT payments, T4 reporting, and financial analytics for a $186.4M public-sector organization with 3,000+ employees.",
    tags: ["Dynamics 365", "Microsoft Fabric", "Power BI"],
    links: [],
  },
  {
    type: "Internal Tooling",
    year: "2024",
    title: "Jira Service Management",
    description:
      "Replaced a legacy helpdesk with a fully custom Jira Service Management deployment. Designed ticket workflows, automation rules, and SLA configurations from scratch, then migrated all historical support data for continuity.",
    tags: ["Jira", "Automation", "Agile"],
    links: [],
  },
  {
    type: "Portfolio",
    year: "2025",
    title: "jinhyunglee.org",
    description:
      "This portfolio site — built with React and Vite, deployed on Cloudflare Workers, and developed using Claude Code connected to GitHub for AI-assisted workflows.",
    tags: ["React", "Cloudflare", "Claude Code"],
    links: [{ label: "Live site", href: "https://jinhyunglee.org" }],
  },
];

export const experience = [
  {
    title: "Development Lead",
    org: "Greater Saskatoon Catholic Schools",
    start: "2024",
    end: "Present",
    bullets: [
      "Led 5 developers and 3 BAs on a $1M+ cloud ERP migration (Finance & HR) for a $186.4M organization with 3,000+ employees.",
      "Introduced AI development tooling (Cursor IDE, MCP integrations, Rovo AI) across the team, accelerating delivery and embedding AI into ERP workflows.",
      "Replaced a legacy helpdesk with Jira Service Management — designed custom workflows, automations, and migrated all historical ticket data.",
      "Established Git, CI/CD, and Docker practices across a team of 5, reducing deployment frequency by 25%.",
      "Built PySpark and Power BI pipelines on Microsoft Fabric, cutting reporting turnaround from 2–3 days to 3–4 hours.",
    ],
  },
  {
    title: "Full Stack Developer",
    org: "Framewerx",
    start: "2022",
    end: "2024",
    bullets: [
      "Built MRP, HRMS, and analytics features for Supreme Steel across web and on-premise systems.",
      "Developed Swagger/OData API-driven applications enabling SaaS product integrations.",
      "Grew unit and integration test coverage to 80% using XUnit.",
    ],
  },
  {
    title: "Digital Consultant",
    org: "Freelance",
    start: "2020",
    end: "2022",
    bullets: [
      "Delivered full-stack web applications (React/Deno/PostgreSQL, WordPress/MySQL) with OAuth and SSO integrations.",
      "Two projects for GongCha Western Canada contributed to a 3–4% increase in online orders.",
    ],
  },
  {
    title: "IT Analyst",
    org: "University of Alberta",
    start: "2019",
    end: "2020",
    bullets: [
      "Co-developed Python automation scripts that cut OS imaging time from 2 hours to 20 minutes across 500+ machines.",
    ],
  },
  {
    title: "B.S. Computer Science, Minor: Business",
    org: "University of Alberta",
    start: "2019",
    end: null,
    summary: "GPA 3.7 / 4.0 — Software Engineering, Intelligent Systems, File & Database Management, Reinforcement Learning, Business Economics.",
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
