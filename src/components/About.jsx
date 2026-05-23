import { about } from "../data/portfolio";

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">About</p>
          <h2>Background &amp; skills</h2>
        </div>
        <div className="about-grid">
          <div className="about-copy">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="skills-card">
            <h3>Skills</h3>
            <ul className="tag-list">
              {about.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
