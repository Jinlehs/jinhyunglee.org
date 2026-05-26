import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminNav from "./AdminNav";

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = { title: "", slug: "", excerpt: "", content: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/admin/login"); return; }
      loadPosts();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, excerpt, content, created_at")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "title" && !editingId ? { slug: slugify(value) } : {}),
    }));
  }

  function startEdit(post) {
    setEditingId(post.id);
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content });
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = editingId
      ? await supabase.from("posts").update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
        }).eq("id", editingId)
      : await supabase.from("posts").insert(form);

    if (error) {
      setStatus({ ok: false, msg: error.message });
    } else {
      setStatus({ ok: true, msg: editingId ? "Post updated." : "Post published." });
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadPosts();
    }
    setLoading(false);
  }

  async function handleDelete(post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      setStatus({ ok: false, msg: error.message });
    } else {
      loadPosts();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <section className="section">
      <div className="container admin-form-wrap">
        <AdminNav />
        <div className="admin-header">
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <p className="eyebrow">Admin</p>
            <h2>{editingId ? "Edit post" : "New post"}</h2>
          </div>
          <div className="admin-header-actions">
            {editingId && (
              <button className="btn btn-secondary" onClick={cancelEdit}>New post</button>
            )}
            <button className="btn btn-secondary" onClick={handleLogout}>Log out</button>
          </div>
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
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save changes" : "Publish post"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {posts.length > 0 && (
          <div className="admin-posts">
            <h3>Published posts</h3>
            <ul>
              {posts.map((p) => (
                <li key={p.id}>
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                  <div className="admin-post-actions">
                    <button className="post-action-btn" onClick={() => startEdit(p)}>Edit</button>
                    <button className="post-action-btn post-action-delete" onClick={() => handleDelete(p)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
