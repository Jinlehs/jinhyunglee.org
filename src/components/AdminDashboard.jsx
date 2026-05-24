import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = { title: "", slug: "", excerpt: "", content: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetch("/api/auth/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) { localStorage.removeItem("admin_token"); navigate("/admin/login"); } });
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "title" ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, date: new Date().toISOString().split("T")[0] }),
    });
    if (res.ok) {
      setStatus({ ok: true, msg: "Post published." });
      setForm(EMPTY_FORM);
      fetch("/api/posts").then((r) => r.json()).then(setPosts);
    } else {
      const { error } = await res.json();
      setStatus({ ok: false, msg: error || "Something went wrong." });
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  return (
    <section className="section">
      <div className="container admin-form-wrap">
        <div className="admin-header">
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <p className="eyebrow">Admin</p>
            <h2>New post</h2>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label className="field-label">
            Slug
            <input name="slug" value={form.slug} onChange={handleChange} required />
          </label>
          <label className="field-label">
            Excerpt
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} />
          </label>
          <label className="field-label">
            Content <span className="field-hint">(Markdown)</span>
            <textarea name="content" value={form.content} onChange={handleChange} rows={14} required />
          </label>
          {status && (
            <p className={status.ok ? "form-success" : "form-error"}>{status.msg}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Publishing…" : "Publish post"}
          </button>
        </form>

        {posts.length > 0 && (
          <div className="admin-posts">
            <h3>Published posts</h3>
            <ul>
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                  <time dateTime={p.date}>{p.date}</time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
