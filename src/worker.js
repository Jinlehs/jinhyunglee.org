const FINNHUB = "https://finnhub.io/api/v1";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function finnhub(path, env) {
  const res = await fetch(`${FINNHUB}${path}&token=${env.FINNHUB_API_KEY}`);
  const data = await res.json();
  if (!res.ok || data.error) return { _err: data.error || res.status };
  return data;
}

async function handleAPI(request, env, pathname) {
  const match = pathname.match(/^\/api\/stocks\/([A-Z0-9.]+)$/);
  if (match && request.method === "GET") {
    const ticker = match[1];

    if (!env.FINNHUB_API_KEY) {
      return json({ error: "FINNHUB_API_KEY secret is not set on this Worker." }, 500);
    }

    const [quote, profile, metrics] = await Promise.all([
      finnhub(`/quote?symbol=${ticker}`, env),
      finnhub(`/stock/profile2?symbol=${ticker}`, env),
      finnhub(`/stock/metric?symbol=${ticker}&metric=all`, env),
    ]);

    if (quote?._err) {
      const msg = typeof quote._err === "string"
        ? `Finnhub error: ${quote._err}`
        : "API key invalid or request failed.";
      return json({ error: msg }, 502);
    }

    if (!quote || (quote.c === 0 && quote.pc === 0)) {
      return json({ error: `Ticker "${ticker}" not found on Finnhub.` }, 404);
    }

    return json({ ticker, quote, profile: profile?._err ? {} : profile, metrics: metrics?._err ? {} : metrics?.metric || {} });
  }
  return json({ error: "Not found" }, 404);
}

function isWordPressPath(pathname) {
  return pathname.startsWith("/wp-") || pathname === "/xmlrpc.php";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "jinhyunglee.org") {
      if (isWordPressPath(url.pathname)) return fetch(request);
      url.hostname = "resume.jinhyunglee.org";
      return Response.redirect(url.toString(), 301);
    }
    const { pathname } = url;
    if (pathname.startsWith("/api/")) return handleAPI(request, env, pathname);
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    return response;
  },
};
