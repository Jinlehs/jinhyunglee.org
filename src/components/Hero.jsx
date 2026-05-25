import { site } from "../data/portfolio";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <p className="eyebrow">{site.tagline}</p>
        <h1>Hi there.</h1>
        <p className="hero-lead">{site.intro}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#projects">
            View my work
          </a>
          <a className="btn btn-secondary" href="#contact">
            Get in touch
          </a>
          <a className="btn btn-secondary" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            Resume ↓
          </a>
        </div>
      </div>
    </section>
  );
}
