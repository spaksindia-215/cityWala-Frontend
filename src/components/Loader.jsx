import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Loader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="cw-route-progress" role="status" aria-label="Loading">
      <div className="cw-route-progress__bar" />
    </div>
  );
}