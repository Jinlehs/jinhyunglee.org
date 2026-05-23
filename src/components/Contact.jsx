import { site } from "../data/portfolio";

export default function Contact() {
  const links = [
    {
      label: "Email",
      href: `mailto:${site.email}`,
      text: site.email,
    },
    {
      label: "GitHub",
      href: site.github.url,
      text: site.github.label,
      external: true,
    },
    {
      label: "LinkedIn",
      href: site.linkedin.url,
      text: site.linkedin.label,
      external: true,
    },
  ];

  return (
    <section id="contact" className="section section-alt">
      <div className="container contact-inner">
        <div className="section-heading">
          <p className="eyebrow">Contact</p>
          <h2>Let's connect</h2>
          <p className="section-lead">
            Open to opportunities and collaborations. Reach out below.
          </p>
        </div>
        <ul className="contact-links">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="contact-label">{link.label}</span>
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
