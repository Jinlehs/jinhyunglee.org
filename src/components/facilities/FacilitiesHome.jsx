import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatCurrency, FACILITY_TYPES } from "../../lib/bookingUtils";

export default function FacilitiesHome() {
  const [locations, setLocations] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [{ data: locs }, { data: facs }] = await Promise.all([
        supabase.from("locations").select("*").eq("active", true).order("name"),
        supabase.from("facilities").select("*, locations(name, city, state)").eq("active", true).limit(6),
      ]);
      setLocations(locs || []);
      setFeatured(facs || []);
      setLoading(false);
    }
    load();
  }, []);

  const typeLabel = (t) => FACILITY_TYPES.find((f) => f.value === t)?.label || t;

  return (
    <div className="facilities-page">
      {/* Hero */}
      <section className="fac-hero">
        <div className="fac-hero-inner">
          <span className="fac-badge">Springfield School Division</span>
          <h1 className="fac-hero-title">
            Book World-Class<br />School Facilities
          </h1>
          <p className="fac-hero-sub">
            Reserve gymnasiums, auditoriums, fields, meeting rooms and more across
            five premier K–12 locations. Transparent pricing, instant availability.
          </p>
          <div className="fac-hero-actions">
            <Link to="/facilities/browse" className="fac-btn-primary">Browse All Facilities</Link>
            <a href="#locations" className="fac-btn-ghost">View Locations</a>
          </div>
        </div>
        <div className="fac-hero-stats">
          <div className="fac-stat">
            <span className="fac-stat-num">5</span>
            <span className="fac-stat-label">Locations</span>
          </div>
          <div className="fac-stat">
            <span className="fac-stat-num">14</span>
            <span className="fac-stat-label">Facilities</span>
          </div>
          <div className="fac-stat">
            <span className="fac-stat-num">2,500+</span>
            <span className="fac-stat-label">Seats & Capacity</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="fac-section fac-how">
        <div className="fac-container">
          <h2 className="fac-section-title">How It Works</h2>
          <div className="fac-steps">
            {[
              { n: "01", title: "Find a Facility", desc: "Browse our locations and filter by type, capacity, or date." },
              { n: "02", title: "Check Availability", desc: "View real-time availability on our interactive calendar." },
              { n: "03", title: "Book & Pay", desc: "Complete your booking in minutes with secure online payment." },
              { n: "04", title: "Get Confirmed", desc: "Receive your confirmation and booking reference instantly." },
            ].map((s) => (
              <div className="fac-step" key={s.n}>
                <span className="fac-step-num">{s.n}</span>
                <h3 className="fac-step-title">{s.title}</h3>
                <p className="fac-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Facilities */}
      <section className="fac-section" id="featured">
        <div className="fac-container">
          <div className="fac-section-header">
            <h2 className="fac-section-title">Featured Spaces</h2>
            <Link to="/facilities/browse" className="fac-link-all">View all →</Link>
          </div>
          {loading ? (
            <div className="fac-loading">Loading facilities…</div>
          ) : (
            <div className="fac-grid">
              {featured.map((f) => (
                <Link key={f.id} to={`/facilities/${f.id}`} className="fac-card">
                  <div className="fac-card-header">
                    <span className="fac-card-type">{typeLabel(f.facility_type)}</span>
                    {f.requires_approval && (
                      <span className="fac-card-approval">Approval required</span>
                    )}
                  </div>
                  <h3 className="fac-card-name">{f.name}</h3>
                  <p className="fac-card-location">
                    📍 {f.locations?.name} · {f.locations?.city}
                  </p>
                  <p className="fac-card-desc">{f.description?.substring(0, 100)}…</p>
                  <div className="fac-card-footer">
                    <span className="fac-card-cap">Up to {f.capacity.toLocaleString()} guests</span>
                    <span className="fac-card-price">
                      From {formatCurrency(f.hourly_rate)}/hr
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Locations */}
      <section className="fac-section fac-section-alt" id="locations">
        <div className="fac-container">
          <h2 className="fac-section-title">Our Locations</h2>
          {loading ? (
            <div className="fac-loading">Loading locations…</div>
          ) : (
            <div className="fac-locations-grid">
              {locations.map((loc) => (
                <Link
                  key={loc.id}
                  to={`/facilities/browse?location=${loc.id}`}
                  className="fac-location-card"
                >
                  <h3 className="fac-location-name">{loc.name}</h3>
                  <p className="fac-location-addr">
                    {loc.address}, {loc.city}, {loc.state} {loc.zip}
                  </p>
                  <p className="fac-location-desc">
                    {loc.description?.substring(0, 120)}…
                  </p>
                  <div className="fac-location-contact">
                    {loc.phone && <span>📞 {loc.phone}</span>}
                    {loc.email && <span>✉ {loc.email}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="fac-cta">
        <div className="fac-container">
          <h2 className="fac-cta-title">Ready to book your event?</h2>
          <p className="fac-cta-sub">
            All bookings include access to our support team and detailed setup guides.
          </p>
          <Link to="/facilities/browse" className="fac-btn-primary fac-btn-lg">
            Browse Facilities
          </Link>
        </div>
      </section>
    </div>
  );
}
