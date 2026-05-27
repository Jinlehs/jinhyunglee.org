import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminNav from "./AdminNav";

function formatMarketCap(millions) {
  if (!millions) return "—";
  if (millions >= 1e6) return `$${(millions / 1e6).toFixed(2)}T`;
  if (millions >= 1e3) return `$${(millions / 1e3).toFixed(2)}B`;
  return `$${millions.toFixed(0)}M`;
}

function fmt(n, prefix = "", decimals = 2) {
  if (n == null || n === 0) return "—";
  return `${prefix}${Number(n).toFixed(decimals)}`;
}

function ChangeTag({ d, dp }) {
  if (d == null) return null;
  const pos = d >= 0;
  return (
    <span className={`stock-change ${pos ? "positive" : "negative"}`}>
      {pos ? "+" : ""}{d?.toFixed(2)} ({pos ? "+" : ""}{dp?.toFixed(2)}%)
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value ?? "—"}</span>
    </div>
  );
}

export default function AdminStocks() {
  const navigate = useNavigate();
  const [tickers, setTickers] = useState([]);
  const [stockData, setStockData] = useState({});
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/admin/login"); return; }
      loadWatchlist();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadWatchlist() {
    const { data } = await supabase
      .from("watchlist")
      .select("ticker")
      .order("added_at", { ascending: true });
    const list = (data || []).map((r) => r.ticker);
    setTickers(list);
    if (list.length) fetchAll(list);
  }

  async function fetchOne(ticker) {
    const res = await fetch(`/api/stocks/${ticker}`);
    if (!res.ok) return null;
    return res.json();
  }

  async function fetchAll(list) {
    setRefreshing(true);
    const results = await Promise.all(list.map(fetchOne));
    const map = {};
    list.forEach((t, i) => { if (results[i]) map[t] = results[i]; });
    setStockData(map);
    setRefreshing(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const ticker = input.trim().toUpperCase();
    if (!ticker || tickers.includes(ticker)) { setInput(""); return; }
    setAdding(true);
    setError("");
    const data = await fetchOne(ticker);
    if (!data) {
      setError(`"${ticker}" not found. Check the ticker symbol and try again.`);
      setAdding(false);
      return;
    }
    await supabase.from("watchlist").insert({ ticker });
    setTickers((prev) => [...prev, ticker]);
    setStockData((prev) => ({ ...prev, [ticker]: data }));
    setInput("");
    setAdding(false);
  }

  async function handleRemove(ticker) {
    await supabase.from("watchlist").delete().eq("ticker", ticker);
    setTickers((prev) => prev.filter((t) => t !== ticker));
    setStockData((prev) => { const n = { ...prev }; delete n[ticker]; return n; });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <section className="section">
      <div className="container admin-stocks-wrap">
        <AdminNav />

        <div className="admin-header">
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <p className="eyebrow">Admin</p>
            <h2>Stock Watchlist</h2>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => fetchAll(tickers)}
              disabled={refreshing || tickers.length === 0}
            >
              {refreshing ? "Refreshing…" : "↻ Refresh all"}
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <form className="stock-add-form" onSubmit={handleAdd}>
          <input
            className="stock-ticker-input"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Ticker symbol (e.g. AAPL)"
            maxLength={12}
            autoCapitalize="characters"
          />
          <button className="btn btn-primary" type="submit" disabled={adding}>
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
        {error && <p className="form-error" style={{ marginTop: "0.5rem" }}>{error}</p>}

        {tickers.length === 0 ? (
          <p className="stock-empty">No stocks added yet. Enter a ticker symbol above to get started.</p>
        ) : (
          <div className="stock-grid">
            {tickers.map((ticker) => {
              const d = stockData[ticker];
              return (
                <div key={ticker} className="stock-card">
                  <div className="stock-card-header">
                    <div>
                      <span className="stock-ticker-label">{ticker}</span>
                      {d?.profile?.name && (
                        <span className="stock-company">{d.profile.name}</span>
                      )}
                      {d?.profile?.finnhubIndustry && (
                        <span className="stock-industry">{d.profile.finnhubIndustry}</span>
                      )}
                    </div>
                    <button
                      className="post-action-btn post-action-delete"
                      onClick={() => handleRemove(ticker)}
                    >
                      Remove
                    </button>
                  </div>

                  {!d ? (
                    <p className="stock-loading">Loading…</p>
                  ) : (
                    <>
                      <div className="stock-price-row">
                        <span className="stock-price">${d.quote.c?.toFixed(2)}</span>
                        <ChangeTag d={d.quote.d} dp={d.quote.dp} />
                      </div>
                      <div className="stock-metrics">
                        <Metric label="Open"        value={fmt(d.quote.o, "$")} />
                        <Metric label="Prev Close"  value={fmt(d.quote.pc, "$")} />
                        <Metric label="Day High"    value={fmt(d.quote.h, "$")} />
                        <Metric label="Day Low"     value={fmt(d.quote.l, "$")} />
                        <Metric label="52W High"    value={fmt(d.metrics["52WeekHigh"], "$")} />
                        <Metric label="52W Low"     value={fmt(d.metrics["52WeekLow"], "$")} />
                        <Metric label="Market Cap"  value={formatMarketCap(d.profile.marketCapitalization)} />
                        <Metric label="P/E (TTM)"   value={fmt(d.metrics.peBasicExclExtraTTM, "", 1)} />
                        <Metric label="EPS (TTM)"   value={fmt(d.metrics.epsBasicExclExtraItemsTTM, "$")} />
                        <Metric label="P/B Ratio"   value={fmt(d.metrics.pbAnnual, "", 2)} />
                        <Metric label="Beta"        value={fmt(d.metrics.beta, "", 2)} />
                        <Metric label="Exchange"    value={d.profile.exchange || null} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
