import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatCurrency, EVENT_TYPES } from "../../lib/bookingUtils";
import AdminNav from "../AdminNav";

function BarChart({ data, valueKey, labelKey, max }) {
  return (
    <div className="fac-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="fac-bar-row">
          <span className="fac-bar-label">{d[labelKey]}</span>
          <div className="fac-bar-track">
            <div
              className="fac-bar-fill"
              style={{ width: `${max > 0 ? (d[valueKey] / max) * 100 : 0}%` }}
            />
          </div>
          <span className="fac-bar-value">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30"); // days

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - parseInt(period));
      const sinceISO = since.toISOString();

      const [
        { data: allBookings },
        { data: recentBookings },
        { data: facilities },
      ] = await Promise.all([
        supabase.from("bookings").select("status, payment_status, payment_amount, event_type, facility_id, created_at"),
        supabase.from("bookings").select("status, payment_status, payment_amount, event_type, facility_id, created_at").gte("created_at", sinceISO),
        supabase.from("facilities").select("id, name"),
      ]);

      const all = allBookings || [];
      const recent = recentBookings || [];
      const facs = facilities || [];

      // Total stats
      const totalRevenue = all.filter((b) => b.payment_status === "paid").reduce((s, b) => s + (b.payment_amount || 0), 0);
      const recentRevenue = recent.filter((b) => b.payment_status === "paid").reduce((s, b) => s + (b.payment_amount || 0), 0);

      // By facility
      const byFacility = facs.map((f) => {
        const fBookings = recent.filter((b) => b.facility_id === f.id);
        return { name: f.name.substring(0, 20), count: fBookings.length, revenue: fBookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + (b.payment_amount || 0), 0) };
      }).filter((f) => f.count > 0).sort((a, b) => b.count - a.count).slice(0, 8);

      // By event type
      const byType = EVENT_TYPES.map((t) => ({
        label: t.label.split(" ")[0],
        count: recent.filter((b) => b.event_type === t.value).length,
      })).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

      // By status
      const byStatus = ["pending", "confirmed", "declined", "cancelled"].map((s) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        count: recent.filter((b) => b.status === s).length,
      }));

      // Monthly trend (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        const monthBookings = all.filter((b) => b.created_at.startsWith(monthStr));
        monthlyData.push({
          label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          count: monthBookings.length,
          revenue: monthBookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + (b.payment_amount || 0), 0),
        });
      }

      setData({ totalRevenue, recentRevenue, byFacility, byType, byStatus, monthlyData, recentCount: recent.length, totalCount: all.length });
      setLoading(false);
    }
    load();
  }, [period]);

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/facilities" className="fac-back" style={{ marginBottom: "0.5rem", display: "inline-block" }}>← Facilities Hub</Link>
            <h1 className="admin-title">Analytics</h1>
          </div>
          <select className="fac-input fac-input-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {[["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["365", "Last year"]].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="fac-loading">Loading analytics…</div>
        ) : data && (
          <>
            {/* KPI cards */}
            <div className="fac-hub-stats">
              <div className="fac-stat-card">
                <span className="fac-stat-card-val">{data.recentCount}</span>
                <span className="fac-stat-card-label">Bookings (period)</span>
                <span className="fac-stat-card-sub">{data.totalCount} all time</span>
              </div>
              <div className="fac-stat-card">
                <span className="fac-stat-card-val">{formatCurrency(data.recentRevenue)}</span>
                <span className="fac-stat-card-label">Revenue (period)</span>
                <span className="fac-stat-card-sub">{formatCurrency(data.totalRevenue)} all time</span>
              </div>
              <div className="fac-stat-card">
                <span className="fac-stat-card-val">
                  {data.recentCount > 0 ? formatCurrency(data.recentRevenue / data.recentCount) : "$0"}
                </span>
                <span className="fac-stat-card-label">Avg. Booking Value</span>
              </div>
            </div>

            <div className="fac-analytics-grid">
              {/* Bookings by month */}
              <div className="fac-detail-card">
                <h3 className="fac-detail-card-title">Monthly Bookings (6 months)</h3>
                <BarChart
                  data={data.monthlyData}
                  valueKey="count"
                  labelKey="label"
                  max={Math.max(...data.monthlyData.map((m) => m.count), 1)}
                />
              </div>

              {/* Monthly revenue */}
              <div className="fac-detail-card">
                <h3 className="fac-detail-card-title">Monthly Revenue (6 months)</h3>
                <BarChart
                  data={data.monthlyData.map((m) => ({ ...m, revenueStr: Math.round(m.revenue) }))}
                  valueKey="revenueStr"
                  labelKey="label"
                  max={Math.max(...data.monthlyData.map((m) => m.revenue), 1)}
                />
              </div>

              {/* By facility */}
              {data.byFacility.length > 0 && (
                <div className="fac-detail-card">
                  <h3 className="fac-detail-card-title">Top Facilities by Bookings</h3>
                  <BarChart
                    data={data.byFacility}
                    valueKey="count"
                    labelKey="name"
                    max={Math.max(...data.byFacility.map((f) => f.count), 1)}
                  />
                </div>
              )}

              {/* By status */}
              <div className="fac-detail-card">
                <h3 className="fac-detail-card-title">Bookings by Status</h3>
                <BarChart
                  data={data.byStatus.filter((s) => s.count > 0)}
                  valueKey="count"
                  labelKey="label"
                  max={Math.max(...data.byStatus.map((s) => s.count), 1)}
                />
              </div>

              {/* By event type */}
              {data.byType.length > 0 && (
                <div className="fac-detail-card">
                  <h3 className="fac-detail-card-title">Bookings by Event Type</h3>
                  <BarChart
                    data={data.byType}
                    valueKey="count"
                    labelKey="label"
                    max={Math.max(...data.byType.map((t) => t.count), 1)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
