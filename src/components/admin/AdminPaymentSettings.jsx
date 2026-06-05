import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminNav from "../AdminNav";

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.from("payment_settings").select("*").eq("is_active", true).single()
      .then(({ data }) => {
        setSettings(data || { provider: "free", currency: "USD", allow_free_bookings: false, require_payment_upfront: true });
        setLoading(false);
      });
  }, []);

  function set(k, v) { setSettings((s) => ({ ...s, [k]: v })); }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      provider: settings.provider,
      stripe_publishable_key: settings.stripe_publishable_key || null,
      square_app_id: settings.square_app_id || null,
      square_location_id: settings.square_location_id || null,
      allow_free_bookings: settings.allow_free_bookings,
      require_payment_upfront: settings.require_payment_upfront,
      currency: settings.currency || "USD",
      updated_at: new Date().toISOString(),
    };
    if (settings.id) {
      const { error: e } = await supabase.from("payment_settings").update(payload).eq("id", settings.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { data, error: e } = await supabase.from("payment_settings").insert({ ...payload, is_active: true }).select().single();
      if (e) { setError(e.message); setSaving(false); return; }
      setSettings(data);
    }
    setSuccess("Payment settings saved successfully.");
    setSaving(false);
  }

  if (loading) return <div className="admin-page"><AdminNav /><div className="admin-content fac-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">Payment Settings</h1>
            <p className="admin-sub">Configure how users pay for facility bookings</p>
          </div>
        </div>

        {error && <p className="fac-error-msg">{error}</p>}
        {success && <p className="fac-success-msg">{success}</p>}

        <div className="fac-payment-settings">
          {/* Provider Selection */}
          <div className="fac-detail-card">
            <h3 className="fac-detail-card-title">Payment Provider</h3>
            <div className="fac-provider-cards">
              {[
                { value: "stripe", label: "Stripe", desc: "Accept cards, Apple Pay, Google Pay. Industry-leading checkout experience.", badge: "Recommended" },
                { value: "square", label: "Square", desc: "Accept cards with Square's payment ecosystem. Great for in-person + online." },
                { value: "free", label: "No Payment / Free", desc: "Disable online payment. Bookings are free or payment collected offline." },
              ].map((p) => (
                <label key={p.value} className={`fac-provider-card${settings.provider === p.value ? " selected" : ""}`}>
                  <input
                    type="radio"
                    name="provider"
                    value={p.value}
                    checked={settings.provider === p.value}
                    onChange={() => set("provider", p.value)}
                  />
                  <div className="fac-provider-card-body">
                    <div className="fac-provider-card-header">
                      <span className="fac-provider-label">{p.label}</span>
                      {p.badge && <span className="fac-provider-badge">{p.badge}</span>}
                    </div>
                    <p className="fac-provider-desc">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stripe Config */}
          {settings.provider === "stripe" && (
            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Stripe Configuration</h3>
              <div className="fac-payment-notice">
                <strong>Security Note:</strong> Your Stripe publishable key (safe for frontend) is stored here.
                Your <strong>Stripe Secret Key</strong> must be set as a Cloudflare Worker environment variable named{" "}
                <code>STRIPE_SECRET_KEY</code> via the Cloudflare dashboard for security.
              </div>
              <div className="fac-form-grid">
                <div className="fac-form-group fac-form-full">
                  <label className="fac-form-label">Publishable Key (pk_live_… or pk_test_…)</label>
                  <input
                    className="fac-input"
                    value={settings.stripe_publishable_key || ""}
                    onChange={(e) => set("stripe_publishable_key", e.target.value)}
                    placeholder="pk_test_..."
                  />
                  <span className="fac-form-hint">Found in your Stripe Dashboard → Developers → API Keys</span>
                </div>
              </div>
              <div className="fac-stripe-links">
                <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noreferrer" className="fac-btn-ghost fac-btn-sm">
                  Open Stripe Dashboard ↗
                </a>
                <a href="https://dashboard.cloudflare.com" target="_blank" rel="noreferrer" className="fac-btn-ghost fac-btn-sm">
                  Set Secret Key in Cloudflare ↗
                </a>
              </div>
            </div>
          )}

          {/* Square Config */}
          {settings.provider === "square" && (
            <div className="fac-detail-card">
              <h3 className="fac-detail-card-title">Square Configuration</h3>
              <div className="fac-payment-notice">
                <strong>Security Note:</strong> App ID and Location ID are stored here (safe for frontend).
                Your <strong>Square Access Token</strong> must be set as a Cloudflare Worker environment variable named{" "}
                <code>SQUARE_ACCESS_TOKEN</code> for security.
              </div>
              <div className="fac-form-grid">
                <div className="fac-form-group">
                  <label className="fac-form-label">Application ID</label>
                  <input
                    className="fac-input"
                    value={settings.square_app_id || ""}
                    onChange={(e) => set("square_app_id", e.target.value)}
                    placeholder="sandbox-sq0idb-..."
                  />
                </div>
                <div className="fac-form-group">
                  <label className="fac-form-label">Location ID</label>
                  <input
                    className="fac-input"
                    value={settings.square_location_id || ""}
                    onChange={(e) => set("square_location_id", e.target.value)}
                    placeholder="Your Square Location ID"
                  />
                </div>
              </div>
              <div className="fac-stripe-links">
                <a href="https://developer.squareup.com/apps" target="_blank" rel="noreferrer" className="fac-btn-ghost fac-btn-sm">
                  Open Square Developer Dashboard ↗
                </a>
              </div>
            </div>
          )}

          {/* General Options */}
          <div className="fac-detail-card">
            <h3 className="fac-detail-card-title">Booking Options</h3>
            <div className="fac-form-grid">
              <div className="fac-form-group">
                <label className="fac-form-label">Currency</label>
                <select className="fac-input" value={settings.currency || "USD"} onChange={(e) => set("currency", e.target.value)}>
                  {["USD", "CAD", "GBP", "AUD", "EUR"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="fac-form-group">
                <label className="fac-check-label">
                  <input type="checkbox" checked={settings.allow_free_bookings} onChange={(e) => set("allow_free_bookings", e.target.checked)} />
                  Allow $0 bookings (free facilities skip payment)
                </label>
              </div>
              <div className="fac-form-group">
                <label className="fac-check-label">
                  <input type="checkbox" checked={settings.require_payment_upfront} onChange={(e) => set("require_payment_upfront", e.target.checked)} />
                  Require payment before booking is confirmed
                </label>
              </div>
            </div>
          </div>

          <div className="fac-form-actions">
            <button className="fac-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Payment Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
