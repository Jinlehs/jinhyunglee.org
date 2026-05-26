const FINNHUB = "https://finnhub.io/api/v1";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function finnhub(path, env) {
  const res = await fetch(`${FINNHUB}${path}&token=${env.FINNHUB_API_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

async function handleAPI(request, env, pathname) {
  const match = pathname.match(/^\/api\/stocks\/([A-Z0-9.]+)$/);
  if (match && request.method === "GET") {
    const ticker = match[1];
    const [quote, profile, metrics] = await Promise.all([
      finnhub(`/quote?symbol=${ticker}`, env),
      finnhub(`/stock/profile2?symbol=${ticker}`, env),
      finnhub(`/stock/metric?symbol=${ticker}&metric=all`, env),
    ]);
    if (!quote || quote.c === 0) return json({ error: "Ticker not found" }, 404);
    return json({ ticker, quote, profile: profile || {}, metrics: metrics?.metric || {} });
  }
  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) return handleAPI(request, env, pathname);
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    return response;
  },
};
