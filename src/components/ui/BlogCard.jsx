import { Link } from "react-router-dom";

/**
 * Shared blog post card for the /blogs grid and related-articles sections.
 * Mirrors BusinessCard's structure (.cw-card.cw-lift) so blog listings match
 * the rest of the site's visual language.
 */
export default function BlogCard({ blog }) {
  const dateLabel = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Link to={`/blogs/${blog.slug}`} className="cw-card cw-lift cw-blog-card text-decoration-none">
      <div className="cw-blog-card__image">
        {blog.featuredImage ? (
          <img src={blog.featuredImage} alt={blog.altText || blog.title} loading="lazy" />
        ) : (
          <div className="cw-blog-card__image-fallback">
            <i className="fa-solid fa-newspaper" aria-hidden="true"></i>
          </div>
        )}
        {blog.isFeatured && <span className="cw-badge cw-badge--success cw-blog-card__badge">Featured</span>}
        {blog.isTrending && <span className="cw-badge cw-badge--info cw-blog-card__badge cw-blog-card__badge--second">Trending</span>}
      </div>

      <div className="cw-blog-card__body">
        {blog.category?.name && <span className="cw-blog-card__category">{blog.category.name}</span>}
        <h4 className="cw-blog-card__title text-truncate-2">{blog.title}</h4>
        {blog.shortDescription && (
          <p className="cw-blog-card__desc text-truncate-2">{blog.shortDescription}</p>
        )}
        <div className="cw-blog-card__meta">
          {dateLabel && <span>{dateLabel}</span>}
          {blog.readingTime ? <span>{blog.readingTime} min read</span> : null}
        </div>
      </div>
    </Link>
  );
}
