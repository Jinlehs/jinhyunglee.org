import { projects } from "../data/portfolio";

export default function Projects() {
  return (
    <section id="projects" className="section section-alt">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Projects</p>
          <h2>Selected work</h2>
        </div>
        <div className="card-grid">
          {projects.map((project) => (
            <article key={project.title} className="project-card">
              <div className="project-meta">
                <span className="project-type">{project.type}</span>
                <time dateTime={project.year}>{project.year}</time>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <ul className="tag-list tag-list-inline">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="card-links">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={`${link.label} for ${project.title}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
