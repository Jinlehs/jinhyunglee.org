import { Link } from "react-router-dom";
import { site } from "../data/portfolio";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <div className="footer-links">
          <a href="#main">Back to top</a>
          <Link to="/admin" className="admin-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
