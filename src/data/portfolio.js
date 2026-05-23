export const site = {
  name: "Jin Hyung Lee",
  title: "Reliable software. Clear impact.",
  tagline: "Portfolio & Resume",
  intro:
    "I'm a PMP-certified Development Lead and full-stack engineer based in Saskatoon, SK. With 6+ years across enterprise software, cloud infrastructure, and team leadership, I specialize in delivering complex systems that work reliably at scale — from ETL pipelines processing finance data to ERP platforms serving thousands of public-sector employees.",
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
    "I'm a full-stack engineer and certified Project Management Professional based in Saskatoon, SK. My background spans the full arc of a technology career — from diagnosing hardware failures on a university helpdesk to architecting multi-million-dollar ERP migrations for public institutions. I have a deep respect for software that actually works: systems that don't surprise you at 2am, interfaces that make the right action obvious, and codebases that a new developer can navigate without a guide.",
    "Right now I'm leading the technology transformation at Greater Saskatoon Catholic Schools, managing a cross-functional team of developers, business analysts, and vendor partners delivering a cloud ERP platform for an organization with over 3,000 employees. Alongside that, I'm pushing the team toward AI-assisted workflows and modern DevOps practices — because the best way to ship reliable software faster is to build the right culture around it. I hold a PMP certification from PMI and am a Microsoft-certified Dynamics 365 Business Central Functional Consultant.",
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
    description:
      "Describe the problem you set out to solve, the approach you took, and the measurable outcome. Who used it, what did it replace, and what changed as a result?",
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
      "Internal tools, open source libraries, and workflow automation are worth showcasing here. What pain did this eliminate, and how did the team's day-to-day change after you shipped it?",
    tags: ["Python", "Docker", "AWS"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    type: "Case study",
    year: "2023",
    title: "Project Title Three",
    description:
      "Some projects are defined as much by their process and trade-offs as by their final form. Use this space to walk through a decision-heavy piece of work and explain the thinking behind the choices you made.",
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
      "Managed a team of 5 developers, 3 business analysts, and external vendor resources to lead an on-premise-to-cloud ERP migration covering Finance and HR for a public-sector organization operating on a $186.4M annual budget with over 3,000 employees. The three-year initiative — projected to exceed $1M in total investment — delivered critical capabilities including streamlined payroll processing, vendor EFT payments, T4 reporting, and financial analytics dashboards used by district leadership.",
      "Championed the adoption of AI-assisted development tooling across the entire development team, introducing Cursor IDE, MCP server integrations, and Rovo AI as part of the standard engineering workflow. This accelerated feature delivery cycles and embedded AI-driven capabilities directly into ERP processes, reducing manual overhead on routine development and configuration tasks.",
      "Led the organization's full transition from a legacy helpdesk system to Jira Service Management. Designed custom ticket workflows, automated routing and escalation rules, and SLA configurations from the ground up, while engineering a clean migration of all historical support data to preserve institutional continuity.",
      "Built the team's engineering culture from scratch by establishing Agile and DevOps best practices across a group of five developers. Delivered hands-on training sessions covering Git branching strategies, CI/CD pipeline design, Docker containerization, and sprint planning — changes that directly contributed to a 25% reduction in deployment frequency and a measurable decrease in production incidents.",
      "Designed and implemented ETL pipelines and executive reporting dashboards using PySpark, Power BI, and Microsoft Fabric, transforming a slow, manual reporting cycle of 2–3 days into a 3–4 hour automated process that delivers real-time financial visibility to district leadership.",
    ],
  },
  {
    title: "Full Stack Developer",
    org: "Framewerx",
    start: "2022",
    end: "2024",
    bullets: [
      "Developed and maintained full-stack features across web and on-premise applications for Supreme Steel, one of Western Canada's largest steel fabricators. Work spanned MRP production scheduling systems, HRMS workforce management tools, and general-purpose analytics applications — each requiring close collaboration with domain experts to translate complex business rules into reliable software.",
      "Architected and built Swagger/OData API-driven web applications that connected Supreme Steel's on-premise systems with modern SaaS products, replacing fragile manual data transfers and spreadsheet exports with clean, versioned API contracts and automated data flows.",
      "Established a test-driven development culture by introducing a comprehensive XUnit-based unit and integration testing suite across the codebase. Grew overall test coverage from a low baseline to 80%, significantly reducing the frequency of regression bugs reaching production and giving the team confidence to refactor and extend core systems.",
    ],
  },
  {
    title: "Digital Consultant",
    org: "Freelance",
    start: "2020",
    end: "2022",
    bullets: [
      "Ran an independent consulting practice delivering custom web solutions for businesses across Edmonton. Built full-stack applications on both React/Deno/PostgreSQL and WordPress/MySQL stacks depending on client needs, implementing OAuth authentication and SSO integrations to support secure, multi-platform login experiences for end users.",
      "Partnered with GongCha Western Canada on two digital projects — a refreshed online ordering experience and a promotional campaign integration — that together contributed to a measurable 3–4% increase in online order volume across their Western Canadian franchise network.",
    ],
  },
  {
    title: "IT Analyst",
    org: "University of Alberta",
    start: "2019",
    end: "2020",
    bullets: [
      "Supported a high-volume IT helpdesk at one of Canada's largest research universities, resolving hardware and software support tickets collaboratively with senior technicians across a large and varied campus environment. Co-developed Python automation scripts for OS image deployment that reduced per-device imaging time from 2 hours down to 20 minutes — a 10× improvement that was scaled to support deployment across 500+ machines.",
    ],
  },
  {
    title: "B.S. Computer Science, Minor: Business",
    org: "University of Alberta",
    start: "2019",
    end: null,
    summary:
      "Graduated with a 3.7 GPA across a curriculum that combined rigorous technical depth with business fundamentals. Coursework included Software Engineering, Intelligent Systems, File & Database Management, Reinforcement Learning, Product Management & Pricing, Business Economics, and Accounting. The business minor was intentional — understanding how software decisions translate into organizational outcomes has shaped how I approach every project since.",
  },
  {
    title: "Event Coordinator & Instructor",
    org: "Freestyle Movement",
    start: "2013",
    end: "2025",
    summary:
      "For over a decade, volunteered as a breakdance instructor with Freestyle Movement in Edmonton and organized Get School'd — an annual hip-hop youth event bringing together local artists, dancers, and the broader community. The event raised over $15,000 for Edmonton-area non-profits and provided hundreds of young people with access to arts programming and performance opportunities they wouldn't otherwise have had.",
  },
];
