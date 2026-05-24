const SEED_POSTS = [
  {
    id: "1",
    slug: "experimenting-with-claude-code-cloudflare-github",
    title: "Experimenting with Claude Code, Cloudflare Workers, and GitHub Actions",
    excerpt:
      "What I learned building this portfolio using AI-assisted development, edge deployments, and automated GitHub workflows.",
    date: "2025-05-24",
    published: true,
    content: `I've been building out my portfolio site and the experience has been a good excuse to try a few things I'd been meaning to experiment with: AI-assisted development with Claude Code, edge deployments on Cloudflare Workers, and GitHub Actions as the glue holding it together.

## The Stack

The site itself is simple: a React + Vite SPA with no backend framework. What's different is the workflow on top of it. The source code lives on GitHub, deployments go to Cloudflare Workers, and a GitHub Actions workflow wires Claude Code into the repository so I can make changes through a chat interface and have them committed and pushed automatically.

## Claude Code

Claude Code is Anthropic's coding agent. It runs in a managed cloud environment, clones your repository, makes file edits, commits the changes, and pushes them back to a branch. You review the diff, merge, deploy.

What surprised me was how useful it is for tasks I'd normally context-switch out of — updating copy, restructuring components, adding a new section. The kind of work that's not hard but has enough surface area that I'd put it off. Claude Code handles it in one go.

It's not a replacement for understanding the codebase. The agent needs clear, specific instructions. Vague prompts produce overengineered output. But the ceiling on what I can ship in a sitting has gone up.

## Cloudflare Workers

Deploying to Workers was the biggest architectural shift. Your code runs in V8 isolates at Cloudflare's edge — not a traditional server, not even a conventional serverless function. Cold start is under a millisecond. The deployment unit is a JavaScript file plus static assets.

The \`wrangler.toml\` file is the whole contract:

\`\`\`toml
name = "jinhyunglee"
main = "src/worker.js"

[assets]
directory = "./dist"
binding = "ASSETS"
\`\`\`

Run \`wrangler deploy\` and the site is live globally in about 30 seconds.

For a portfolio this is overkill. For anything latency-sensitive, it's remarkable infrastructure at the free tier.

## GitHub Actions

GitHub Actions is the automation layer. Pushes to main can trigger a deploy. PRs can trigger a review. Issues can wake up Claude Code. The repository becomes the source of truth not just for the application code, but for how the app is built, tested, reviewed, and deployed.

The \`claude.yml\` workflow file is what made this whole session possible — it's the hook that gave Claude Code access to the repo.

## What I Learned

**Be specific with AI.** Vague instructions produce verbose, over-engineered output. The more precisely you describe what you want — including what you don't want — the better the result.

**Keep the stack lean.** Every dependency is a thing that can break. This site has almost no dependencies outside React and Vite. That was intentional and I'd do it again.

**Deploy early.** I spent too long iterating locally before getting a real URL live. Actual deployment catches configuration issues that local dev never will.

## What's Next

This blog is the next experiment — a lightweight CMS using Cloudflare KV for storage and a protected admin route, without reaching for a database or a backend framework.

So far: works exactly as expected.`,
  },
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getPosts(env) {
  const raw = await env.BLOG_KV.get("posts");
  if (!raw) {
    await env.BLOG_KV.put("posts", JSON.stringify(SEED_POSTS));
    return SEED_POSTS;
  }
  return JSON.parse(raw);
}

async function requireAuth(request, env) {
  const token = request.headers.get("Authorization")?.slice(7);
  if (!token) return false;
  return !!(await env.BLOG_KV.get(`session:${token}`));
}

async function handleAPI(request, env, pathname) {
  const method = request.method;

  // List posts (public)
  if (pathname === "/api/posts" && method === "GET") {
    const posts = await getPosts(env);
    return json(
      posts
        .filter((p) => p.published)
        .map(({ id, slug, title, excerpt, date }) => ({ id, slug, title, excerpt, date }))
    );
  }

  // Single post (public)
  const postMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch && method === "GET") {
    const posts = await getPosts(env);
    const post = posts.find((p) => p.slug === postMatch[1] && p.published);
    return post ? json(post) : json({ error: "Not found" }, 404);
  }

  // Login
  if (pathname === "/api/auth/login" && method === "POST") {
    const { password } = await request.json();
    if (password !== env.ADMIN_PASSWORD) return json({ error: "Invalid password" }, 401);
    const token = crypto.randomUUID();
    await env.BLOG_KV.put(`session:${token}`, "1", { expirationTtl: 86400 });
    return json({ token });
  }

  // Verify session
  if (pathname === "/api/auth/verify" && method === "GET") {
    const authed = await requireAuth(request, env);
    return authed ? json({ ok: true }) : json({ error: "Unauthorized" }, 401);
  }

  // Create post (protected)
  if (pathname === "/api/posts" && method === "POST") {
    if (!(await requireAuth(request, env))) return json({ error: "Unauthorized" }, 401);
    const { title, slug, excerpt, content, date } = await request.json();
    if (!title || !slug || !content) return json({ error: "title, slug, and content are required" }, 400);
    const posts = await getPosts(env);
    if (posts.find((p) => p.slug === slug)) return json({ error: "Slug already exists" }, 409);
    const post = {
      id: crypto.randomUUID(),
      slug,
      title,
      excerpt: excerpt || "",
      content,
      date: date || new Date().toISOString().split("T")[0],
      published: true,
    };
    posts.unshift(post);
    await env.BLOG_KV.put("posts", JSON.stringify(posts));
    return json(post, 201);
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/api/")) {
      return handleAPI(request, env, pathname);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    return response;
  },
};
