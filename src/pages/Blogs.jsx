import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import BlogCard from "../components/ui/BlogCard";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/Pagination";
import SectionHeader from "../components/ui/SectionHeader";
import Seo from "../seo/Seo";
import { blogListSchema, breadcrumbSchema, graph, webPageSchema } from "../seo/schema";

export default function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page")) || 1;
  const limit = 12;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const sort = searchParams.get("sort") || "latest";

  useEffect(() => {
    API.get("/blogs/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Featured/trending strips only load on the unfiltered first page, so they
  // don't fight for attention once a user is actively searching/filtering.
  useEffect(() => {
    if (search || category || tag) return;
    API.get("/blogs?featured=true&limit=4").then((res) => setFeatured(res.data.blogs || [])).catch(() => {});
    API.get("/blogs?trending=true&limit=4").then((res) => setTrending(res.data.blogs || [])).catch(() => {});
  }, [search, category, tag]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit, sort });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);

    API.get(`/blogs?${params.toString()}`)
      .then((res) => {
        setBlogs(res.data.blogs || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {
        setBlogs([]);
        setPagination({});
      })
      .finally(() => setLoading(false));
  }, [page, search, category, tag, sort]);

  const updateParam = (key, value, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (resetPage) next.set("page", "1");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const showDiscoveryStrips = !search && !category && !tag && page === 1;

  return (
    <div className="container py-5">
      <Seo
        title="Blog"
        description="Guides on local businesses, travel, hotels, restaurants, shopping, tourism, real estate, jobs and more — powered by CityWala."
        path="/blogs"
        type="website"
        jsonLd={graph(
          blogListSchema({ path: "/blogs", name: "CityWala Blog" }),
          webPageSchema({ path: "/blogs", name: "CityWala Blog" }),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog" }])
        )}
      />

      <SectionHeader
        title="CityWala Blog"
        subtitle="Local business guides, travel tips, and everything you need to explore your city."
      />

      <form onSubmit={handleSearchSubmit} className="d-flex flex-wrap gap-2 my-4">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search articles..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest</option>
        </select>
        <button type="submit" className="nav-btn primary">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          Search
        </button>
        {(search || category || tag) && (
          <button
            type="button"
            className="nav-btn outline"
            onClick={() => {
              setSearchInput("");
              setSearchParams({});
            }}
          >
            Clear Filters
          </button>
        )}
      </form>

      {showDiscoveryStrips && featured.length > 0 && (
        <section className="mb-5">
          <SectionHeader title="Featured Articles" />
          <div className="row g-4 mt-1">
            {featured.map((blog) => (
              <div className="col-sm-6 col-lg-3" key={blog._id}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        </section>
      )}

      {showDiscoveryStrips && trending.length > 0 && (
        <section className="mb-5">
          <SectionHeader title="Trending Now" />
          <div className="row g-4 mt-1">
            {trending.map((blog) => (
              <div className="col-sm-6 col-lg-3" key={blog._id}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title={showDiscoveryStrips ? "Latest Articles" : "Results"} />
        <div className="row g-4 mt-1">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div className="col-sm-6 col-lg-3" key={i}>
                <SkeletonCard variant="business" />
              </div>
            ))
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <div className="col-sm-6 col-lg-3" key={blog._id}>
                <BlogCard blog={blog} />
              </div>
            ))
          ) : (
            <EmptyState
              icon="fa-newspaper"
              title="No articles found"
              description="Try adjusting your search or filters."
            />
          )}
        </div>

        {!loading && blogs.length > 0 && (
          <Pagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            onPageChange={(p) => updateParam("page", String(p), { resetPage: false })}
            limit={limit}
            setLimit={() => {}}
          />
        )}
      </section>
    </div>
  );
}
