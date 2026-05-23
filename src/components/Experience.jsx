import { experience } from "../data/portfolio";

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Experience</p>
          <h2>Where I've worked</h2>
        </div>
        <ol className="timeline">
          {experience.map((item) => (
            <li key={`${item.title}-${item.org}`} className="timeline-item">
              <div className="timeline-marker" aria-hidden="true"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="timeline-org">{item.org}</p>
                  </div>
                  <p className="timeline-date">
                    <time dateTime={item.start}>{item.start}</time>
                    {item.end ? (
                      <>
                        {" "}
                        –{" "}
                        {item.end === "Present" ? (
                          item.end
                        ) : (
                          <time dateTime={item.end}>{item.end}</time>
                        )}
                      </>
                    ) : null}
                  </p>
                </div>
                {item.bullets ? (
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{item.summary}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
