import { site } from "../data/portfolio";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <a href="#main">Back to top</a>
      </div>
    </footer>
  );
}
