import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DAYS_OF_WEEK, BLOCK_TYPES, formatTime } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

export default function AdminSchedules() {
  const [searchParams] = useSearchParams();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(searchParams.get("facility") || "");
  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New schedule form
  const [newSched, setNewSched] = useState({ day_of_week: 1, open_time: "16:00", close_time: "22:00" });
  // New block form
  const [newBlock, setNewBlock] = useState({ start_datetime: "", end_datetime: "", reason: "", block_type: "maintenance" });

  useEffect(() => {
    supabase.from("facilities").select("id, name, locations(name)").eq("active", true).order("name")
      .then(({ data }) => {
        setFacilities(data || []);
        if (!selectedFacility && data && data[0]) setSelectedFacility(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedFacility) return;
    setLoading(true);
    Promise.all([
      supabase.from("facility_schedules").select("*").eq("facility_id", selectedFacility).order("day_of_week"),
      supabase.from("facility_blocks").select("*").eq("facility_id", selectedFacility).order("start_datetime"),
    ]).then(([{ data: s }, { data: b }]) => {
      setSchedules(s || []);
      setBlocks(b || []);
      setLoading(false);
    });
  }, [selectedFacility]);

  async function addSchedule() {
    setSaving(true);
    setError("");
    const { error: e } = await supabase.from("facility_schedules").insert({
      facility_id: selectedFacility,
      day_of_week: parseInt(newSched.day_of_week),
      open_time: newSched.open_time,
      close_time: newSched.close_time,
      active: true,
    });
    if (e) { setError(e.message); setSaving(false); return; }
    const { data } = await supabase.from("facility_schedules").select("*").eq("facility_id", selectedFacility).order("day_of_week");
    setSchedules(data || []);
    setSaving(false);
  }

  async function deleteSchedule(id) {
    await supabase.from("facility_schedules").delete().eq("id", id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleSchedule(s) {
    await supabase.from("facility_schedules").update({ active: !s.active }).eq("id", s.id);
    setSchedules((prev) => prev.map((x) => x.id === s.id ? { ...x, active: !x.active } : x));
  }

  async function addBlock() {
    if (!newBlock.start_datetime || !newBlock.end_datetime) { setError("Block start and end dates are required."); return; }
    if (new Date(newBlock.end_datetime) <= new Date(newBlock.start_datetime)) { setError("End must be after start."); return; }
    setSaving(true);
    setError("");
    const { error: e } = await supabase.from("facility_blocks").insert({
      facility_id: selectedFacility,
      ...newBlock,
    });
    if (e) { setError(e.message); setSaving(false); return; }
    const { data } = await supabase.from("facility_blocks").select("*").eq("facility_id", selectedFacility).order("start_datetime");
    setBlocks(data || []);
    setNewBlock({ start_datetime: "", end_datetime: "", reason: "", block_type: "maintenance" });
    setSaving(false);
  }

  async function deleteBlock(id) {
    await supabase.from("facility_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  const selectedFac = facilities.find((f) => f.id === selectedFacility);

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">Schedules & Availability</h1>
          </div>
        </div>

        {error && <p className="fac-error-msg">{error}</p>}

        <div className="fac-form-group" style={{ maxWidth: 380 }}>
          <label className="fac-form-label">Select Facility</label>
          <select className="fac-input" value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)}>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({f.locations?.name})</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="fac-loading">Loading…</div>
        ) : selectedFacility && (
          <div className="fac-sched-layout">
            {/* Weekly Schedules */}
            <div className="fac-sched-section">
              <h2 className="fac-sched-title">Weekly Availability</h2>
              <p className="fac-sched-hint">Set regular hours for each day of the week.</p>

              <div className="fac-sched-list">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const daySched = schedules.filter((s) => s.day_of_week === idx);
                  return (
                    <div key={idx} className="fac-sched-day-row">
                      <span className="fac-sched-day-name">{day}</span>
                      <div className="fac-sched-slots">
                        {daySched.length === 0 ? (
                          <span className="fac-sched-none">Closed</span>
                        ) : (
                          daySched.map((s) => (
                            <div key={s.id} className={`fac-sched-slot${s.active ? "" : " inactive"}`}>
                              <span>{formatTime(s.open_time)} – {formatTime(s.close_time)}</span>
                              <button className={`fac-toggle-btn fac-toggle-sm${s.active ? " active" : ""}`} onClick={() => toggleSchedule(s)}>
                                {s.active ? "On" : "Off"}
                              </button>
                              <button className="fac-btn-danger fac-btn-xs" onClick={() => deleteSchedule(s.id)}>×</button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="fac-sched-add">
                <h3 className="fac-sched-add-title">Add Availability Window</h3>
                <div className="fac-form-grid fac-form-grid-3">
                  <div className="fac-form-group">
                    <label className="fac-form-label">Day</label>
                    <select className="fac-input" value={newSched.day_of_week} onChange={(e) => setNewSched((s) => ({ ...s, day_of_week: e.target.value }))}>
                      {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="fac-form-group">
                    <label className="fac-form-label">Open Time</label>
                    <input className="fac-input" type="time" value={newSched.open_time} onChange={(e) => setNewSched((s) => ({ ...s, open_time: e.target.value }))} />
                  </div>
                  <div className="fac-form-group">
                    <label className="fac-form-label">Close Time</label>
                    <input className="fac-input" type="time" value={newSched.close_time} onChange={(e) => setNewSched((s) => ({ ...s, close_time: e.target.value }))} />
                  </div>
                </div>
                <button className="fac-btn-primary fac-btn-sm" onClick={addSchedule} disabled={saving}>
                  {saving ? "Adding…" : "+ Add Window"}
                </button>
              </div>
            </div>

            {/* Blocks */}
            <div className="fac-sched-section">
              <h2 className="fac-sched-title">Date Blocks & Closures</h2>
              <p className="fac-sched-hint">Block specific date ranges for maintenance, holidays, or school events.</p>

              {blocks.length > 0 && (
                <div className="fac-blocks-list">
                  {blocks.map((b) => (
                    <div key={b.id} className="fac-block-item">
                      <div className="fac-block-main">
                        <span className="fac-block-type">{BLOCK_TYPES.find((t) => t.value === b.block_type)?.label || b.block_type}</span>
                        <span className="fac-block-dates">
                          {new Date(b.start_datetime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          {" → "}
                          {new Date(b.end_datetime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                        {b.reason && <span className="fac-block-reason">{b.reason}</span>}
                      </div>
                      <button className="fac-btn-danger fac-btn-xs" onClick={() => deleteBlock(b.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="fac-sched-add">
                <h3 className="fac-sched-add-title">Add Block</h3>
                <div className="fac-form-grid">
                  <div className="fac-form-group">
                    <label className="fac-form-label">Start Date & Time</label>
                    <input className="fac-input" type="datetime-local" value={newBlock.start_datetime} onChange={(e) => setNewBlock((b) => ({ ...b, start_datetime: e.target.value }))} />
                  </div>
                  <div className="fac-form-group">
                    <label className="fac-form-label">End Date & Time</label>
                    <input className="fac-input" type="datetime-local" value={newBlock.end_datetime} onChange={(e) => setNewBlock((b) => ({ ...b, end_datetime: e.target.value }))} />
                  </div>
                  <div className="fac-form-group">
                    <label className="fac-form-label">Block Type</label>
                    <select className="fac-input" value={newBlock.block_type} onChange={(e) => setNewBlock((b) => ({ ...b, block_type: e.target.value }))}>
                      {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="fac-form-group fac-form-full">
                    <label className="fac-form-label">Reason (optional)</label>
                    <input className="fac-input" value={newBlock.reason} onChange={(e) => setNewBlock((b) => ({ ...b, reason: e.target.value }))} placeholder="e.g. Spring Break, HVAC repair" />
                  </div>
                </div>
                <button className="fac-btn-primary fac-btn-sm" onClick={addBlock} disabled={saving}>
                  {saving ? "Adding…" : "Block These Dates"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
