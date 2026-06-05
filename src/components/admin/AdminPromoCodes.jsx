import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "", discount_type: "percentage", discount_value: "",
    max_uses: "", valid_from: "", valid_until: "", active: true,
  });

  useEffect(() => {
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCodes(data || []); setLoading(false); });
  }, []);

  function setF(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleAdd() {
    if (!form.code || !form.discount_value) { setError("Code and discount value are required."); return; }
    setSaving(true);
    setError("");
    const { data, error: e } = await supabase.from("promo_codes").insert({
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      active: form.active,
    }).select().single();
    if (e) { setError(e.message); setSaving(false); return; }
    setCodes((prev) => [data, ...prev]);
    setForm({ code: "", discount_type: "percentage", discount_value: "", max_uses: "", valid_from: "", valid_until: "", active: true });
    setSaving(false);
  }

  async function toggleActive(code) {
    await supabase.from("promo_codes").update({ active: !code.active }).eq("id", code.id);
    setCodes((prev) => prev.map((c) => c.id === code.id ? { ...c, active: !c.active } : c));
  }

  async function deleteCode(id) {
    if (!confirm("Delete this promo code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }

  const discountDisplay = (c) =>
    c.discount_type === "percentage" ? `${c.discount_value}% off` : `${formatCurrency(c.discount_value)} off`;

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">Promo Codes</h1>
          </div>
        </div>

        {error && <p className="fac-error-msg">{error}</p>}

        {/* Add Form */}
        <div className="fac-detail-card">
          <h3 className="fac-detail-card-title">Create Promo Code</h3>
          <div className="fac-form-grid">
            <div className="fac-form-group">
              <label className="fac-form-label">Code *</label>
              <input className="fac-input" value={form.code} onChange={(e) => setF("code", e.target.value.toUpperCase())} placeholder="SUMMER25" />
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label">Discount Type</label>
              <select className="fac-input" value={form.discount_type} onChange={(e) => setF("discount_type", e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label">Discount Value *</label>
              <input className="fac-input" type="number" min={0} step={form.discount_type === "percentage" ? "1" : "0.01"} max={form.discount_type === "percentage" ? "100" : undefined} value={form.discount_value} onChange={(e) => setF("discount_value", e.target.value)} placeholder={form.discount_type === "percentage" ? "e.g. 10" : "e.g. 25.00"} />
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label">Max Uses (blank = unlimited)</label>
              <input className="fac-input" type="number" min={1} value={form.max_uses} onChange={(e) => setF("max_uses", e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label">Valid From</label>
              <input className="fac-input" type="date" value={form.valid_from} onChange={(e) => setF("valid_from", e.target.value)} />
            </div>
            <div className="fac-form-group">
              <label className="fac-form-label">Valid Until</label>
              <input className="fac-input" type="date" value={form.valid_until} onChange={(e) => setF("valid_until", e.target.value)} />
            </div>
            <div className="fac-form-group">
              <label className="fac-check-label">
                <input type="checkbox" checked={form.active} onChange={(e) => setF("active", e.target.checked)} />
                Active immediately
              </label>
            </div>
          </div>
          <button className="fac-btn-primary fac-btn-sm" onClick={handleAdd} disabled={saving}>
            {saving ? "Creating…" : "Create Promo Code"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="fac-loading">Loading…</div>
        ) : codes.length === 0 ? (
          <div className="fac-empty-state">No promo codes yet.</div>
        ) : (
          <div className="fac-admin-table-wrap">
            <table className="fac-admin-table">
              <thead>
                <tr><th>Code</th><th>Discount</th><th>Uses</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td><code className="fac-code fac-code-lg">{c.code}</code></td>
                    <td>{discountDisplay(c)}</td>
                    <td>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}</td>
                    <td>{c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "No expiry"}</td>
                    <td>
                      <button className={`fac-toggle-btn${c.active ? " active" : ""}`} onClick={() => toggleActive(c)}>
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="fac-table-actions">
                      <button className="fac-btn-danger fac-btn-xs" onClick={() => deleteCode(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
