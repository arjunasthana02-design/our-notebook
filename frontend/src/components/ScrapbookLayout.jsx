import { Link, useLocation } from "react-router-dom";
import "../styles/scrapbook.css";

export default function ScrapbookLayout({
  children,
  label = "Bhoomi & Arjun's Notebook",
}) {
  const location = useLocation();

  return (
    <main className="scrapbook-shell">

      <nav className="scrapbook-nav">

        <Link
          to="/home"
          className="scrapbook-brand"
        >
          📖 {label}
        </Link>

        <div className="scrapbook-links">

          <Link
            to="/welcome"
            className={`scrapbook-link ${
              location.pathname === "/welcome" ? "active-link" : ""
            }`}
          >
            Letter
          </Link>

          <Link
            to="/home"
            className={`scrapbook-link ${
              location.pathname === "/home" ? "active-link" : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/planner"
            className={`scrapbook-link ${
              location.pathname === "/planner" ? "active-link" : ""
            }`}
          >
            Bucket List
          </Link>

          <Link
            to="/chapters"
            className={`scrapbook-link ${
              location.pathname === "/chapters" ? "active-link" : ""
            }`}
          >
            Memories
          </Link>

          <Link
            to="/settings"
            className={`scrapbook-link ${
              location.pathname === "/settings" ? "active-link" : ""
            }`}
          >
            Settings
          </Link>

        </div>

      </nav>

      {children}

    </main>
  );
}