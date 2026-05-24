import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Blog</p>
          <h2>Writing</h2>
        </div>
        <input
          className="blog-search"
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search posts"
        />
        {loading ? (
          <p className="blog-loading">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="blog-empty">No posts found.</p>
        ) : (
          <ol className="blog-list">
            {filtered.map((post) => (
              <li key={post.slug} className="blog-card">
                <time className="blog-date" dateTime={post.date}>
                  {new Date(post.date + "T00:00:00").toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h3>
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt && <p>{post.excerpt}</p>}
                <Link to={`/blog/${post.slug}`} className="read-more">
                  Read post →
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
