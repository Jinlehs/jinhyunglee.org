import { Link, useLocation } from "react-router-dom";

export default function AdminNav() {
  const { pathname } = useLocation();
  return (
    <nav className="admin-nav">
      <Link to="/admin" className={`admin-nav-link${pathname === "/admin" ? " active" : ""}`}>
        Blog
      </Link>
      <Link to="/admin/stocks" className={`admin-nav-link${pathname === "/admin/stocks" ? " active" : ""}`}>
        Stocks
      </Link>
    </nav>
  );
}
