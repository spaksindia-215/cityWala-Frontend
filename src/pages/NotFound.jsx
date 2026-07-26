import Seo from "../seo/Seo";
import HeroBanner from "../components/ui/HeroBanner";
import EmptyState from "../components/ui/EmptyState";

export default function NotFound() {
  return (
    <div>
      <Seo
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        path="/404"
        noindex
      />

      <HeroBanner eyebrow="Error 404" title="Page Not Found" />

      <section className="cw-section">
        <div className="container">
          <EmptyState
            icon="fa-compass"
            title="We couldn't find that page"
            description="Sorry, the page you're looking for doesn't exist or has been moved."
            primaryAction={{ label: "Back to Home", to: "/" }}
          />
        </div>
      </section>
    </div>
  );
}
