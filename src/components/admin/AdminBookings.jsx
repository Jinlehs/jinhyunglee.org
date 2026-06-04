import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatDateTime, formatCurrency, EVENT_TYPES } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

const STATUS_COLORS = {
  pending: "#f59e0b", confirmed: "#22c55e", declined: "#ef4444", cancelled: "#6b7280",
};
const PAYMENT_COLORS = {
  pending: "#f59e0b", paid: "#22c55e", refunded: "#3b82f6", waived: "#6b7280",
};

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const filterStatus = searchParams.get("status") || "";
  const filterSearch = searchParams.get("q") || "";
  const filterFacility = searchParams.get("facility") || "";
  const page = parseInt(searchParams.get("page") || "0");
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from("bookings")
        .select("*, facilities(name, locations(name))", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (filterStatus) q = q.eq("status", filterStatus);
      if (filterFacility) q = q.eq("facility_id", filterFacility);
      if (filterSearch) q = q.or(`contact_name.ilike.%${filterSearch}%,contact_email.ilike.%${filterSearch}%,booking_ref.ilike.%${filterSearch}%,event_title.ilike.%${filterSearch}%`);
      const { data, count } = await q;
      setBookings(data || []);
      setTotal(count || 0);
      setLoading(false);
    }
    load();
  }, [filterStatus, filterSearch, filterFacility, page]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  async function updateStatus(id, status) {
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  }

  const eventTypeLabel = (t) => EVENT_TYPES.find((e) => e.value === t)?.label || t;

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">Bookings</h1>
            <p className="admin-sub">{total} total bookings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="fac-bookings-filters">
          <input
            className="fac-input fac-input-search"
            placeholder="Search by name, email, ref, event…"
            value={filterSearch}
            onChange={(e) => setParam("q", e.target.value)}
          />
          <select className="fac-input fac-input-sm" value={filterStatus} onChange={(e) => setParam("status", e.target.value)}>
            <option value="">All Statuses</option>
            {["pending", "confirmed", "declined", "cancelled"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {(filterStatus || filterSearch) && (
            <button className="fac-btn-ghost fac-btn-sm" onClick={() => setSearchParams({})}>Clear</button>
          )}
        </div>

        {loading ? (
          <div className="fac-loading">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="fac-empty-state">No bookings match your filters.</div>
        ) : (
          <>
            <div className="fac-admin-table-wrap">
              <table className="fac-admin-table fac-bookings-table">
                <thead>
                  <tr>
                    <th>Ref</th><th>Event</th><th>Facility</th><th>Date</th>
                    <th>Contact</th><th>Status</th><th>Payment</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="fac-booking-ref">{b.booking_ref}</td>
                      <td>
                        <div className="fac-booking-event">
                          <strong>{b.event_title}</strong>
                          <span className="fac-booking-type">{eventTypeLabel(b.event_type)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fac-booking-facility">
                          <span>{b.facilities?.name}</span>
                          <span className="fac-booking-loc">{b.facilities?.locations?.name}</span>
                        </div>
                      </td>
                      <td className="fac-booking-date">
                        {new Date(b.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        <span className="fac-booking-time">
                          {new Date(b.start_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>
                        <div className="fac-booking-contact">
                          <span>{b.contact_name}</span>
                          <span className="fac-booking-email">{b.contact_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="fac-status-badge" style={{ background: STATUS_COLORS[b.status] + "22", color: STATUS_COLORS[b.status] }}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <span className="fac-status-badge" style={{ background: PAYMENT_COLORS[b.payment_status] + "22", color: PAYMENT_COLORS[b.payment_status] }}>
                          {b.payment_status === "paid" ? formatCurrency(b.payment_amount) : b.payment_status}
                        </span>
                      </td>
                      <td className="fac-table-actions">
                        <Link to={`/admin/facilities/bookings/${b.id}`} className="fac-btn-ghost fac-btn-xs">View</Link>
                        {b.status === "pending" && (
                          <>
                            <button className="fac-btn-success fac-btn-xs" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</button>
                            <button className="fac-btn-danger fac-btn-xs" onClick={() => updateStatus(b.id, "declined")}>Decline</button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button className="fac-btn-danger fac-btn-xs" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="fac-pagination">
                <button
                  className="fac-btn-ghost fac-btn-sm"
                  disabled={page === 0}
                  onClick={() => setParam("page", String(page - 1))}
                >← Prev</button>
                <span>Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}</span>
                <button
                  className="fac-btn-ghost fac-btn-sm"
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  onClick={() => setParam("page", String(page + 1))}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
