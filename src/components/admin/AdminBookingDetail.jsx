import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatDateTime, formatCurrency, EVENT_TYPES, getDurationHours } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

const STATUS_COLORS = {
  pending: "#f59e0b", confirmed: "#22c55e", declined: "#ef4444", cancelled: "#6b7280",
};

export default function AdminBookingDetail() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.from("bookings").select("*, facilities(*, locations(*))").eq("id", bookingId).single()
      .then(({ data }) => {
        if (data) {
          setBooking(data);
          setFacility(data.facilities);
          setAdminNotes(data.admin_notes || "");
        }
        setLoading(false);
      });
  }, [bookingId]);

  async function updateStatus(status) {
    setSaving(true);
    setError("");
    const { error: e } = await supabase.from("bookings")
      .update({ status, updated_at: new Date().toISOString() }).eq("id", bookingId);
    if (e) { setError(e.message); setSaving(false); return; }
    setBooking((b) => ({ ...b, status }));
    setSuccess(`Booking ${status}.`);
    setSaving(false);
  }

  async function saveNotes() {
    setSaving(true);
    const { error: e } = await supabase.from("bookings").update({ admin_notes: adminNotes }).eq("id", bookingId);
    if (e) { setError(e.message); setSaving(false); return; }
    setSuccess("Notes saved.");
    setSaving(false);
  }

  async function updatePaymentStatus(payment_status) {
    await supabase.from("bookings").update({ payment_status }).eq("id", bookingId);
    setBooking((b) => ({ ...b, payment_status }));
    setSuccess("Payment status updated.");
  }

  if (loading) return <div className="admin-page"><AdminNav /><div className="admin-content fac-loading">Loading…</div></div>;
  if (!booking) return <div className="admin-page"><AdminNav /><div className="admin-content">Booking not found.</div></div>;

  const hours = getDurationHours(booking.start_datetime, booking.end_datetime);
  const eventTypeLabel = EVENT_TYPES.find((e) => e.value === booking.event_type)?.label || booking.event_type;
  const amenities = JSON.parse(booking.amenities_requested || "[]");

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities/bookings" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← All Bookings</Link>
            <h1 className="admin-title">Booking {booking.booking_ref}</h1>
            <span className="fac-status-badge fac-status-lg" style={{ background: STATUS_COLORS[booking.status] + "22", color: STATUS_COLORS[booking.status] }}>
              {booking.status}
            </span>
          </div>
          <div className="fac-table-actions">
            {booking.status === "pending" && (
              <>
                <button className="fac-btn-success" onClick={() => updateStatus("confirmed")} disabled={saving}>Confirm Booking</button>
                <button className="fac-btn-danger" onClick={() => updateStatus("declined")} disabled={saving}>Decline</button>
              </>
            )}
            {booking.status === "confirmed" && (
              <button className="fac-btn-danger" onClick={() => updateStatus("cancelled")} disabled={saving}>Cancel Booking</button>
            )}
          </div>
        </div>

        {error && <p className="fac-error-msg">{error}</p>}
        {success && <p className="fac-success-msg">{success}</p>}

        <div className="fac-detail-booking-grid">
          {/* Left column */}
          <div className="fac-detail-booking-main">
            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Event Information</h3>
              <div className="fac-detail-rows">
                <div className="fac-detail-row"><span>Event Title</span><strong>{booking.event_title}</strong></div>
                <div className="fac-detail-row"><span>Event Type</span><span>{eventTypeLabel}</span></div>
                <div className="fac-detail-row"><span>Attendees</span><span>{booking.attendees}</span></div>
                {booking.event_description && (
                  <div className="fac-detail-row"><span>Description</span><span>{booking.event_description}</span></div>
                )}
                {amenities.length > 0 && (
                  <div className="fac-detail-row"><span>Amenities Requested</span><span>{amenities.join(", ")}</span></div>
                )}
                {booking.special_requests && (
                  <div className="fac-detail-row"><span>Special Requests</span><span>{booking.special_requests}</span></div>
                )}
              </div>
            </div>

            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Booking Details</h3>
              <div className="fac-detail-rows">
                <div className="fac-detail-row"><span>Facility</span><strong>{facility?.name}</strong></div>
                <div className="fac-detail-row"><span>Location</span><span>{facility?.locations?.name} · {facility?.locations?.city}</span></div>
                <div className="fac-detail-row"><span>Start</span><span>{formatDateTime(booking.start_datetime)}</span></div>
                <div className="fac-detail-row"><span>End</span><span>{formatDateTime(booking.end_datetime)}</span></div>
                <div className="fac-detail-row"><span>Duration</span><span>{hours} hour{hours !== 1 ? "s" : ""}</span></div>
                <div className="fac-detail-row"><span>Booked</span><span>{formatDateTime(booking.created_at)}</span></div>
              </div>
            </div>

            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Admin Notes</h3>
              <textarea
                className="fac-input fac-textarea"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not visible to booker)…"
              />
              <button className="fac-btn-ghost fac-btn-sm" onClick={saveNotes} disabled={saving} style={{ marginTop: "0.5rem" }}>
                Save Notes
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="fac-detail-booking-side">
            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Contact</h3>
              <div className="fac-detail-rows">
                <div className="fac-detail-row"><span>Name</span><strong>{booking.contact_name}</strong></div>
                <div className="fac-detail-row"><span>Email</span><a href={`mailto:${booking.contact_email}`}>{booking.contact_email}</a></div>
                {booking.contact_phone && <div className="fac-detail-row"><span>Phone</span><span>{booking.contact_phone}</span></div>}
                {booking.organization && <div className="fac-detail-row"><span>Organization</span><span>{booking.organization}</span></div>}
              </div>
            </div>

            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Payment</h3>
              <div className="fac-detail-rows">
                <div className="fac-detail-row">
                  <span>Status</span>
                  <select
                    className="fac-input fac-input-inline"
                    value={booking.payment_status}
                    onChange={(e) => updatePaymentStatus(e.target.value)}
                  >
                    {["pending", "paid", "refunded", "waived"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="fac-detail-row"><span>Amount</span><strong>{formatCurrency(booking.payment_amount || 0)}</strong></div>
                {booking.discount_amount > 0 && (
                  <div className="fac-detail-row"><span>Discount</span><span>− {formatCurrency(booking.discount_amount)} ({booking.promo_code})</span></div>
                )}
                {booking.payment_provider && <div className="fac-detail-row"><span>Provider</span><span>{booking.payment_provider}</span></div>}
                {booking.payment_intent_id && (
                  <div className="fac-detail-row"><span>Intent ID</span><code className="fac-code">{booking.payment_intent_id.substring(0, 20)}…</code></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
