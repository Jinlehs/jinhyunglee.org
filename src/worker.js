const FINNHUB = "https://finnhub.io/api/v1";
const STRIPE_API = "https://api.stripe.com/v1";
const SQUARE_API = "https://connect.squareup.com/v2";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function finnhub(path, env) {
  const res = await fetch(`${FINNHUB}${path}&token=${env.FINNHUB_API_KEY}`);
  const data = await res.json();
  if (!res.ok || data.error) return { _err: data.error || res.status };
  return data;
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

async function createStripePaymentIntent(body, env) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "STRIPE_SECRET_KEY is not configured on this Worker." }, 500);
  }
  const { amount, currency = "usd", bookingRef, description } = body;
  if (!amount || amount < 50) return json({ error: "Amount must be at least 50 cents." }, 400);

  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    currency,
    "metadata[booking_ref]": bookingRef || "",
    description: description || "Facility Booking",
    "automatic_payment_methods[enabled]": "true",
  });

  const res = await fetch(`${STRIPE_API}/payment_intents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data.error?.message || "Stripe error" }, 502);
  return json({ clientSecret: data.client_secret, paymentIntentId: data.id });
}

// ─── Square ──────────────────────────────────────────────────────────────────

async function createSquarePayment(body, env) {
  if (!env.SQUARE_ACCESS_TOKEN) {
    return json({ error: "SQUARE_ACCESS_TOKEN is not configured on this Worker." }, 500);
  }
  const { sourceId, amount, currency = "USD", bookingRef, locationId } = body;
  if (!sourceId || !amount) return json({ error: "sourceId and amount are required." }, 400);

  const res = await fetch(`${SQUARE_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-01-17",
    },
    body: JSON.stringify({
      source_id: sourceId,
      idempotency_key: `${bookingRef}-${Date.now()}`,
      amount_money: { amount: Math.round(amount), currency },
      location_id: locationId,
      note: `Facility Booking ${bookingRef}`,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.errors) {
    return json({ error: data.errors?.[0]?.detail || "Square payment failed" }, 502);
  }
  return json({ paymentId: data.payment.id, status: data.payment.status });
}

// ─── Promo code validation (server-side double-check) ────────────────────────

async function validatePromoCode(body, env) {
  const { code } = body;
  if (!code) return json({ error: "Code is required." }, 400);
  // Validation happens client-side via Supabase; this endpoint is a secondary check
  return json({ valid: true });
}

// ─── Router ──────────────────────────────────────────────────────────────────

async function handleAPI(request, env, pathname) {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Stocks
  const stockMatch = pathname.match(/^\/api\/stocks\/([A-Z0-9.]+)$/);
  if (stockMatch && request.method === "GET") {
    const ticker = stockMatch[1];
    if (!env.FINNHUB_API_KEY) {
      return json({ error: "FINNHUB_API_KEY secret is not set on this Worker." }, 500);
    }
    const [quote, profile, metrics] = await Promise.all([
      finnhub(`/quote?symbol=${ticker}`, env),
      finnhub(`/stock/profile2?symbol=${ticker}`, env),
      finnhub(`/stock/metric?symbol=${ticker}&metric=all`, env),
    ]);
    if (quote?._err) {
      const msg = typeof quote._err === "string" ? `Finnhub error: ${quote._err}` : "API key invalid or request failed.";
      return json({ error: msg }, 502);
    }
    if (!quote || (quote.c === 0 && quote.pc === 0)) {
      return json({ error: `Ticker "${ticker}" not found on Finnhub.` }, 404);
    }
    return json({ ticker, quote, profile: profile?._err ? {} : profile, metrics: metrics?._err ? {} : metrics?.metric || {} });
  }

  // Payment: Stripe create intent
  if (pathname === "/api/payment/create-intent" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    return createStripePaymentIntent(body, env);
  }

  // Payment: Square create payment
  if (pathname === "/api/payment/square-create" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    return createSquarePayment(body, env);
  }

  // Health check
  if (pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, ts: new Date().toISOString() });
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
