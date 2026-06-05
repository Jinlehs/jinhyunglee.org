import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminNav from "../AdminNav";

function StatCard({ label, value, sub, to }) {
  const inner = (
    <div className="fac-stat-card">
      <span className="fac-stat-card-val">{value}</span>
      <span className="fac-stat-card-label">{label}</span>
      {sub && <span className="fac-stat-card-sub">{sub}</span>}
    </div>
  );
  return to ? <Link to={to} className="fac-stat-card-link">{inner}</Link> : inner;
}

export default function AdminFacilitiesHub() {
  const [stats, setStats] = useState({ bookings: 0, pending: 0, facilities: 0, locations: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: totalBookings },
        { count: pendingBookings },
        { count: totalFacilities },
        { count: totalLocations },
        { data: recent },
        { data: paidBookings },
      ] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("facilities").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("locations").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("bookings").select("*, facilities(name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("bookings").select("payment_amount").eq("payment_status", "paid"),
      ]);
      const revenue = (paidBookings || []).reduce((sum, b) => sum + (b.payment_amount || 0), 0);
      setStats({
        bookings: totalBookings || 0,
        pending: pendingBookings || 0,
        facilities: totalFacilities || 0,
        locations: totalLocations || 0,
        revenue,
      });
      setRecentBookings(recent || []);
      setLoading(false);
    }
    load();
  }, []);

  const statusColor = { pending: "#f59e0b", confirmed: "#22c55e", declined: "#ef4444", cancelled: "#6b7280" };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Facilities Hub</h1>
          <p className="admin-sub">Manage your K–12 facility booking system</p>
          <div className="admin-header-actions">
            <Link to="/facilities" className="fac-btn-ghost fac-btn-sm" target="_blank">
              View Public Page ↗
            </Link>
            <Link to="/admin/facilities/locations/new" className="fac-btn-primary fac-btn-sm">
              + Add Location
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="fac-loading">Loading dashboard…</div>
        ) : (
          <>
            <div className="fac-hub-stats">
              <StatCard label="Total Bookings" value={stats.bookings} to="/admin/facilities/bookings" />
              <StatCard label="Pending Review" value={stats.pending} sub="requires action" to="/admin/facilities/bookings?status=pending" />
              <StatCard label="Active Facilities" value={stats.facilities} to="/admin/facilities/list" />
              <StatCard label="Locations" value={stats.locations} to="/admin/facilities/locations" />
              <StatCard label="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} to="/admin/facilities/analytics" />
            </div>

            <div className="fac-hub-grid">
              {/* Quick Links */}
              <div className="fac-hub-section">
                <h2 className="fac-hub-section-title">Management</h2>
                <div className="fac-hub-links">
                  {[
                    { to: "/admin/facilities/locations", label: "Locations", desc: "Add and manage school buildings" },
                    { to: "/admin/facilities/list", label: "Facilities", desc: "Manage rooms and spaces" },
                    { to: "/admin/facilities/schedules", label: "Schedules & Blocks", desc: "Set availability and block dates" },
                    { to: "/admin/facilities/bookings", label: "Bookings", desc: "View, approve, and manage bookings" },
                    { to: "/admin/facilities/promo-codes", label: "Promo Codes", desc: "Create discount codes" },
                    { to: "/admin/facilities/payment-settings", label: "Payment Settings", desc: "Configure Stripe or Square" },
                    { to: "/admin/facilities/analytics", label: "Analytics", desc: "Revenue and usage reports" },
                  ].map((l) => (
                    <Link key={l.to} to={l.to} className="fac-hub-link">
                      <span className="fac-hub-link-label">{l.label}</span>
                      <span className="fac-hub-link-desc">{l.desc}</span>
                      <span className="fac-hub-link-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="fac-hub-section">
                <div className="fac-hub-section-header">
                  <h2 className="fac-hub-section-title">Recent Bookings</h2>
                  <Link to="/admin/facilities/bookings" className="fac-link-all">View all →</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p className="fac-empty-state">No bookings yet.</p>
                ) : (
                  <div className="fac-recent-list">
                    {recentBookings.map((b) => (
                      <Link key={b.id} to={`/admin/facilities/bookings/${b.id}`} className="fac-recent-item">
                        <div className="fac-recent-main">
                          <span className="fac-recent-title">{b.event_title}</span>
                          <span className="fac-recent-facility">{b.facilities?.name}</span>
                        </div>
                        <div className="fac-recent-meta">
                          <span className="fac-recent-date">
                            {new Date(b.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className="fac-status-badge" style={{ background: statusColor[b.status] + "22", color: statusColor[b.status] }}>
                            {b.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
