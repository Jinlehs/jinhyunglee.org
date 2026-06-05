import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatCurrency, FACILITY_TYPES } from "../../lib/bookingUtils";

export default function FacilitiesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [facilities, setFacilities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterLocation = searchParams.get("location") || "";
  const filterType = searchParams.get("type") || "";
  const filterSearch = searchParams.get("q") || "";
  const filterCapacity = searchParams.get("cap") || "";

  useEffect(() => {
    supabase.from("locations").select("id, name").eq("active", true).order("name")
      .then(({ data }) => setLocations(data || []));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from("facilities")
        .select("*, locations(id, name, city, state)")
        .eq("active", true);
      if (filterLocation) q = q.eq("location_id", filterLocation);
      if (filterType) q = q.eq("facility_type", filterType);
      if (filterCapacity) q = q.gte("capacity", parseInt(filterCapacity));
      const { data } = await q.order("name");
      let results = data || [];
      if (filterSearch) {
        const s = filterSearch.toLowerCase();
        results = results.filter(
          (f) =>
            f.name.toLowerCase().includes(s) ||
            f.description?.toLowerCase().includes(s) ||
            f.locations?.name?.toLowerCase().includes(s)
        );
      }
      setFacilities(results);
      setLoading(false);
    }
    load();
  }, [filterLocation, filterType, filterSearch, filterCapacity]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  const typeLabel = (t) => FACILITY_TYPES.find((f) => f.value === t)?.label || t;
  const hasFilters = filterLocation || filterType || filterSearch || filterCapacity;

  return (
    <div className="facilities-page">
      <div className="fac-browse-header">
        <div className="fac-container">
          <h1 className="fac-browse-title">Find a Facility</h1>
          <p className="fac-browse-sub">
            Browse and filter from {facilities.length} available spaces across Springfield.
          </p>
        </div>
      </div>

      <div className="fac-container fac-browse-body">
        {/* Filters */}
        <aside className="fac-filters">
          <div className="fac-filter-section">
            <label className="fac-filter-label">Search</label>
            <input
              className="fac-input"
              type="text"
              placeholder="Name, location…"
              value={filterSearch}
              onChange={(e) => setParam("q", e.target.value)}
            />
          </div>
          <div className="fac-filter-section">
            <label className="fac-filter-label">Location</label>
            <select
              className="fac-input"
              value={filterLocation}
              onChange={(e) => setParam("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="fac-filter-section">
            <label className="fac-filter-label">Facility Type</label>
            <select
              className="fac-input"
              value={filterType}
              onChange={(e) => setParam("type", e.target.value)}
            >
              <option value="">All Types</option>
              {FACILITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="fac-filter-section">
            <label className="fac-filter-label">Min. Capacity</label>
            <select
              className="fac-input"
              value={filterCapacity}
              onChange={(e) => setParam("cap", e.target.value)}
            >
              <option value="">Any Size</option>
              {[25, 50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>{n}+ guests</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              className="fac-btn-ghost fac-btn-sm"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="fac-results">
          {loading ? (
            <div className="fac-loading">Loading…</div>
          ) : facilities.length === 0 ? (
            <div className="fac-empty">
              <p>No facilities match your search.</p>
              <button className="fac-btn-ghost fac-btn-sm" onClick={() => setSearchParams({})}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="fac-grid fac-grid-2">
              {facilities.map((f) => (
                <Link key={f.id} to={`/facilities/${f.id}`} className="fac-card">
                  <div className="fac-card-header">
                    <span className="fac-card-type">{typeLabel(f.facility_type)}</span>
                    {f.requires_approval && (
                      <span className="fac-card-approval">Approval required</span>
                    )}
                  </div>
                  <h3 className="fac-card-name">{f.name}</h3>
                  <p className="fac-card-location">
                    📍 {f.locations?.name} · {f.locations?.city}, {f.locations?.state}
                  </p>
                  <p className="fac-card-desc">{f.description?.substring(0, 130)}…</p>
                  <div className="fac-amenities-preview">
                    {(JSON.parse(f.amenities || "[]")).slice(0, 3).map((a, i) => (
                      <span key={i} className="fac-amenity-tag">{a}</span>
                    ))}
                    {(JSON.parse(f.amenities || "[]")).length > 3 && (
                      <span className="fac-amenity-more">
                        +{JSON.parse(f.amenities || "[]").length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="fac-card-footer">
                    <span className="fac-card-cap">👥 Up to {f.capacity.toLocaleString()}</span>
                    <div className="fac-card-pricing">
                      <span className="fac-card-price">
                        {formatCurrency(f.hourly_rate)}/hr
                      </span>
                      {f.full_day_rate && (
                        <span className="fac-card-price-alt">
                          · {formatCurrency(f.full_day_rate)} full day
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
