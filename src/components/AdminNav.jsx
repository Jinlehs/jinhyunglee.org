import { Link, useLocation } from "react-router-dom";

export default function AdminNav() {
  const { pathname } = useLocation();
  const isActive = (prefix) => pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <nav className="admin-nav">
      <Link to="/admin" className={`admin-nav-link${pathname === "/admin" ? " active" : ""}`}>
        Blog
      </Link>
      <Link to="/admin/stocks" className={`admin-nav-link${pathname === "/admin/stocks" ? " active" : ""}`}>
        Stocks
      </Link>
      <Link to="/admin/facilities" className={`admin-nav-link${isActive("/admin/facilities") ? " active" : ""}`}>
        Facilities
      </Link>
    </nav>
  );
}
