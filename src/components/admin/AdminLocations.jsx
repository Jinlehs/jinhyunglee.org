import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminNav from "../AdminNav";

function LocationForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: "", address: "", city: "Springfield", state: "IL", zip: "",
    phone: "", email: "", description: "", active: true,
    ...initial,
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="fac-admin-form-wrap">
      <div className="fac-form-grid">
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Location Name *</label>
          <input className="fac-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Street Address *</label>
          <input className="fac-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">City</label>
          <input className="fac-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">State</label>
          <input className="fac-input" value={form.state} onChange={(e) => set("state", e.target.value)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">ZIP Code</label>
          <input className="fac-input" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
        </div>
        <div className="fac-form-group">
          <label className="fac-form-label">Phone</label>
          <input className="fac-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Email</label>
          <input className="fac-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="fac-form-group fac-form-full">
          <label className="fac-form-label">Description</label>
          <textarea className="fac-input fac-textarea" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
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
          {saving ? "Saving…" : "Save Location"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLocations() {
  const { locationId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const action = pathname.includes("/new") ? "new" : locationId ? "edit" : "list";
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState("");

  const isNew = action === "new";
  const isEdit = action === "edit" && locationId;

  useEffect(() => {
    if (!isNew && !isEdit) {
      supabase.from("locations").select("*, facilities(count)").order("name")
        .then(({ data }) => { setLocations(data || []); setLoading(false); });
    }
    if (isEdit) {
      supabase.from("locations").select("*").eq("id", locationId).single()
        .then(({ data }) => { setEditData(data); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [action, locationId]);

  async function handleSave(form) {
    if (!form.name || !form.address) { setError("Name and address are required."); return; }
    setSaving(true);
    setError("");
    const payload = { name: form.name, address: form.address, city: form.city, state: form.state, zip: form.zip, phone: form.phone, email: form.email, description: form.description, active: form.active };
    if (isEdit) {
      const { error: e } = await supabase.from("locations").update(payload).eq("id", locationId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("locations").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false);
    navigate("/admin/facilities/locations");
  }

  async function toggleActive(loc) {
    await supabase.from("locations").update({ active: !loc.active }).eq("id", loc.id);
    setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, active: !l.active } : l));
  }

  async function deleteLocation(id) {
    if (!confirm("Delete this location and all its facilities? This cannot be undone.")) return;
    await supabase.from("locations").delete().eq("id", id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">
              {isNew ? "Add Location" : isEdit ? "Edit Location" : "Locations"}
            </h1>
          </div>
          {!isNew && !isEdit && (
            <Link to="/admin/facilities/locations/new" className="fac-btn-primary fac-btn-sm">+ Add Location</Link>
          )}
        </div>

        {error && <p className="fac-error-msg">{error}</p>}

        {(isNew || isEdit) ? (
          loading ? <div className="fac-loading">Loading…</div> : (
            <LocationForm
              initial={editData || {}}
              onSave={handleSave}
              onCancel={() => navigate("/admin/facilities/locations")}
              saving={saving}
            />
          )
        ) : (
          loading ? <div className="fac-loading">Loading…</div> : (
            <div className="fac-admin-table-wrap">
              {locations.length === 0 ? (
                <div className="fac-empty-state">
                  <p>No locations yet.</p>
                  <Link to="/admin/facilities/locations/new" className="fac-btn-primary fac-btn-sm">Add your first location</Link>
                </div>
              ) : (
                <table className="fac-admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Address</th><th>Phone</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.name}</strong></td>
                        <td>{l.address}, {l.city}, {l.state}</td>
                        <td>{l.phone || "—"}</td>
                        <td>
                          <button className={`fac-toggle-btn${l.active ? " active" : ""}`} onClick={() => toggleActive(l)}>
                            {l.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="fac-table-actions">
                          <Link to={`/admin/facilities/locations/edit/${l.id}`} className="fac-btn-ghost fac-btn-xs">Edit</Link>
                          <Link to={`/admin/facilities/list?location=${l.id}`} className="fac-btn-ghost fac-btn-xs">Facilities</Link>
                          <button className="fac-btn-danger fac-btn-xs" onClick={() => deleteLocation(l.id)}>Delete</button>
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
