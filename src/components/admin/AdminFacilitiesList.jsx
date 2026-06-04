import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FACILITY_TYPES, formatCurrency } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

function parseAmenities(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join("\n");
  try { return JSON.parse(raw).join("\n"); } catch { return raw; }
}

function FacilityForm({ initial, locations, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    location_id: locations[0]?.id || "",
    name: "", description: "", capacity: 50,
    hourly_rate: 0, half_day_rate: "", full_day_rate: "",
    facility_type: "multipurpose",
    requires_approval: false, min_booking_hours: 1,
    max_booking_hours: 8, advance_booking_days: 90, active: true,
    ...initial,
    amenities: parseAmenities(initial?.amenities),
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="fac-admin-form-wrap">
      <div className="fac-form-grid">
        <div className="fac-form-group">
          <label className="fac-form-label">Location *</label>
          <select className="fac-input" value={form.location_id} onChange={(e) => set("location_id", e.target.value)}>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Facility Type *</label>
          <select className="fac-input" value={form.facility_type} onChange={(e) => set("facility_type", e.target.value)}>
            {FACILITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Facility Name *</label>
          <input className="fac-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Description</label>
          <textarea className="fac-input fac-textarea" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Capacity *</label>
          <input className="fac-input" type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", parseInt(e.target.value) || 1)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Hourly Rate ($) *</label>
          <input className="fac-input" type="number" min={0} step="0.01" value={form.hourly_rate} onChange={(e) => set("hourly_rate", parseFloat(e.target.value) || 0)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Half-Day Rate ($)</label>
          <input className="fac-input" type="number" min={0} step="0.01" value={form.half_day_rate} onChange={(e) => set("half_day_rate", e.target.value)} placeholder="Leave blank to use hourly" />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Full-Day Rate ($)</label>
          <input className="fac-input" type="number" min={0} step="0.01" value={form.full_day_rate} onChange={(e) => set("full_day_rate", e.target.value)} placeholder="Leave blank to use hourly" />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Min Booking Hours</label>
          <input className="fac-input" type="number" min={1} max={24} value={form.min_booking_hours} onChange={(e) => set("min_booking_hours", parseInt(e.target.value) || 1)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Max Booking Hours</label>
          <input className="fac-input" type="number" min={1} max={24} value={form.max_booking_hours} onChange={(e) => set("max_booking_hours", parseInt(e.target.value) || 8)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Advance Booking Days</label>
          <input className="fac-input" type="number" min={1} max={365} value={form.advance_booking_days} onChange={(e) => set("advance_booking_days", parseInt(e.target.value) || 90)} />
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Amenities (one per line)</label>
          <textarea className="fac-input fac-textarea" rows={5} value={form.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="Basketball hoops&#10;Sound system&#10;Bleacher seating" />
        </div>
        <div className="fac-form-group">
          <label className="fac-check-label">
            <input type="checkbox" checked={form.requires_approval} onChange={(e) => set("requires_approval", e.target.checked)} />
            Requires Admin Approval
          </label>
        </div>
        <div className="fac-form-group">
          <label className="fac-check-label">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
            Active (visible to public)
          </label>
        </div>
      </div>
      <div className="fac-form-actions">
        <button className="fac-btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="fac-btn-primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? "Saving…" : "Save Facility"}
        </button>
      </div>
    </div>
  );
}

export default function AdminFacilitiesList() {
  const { facilityId } = useParams();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = pathname.includes("/new") ? "new" : facilityId ? "edit" : "list";
  const [facilities, setFacilities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState("");

  const isNew = action === "new";
  const isEdit = action === "edit" && facilityId;
  const filterLocation = searchParams.get("location") || "";

  useEffect(() => {
    supabase.from("locations").select("id, name").eq("active", true).order("name")
      .then(({ data }) => setLocations(data || []));
  }, []);

  useEffect(() => {
    if (!isNew && !isEdit) {
      let q = supabase.from("facilities").select("*, locations(name)").order("name");
      if (filterLocation) q = q.eq("location_id", filterLocation);
      q.then(({ data }) => { setFacilities(data || []); setLoading(false); });
    }
    if (isEdit) {
      supabase.from("facilities").select("*").eq("id", facilityId).single()
        .then(({ data }) => { setEditData(data); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [action, facilityId, filterLocation]);

  async function handleSave(form) {
    if (!form.name || !form.location_id) { setError("Name and location are required."); return; }
    setSaving(true);
    setError("");
    const amenitiesArr = form.amenities.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = {
      location_id: form.location_id, name: form.name, description: form.description,
      capacity: form.capacity, hourly_rate: form.hourly_rate,
      half_day_rate: form.half_day_rate || null, full_day_rate: form.full_day_rate || null,
      amenities: JSON.stringify(amenitiesArr), facility_type: form.facility_type,
      requires_approval: form.requires_approval, min_booking_hours: form.min_booking_hours,
      max_booking_hours: form.max_booking_hours, advance_booking_days: form.advance_booking_days,
      active: form.active,
    };
    if (isEdit) {
      const { error: e } = await supabase.from("facilities").update(payload).eq("id", facilityId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("facilities").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false);
    navigate("/admin/facilities/list");
  }

  async function toggleActive(fac) {
    await supabase.from("facilities").update({ active: !fac.active }).eq("id", fac.id);
    setFacilities((prev) => prev.map((f) => f.id === fac.id ? { ...f, active: !f.active } : f));
  }

  async function deleteFacility(id) {
    if (!confirm("Delete this facility? This will also delete its schedules and blocks.")) return;
    await supabase.from("facilities").delete().eq("id", id);
    setFacilities((prev) => prev.filter((f) => f.id !== id));
  }

  const typeLabel = (t) => FACILITY_TYPES.find((f) => f.value === t)?.label || t;

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">
              {isNew ? "Add Facility" : isEdit ? "Edit Facility" : "Facilities"}
            </h1>
          </div>
          {!isNew && !isEdit && (
            <Link to="/admin/facilities/list/new" className="fac-btn-primary fac-btn-sm">+ Add Facility</Link>
          )}
        </div>

        {error && <p className="fac-error-msg">{error}</p>}

        {(isNew || isEdit) ? (
          loading ? <div className="fac-loading">Loading…</div> : (
            <FacilityForm
              initial={editData || {}}
              locations={locations}
              onSave={handleSave}
              onCancel={() => navigate("/admin/facilities/list")}
              saving={saving}
            />
          )
        ) : (
          loading ? <div className="fac-loading">Loading…</div> : (
            <div className="fac-admin-table-wrap">
              {facilities.length === 0 ? (
                <div className="fac-empty-state">
                  <p>No facilities yet.</p>
                  <Link to="/admin/facilities/list/new" className="fac-btn-primary fac-btn-sm">Add your first facility</Link>
                </div>
              ) : (
                <table className="fac-admin-table">
                  <thead>
                    <tr><th>Name</th><th>Location</th><th>Type</th><th>Capacity</th><th>Rate</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {facilities.map((f) => (
                      <tr key={f.id}>
                        <td><strong>{f.name}</strong></td>
                        <td>{f.locations?.name}</td>
                        <td>{typeLabel(f.facility_type)}</td>
                        <td>{f.capacity.toLocaleString()}</td>
                        <td>{formatCurrency(f.hourly_rate)}/hr</td>
                        <td>
                          <button className={`fac-toggle-btn${f.active ? " active" : ""}`} onClick={() => toggleActive(f)}>
                            {f.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="fac-table-actions">
                          <Link to={`/admin/facilities/list/edit/${f.id}`} className="fac-btn-ghost fac-btn-xs">Edit</Link>
                          <Link to={`/admin/facilities/schedules?facility=${f.id}`} className="fac-btn-ghost fac-btn-xs">Schedule</Link>
                          <Link to={`/facilities/${f.id}`} className="fac-btn-ghost fac-btn-xs" target="_blank">Preview</Link>
                          <button className="fac-btn-danger fac-btn-xs" onClick={() => deleteFacility(f.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
