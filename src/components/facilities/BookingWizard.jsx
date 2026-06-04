import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  generateBookingRef, formatCurrency, formatTime, formatDate,
  calculatePrice, applyPromoCode, getDurationHours,
  buildLocalDT, EVENT_TYPES,
} from "../../lib/bookingUtils";

const STEPS = ["Date & Time", "Event Details", "Contact Info", "Amenities", "Review & Pay"];

function StepIndicator({ current }) {
  return (
    <div className="fac-wizard-steps">
      {STEPS.map((s, i) => (
        <div key={i} className={`fac-wizard-step${i === current ? " active" : ""}${i < current ? " done" : ""}`}>
          <span className="fac-wizard-step-num">{i < current ? "✓" : i + 1}</span>
          <span className="fac-wizard-step-label">{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookingWizard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [facility, setFacility] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [selectedDate] = useState(state.selectedDate || "");
  const [selectedStart] = useState(state.selectedStart || "");
  const [selectedEnd] = useState(state.selectedEnd || "");

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [eventDesc, setEventDesc] = useState("");
  const [attendees, setAttendees] = useState(1);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [organization, setOrganization] = useState("");

  const [requestedAmenities, setRequestedAmenities] = useState([]);
  const [specialRequests, setSpecialRequests] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Payment
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [cardElement, setCardElement] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!state.facilityId && !id) { navigate("/facilities/browse"); return; }
    const fid = state.facilityId || id;
    Promise.all([
      supabase.from("facilities").select("*, locations(name, city)").eq("id", fid).single(),
      supabase.from("payment_settings").select("*").eq("is_active", true).single(),
    ]).then(([{ data: fac }, { data: ps }]) => {
      setFacility(fac);
      setPaymentSettings(ps);
    });
  }, []);

  // Load Stripe.js when reaching payment step
  useEffect(() => {
    if (step !== 4 || stripeLoaded || !paymentSettings?.stripe_publishable_key) return;
    if (paymentSettings.provider !== "stripe") return;
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => {
      const s = window.Stripe(paymentSettings.stripe_publishable_key);
      setStripe(s);
      const elements = s.elements();
      const card = elements.create("card", {
        style: {
          base: {
            color: "#f0f0f0",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "16px",
            "::placeholder": { color: "#666" },
          },
        },
      });
      // Mount after a tick to ensure the DOM is ready
      setTimeout(() => {
        if (cardRef.current) {
          card.mount(cardRef.current);
          setCardElement(card);
        }
      }, 100);
      setStripeLoaded(true);
    };
    document.body.appendChild(script);
  }, [step, paymentSettings, stripeLoaded]);

  if (!facility) return <div className="fac-loading-full">Loading booking form…</div>;
  if (!selectedDate || !selectedStart || !selectedEnd) {
    return (
      <div className="fac-loading-full">
        <p>Missing time selection.</p>
        <button className="fac-btn-ghost" onClick={() => navigate(`/facilities/${id || state.facilityId}`)}>
          ← Go back
        </button>
      </div>
    );
  }

  const startDT = buildLocalDT(selectedDate, selectedStart).toISOString();
  const endDT = buildLocalDT(selectedDate, selectedEnd).toISOString();
  const hours = getDurationHours(startDT, endDT);
  const subtotal = calculatePrice(facility, startDT, endDT);
  const discount = promoData ? applyPromoCode(promoData, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const amenitiesList = JSON.parse(facility.amenities || "[]");
  const needsPayment = paymentSettings?.provider !== "free" && total > 0;

  async function checkPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase())
      .eq("active", true)
      .single();
    if (!data) {
      setPromoError("Invalid or expired promo code.");
      setPromoData(null);
    } else if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setPromoError("This promo code has expired.");
      setPromoData(null);
    } else if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setPromoError("This promo code has reached its usage limit.");
      setPromoData(null);
    } else {
      setPromoData(data);
    }
    setPromoLoading(false);
  }

  function validateStep() {
    setError("");
    if (step === 1) {
      if (!eventTitle.trim()) { setError("Please enter an event title."); return false; }
      if (attendees < 1) { setError("Attendees must be at least 1."); return false; }
      if (attendees > facility.capacity) { setError(`Maximum capacity is ${facility.capacity}.`); return false; }
    }
    if (step === 2) {
      if (!contactName.trim()) { setError("Please enter your name."); return false; }
      if (!contactEmail.trim() || !contactEmail.includes("@")) { setError("Please enter a valid email."); return false; }
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setError("");

    const bookingRef = generateBookingRef();

    try {
      let paymentIntentId = null;
      let paymentStatus = "pending";

      if (needsPayment && paymentSettings.provider === "stripe") {
        if (!cardElement || !stripe) {
          setError("Payment form not ready. Please wait.");
          setSubmitting(false);
          return;
        }
        // Create payment intent via worker
        const intentRes = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: "usd",
            bookingRef,
            description: `${facility.name} — ${eventTitle}`,
          }),
        });
        const intentData = await intentRes.json();
        if (!intentData.clientSecret) {
          setError(intentData.error || "Payment setup failed.");
          setSubmitting(false);
          return;
        }
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          { payment_method: { card: cardElement, billing_details: { name: contactName, email: contactEmail } } }
        );
        if (stripeError) {
          setPaymentError(stripeError.message);
          setSubmitting(false);
          return;
        }
        paymentIntentId = paymentIntent.id;
        paymentStatus = "paid";
      }

      const { data: booking, error: dbError } = await supabase.from("bookings").insert({
        booking_ref: bookingRef,
        facility_id: facility.id,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        organization,
        event_title: eventTitle,
        event_type: eventType,
        event_description: eventDesc,
        attendees,
        start_datetime: startDT,
        end_datetime: endDT,
        amenities_requested: JSON.stringify(requestedAmenities),
        special_requests: specialRequests,
        status: facility.requires_approval ? "pending" : "confirmed",
        payment_status: needsPayment ? paymentStatus : "waived",
        payment_amount: total,
        payment_provider: paymentSettings?.provider,
        payment_intent_id: paymentIntentId,
        promo_code: promoData ? promoCode.toUpperCase() : null,
        discount_amount: discount,
      }).select().single();

      if (dbError) throw dbError;

      if (promoData) {
        await supabase.from("promo_codes").update({ used_count: promoData.used_count + 1 }).eq("id", promoData.id);
      }

      navigate("/facilities/confirmation", { state: { booking, facility, locationName: facility.locations?.name } });
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    }
    setSubmitting(false);
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <div className="facilities-page">
      <div className="fac-wizard-header">
        <div className="fac-container">
          <Link to={`/facilities/${facility.id}`} className="fac-back">← Back to Facility</Link>
          <h1 className="fac-wizard-title">Book {facility.name}</h1>
          <p className="fac-wizard-sub">📍 {facility.locations?.name} · {facility.locations?.city}</p>
        </div>
      </div>

      <div className="fac-container fac-wizard-body">
        <StepIndicator current={step} />

        <div className="fac-wizard-content">
          {/* Step 0: Date & Time summary */}
          {step === 0 && (
            <div className="fac-wizard-step-content">
              <h2 className="fac-wizard-sec-title">Confirm Your Time Slot</h2>
              <div className="fac-confirm-grid">
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">Date</span>
                  <span className="fac-confirm-value">{formatDate(selectedDate + "T12:00:00")}</span>
                </div>
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">Start Time</span>
                  <span className="fac-confirm-value">{formatTime(selectedStart)}</span>
                </div>
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">End Time</span>
                  <span className="fac-confirm-value">{formatTime(selectedEnd)}</span>
                </div>
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">Duration</span>
                  <span className="fac-confirm-value">{hours} hour{hours !== 1 ? "s" : ""}</span>
                </div>
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">Facility</span>
                  <span className="fac-confirm-value">{facility.name}</span>
                </div>
                <div className="fac-confirm-item">
                  <span className="fac-confirm-label">Estimated Cost</span>
                  <span className="fac-confirm-value fac-confirm-price">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="fac-wizard-step-content">
              <h2 className="fac-wizard-sec-title">Event Details</h2>
              <div className="fac-form-grid">
                <div className="fac-form-group fac-form-full">
                  <label className="fac-form-label">Event Title *</label>
                  <input className="fac-input" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Annual Community Dinner" />
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Event Type *</label>
                  <select className="fac-input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Expected Attendees *</label>
                  <input className="fac-input" type="number" min={1} max={facility.capacity} value={attendees} onChange={(e) => setAttendees(parseInt(e.target.value) || 1)} />
                  <span className="fac-form-hint">Max capacity: {facility.capacity.toLocaleString()}</span>
                </div>
                <div className="fac-form-group fac-form-full">
                  <label className="fac-form-label">Event Description</label>
                  <textarea className="fac-input fac-textarea" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Brief description of your event…" rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="fac-wizard-step-content">
              <h2 className="fac-wizard-sec-title">Contact Information</h2>
              <div className="fac-form-grid">
                <div className="fac-form-group">
                  <label className="fac-form-label">Full Name *</label>
                  <input className="fac-input" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Email Address *</label>
                  <input className="fac-input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Phone Number</label>
                  <input className="fac-input" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 555-5555" />
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Organization / School</label>
                  <input className="fac-input" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Springfield Community Club" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="fac-wizard-step-content">
              <h2 className="fac-wizard-sec-title">Amenities & Requests</h2>
              {amenitiesList.length > 0 && (
                <>
                  <p className="fac-wizard-hint">Select any amenities you'll need for your event:</p>
                  <div className="fac-amenity-checkboxes">
                    {amenitiesList.map((a, i) => (
                      <label key={i} className="fac-amenity-check-label">
                        <input
                          type="checkbox"
                          checked={requestedAmenities.includes(a)}
                          onChange={(e) => {
                            setRequestedAmenities((prev) =>
                              e.target.checked ? [...prev, a] : prev.filter((x) => x !== a)
                            );
                          }}
                        />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="fac-form-group fac-form-full" style={{ marginTop: "1.5rem" }}>
                <label className="fac-form-label">Special Requests or Setup Notes</label>
                <textarea
                  className="fac-input fac-textarea"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any specific setup requirements, accessibility needs, or other notes…"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Pay */}
          {step === 4 && (
            <div className="fac-wizard-step-content">
              <h2 className="fac-wizard-sec-title">Review & Complete Booking</h2>

              {/* Summary */}
              <div className="fac-review-box">
                <h3 className="fac-review-section-title">Booking Summary</h3>
                <div className="fac-review-grid">
                  <div className="fac-review-row"><span>Facility</span><span>{facility.name}</span></div>
                  <div className="fac-review-row"><span>Location</span><span>{facility.locations?.name}</span></div>
                  <div className="fac-review-row"><span>Date</span><span>{formatDate(selectedDate + "T12:00:00")}</span></div>
                  <div className="fac-review-row"><span>Time</span><span>{formatTime(selectedStart)} – {formatTime(selectedEnd)}</span></div>
                  <div className="fac-review-row"><span>Duration</span><span>{hours} hour{hours !== 1 ? "s" : ""}</span></div>
                  <div className="fac-review-row"><span>Event</span><span>{eventTitle}</span></div>
                  <div className="fac-review-row"><span>Attendees</span><span>{attendees}</span></div>
                  <div className="fac-review-row"><span>Contact</span><span>{contactName} · {contactEmail}</span></div>
                  {organization && <div className="fac-review-row"><span>Organization</span><span>{organization}</span></div>}
                  {requestedAmenities.length > 0 && (
                    <div className="fac-review-row"><span>Amenities</span><span>{requestedAmenities.join(", ")}</span></div>
                  )}
                </div>
              </div>

              {/* Promo Code */}
              <div className="fac-promo-section">
                <label className="fac-form-label">Promo Code</label>
                <div className="fac-promo-row">
                  <input
                    className="fac-input"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoData(null); setPromoError(""); }}
                    placeholder="Enter code"
                    style={{ flex: 1 }}
                  />
                  <button className="fac-btn-ghost fac-btn-sm" onClick={checkPromo} disabled={promoLoading}>
                    {promoLoading ? "…" : "Apply"}
                  </button>
                </div>
                {promoError && <p className="fac-error-msg">{promoError}</p>}
                {promoData && (
                  <p className="fac-success-msg">
                    ✓ {promoData.discount_type === "percentage" ? `${promoData.discount_value}% off` : `${formatCurrency(promoData.discount_value)} off`} applied!
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="fac-price-breakdown">
                <div className="fac-price-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="fac-price-row fac-price-discount"><span>Discount ({promoCode})</span><span>− {formatCurrency(discount)}</span></div>}
                <div className="fac-price-row fac-price-total"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              {/* Payment */}
              {needsPayment && paymentSettings?.provider === "stripe" && (
                <div className="fac-payment-section">
                  <h3 className="fac-review-section-title">Payment</h3>
                  <div className="fac-stripe-card-wrap">
                    <div ref={cardRef} className="fac-stripe-card-element" />
                  </div>
                  {!paymentSettings?.stripe_publishable_key && (
                    <p className="fac-error-msg">Stripe is not configured. Contact admin.</p>
                  )}
                  {paymentError && <p className="fac-error-msg">{paymentError}</p>}
                </div>
              )}

              {!needsPayment && (
                <div className="fac-free-notice">
                  {total === 0 ? "✓ No payment required for this booking." : "✓ Payment will be collected at the facility."}
                </div>
              )}

              {facility.requires_approval && (
                <div className="fac-approval-notice">
                  ⚠️ This facility requires admin approval. Your booking will be reviewed within 1–2 business days.
                </div>
              )}
            </div>
          )}

          {error && <p className="fac-error-msg fac-error-global">{error}</p>}

          {/* Navigation */}
          <div className="fac-wizard-nav">
            {step > 0 && (
              <button className="fac-btn-ghost" onClick={back} disabled={submitting}>← Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="fac-btn-primary" onClick={next}>Continue →</button>
            ) : (
              <button className="fac-btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Processing…" : needsPayment ? `Pay ${formatCurrency(total)} & Confirm` : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
