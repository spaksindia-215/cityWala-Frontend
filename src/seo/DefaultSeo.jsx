import { Helmet } from "react-helmet-async";
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_LOCALE,
  TWITTER_CARD,
  SITE_NAME,
  SITE_URL,
  GSC_VERIFICATION,
} from "./config";
import { organizationSchema, websiteSchema, graph } from "./schema";

/**
 * Site-wide fallback tags, rendered once near the app root. Because
 * react-helmet-async merges tags in render order (later = wins for
 * singleton tags like <title>), any page-level <Seo> further down the tree
 * overrides these without needing to repeat site-wide boilerplate.
 */
export default function DefaultSeo() {
  return (
    <Helmet defaultTitle={DEFAULT_TITLE}>
      <html lang="en" />
      <meta name="description" content={DEFAULT_DESCRIPTION} />
      <meta name="keywords" content={DEFAULT_KEYWORDS.join(", ")} />
      <meta name="author" content={SITE_NAME} />
      <meta name="creator" content={SITE_NAME} />
      <meta name="publisher" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="google-site-verification" content={GSC_VERIFICATION} />
      <meta name="theme-color" content="#2563eb" />
      <link rel="canonical" href={`${SITE_URL}/`} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={DEFAULT_TITLE} />
      <meta property="og:description" content={DEFAULT_DESCRIPTION} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:secure_url" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:alt" content={`${SITE_NAME} - Business Listing Website in India`} />
      <meta property="og:locale" content={DEFAULT_LOCALE} />

      <meta name="twitter:card" content={TWITTER_CARD} />
      <meta name="twitter:title" content={DEFAULT_TITLE} />
      <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} - Business Listing Website in India`} />

      <script type="application/ld+json">
        {JSON.stringify(graph(organizationSchema(), websiteSchema()))}
      </script>
    </Helmet>
  );
}
