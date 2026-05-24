import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "../lib/supabase";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setPost(data);
      });
  }, [slug]);

  if (notFound) {
    return (
      <section className="section">
        <div className="container">
          <p>Post not found. <Link to="/blog">← Back to blog</Link></p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section">
        <div className="container"><p>Loading…</p></div>
      </section>
    );
  }

  return (
    <article className="section">
      <div className="container blog-post-page">
        <Link to="/blog" className="back-link">← Back to blog</Link>
        <header className="blog-post-header">
          <time className="blog-date" dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
        </header>
        <div className="blog-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
