const WP_PATHS = [
  "/wp-admin",
  "/wp-login.php",
  "/wp-content",
  "/wp-includes",
  "/wp-json",
  "/xmlrpc.php",
  "/wp-cron.php",
  "/wp-signup.php",
];

function isWordPressPath(pathname) {
  return WP_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
  );
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (isWordPressPath(pathname)) {
      return fetch(request);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    return response;
  },
};
