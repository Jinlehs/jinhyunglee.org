# jinhyunglee.org

Personal portfolio website for **Jin Hyung Lee** — a place to showcase professional work, projects, and experience.

**Live site:** [jinhyunglee.org](https://jinhyunglee.org) *(coming soon)*

---

## Purpose

This site is a **work portfolio**, not a personal blog or hobby page. Its job is to help recruiters, hiring managers, collaborators, and clients quickly understand:

- **Who I am** — background, interests, and what kind of work I do
- **What I've built** — projects with context, tech stack, and outcomes
- **Where I've worked** — roles, responsibilities, and impact
- **How to reach me** — contact and links to professional profiles

The goal is a fast, accessible, easy-to-maintain site that presents my work clearly and leaves a strong first impression.

---

## Planned Site Structure

| Section | Purpose |
|---------|---------|
| **Home** | Brief intro, headline, and links to key sections |
| **About** | Background, skills, and what I'm looking for |
| **Projects** | Selected work with descriptions, screenshots, and links (GitHub, demos) |
| **Experience** | Work history, education, and relevant achievements |
| **Contact** | Email, LinkedIn, GitHub, and other professional links |

Additional pages (e.g. a dedicated resume PDF, case studies, or a blog) can be added later if they support the portfolio goal.

---

## Tech Stack

- **Frontend** — React with [Vite](https://vite.dev/)
- **Hosting** — GitHub Pages, Vercel, Netlify, or similar
- **Domain** — `jinhyunglee.org` pointed at the deployed site

The stack prioritizes simplicity, performance, and low maintenance so the focus stays on the work itself.

---

## Local Development

```bash
git clone https://github.com/Jinlehs/jinhyunglee.org.git
cd jinhyunglee.org
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Project structure

```
src/
  components/     # UI sections (Header, Hero, Projects, etc.)
  data/           # Portfolio content (edit portfolio.js to update copy)
  App.jsx         # Page layout
  main.jsx        # React entry point
  index.css       # Global styles
```

### Build for production

```bash
npm run build
npm run preview
```

Production output is written to `dist/`.

---

## Deployment

The site will deploy automatically from the `main` branch (e.g. via GitHub Pages or a connected CI/CD pipeline). Production URL: **https://jinhyunglee.org**.

---

## Roadmap

- [x] Choose tech stack and scaffold the project
- [x] Design layout and content structure
- [x] Build core pages (Home, About, Projects, Experience, Contact)
- [ ] Add project content and assets
- [ ] Configure domain and deploy to production
- [ ] Optimize for SEO, accessibility, and performance

---

## Repository

- **GitHub:** [github.com/Jinlehs/jinhyunglee.org](https://github.com/Jinlehs/jinhyunglee.org)
- **License:** TBD

---

## Contact

**Jin Hyung Lee**

- GitHub: [@Jinlehs](https://github.com/Jinlehs)
- Website: [jinhyunglee.org](https://jinhyunglee.org)
