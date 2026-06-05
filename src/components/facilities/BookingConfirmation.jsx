import { useLocation, Link } from "react-router-dom";
import { formatDateTime, formatCurrency } from "../../lib/bookingUtils";

export default function BookingConfirmation() {
  const { state } = useLocation();

  if (!state?.booking) {
    return (
      <div className="fac-loading-full">
        <h2>Booking not found.</h2>
        <Link to="/facilities" className="fac-btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Back to Facilities
        </Link>
      </div>
    );
  }

  const { booking, facility, locationName } = state;
  const isPending = booking.status === "pending";
  const isPaid = booking.payment_status === "paid";

  return (
    <div className="facilities-page">
      <div className="fac-container fac-confirmation">
        <div className={`fac-confirm-icon${isPending ? " pending" : " success"}`}>
          {isPending ? "⏳" : "✓"}
        </div>
        <h1 className="fac-confirm-title">
          {isPending ? "Booking Submitted!" : "Booking Confirmed!"}
        </h1>
        <p className="fac-confirm-subtitle">
          {isPending
            ? "Your booking request has been received and is awaiting admin approval. You'll be notified by email once it's reviewed."
            : "Your booking is confirmed. A confirmation has been sent to your email."}
        </p>

        <div className="fac-confirm-card">
          <div className="fac-confirm-ref">
            <span className="fac-confirm-ref-label">Booking Reference</span>
            <span className="fac-confirm-ref-value">{booking.booking_ref}</span>
          </div>

          <div className="fac-confirm-details">
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Facility</span>
              <span className="fac-confirm-val">{facility?.name || booking.facility_id}</span>
            </div>
            {locationName && (
              <div className="fac-confirm-row">
                <span className="fac-confirm-key">Location</span>
                <span className="fac-confirm-val">{locationName}</span>
              </div>
            )}
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Date & Time</span>
              <span className="fac-confirm-val">
                {formatDateTime(booking.start_datetime)} → {new Date(booking.end_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Event</span>
              <span className="fac-confirm-val">{booking.event_title}</span>
            </div>
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Contact</span>
              <span className="fac-confirm-val">{booking.contact_name} · {booking.contact_email}</span>
            </div>
            {booking.organization && (
              <div className="fac-confirm-row">
                <span className="fac-confirm-key">Organization</span>
                <span className="fac-confirm-val">{booking.organization}</span>
              </div>
            )}
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Status</span>
              <span className={`fac-status-badge fac-status-${booking.status}`}>{booking.status}</span>
            </div>
            <div className="fac-confirm-row">
              <span className="fac-confirm-key">Payment</span>
              <span className={`fac-status-badge fac-payment-${booking.payment_status}`}>
                {booking.payment_status === "paid"
                  ? `Paid — ${formatCurrency(booking.payment_amount)}`
                  : booking.payment_status === "waived"
                  ? "No charge"
                  : "Pending payment"}
              </span>
            </div>
          </div>
        </div>

        <div className="fac-confirm-actions">
          <Link to="/facilities" className="fac-btn-primary">Browse More Facilities</Link>
          <button className="fac-btn-ghost" onClick={() => window.print()}>Print Confirmation</button>
        </div>

        <p className="fac-confirm-help">
          Need help? Contact us at{" "}
          <a href="mailto:facilities@springfield.k12.il.us">facilities@springfield.k12.il.us</a>
          {" "}or call (217) 555-0100.
        </p>
      </div>
    </div>
  );
}
